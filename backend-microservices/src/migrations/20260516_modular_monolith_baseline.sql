-- ================================================================
-- MERIGAUMATA — MODULAR MONOLITH BASELINE CONSOLIDATED MIGRATION
-- Version: 3.1.0
-- Date: 2026-05-23
--
-- This migration sets up the shared database infrastructure,
-- schemas, and all core modules for the Merigaumata platform.
-- ================================================================

-- ================================================================
-- 1. PUBLIC SCHEMA, EXTENSIONS & HELPER PROCEDURES
-- ================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN CREATE ROLE service_role; END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated; END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon; END IF;
END $$;

CREATE SCHEMA IF NOT EXISTS app_config;        -- System configuration & RBAC metadata
CREATE SCHEMA IF NOT EXISTS app_auth;          -- Auth identities & sessions
CREATE SCHEMA IF NOT EXISTS app_user;          -- User profiles & domain entities
CREATE SCHEMA IF NOT EXISTS app_product;       -- Catalog & Inventory
CREATE SCHEMA IF NOT EXISTS app_cart;          -- Shopping carts
CREATE SCHEMA IF NOT EXISTS app_order;         -- Order processing
CREATE SCHEMA IF NOT EXISTS app_payment;       -- Payment records
CREATE SCHEMA IF NOT EXISTS app_event;         -- Event registrations
CREATE SCHEMA IF NOT EXISTS app_content;       -- CMS (Blogs, FAQs, etc.)
CREATE SCHEMA IF NOT EXISTS app_communication; -- Email & Messaging
CREATE SCHEMA IF NOT EXISTS app_analytics;     -- System logs
CREATE SCHEMA IF NOT EXISTS app_storage;       -- Media metadata
CREATE SCHEMA IF NOT EXISTS app_cron;          -- Scheduled tasks

-- uid(): Resolves current user ID from Supabase context
CREATE OR REPLACE FUNCTION public.uid()
RETURNS UUID LANGUAGE plpgsql STABLE AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'auth' AND p.proname = 'uid') THEN
    RETURN auth.uid();
  ELSE
    RETURN NULL::UUID;
  END IF;
END; $$;

-- set_updated_at(): Shared updatedAt trigger handler
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW."updatedAt" = NOW(); RETURN NEW; END; $$;

-- create_updated_at_trigger(): Helper to generate trigger on tables
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

-- is_admin_or_manager(): RBAC check for stored procedures
CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT EXISTS (SELECT 1 FROM app_auth."user" WHERE id = uid()::text AND role IN ('ADMIN','MANAGER'));
$$;

-- Table: public.ai_nim_logs
CREATE TABLE IF NOT EXISTS public.ai_nim_logs (
  id                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  model              VARCHAR(100)  NOT NULL,
  prompt_tokens      INT,
  completion_tokens  INT,
  total_tokens       INT,
  latency_ms         INT,
  finish_reason      VARCHAR(50),
  request_payload    JSONB         NOT NULL,
  response_payload   JSONB,
  error              TEXT,
  triggered_by_event VARCHAR(100),
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nim_logs_model           ON public.ai_nim_logs (model);
CREATE INDEX IF NOT EXISTS idx_nim_logs_triggered_by    ON public.ai_nim_logs (triggered_by_event);
CREATE INDEX IF NOT EXISTS idx_nim_logs_created_at      ON public.ai_nim_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nim_logs_error           ON public.ai_nim_logs (error) WHERE error IS NOT NULL;


-- ================================================================
-- 2. CONFIG SCHEMA TABLES
-- ================================================================

CREATE TABLE IF NOT EXISTS app_config.system_switches (
    key         TEXT PRIMARY KEY,
    value       JSONB   NOT NULL,
    description TEXT,
    "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE app_config.system_switches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_system_switches" ON app_config.system_switches FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_read_system_switches" ON app_config.system_switches FOR SELECT TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS app_config.idempotency_keys (
    cache_key       TEXT PRIMARY KEY,
    "userId"         TEXT NOT NULL,
    idempotency_key TEXT NOT NULL,
    correlation_id  TEXT,
    in_progress     BOOLEAN NOT NULL DEFAULT true,
    "statusCode"     INTEGER,
    response        JSONB,
    "completedAt"    TIMESTAMPTZ,
    "expiresAt"      TIMESTAMPTZ NOT NULL,
    "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_idempotency_userId ON app_config.idempotency_keys("userId");
CREATE INDEX IF NOT EXISTS idx_idempotency_expiresAt ON app_config.idempotency_keys("expiresAt");

ALTER TABLE app_config.idempotency_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_idempotency" ON app_config.idempotency_keys FOR ALL TO service_role USING (true) WITH CHECK (true);


-- ================================================================
-- 3. APP_USER SCHEMA TABLES (COUNTRIES, PROFILES & ADDRESSES)
-- ================================================================

CREATE TABLE IF NOT EXISTS app_user.countries (
  id              INTEGER       PRIMARY KEY,
  iso2            CHAR(2)       NOT NULL UNIQUE,
  iso3            CHAR(3)       NOT NULL UNIQUE,
  name            VARCHAR(100)  NOT NULL,
  phonecode       VARCHAR(20),
  capital         VARCHAR(100),
  currency        VARCHAR(10),
  native          VARCHAR(100),
  region          VARCHAR(50),
  region_id       INTEGER,
  subregion       VARCHAR(100),
  subregion_id    INTEGER,
  timezones       JSONB,
  emoji           VARCHAR(10),
  latitude        VARCHAR(20),
  longitude       VARCHAR(20),
  synced_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_countries_iso2      ON app_user.countries (iso2);
CREATE INDEX IF NOT EXISTS idx_countries_iso3      ON app_user.countries (iso3);
CREATE INDEX IF NOT EXISTS idx_countries_region    ON app_user.countries (region);
CREATE INDEX IF NOT EXISTS idx_countries_synced_at ON app_user.countries (synced_at);

CREATE OR REPLACE FUNCTION app_user.set_countries_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_countries_updated_at ON app_user.countries;
CREATE TRIGGER trg_countries_updated_at
  BEFORE UPDATE ON app_user.countries
  FOR EACH ROW EXECUTE FUNCTION app_user.set_countries_updated_at();

CREATE TABLE IF NOT EXISTS app_user.profiles (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId"      TEXT UNIQUE NOT NULL,
    "roleId"      TEXT NOT NULL,
    "firstName"   TEXT,
    "lastName"    TEXT,
    locale      TEXT NOT NULL DEFAULT 'en',
    timezone    TEXT NOT NULL DEFAULT 'UTC',
    "isActive"    BOOLEAN NOT NULL DEFAULT true,
    "isVerified"  BOOLEAN NOT NULL DEFAULT false,
    "avatarUrl"   TEXT,
    "coverUrl"    TEXT,
    "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "deletedAt"   TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_profiles_userId ON app_user.profiles("userId");
CREATE INDEX IF NOT EXISTS idx_profiles_roleId ON app_user.profiles("roleId");
CREATE INDEX IF NOT EXISTS idx_profiles_isActive ON app_user.profiles("isActive") WHERE "deletedAt" IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_createdAt ON app_user.profiles("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_lastName ON app_user.profiles("lastName") WHERE "deletedAt" IS NULL;

CREATE TABLE IF NOT EXISTS app_user.user_addresses (
    id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "profileId"     TEXT NOT NULL REFERENCES app_user.profiles(id) ON DELETE CASCADE,
    label         TEXT NOT NULL DEFAULT 'HOME',
    line1         TEXT NOT NULL,
    line2         TEXT,
    city          TEXT NOT NULL,
    state         TEXT NOT NULL,
    "countryCode"  CHAR(2) NOT NULL,
    "postalCode"   TEXT NOT NULL,
    "isDefault"    BOOLEAN NOT NULL DEFAULT false,
    "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "deletedAt"    TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_addresses_profileId ON app_user.user_addresses("profileId");

CREATE TABLE IF NOT EXISTS app_user.user_phone_numbers (
    id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "profileId"     TEXT NOT NULL REFERENCES app_user.profiles(id) ON DELETE CASCADE,
    country_id    INTEGER REFERENCES app_user.countries(id) ON DELETE SET NULL,
    number        TEXT NOT NULL,
    label         TEXT NOT NULL DEFAULT 'MOBILE',
    "isDefault"    BOOLEAN NOT NULL DEFAULT false,
    "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_profileId ON app_user.user_phone_numbers("profileId");
CREATE INDEX IF NOT EXISTS idx_phone_numbers_country_id ON app_user.user_phone_numbers(country_id);

CREATE TABLE IF NOT EXISTS app_user.managers (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "identityId" TEXT NOT NULL UNIQUE,
    name        VARCHAR(255) NOT NULL,
    phone       VARCHAR(20),
    role        VARCHAR(20) NOT NULL DEFAULT 'manager',
    "creatorId"  TEXT REFERENCES app_user.profiles(id) ON DELETE SET NULL,
    "isActive"   BOOLEAN NOT NULL DEFAULT true,
    "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_managers_identityId ON app_user.managers("identityId");
CREATE INDEX IF NOT EXISTS idx_managers_creatorId ON app_user.managers("creatorId");

ALTER TABLE app_user.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_profiles" ON app_user.profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_view_own_profile" ON app_user.profiles FOR SELECT TO authenticated USING (public.uid()::text = "userId");

ALTER TABLE app_user.user_addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_addresses" ON app_user.user_addresses FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "users_own_addresses" ON app_user.user_addresses FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM app_user.profiles p WHERE p.id = "profileId" AND p."userId" = public.uid()::text));

ALTER TABLE app_user.user_phone_numbers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_phone_numbers" ON app_user.user_phone_numbers FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "users_own_phone_numbers" ON app_user.user_phone_numbers FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM app_user.profiles p WHERE p.id = "profileId" AND p."userId" = public.uid()::text));

ALTER TABLE app_user.managers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_managers" ON app_user.managers FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION app_user.handle_new_user_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_customer_role_id TEXT;
BEGIN
    SELECT id INTO v_customer_role_id FROM app_auth.roles WHERE name = 'CUSTOMER';

    INSERT INTO app_user.profiles (
        id,
        "userId",
        "roleId",
        "firstName",
        "lastName",
        "isActive"
    ) VALUES (
        gen_random_uuid()::text,
        NEW.id,
        v_customer_role_id,
        NEW."firstName",
        NEW."lastName",
        true
    ) ON CONFLICT ("userId") DO NOTHING;

    RETURN NEW;
END; $$;


-- ================================================================
-- 4. APP_AUTH SCHEMA TABLES (IDENTITIES, SESSIONS & SECURITY AUDITING)
-- ================================================================

DO $$ BEGIN
    CREATE TYPE "app_auth"."EmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED');
    CREATE TYPE "app_auth"."DeviceType" AS ENUM ('DESKTOP', 'MOBILE', 'TABLET', 'BOT', 'UNKNOWN');
    CREATE TYPE "app_auth"."SessionRiskLevel" AS ENUM ('NORMAL', 'SUSPICIOUS', 'HIGH_RISK');
    CREATE TYPE "app_auth"."AuditResolution" AS ENUM ('CONFIRMED_BY_USER', 'REVOKED_BY_USER', 'AUTO_REVOKED', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS app_auth.genders (
  id          TEXT          PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name        VARCHAR(50)   NOT NULL UNIQUE
);
INSERT INTO app_auth.genders (name) VALUES ('Male'), ('Female'), ('Other') ON CONFLICT DO NOTHING;

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
    nationality_country_code CHAR(2), -- Foreign key constraint added later
    preferred_currency VARCHAR(10) DEFAULT 'INR',
    email_notification BOOLEAN DEFAULT TRUE,
    "lastLoginAt"      TIMESTAMP(3),
    "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_email ON app_auth."user"(lower(email));
CREATE INDEX IF NOT EXISTS idx_user_gender_id ON app_auth.user(gender_id);
CREATE INDEX IF NOT EXISTS idx_user_nationality_country_code ON app_auth.user(nationality_country_code);

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

CREATE TABLE IF NOT EXISTS app_auth.verification (
    id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    identifier TEXT NOT NULL,
    value      TEXT NOT NULL,
    "expiresAt"  TIMESTAMPTZ NOT NULL,
    "createdAt"  TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt"  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_verification_identifier ON app_auth.verification(identifier);

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


-- ================================================================
-- 5. APP_PRODUCT CATALOG SCHEMA TABLES
-- ================================================================

CREATE TABLE IF NOT EXISTS app_product.categories (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT NOT NULL,
    "isActive"     BOOLEAN NOT NULL DEFAULT true,
    "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_categories_isActive ON app_product.categories("isActive");

CREATE TABLE IF NOT EXISTS app_product.products (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title                  TEXT NOT NULL,
    price                  NUMERIC(10,2) NOT NULL,
    "isActive"              BOOLEAN NOT NULL DEFAULT true,
    "createdAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_isActive ON app_product.products("isActive");
CREATE INDEX IF NOT EXISTS idx_products_createdAt ON app_product.products("createdAt" DESC);


-- ================================================================
-- 6. APP_ORDER PROCESSING SCHEMA TABLES
-- ================================================================

CREATE TABLE IF NOT EXISTS app_order.orders (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderNumber"    TEXT UNIQUE,
    "totalAmount"    NUMERIC(12,2) NOT NULL DEFAULT 0,
    status           TEXT NOT NULL DEFAULT 'pending',
    "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_status ON app_order.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_createdAt ON app_order.orders("createdAt" DESC);


-- ================================================================
-- 7. FOREIGN KEY CONSTRAINTS (CROSS-SCHEMA LINKS)
-- ================================================================

ALTER TABLE app_auth."user" 
  ADD CONSTRAINT fk_user_countries FOREIGN KEY (nationality_country_code) REFERENCES app_user.countries(iso2) ON DELETE RESTRICT;

ALTER TABLE app_user.profiles 
  ADD CONSTRAINT fk_profiles_user FOREIGN KEY ("userId") REFERENCES app_auth.user(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_profiles_roles FOREIGN KEY ("roleId") REFERENCES app_auth.roles(id) ON DELETE RESTRICT;

ALTER TABLE app_user.managers 
  ADD CONSTRAINT fk_managers_user FOREIGN KEY ("identityId") REFERENCES app_auth.user(id) ON DELETE CASCADE;


-- ================================================================
-- 8. COMPILATION TRIGGERS & GRANTS
-- ================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON app_auth."user";
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON app_auth."user"
  FOR EACH ROW EXECUTE FUNCTION app_user.handle_new_user_profile();

SELECT public.create_updated_at_trigger('app_auth', 'roles');
SELECT public.create_updated_at_trigger('app_auth', 'user');
SELECT public.create_updated_at_trigger('app_auth', 'session');
SELECT public.create_updated_at_trigger('app_auth', 'account');
SELECT public.create_updated_at_trigger('app_auth', 'verification');
SELECT public.create_updated_at_trigger('app_auth', 'two_factors');
SELECT public.create_updated_at_trigger('app_auth', 'device_sessions');
SELECT public.create_updated_at_trigger('app_auth', 'email_audit');

SELECT public.create_updated_at_trigger('app_user', 'profiles');
SELECT public.create_updated_at_trigger('app_user', 'user_addresses');
SELECT public.create_updated_at_trigger('app_user', 'user_phone_numbers');
SELECT public.create_updated_at_trigger('app_user', 'managers');

SELECT public.create_updated_at_trigger('app_product', 'products');

-- Supabase auth integration trigger (conditional)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    EXECUTE '
    CREATE OR REPLACE FUNCTION public.handle_supabase_user_sync()
    RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $body$
    BEGIN
      INSERT INTO app_auth."user" (id, "firstName", "lastName", email, "emailVerified", "createdAt", "updatedAt")
      VALUES (NEW.id::text, COALESCE(NEW.raw_user_meta_data->>''first_name'', NEW.raw_user_meta_data->>''name'', NEW.email),
              NEW.raw_user_meta_data->>''last_name'', NEW.email, (NEW.email_confirmed_at IS NOT NULL),
              COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()))
      ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, "emailVerified" = EXCLUDED."emailVerified", "updatedAt" = NOW();
      RETURN NEW;
    END; $body$; ';

    DROP TRIGGER IF EXISTS on_supabase_user_sync ON auth.users;
    CREATE TRIGGER on_supabase_user_sync AFTER INSERT OR UPDATE OF email, email_confirmed_at ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_supabase_user_sync();
  END IF;
END $$;

GRANT USAGE ON SCHEMA app_config, app_auth, app_user, app_product, app_cart, app_order, app_payment, app_event, app_content, app_communication, app_analytics, app_storage, app_cron TO authenticated, anon, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA app_config, app_auth, app_user, app_product, app_cart, app_order, app_payment, app_event, app_content, app_communication, app_analytics, app_storage, app_cron TO service_role;

DO $$ BEGIN RAISE NOTICE '✅ Shared baseline migration complete.'; END $$;
