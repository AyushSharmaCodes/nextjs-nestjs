-- ================================================================
-- MERIGAUMATA — MODULAR MONOLITH AUTHENTICATION & RBAC MIGRATION
-- Version: 1.2.0
-- Date: 2026-05-19
-- Strategy: Dedicated isolated schema "app_auth" for authentication
-- Updated: Better-Auth with snake_case columns
-- ================================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0.1 MIGRATION: Rename existing snake_case columns to camelCase
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'app_auth' AND table_name = 'roles' AND column_name = 'updated_at') THEN
        ALTER TABLE app_auth.roles ALTER COLUMN updated_at SET DEFAULT NOW();
        ALTER TABLE app_auth.roles RENAME COLUMN updated_at TO updatedAt;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'app_auth' AND table_name = 'roles' AND column_name = 'created_at') THEN
        ALTER TABLE app_auth.roles RENAME COLUMN created_at TO createdAt;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'app_auth' AND table_name = 'permissions' AND column_name = 'updated_at') THEN
        ALTER TABLE app_auth.permissions ALTER COLUMN updated_at SET DEFAULT NOW();
        ALTER TABLE app_auth.permissions RENAME COLUMN updated_at TO updatedAt;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'app_auth' AND table_name = 'permissions' AND column_name = 'created_at') THEN
        ALTER TABLE app_auth.permissions RENAME COLUMN created_at TO createdAt;
    END IF;
END $$;

-- 1. LOCAL DEVELOPMENT COMPATIBILITY (Roles, Schemas & Privileges)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon;
  END IF;
END
$$;

-- 2. CREATE SCHEMA
CREATE SCHEMA IF NOT EXISTS app_auth;

GRANT ALL ON SCHEMA app_auth TO PUBLIC;

-- 2.1 UID Helper Function wrapper (cross-compatible for Supabase and generic PG)
CREATE OR REPLACE FUNCTION public.uid()
RETURNS UUID LANGUAGE plpgsql STABLE AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p 
    JOIN pg_namespace n ON p.pronamespace = n.oid 
    WHERE n.nspname = 'auth' AND p.proname = 'uid'
  ) THEN
    RETURN auth.uid();
  ELSE
    RETURN NULL::UUID;
  END IF;
END;
$$;
GRANT ALL ON SCHEMA app_auth TO postgres;
GRANT ALL ON SCHEMA app_auth TO authenticated;
GRANT ALL ON SCHEMA app_auth TO service_role;

-- 3. SHARED UTILITY: updatedAt TRIGGER
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

-- 4. TABLES DEFINITIONS (ALL camelCase)

-- 4.1 Roles (custom RBAC - camelCase)
CREATE TABLE IF NOT EXISTS app_auth.roles (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name        TEXT NOT NULL UNIQUE,
    description TEXT,
    "isSystem"   BOOLEAN NOT NULL DEFAULT false,
    "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE app_auth.roles ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE app_auth.roles ALTER COLUMN "updatedAt" SET DEFAULT NOW();

INSERT INTO app_auth.roles (name, description, "isSystem") VALUES 
    ('ADMIN', 'System Administrator with full access', true),
    ('MANAGER', 'Store Manager with limited management access', true),
    ('CUSTOMER', 'Regular Customer with shopping access', true)
ON CONFLICT (name) DO NOTHING;

-- 4.2 Permissions & Role Permissions (custom RBAC - camelCase)
CREATE TABLE IF NOT EXISTS app_auth.permissions (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    action      TEXT NOT NULL,
    resource    TEXT NOT NULL,
    description TEXT,
    "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (action, resource)
);
ALTER TABLE app_auth.permissions ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE app_auth.permissions ALTER COLUMN "updatedAt" SET DEFAULT NOW();

CREATE TABLE IF NOT EXISTS app_auth.role_permissions (
    id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "roleId"       TEXT NOT NULL REFERENCES app_auth.roles(id) ON DELETE CASCADE,
    "permissionId" TEXT NOT NULL REFERENCES app_auth.permissions(id) ON DELETE CASCADE,
    "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE ("roleId", "permissionId")
);
ALTER TABLE app_auth.role_permissions ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- 4.3 User (better-auth - uses camelCase in DB)
CREATE TABLE IF NOT EXISTS app_auth."user" (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "firstName"     TEXT NOT NULL DEFAULT 'User',
    "lastName"      TEXT,
    email           TEXT NOT NULL,
    "emailVerified"   BOOLEAN NOT NULL DEFAULT false,
    image           TEXT,
    role            TEXT NOT NULL DEFAULT 'CUSTOMER',
    "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE app_auth."user" ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE app_auth."user" ALTER COLUMN "updatedAt" SET DEFAULT NOW();
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_email ON app_auth."user"(lower(email));
ALTER TABLE app_auth."user" ADD CONSTRAINT "user_role_fkey" FOREIGN KEY (role) REFERENCES app_auth.roles(name) ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS idx_user_role ON app_auth."user"(role);

-- 4.4 Session (better-auth - uses camelCase in DB)
CREATE TABLE IF NOT EXISTS app_auth.session (
    id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "expiresAt"             TIMESTAMPTZ NOT NULL,
    token                 TEXT NOT NULL,
    "createdAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "ipAddress"             TEXT,
    "userAgent"             TEXT,
    "userId"                TEXT NOT NULL REFERENCES app_auth."user"(id) ON DELETE CASCADE,
    "twoFactorVerified"   BOOLEAN
);
ALTER TABLE app_auth.session ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE app_auth.session ALTER COLUMN "updatedAt" SET DEFAULT NOW();
CREATE UNIQUE INDEX IF NOT EXISTS idx_session_token ON app_auth.session(token);
CREATE INDEX IF NOT EXISTS "idx_session_userId" ON app_auth.session("userId");

-- 4.5 Account (better-auth - uses camelCase in DB)
CREATE TABLE IF NOT EXISTS app_auth.account (
    id                       TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "accountId"                TEXT NOT NULL,
    "providerId"               TEXT NOT NULL,
    "userId"                   TEXT NOT NULL REFERENCES app_auth."user"(id) ON DELETE CASCADE,
    "accessToken"             TEXT,
    "refreshToken"            TEXT,
    "idToken"                 TEXT,
    "accessTokenExpiresAt"     TIMESTAMPTZ,
    "refreshTokenExpiresAt"    TIMESTAMPTZ,
    scope                    TEXT,
    password                 TEXT,
    "createdAt"                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE app_auth.account ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE app_auth.account ALTER COLUMN "updatedAt" SET DEFAULT NOW();
CREATE UNIQUE INDEX IF NOT EXISTS idx_account_provider ON app_auth.account("providerId", "accountId");
CREATE INDEX IF NOT EXISTS "idx_account_userId" ON app_auth.account("userId");

-- 4.6 Verification (better-auth - uses camelCase in DB)
CREATE TABLE IF NOT EXISTS app_auth.verification (
    id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    identifier TEXT NOT NULL,
    value      TEXT NOT NULL,
    "expiresAt"  TIMESTAMPTZ NOT NULL,
    "createdAt"  TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt"  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE app_auth.verification ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE app_auth.verification ALTER COLUMN "updatedAt" SET DEFAULT NOW();
CREATE INDEX IF NOT EXISTS idx_verification_identifier ON app_auth.verification(identifier);



-- 4.8 Security Events (audit logging)
CREATE TABLE IF NOT EXISTS app_auth.security_events (
    id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId"        TEXT REFERENCES app_auth."user"(id) ON DELETE SET NULL,
    email          TEXT,
    "eventType"     TEXT NOT NULL,
    status         TEXT NOT NULL,
    "ipAddress"     TEXT,
    "userAgent"     TEXT,
    "correlationId" TEXT,
    metadata       JSONB DEFAULT '{}'::jsonb,
    "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE app_auth.security_events ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
CREATE INDEX IF NOT EXISTS idx_security_events_event_type_created ON app_auth.security_events("eventType", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_user_created ON app_auth.security_events("userId", "createdAt" DESC);

-- 4.9 OTP Email History (custom - tracks OTP emails sent for audit)
CREATE TABLE IF NOT EXISTS app_auth.otp_email_history (
    id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId"    TEXT REFERENCES app_auth."user"(id) ON DELETE SET NULL,
    email      TEXT NOT NULL,
    subject    TEXT NOT NULL,
    body       TEXT NOT NULL,
    status     TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE app_auth.otp_email_history ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
CREATE INDEX IF NOT EXISTS idx_otp_email_history_user ON app_auth.otp_email_history("userId");

-- 4.10 Two Factors (better-auth - uses camelCase in DB)
CREATE TABLE IF NOT EXISTS app_auth.two_factors (
    id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId"       TEXT NOT NULL REFERENCES app_auth."user"(id) ON DELETE CASCADE,
    secret       TEXT NOT NULL,
    "backupCodes"  TEXT[] NOT NULL,
    "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE app_auth.two_factors ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE app_auth.two_factors ALTER COLUMN "updatedAt" SET DEFAULT NOW();
CREATE UNIQUE INDEX IF NOT EXISTS "idx_two_factors_userId" ON app_auth.two_factors("userId");
CREATE INDEX IF NOT EXISTS "idx_two_factors_createdAt" ON app_auth.two_factors("createdAt");

-- 5. ROW LEVEL SECURITY (RLS) POLICIES

-- Roles (custom RBAC)
ALTER TABLE app_auth.roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_roles" ON app_auth.roles;
CREATE POLICY "service_role_roles" ON app_auth.roles FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_read_roles" ON app_auth.roles;
CREATE POLICY "authenticated_read_roles" ON app_auth.roles FOR SELECT TO authenticated USING (true);

-- Permissions (custom RBAC)
ALTER TABLE app_auth.permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_permissions" ON app_auth.permissions;
CREATE POLICY "service_role_permissions" ON app_auth.permissions FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Role Permissions (custom RBAC)
ALTER TABLE app_auth.role_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_role_permissions" ON app_auth.role_permissions;
CREATE POLICY "service_role_role_permissions" ON app_auth.role_permissions FOR ALL TO service_role USING (true) WITH CHECK (true);

-- User (better-auth)
ALTER TABLE app_auth."user" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_user" ON app_auth."user";
CREATE POLICY "service_role_user" ON app_auth."user" FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_user_access" ON app_auth."user";
CREATE POLICY "authenticated_user_access" ON app_auth."user" FOR ALL TO authenticated USING (id = public.uid()::text) WITH CHECK (id = public.uid()::text);

-- Session (better-auth)
ALTER TABLE app_auth.session ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_session" ON app_auth.session;
CREATE POLICY "service_role_session" ON app_auth.session FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_session_access" ON app_auth.session;
CREATE POLICY "authenticated_session_access" ON app_auth.session FOR ALL TO authenticated USING ("userId" = public.uid()::text) WITH CHECK ("userId" = public.uid()::text);

-- Account (better-auth)
ALTER TABLE app_auth.account ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_account" ON app_auth.account;
CREATE POLICY "service_role_account" ON app_auth.account FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_account_access" ON app_auth.account;
CREATE POLICY "authenticated_account_access" ON app_auth.account FOR SELECT TO authenticated USING ("userId" = public.uid()::text);

-- Verification (better-auth)
ALTER TABLE app_auth.verification ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_verification" ON app_auth.verification;
CREATE POLICY "service_role_verification" ON app_auth.verification FOR ALL TO service_role USING (true) WITH CHECK (true);



-- Security Events (custom)
ALTER TABLE app_auth.security_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_security_events" ON app_auth.security_events;
CREATE POLICY "service_role_security_events" ON app_auth.security_events FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_security_events_access" ON app_auth.security_events;
CREATE POLICY "authenticated_security_events_access" ON app_auth.security_events FOR SELECT TO authenticated USING ("userId" = public.uid()::text);

-- OTP Email History (custom)
ALTER TABLE app_auth.otp_email_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_otp_email_history" ON app_auth.otp_email_history;
CREATE POLICY "service_role_otp_email_history" ON app_auth.otp_email_history FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_otp_history_access" ON app_auth.otp_email_history;
CREATE POLICY "authenticated_otp_history_access" ON app_auth.otp_email_history FOR SELECT TO authenticated USING ("userId" = public.uid()::text);

-- Two Factors (better-auth)
ALTER TABLE app_auth.two_factors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_two_factors" ON app_auth.two_factors;
CREATE POLICY "service_role_two_factors" ON app_auth.two_factors FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_two_factors_access" ON app_auth.two_factors;
CREATE POLICY "authenticated_two_factors_access" ON app_auth.two_factors FOR ALL TO authenticated USING ("userId" = public.uid()::text) WITH CHECK ("userId" = public.uid()::text);

-- 6. TRIGGERS FOR updatedAt
SELECT public.create_updated_at_trigger('app_auth', 'roles');
SELECT public.create_updated_at_trigger('app_auth', 'permissions');
SELECT public.create_updated_at_trigger('app_auth', 'user');
SELECT public.create_updated_at_trigger('app_auth', 'session');
SELECT public.create_updated_at_trigger('app_auth', 'account');
SELECT public.create_updated_at_trigger('app_auth', 'verification');
SELECT public.create_updated_at_trigger('app_auth', 'two_factors');
-- 7. HELPER RPC FUNCTIONS

-- 7.1 Check if caller is admin or manager
CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT EXISTS (
        SELECT 1 FROM app_auth."user"
        WHERE id = uid()::text AND role IN ('ADMIN','MANAGER')
    );
$$;

-- 7.2 Cleanup expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_deleted INTEGER;
BEGIN
    DELETE FROM app_auth.session WHERE "expiresAt" < NOW();
    GET DIAGNOSTICS v_deleted := ROW_COUNT;
    RETURN v_deleted;
END; $$;

-- 7.3 Cleanup expired verifications
CREATE OR REPLACE FUNCTION public.cleanup_expired_verifications()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_deleted INTEGER;
BEGIN
    DELETE FROM app_auth.verification WHERE "expiresAt" < NOW();
    GET DIAGNOSTICS v_deleted := ROW_COUNT;
    RETURN v_deleted;
END; $$;

-- 8. GRANTS
GRANT USAGE ON SCHEMA app_auth TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA app_auth TO service_role;

-- ================================================================
-- 9. SUPABASE AUTOMATIC USER SYNC TRIGGERS
-- ================================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'auth' AND table_name = 'users'
  ) THEN
    -- 9.1 Sync User Function
    EXECUTE '
CREATE OR REPLACE FUNCTION public.handle_supabase_user_sync()
    RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $body$
    DECLARE
      defaultRoleId TEXT;
    BEGIN
      INSERT INTO app_auth."user" (
        id,
        "firstName",
        "lastName",
        email,
        "emailVerified",
        "createdAt",
        "updatedAt"
      ) VALUES (
        NEW.id::text,
        COALESCE(NEW.raw_user_meta_data->>''first_name'', NEW.raw_user_meta_data->>''name'', NEW.email),
        NEW.raw_user_meta_data->>''last_name'',
        NEW.email,
        (NEW.email_confirmed_at IS NOT NULL),
        COALESCE(NEW.created_at, NOW()),
        COALESCE(NEW.updated_at, NOW())
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        "emailVerified" = EXCLUDED."emailVerified",
        "updatedAt" = NOW();



      RETURN NEW;
    END;
    $body$;
    ';

    -- Bind sync trigger
    DROP TRIGGER IF EXISTS on_supabase_user_sync ON auth.users;
    CREATE TRIGGER on_supabase_user_sync
      AFTER INSERT OR UPDATE OF email, email_confirmed_at ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_supabase_user_sync();

    -- 9.2 Sync Soft Delete Function
    EXECUTE '
    CREATE OR REPLACE FUNCTION public.handle_supabase_user_delete()
    RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $body$
    BEGIN
      DELETE FROM app_auth."user" WHERE id = OLD.id::text;
      RETURN OLD;
    END;
    $body$;
    ';

    -- Bind delete trigger
    DROP TRIGGER IF EXISTS on_supabase_user_delete ON auth.users;
    CREATE TRIGGER on_supabase_user_delete
      AFTER DELETE ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_supabase_user_delete();

  END IF;
END
$$;