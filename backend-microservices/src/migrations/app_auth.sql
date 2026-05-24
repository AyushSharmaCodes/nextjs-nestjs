-- ================================================================
-- SCHEMA: APP_AUTH (IDENTITIES, SESSIONS & SECURITY AUDITING)
-- ================================================================

-- 1. SECURITY SECURITY ENUMS
DO $$ BEGIN
    CREATE TYPE "app_auth"."EmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED');
    CREATE TYPE "app_auth"."DeviceType" AS ENUM ('DESKTOP', 'MOBILE', 'TABLET', 'BOT', 'UNKNOWN');
    CREATE TYPE "app_auth"."SessionRiskLevel" AS ENUM ('NORMAL', 'SUSPICIOUS', 'HIGH_RISK');
    CREATE TYPE "app_auth"."AuditResolution" AS ENUM ('CONFIRMED_BY_USER', 'REVOKED_BY_USER', 'AUTO_REVOKED', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. GENDERS MASTER TABLE
CREATE TABLE IF NOT EXISTS app_auth.genders (
  id          TEXT          PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name        VARCHAR(50)   NOT NULL UNIQUE
);
INSERT INTO app_auth.genders (name) VALUES ('Male'), ('Female'), ('Other') ON CONFLICT DO NOTHING;

-- 3. ROLE-BASED ACCESS CONTROL (RBAC)
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

-- 4. USER ACCOUNTS & CREDENTIALS
CREATE TABLE IF NOT EXISTS app_auth."user" (
    id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "firstName"      TEXT,
    "lastName"       TEXT,
    email            TEXT NOT NULL,
    "emailVerified"    BOOLEAN NOT NULL DEFAULT false,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    image            TEXT,
    role             TEXT NOT NULL DEFAULT 'CUSTOMER' REFERENCES app_auth.roles(name),
    gender_id        TEXT REFERENCES app_auth.genders(id) ON DELETE RESTRICT,
    nationality_country_code CHAR(2), -- Foreign key added as alter statement at end of compilation
    preferred_currency VARCHAR(10) DEFAULT 'INR',
    email_notification BOOLEAN DEFAULT TRUE,
    "lastLoginAt"      TIMESTAMP(3),
    "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_email ON app_auth."user"(lower(email));
CREATE INDEX IF NOT EXISTS idx_user_gender_id ON app_auth.user(gender_id);
CREATE INDEX IF NOT EXISTS idx_user_nationality_country_code ON app_auth.user(nationality_country_code);

-- 5. SESSIONS
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

-- 6. OAUTH LINKAGE
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

-- 7. VERIFICATIONS
CREATE TABLE IF NOT EXISTS app_auth.verification (
    id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    identifier TEXT NOT NULL,
    value      TEXT NOT NULL,
    "expiresAt"  TIMESTAMPTZ NOT NULL,
    "createdAt"  TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt"  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_verification_identifier ON app_auth.verification(identifier);

-- 8. TOTP SECRETS
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

-- 9. DEVICE DETAILED SESSIONS
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

-- 10. SUSPICIOUS LOGINS AUDITING
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

-- 11. EMAILS AUDIT LOG
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

-- 12. ROW LEVEL SECURITY (RLS)
ALTER TABLE app_auth.roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_roles" ON app_auth.roles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_read_roles" ON app_auth.roles FOR SELECT TO authenticated USING (true);

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
