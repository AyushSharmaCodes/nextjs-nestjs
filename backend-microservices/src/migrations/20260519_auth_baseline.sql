-- ================================================================
-- MODULE: AUTH & RBAC BASELINE MIGRATION
-- Version: 1.1.0
-- Date: 2026-05-19
-- ================================================================

CREATE SCHEMA IF NOT EXISTS app_auth;

-- ================================================================
-- 0. SHARED UTILITIES (Self-contained)
-- ================================================================

-- 0.1 uid(): Resolves current user ID from Supabase context
CREATE OR REPLACE FUNCTION public.uid()
RETURNS UUID LANGUAGE plpgsql STABLE AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'auth' AND p.proname = 'uid') THEN
    RETURN auth.uid();
  ELSE
    RETURN NULL::UUID;
  END IF;
END; $$;

-- 0.2 Shared updatedAt trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW."updatedAt" = NOW(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.create_updated_at_trigger(p_schema TEXT, p_table TEXT)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE format(
    'DROP TRIGGER IF EXISTS trg_updated_at ON %I.%I;
     CREATE TRIGGER trg_updated_at BEFORE UPDATE ON %I.%I
     FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();',
    p_schema, p_table, p_schema, p_table
  );
END; $$;

-- ================================================================
-- 1. ROLE-BASED ACCESS CONTROL (RBAC)
-- ================================================================

-- 1.1 Roles: Defines system and custom roles (ADMIN, CUSTOMER, etc.)
CREATE TABLE IF NOT EXISTS app_auth.roles (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name        TEXT NOT NULL UNIQUE,
    description TEXT,
    "isSystem"   BOOLEAN NOT NULL DEFAULT false,
    "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO app_auth.roles (name, description, "isSystem") VALUES 
    ('ADMIN', 'Full system access', true),
    ('MANAGER', 'Store and content management access', true),
    ('CUSTOMER', 'Standard customer access', true)
ON CONFLICT (name) DO NOTHING;

-- 1.2 Permissions: Atomic actions that can be performed on resources
CREATE TABLE IF NOT EXISTS app_auth.permissions (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    action      TEXT NOT NULL,
    resource    TEXT NOT NULL,
    description TEXT,
    "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (action, resource)
);

-- 1.3 Role Permissions: Mapping between roles and their allowed actions
CREATE TABLE IF NOT EXISTS app_auth.role_permissions (
    id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "roleId"       TEXT NOT NULL REFERENCES app_auth.roles(id) ON DELETE CASCADE,
    "permissionId" TEXT NOT NULL REFERENCES app_auth.permissions(id) ON DELETE CASCADE,
    "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE ("roleId", "permissionId")
);

-- RBAC RLS
ALTER TABLE app_auth.roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_roles" ON app_auth.roles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_read_roles" ON app_auth.roles FOR SELECT TO authenticated USING (true);

-- ================================================================
-- 2. BETTER-AUTH CORE MODELS
-- ================================================================

-- 2.1 User: Primary identity record
CREATE TABLE IF NOT EXISTS app_auth."user" (
    id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "firstName"      TEXT,
    "lastName"       TEXT,
    email            TEXT NOT NULL,
    "emailVerified"    BOOLEAN NOT NULL DEFAULT false,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    image            TEXT,
    role             TEXT NOT NULL DEFAULT 'CUSTOMER' REFERENCES app_auth.roles(name),
    gender           TEXT,
    dob              TIMESTAMP(3),
    nationality      TEXT,
    "lastLoginAt"      TIMESTAMP(3),
    "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_email ON app_auth."user"(lower(email));

-- 2.2 Session: Active login sessions
CREATE TABLE IF NOT EXISTS app_auth.session (
    id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "expiresAt"  TIMESTAMPTZ NOT NULL,
    token       TEXT NOT NULL UNIQUE,
    "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "ipAddress"  TEXT,
    "userAgent"  TEXT,
    "userId"     TEXT NOT NULL REFERENCES app_auth."user"(id) ON DELETE CASCADE,
    "twoFactorVerified" BOOLEAN
);
CREATE INDEX IF NOT EXISTS idx_session_userId ON app_auth.session("userId");
CREATE INDEX IF NOT EXISTS idx_session_createdAt ON app_auth.session("createdAt" DESC);

-- 2.3 Account: OAuth provider links (Google, etc.)
CREATE TABLE IF NOT EXISTS app_auth.account (
    id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "accountId"               TEXT NOT NULL,
    "providerId"              TEXT NOT NULL,
    "userId"                  TEXT NOT NULL REFERENCES app_auth."user"(id) ON DELETE CASCADE,
    "accessToken"             TEXT,
    "refreshToken"            TEXT,
    "idToken"                 TEXT,
    "accessTokenExpiresAt"  TIMESTAMPTZ,
    "refreshTokenExpiresAt" TIMESTAMPTZ,
    scope                    TEXT,
    password                 TEXT,
    "createdAt"               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE ("providerId", "accountId")
);
CREATE INDEX IF NOT EXISTS idx_account_userId ON app_auth.account("userId");

-- 2.4 Verification: Email and password reset tokens
CREATE TABLE IF NOT EXISTS app_auth.verification (
    id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    identifier TEXT NOT NULL,
    value      TEXT NOT NULL,
    "expiresAt"  TIMESTAMPTZ NOT NULL,
    "createdAt"  TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt"  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_verification_identifier ON app_auth.verification(identifier);

-- 2.5 Two Factors: TOTP/Backup code secrets
CREATE TABLE IF NOT EXISTS app_auth.two_factors (
    id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId"       TEXT NOT NULL REFERENCES app_auth."user"(id) ON DELETE CASCADE,
    secret       TEXT NOT NULL,
    "backupCodes"  TEXT[] NOT NULL,
    verified     BOOLEAN NOT NULL DEFAULT true,
    "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE ("userId")
);

-- ================================================================
-- 3. CUSTOM SECURITY & AUDIT
-- ================================================================

-- 3.1 Security Enums
DO $$ BEGIN
    CREATE TYPE "app_auth"."EmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED');
    CREATE TYPE "app_auth"."DeviceType" AS ENUM ('DESKTOP', 'MOBILE', 'TABLET', 'BOT', 'UNKNOWN');
    CREATE TYPE "app_auth"."SessionRiskLevel" AS ENUM ('NORMAL', 'SUSPICIOUS', 'HIGH_RISK');
    CREATE TYPE "app_auth"."AuditResolution" AS ENUM ('CONFIRMED_BY_USER', 'REVOKED_BY_USER', 'AUTO_REVOKED', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3.2 Device Sessions: Enriched session data for tracking devices and geolocation
CREATE TABLE IF NOT EXISTS app_auth.device_sessions (
    id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId"              TEXT NOT NULL REFERENCES app_auth."user"(id) ON DELETE CASCADE,
    "betterAuthSessionId" TEXT NOT NULL UNIQUE,
    "sessionId"           TEXT NOT NULL UNIQUE,
    "ipAddress"           TEXT NOT NULL,
    "city"                TEXT,
    "region"              TEXT,
    "country"             TEXT NOT NULL,
    "latitude"            DOUBLE PRECISION,
    "longitude"           DOUBLE PRECISION,
    "isp"                 TEXT,
    "deviceType"          app_auth."DeviceType" NOT NULL,
    "os"                  TEXT NOT NULL,
    "osVersion"           TEXT NOT NULL,
    "browser"             TEXT NOT NULL,
    "browserVersion"      TEXT NOT NULL,
    "fingerprint"         TEXT NOT NULL,
    "isTrusted"           BOOLEAN NOT NULL DEFAULT false,
    "trustGrantedAt"      TIMESTAMP(3),
    "riskLevel"           app_auth."SessionRiskLevel" NOT NULL,
    "suspicionReasons"    TEXT[],
    "createdAt"           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_device_sessions_userId ON app_auth.device_sessions("userId");
CREATE INDEX IF NOT EXISTS idx_device_sessions_fingerprint ON app_auth.device_sessions("userId", "fingerprint");
CREATE INDEX IF NOT EXISTS idx_device_sessions_createdAt ON app_auth.device_sessions("createdAt" DESC);

-- 3.3 Suspicious Session Audits: Tracking and resolution of flagged login attempts
CREATE TABLE IF NOT EXISTS app_auth.suspicious_session_audits (
    id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "deviceSessionId" TEXT NOT NULL REFERENCES app_auth.device_sessions(id) ON DELETE CASCADE,
    "userId"          TEXT NOT NULL REFERENCES app_auth."user"(id) ON DELETE CASCADE,
    "eventId"         TEXT NOT NULL UNIQUE,
    "riskLevel"       app_auth."SessionRiskLevel" NOT NULL,
    "suspicionReasons" TEXT[],
    "ipAddress"       TEXT NOT NULL,
    "country"         TEXT NOT NULL,
    "fingerprint"     TEXT NOT NULL,
    "resolvedAt"      TIMESTAMP(3),
    "resolvedBy"      TEXT,
    "resolution"      app_auth."AuditResolution",
    "emailSentAt"     TIMESTAMP(3),
    "requestId"       TEXT NOT NULL,
    "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_suspicious_audits_userId ON app_auth.suspicious_session_audits("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_suspicious_audits_deviceSessionId ON app_auth.suspicious_session_audits("deviceSessionId");

-- 3.4 Email Audit: Logs all auth-related emails sent (verification, reset, security alerts)
CREATE TABLE IF NOT EXISTS app_auth.email_audit (
    id                 TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "eventId"           TEXT NOT NULL UNIQUE,
    "eventName"         TEXT NOT NULL,
    "userId"            TEXT NOT NULL REFERENCES app_auth."user"(id) ON DELETE CASCADE,
    "toEmail"           TEXT NOT NULL,
    "status"            app_auth."EmailStatus" NOT NULL,
    "providerMessageId" TEXT,
    "failReason"        TEXT,
    "requestId"         TEXT NOT NULL,
    "sentAt"            TIMESTAMP(3),
    "failedAt"          TIMESTAMP(3),
    "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_email_audit_userId ON app_auth.email_audit("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_email_audit_status ON app_auth.email_audit("status", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_email_audit_eventName ON app_auth.email_audit("eventName", "createdAt" DESC);

-- ================================================================
-- 4. RLS & TRIGGERS
-- ================================================================

ALTER TABLE app_auth."user" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_user" ON app_auth."user" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_user_access" ON app_auth."user" FOR ALL TO authenticated USING (id = public.uid()::text) WITH CHECK (id = public.uid()::text);

ALTER TABLE app_auth.session ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_session" ON app_auth.session FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_session_access" ON app_auth.session FOR ALL TO authenticated USING ("userId" = public.uid()::text) WITH CHECK ("userId" = public.uid()::text);

ALTER TABLE app_auth.device_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_device_sessions" ON app_auth.device_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_device_sessions_access" ON app_auth.device_sessions FOR SELECT TO authenticated USING ("userId" = public.uid()::text);

ALTER TABLE app_auth.suspicious_session_audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_suspicious_session_audits" ON app_auth.suspicious_session_audits FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_suspicious_session_audits_access" ON app_auth.suspicious_session_audits FOR SELECT TO authenticated USING ("userId" = public.uid()::text);

ALTER TABLE app_auth.email_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_email_audit" ON app_auth.email_audit FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Utility triggers for updatedAt
SELECT public.create_updated_at_trigger('app_auth', 'roles');
SELECT public.create_updated_at_trigger('app_auth', 'permissions');
SELECT public.create_updated_at_trigger('app_auth', 'user');
SELECT public.create_updated_at_trigger('app_auth', 'session');
SELECT public.create_updated_at_trigger('app_auth', 'account');
SELECT public.create_updated_at_trigger('app_auth', 'verification');
SELECT public.create_updated_at_trigger('app_auth', 'two_factors');
SELECT public.create_updated_at_trigger('app_auth', 'device_sessions');
SELECT public.create_updated_at_trigger('app_auth', 'email_audit');
