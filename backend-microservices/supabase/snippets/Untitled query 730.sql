-- ================================================================
-- MERIGAUMATA — MODULAR MONOLITH BASELINE MIGRATION
-- Version: 1.0.0
-- Date: 2026-05-16
-- Strategy: Single Supabase DB, one PostgreSQL schema per domain
--
-- Schemas:
--   config      — system_switches, store_settings, roles, brand_assets, geo/currency cache
--   auth        — identities, sessions, OTPs, OAuth, refresh tokens
--   user        — profiles, addresses, managers, permissions, deletion
--   product     — products, variants, categories, delivery, inventory, reviews
--   cart        — carts, items, coupons
--   order       — orders, items, invoices, returns, QC, reservations
--   payment     — payment_intents, refunds, webhook_logs
--   event       — events, registrations, donations, subscriptions
--   content     — blogs, gallery, about, contact, FAQs, testimonials, policies
--   communication — email queue/templates, alerts, contact messages
--   analytics   — audit logs, request logs, realtime events
--   storage     — file records
--   cron        — background jobs, job runs
--
-- All tables use service_role RLS bypass for backend access.
-- Cross-schema FKs are fully qualified (schema.table).
-- ================================================================

-- ================================================================
-- LOCAL DEVELOPMENT COMPATIBILITY (Roles, Schemas & Privileges)
-- ================================================================
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

CREATE SCHEMA IF NOT EXISTS auth;
GRANT ALL ON SCHEMA auth TO PUBLIC;
GRANT ALL ON SCHEMA auth TO postgres;
GRANT ALL ON SCHEMA auth TO authenticated;
GRANT ALL ON SCHEMA auth TO service_role;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_proc p 
    JOIN pg_namespace n ON p.pronamespace = n.oid 
    WHERE n.nspname = 'auth' AND p.proname = 'uid'
  ) THEN
    EXECUTE 'CREATE FUNCTION auth.uid() RETURNS UUID LANGUAGE sql STABLE AS $body$ SELECT NULL::UUID; $body$';
  END IF;
END
$$;

-- ==========================================
-- 0. EXTENSIONS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- trigram search on text fields
CREATE EXTENSION IF NOT EXISTS "btree_gin";   -- GIN indexes on scalar types

-- ==========================================
-- 1. SCHEMAS
-- ==========================================
CREATE SCHEMA IF NOT EXISTS config;
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS "user";
CREATE SCHEMA IF NOT EXISTS product;
CREATE SCHEMA IF NOT EXISTS cart;
CREATE SCHEMA IF NOT EXISTS "order";
CREATE SCHEMA IF NOT EXISTS payment;
CREATE SCHEMA IF NOT EXISTS event;
CREATE SCHEMA IF NOT EXISTS content;
CREATE SCHEMA IF NOT EXISTS communication;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS cron;

-- ==========================================
-- 2. SHARED UTILITY: updated_at TRIGGER
-- ==========================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

-- Helper macro: call after each table that has updated_at
-- Usage: SELECT public.create_updated_at_trigger('schema', 'table');
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

-- ==========================================
-- 3. CONFIG SCHEMA
-- ==========================================

-- 3.1 Roles
CREATE TABLE IF NOT EXISTS config.roles (
    id   SERIAL PRIMARY KEY,
    name TEXT   NOT NULL UNIQUE
);
INSERT INTO config.roles (name) VALUES ('admin'),('manager'),('customer')
ON CONFLICT (name) DO NOTHING;

-- 3.2 System Switches (dynamic feature flags)
CREATE TABLE IF NOT EXISTS config.system_switches (
    key         TEXT PRIMARY KEY,
    value       JSONB   NOT NULL,
    description TEXT,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE config.system_switches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_system_switches" ON config.system_switches;
CREATE POLICY "service_role_system_switches" ON config.system_switches
    FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_read_system_switches" ON config.system_switches;
CREATE POLICY "authenticated_read_system_switches" ON config.system_switches
    FOR SELECT TO authenticated USING (true);

SELECT public.create_updated_at_trigger('config','system_switches');

INSERT INTO config.system_switches (key, value, description) VALUES
('ENABLE_INTERNAL_SCHEDULER',    'false',                           'Toggle internal Node.js scheduler'),
('ENABLE_RESERVATION_CLEANUP',   'false',                           'Toggle automated cleanup of expired cart reservations'),
('RAZORPAY_SMS_NOTIFY',          'false',                           'Allow Razorpay to send SMS to customers'),
('RAZORPAY_EMAIL_NOTIFY',        'false',                           'Allow Razorpay to send Emails to customers'),
('AUTO_REPLY_ENABLED',           'true',                            'Auto-reply on contact form submission'),
('INVOICE_STORAGE_STRATEGY',     '"SUPABASE"',                      'Invoice storage: SUPABASE | LOCAL | BOTH'),
('CURRENCY_PRIMARY_PROVIDER',    '"currencyapi.net"',               'Live currency exchange rate provider'),
('CACHE_PROVIDER',               '"memory"',                        'Cache strategy: memory | redis'),
('BRAND_LOGO_URL',               '""',                              'Official brand logo URL'),
('ALLOWED_ORIGINS',              '"http://localhost:5173,http://localhost:3000"', 'Comma-separated CORS origins'),
('SELLER_STATE_CODE',            '"09"',                            'State code for GST/invoice'),
('SELLER_GSTIN',                 '""',                              'GSTIN of seller business'),
('SELLER_CIN',                   '""',                              'CIN of seller business'),
('SUPPORT_EMAIL',                '"support@merigaumata.com"',        'Primary customer support email'),
('AUTH_COOKIE_SAMESITE',         '"lax"',                           'SameSite policy for auth cookies'),
('AUTH_COOKIE_SECURE',           'false',                           'Secure policy for auth cookies'),
('CHECKOUT_RECOVERY_WINDOW_MINS','30',                              'Minutes after which abandoned cart is eligible for recovery'),
('INVENTORY_BUFFER_PERCENT',     '5',                               'Safety buffer percent for inventory checks'),
('ENABLE_AUTO_RESTOCK',          'true',                            'Auto-restock on return QC pass'),
('IS_MAINTENANCE_MODE',          'false',                           'Global maintenance mode toggle'),
('MAINTENANCE_BYPASS_IPS',       '""',                              'Comma-separated admin IPs allowed through maintenance')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description;

-- 3.3 Store Settings
CREATE TABLE IF NOT EXISTS config.store_settings (
    key         TEXT PRIMARY KEY,
    value       JSONB NOT NULL,
    description TEXT,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE config.store_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_store_settings" ON config.store_settings;
CREATE POLICY "service_role_store_settings" ON config.store_settings
    FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_read_store_settings" ON config.store_settings;
CREATE POLICY "public_read_store_settings" ON config.store_settings
    FOR SELECT USING (key IN ('delivery_threshold','delivery_charge','delivery_gst','delivery_gst_mode','base_currency'));

SELECT public.create_updated_at_trigger('config','store_settings');

INSERT INTO config.store_settings (key, value, description) VALUES
('delivery_threshold', '1500',      'Min order amount for free delivery'),
('delivery_charge',    '50',        'Standard delivery charge below threshold'),
('delivery_gst',       '0',         'GST rate for delivery charges'),
('delivery_gst_mode',  '"inclusive"','How delivery GST is applied'),
('base_currency',      '"INR"',     'Default display currency')
ON CONFLICT (key) DO NOTHING;

-- 3.4 Brand Assets
CREATE TABLE IF NOT EXISTS config.brand_assets (
    key         TEXT PRIMARY KEY,
    url         TEXT NOT NULL,
    description TEXT,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE config.brand_assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_brand_assets" ON config.brand_assets;
CREATE POLICY "public_read_brand_assets" ON config.brand_assets FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "service_role_brand_assets" ON config.brand_assets;
CREATE POLICY "service_role_brand_assets" ON config.brand_assets FOR ALL TO service_role USING (true) WITH CHECK (true);

SELECT public.create_updated_at_trigger('config','brand_assets');

INSERT INTO config.brand_assets (key, url, description) VALUES
('CONTACT_HERO', '', 'Hero image for Contact page'),
('ABOUT_HERO',   '', 'Hero image for About page'),
('FAQ_HERO',     '', 'Hero image for FAQ page')
ON CONFLICT (key) DO NOTHING;

-- 3.5 Idempotency Keys
CREATE TABLE IF NOT EXISTS config.idempotency_keys (
    cache_key       TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL,
    idempotency_key TEXT NOT NULL,
    correlation_id  TEXT,
    in_progress     BOOLEAN NOT NULL DEFAULT true,
    status_code     INTEGER,
    response        JSONB,
    completed_at    TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_expires ON config.idempotency_keys(expires_at);
ALTER TABLE config.idempotency_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_idempotency" ON config.idempotency_keys;
CREATE POLICY "service_role_idempotency" ON config.idempotency_keys FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('config','idempotency_keys');

-- 3.6 Request Locks
CREATE TABLE IF NOT EXISTS config.request_locks (
    lock_key       TEXT PRIMARY KEY,
    user_id        TEXT NOT NULL,
    operation      TEXT NOT NULL,
    correlation_id TEXT,
    expires_at     TIMESTAMPTZ NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_request_locks_expires ON config.request_locks(expires_at);
ALTER TABLE config.request_locks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_request_locks" ON config.request_locks;
CREATE POLICY "service_role_request_locks" ON config.request_locks FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('config','request_locks');

-- 3.7 Currency Rate Cache
CREATE TABLE IF NOT EXISTS config.currency_rate_cache (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_currency TEXT NOT NULL UNIQUE,
    provider      TEXT NOT NULL DEFAULT 'scheduled',
    rates         JSONB NOT NULL DEFAULT '{}'::jsonb,
    fetched_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at    TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '1 day',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE config.currency_rate_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_currency_cache" ON config.currency_rate_cache;
CREATE POLICY "service_role_currency_cache" ON config.currency_rate_cache FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('config','currency_rate_cache');

-- 3.8 Geo Cache
CREATE TABLE IF NOT EXISTS config.geo_cache (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key  TEXT UNIQUE NOT NULL,
    payload    JSONB NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_geo_cache_expires ON config.geo_cache(expires_at) WHERE expires_at IS NOT NULL;
ALTER TABLE config.geo_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_geo_cache" ON config.geo_cache;
CREATE POLICY "service_role_geo_cache" ON config.geo_cache FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ==========================================
-- 4. AUTH SCHEMA
-- ==========================================

-- 4.1 Identities (email/password accounts)
CREATE TABLE IF NOT EXISTS auth.identities (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email                  TEXT NOT NULL UNIQUE,
    password_hash          TEXT,
    email_verified         BOOLEAN NOT NULL DEFAULT false,
    verification_token     TEXT,
    verification_expires   TIMESTAMPTZ,
    reset_token            TEXT,
    reset_expires          TIMESTAMPTZ,
    last_login_at          TIMESTAMPTZ,
    failed_login_attempts  INTEGER NOT NULL DEFAULT 0,
    locked_until           TIMESTAMPTZ,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_identities_email      ON auth.identities(lower(email));
CREATE INDEX        IF NOT EXISTS idx_auth_identities_reset_token ON auth.identities(reset_token) WHERE reset_token IS NOT NULL;
CREATE INDEX        IF NOT EXISTS idx_auth_identities_verify_token ON auth.identities(verification_token) WHERE verification_token IS NOT NULL;
ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_identities" ON auth.identities;
CREATE POLICY "service_role_identities" ON auth.identities FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('auth','identities');

-- 4.2 OAuth Identities
CREATE TABLE IF NOT EXISTS auth.oauth_identities (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identity_id      UUID NOT NULL REFERENCES auth.identities(id) ON DELETE CASCADE,
    provider         TEXT NOT NULL CHECK (provider IN ('GOOGLE','GITHUB','FACEBOOK')),
    provider_user_id TEXT NOT NULL,
    provider_email   TEXT,
    access_token     TEXT,
    refresh_token    TEXT,
    token_expires_at TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (provider, provider_user_id)
);
CREATE INDEX IF NOT EXISTS idx_oauth_identities_identity_id ON auth.oauth_identities(identity_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_oauth_identities_provider_email ON auth.oauth_identities(provider, lower(provider_email)) WHERE provider_email IS NOT NULL;
ALTER TABLE auth.oauth_identities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_oauth_identities" ON auth.oauth_identities;
CREATE POLICY "service_role_oauth_identities" ON auth.oauth_identities FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('auth','oauth_identities');

-- 4.3 OTP Codes
CREATE TABLE IF NOT EXISTS auth.otp_codes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier  TEXT NOT NULL,          -- email or phone
    code_hash   TEXT NOT NULL,
    purpose     TEXT NOT NULL DEFAULT 'LOGIN'
                    CHECK (purpose IN ('LOGIN','VERIFY_EMAIL','PASSWORD_RESET','ACCOUNT_DELETE','PHONE_VERIFY')),
    expires_at  TIMESTAMPTZ NOT NULL,
    attempts    INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 5,
    verified    BOOLEAN NOT NULL DEFAULT false,
    metadata    JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_otp_identifier_active ON auth.otp_codes(identifier, purpose) WHERE verified = false;
CREATE INDEX IF NOT EXISTS idx_otp_expires ON auth.otp_codes(expires_at) WHERE verified = false;
ALTER TABLE auth.otp_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_otp_codes" ON auth.otp_codes;
CREATE POLICY "service_role_otp_codes" ON auth.otp_codes FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 4.4 Sessions (refresh tokens)
CREATE TABLE IF NOT EXISTS auth.sessions (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identity_id      UUID NOT NULL REFERENCES auth.identities(id) ON DELETE CASCADE,
    refresh_token    TEXT NOT NULL UNIQUE,
    access_token_jti TEXT,
    user_agent       TEXT,
    ip_address       INET,
    expires_at       TIMESTAMPTZ NOT NULL,
    last_used_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at       TIMESTAMPTZ,
    rotated_at       TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sessions_identity_id  ON auth.sessions(identity_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token        ON auth.sessions(refresh_token);
CREATE INDEX IF NOT EXISTS idx_sessions_active       ON auth.sessions(identity_id, expires_at DESC) WHERE revoked_at IS NULL;
ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_sessions" ON auth.sessions;
CREATE POLICY "service_role_sessions" ON auth.sessions FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ==========================================
-- 5. USER SCHEMA
-- ==========================================

-- 5.1 Profiles
CREATE TABLE IF NOT EXISTS "user".profiles (
    id                   UUID PRIMARY KEY,  -- mirrors auth.identities.id
    identity_id          UUID UNIQUE REFERENCES auth.identities(id) ON DELETE CASCADE,
    role_id              INTEGER REFERENCES config.roles(id),
    first_name           VARCHAR(100) NOT NULL DEFAULT 'User',
    last_name            VARCHAR(100),
    display_name         TEXT,
    email                TEXT,
    phone                VARCHAR(20),
    avatar_url           TEXT,
    preferred_language   VARCHAR(5) NOT NULL DEFAULT 'en'
                             CHECK (preferred_language IN ('en','hi','ta','te')),
    preferred_currency   TEXT NOT NULL DEFAULT 'INR',
    default_address_id   UUID,
    preferences          JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_deleted           BOOLEAN NOT NULL DEFAULT false,
    deleted_at           TIMESTAMPTZ,
    is_blocked           BOOLEAN NOT NULL DEFAULT false,
    is_flagged           BOOLEAN NOT NULL DEFAULT false,
    flag_reason          TEXT,
    deletion_status      VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    scheduled_deletion_at TIMESTAMPTZ,
    welcome_email_sent   BOOLEAN NOT NULL DEFAULT false,
    version              INTEGER NOT NULL DEFAULT 0,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_profile_contact CHECK (email IS NOT NULL OR phone IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_profiles_role         ON "user".profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_deleted   ON "user".profiles(is_deleted) WHERE is_deleted = true;
CREATE INDEX IF NOT EXISTS idx_profiles_deletion_status ON "user".profiles(deletion_status) WHERE deletion_status <> 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_profiles_email        ON "user".profiles(lower(email)) WHERE email IS NOT NULL;
ALTER TABLE "user".profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_profiles" ON "user".profiles;
CREATE POLICY "service_role_profiles" ON "user".profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_view_own_profile" ON "user".profiles;
CREATE POLICY "authenticated_view_own_profile" ON "user".profiles FOR SELECT TO authenticated USING (auth.uid() = id);
SELECT public.create_updated_at_trigger('user','profiles');

-- 5.2 Addresses
CREATE TABLE IF NOT EXISTS "user".addresses (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES "user".profiles(id) ON DELETE CASCADE,
    label         VARCHAR(100) NOT NULL DEFAULT 'Home',
    full_name     VARCHAR(255) NOT NULL,
    phone         VARCHAR(20) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    landmark      VARCHAR(255),
    city          VARCHAR(100) NOT NULL,
    state         VARCHAR(100) NOT NULL,
    pincode       VARCHAR(10) NOT NULL,
    country       VARCHAR(100) NOT NULL DEFAULT 'India',
    address_type  VARCHAR(20) NOT NULL DEFAULT 'SHIPPING'
                     CHECK (address_type IN ('SHIPPING','BILLING','BOTH')),
    is_primary    BOOLEAN NOT NULL DEFAULT false,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id  ON "user".addresses(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_primary_address ON "user".addresses(user_id) WHERE is_primary = true;
ALTER TABLE "user".addresses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_addresses" ON "user".addresses;
CREATE POLICY "service_role_addresses" ON "user".addresses FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "users_own_addresses" ON "user".addresses;
CREATE POLICY "users_own_addresses" ON "user".addresses FOR ALL TO authenticated
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
SELECT public.create_updated_at_trigger('user','addresses');

-- Enforce single primary address per user
CREATE OR REPLACE FUNCTION "user".ensure_one_primary_address()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    IF NEW.is_primary = true THEN
        UPDATE "user".addresses SET is_primary = false, updated_at = NOW()
        WHERE user_id = NEW.user_id AND id IS DISTINCT FROM NEW.id AND is_primary = true;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM "user".addresses
        WHERE user_id = NEW.user_id AND id IS DISTINCT FROM NEW.id
    ) THEN NEW.is_primary = true; END IF;
    RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_one_primary_address ON "user".addresses;
CREATE TRIGGER trg_one_primary_address
    BEFORE INSERT OR UPDATE ON "user".addresses
    FOR EACH ROW EXECUTE FUNCTION "user".ensure_one_primary_address();

-- 5.3 User Settings
CREATE TABLE IF NOT EXISTS "user".settings (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL UNIQUE REFERENCES "user".profiles(id) ON DELETE CASCADE,
    email_notifications BOOLEAN NOT NULL DEFAULT true,
    sms_notifications   BOOLEAN NOT NULL DEFAULT false,
    push_notifications  BOOLEAN NOT NULL DEFAULT true,
    marketing_emails    BOOLEAN NOT NULL DEFAULT true,
    two_factor_enabled  BOOLEAN NOT NULL DEFAULT false,
    preferences         JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE "user".settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_settings" ON "user".settings;
CREATE POLICY "service_role_settings" ON "user".settings FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('user','settings');

-- 5.4 Managers
CREATE TABLE IF NOT EXISTS "user".managers (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identity_id UUID NOT NULL UNIQUE REFERENCES auth.identities(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    phone       VARCHAR(20),
    role        VARCHAR(20) NOT NULL DEFAULT 'manager',
    creator_id  UUID REFERENCES "user".profiles(id) ON DELETE SET NULL,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE "user".managers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_managers" ON "user".managers;
CREATE POLICY "service_role_managers" ON "user".managers FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('user','managers');

-- 5.5 Manager Permissions
CREATE TABLE IF NOT EXISTS "user".manager_permissions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manager_id              UUID NOT NULL UNIQUE REFERENCES "user".managers(id) ON DELETE CASCADE,
    can_manage_products     BOOLEAN NOT NULL DEFAULT false,
    can_manage_categories   BOOLEAN NOT NULL DEFAULT false,
    can_manage_orders       BOOLEAN NOT NULL DEFAULT false,
    can_manage_returns      BOOLEAN NOT NULL DEFAULT false,
    can_manage_refunds      BOOLEAN NOT NULL DEFAULT false,
    can_manage_events       BOOLEAN NOT NULL DEFAULT false,
    can_manage_blogs        BOOLEAN NOT NULL DEFAULT false,
    can_manage_testimonials BOOLEAN NOT NULL DEFAULT false,
    can_manage_gallery      BOOLEAN NOT NULL DEFAULT false,
    can_manage_faqs         BOOLEAN NOT NULL DEFAULT false,
    can_manage_coupons      BOOLEAN NOT NULL DEFAULT false,
    can_manage_donations    BOOLEAN NOT NULL DEFAULT false,
    can_manage_about_us     BOOLEAN NOT NULL DEFAULT false,
    can_manage_contact_info BOOLEAN NOT NULL DEFAULT false,
    can_manage_policies     BOOLEAN NOT NULL DEFAULT false,
    can_manage_delivery     BOOLEAN NOT NULL DEFAULT false,
    can_manage_emails       BOOLEAN NOT NULL DEFAULT false,
    can_manage_translations BOOLEAN NOT NULL DEFAULT false,
    can_manage_jobs         BOOLEAN NOT NULL DEFAULT false,
    can_manage_managers     BOOLEAN NOT NULL DEFAULT false,
    can_manage_system       BOOLEAN NOT NULL DEFAULT false,
    can_view_analytics      BOOLEAN NOT NULL DEFAULT false,
    can_view_logs           BOOLEAN NOT NULL DEFAULT false,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE "user".manager_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_manager_permissions" ON "user".manager_permissions;
CREATE POLICY "service_role_manager_permissions" ON "user".manager_permissions FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('user','manager_permissions');

-- 5.6 Account Deletion Jobs
CREATE TABLE IF NOT EXISTS "user".account_deletion_jobs (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identity_id             UUID NOT NULL REFERENCES auth.identities(id) ON DELETE CASCADE,
    user_id                 UUID NOT NULL REFERENCES "user".profiles(id) ON DELETE CASCADE,
    status                  VARCHAR(30) NOT NULL DEFAULT 'PENDING'
                                CHECK (status IN ('PENDING','OTP_VERIFIED','SCHEDULED','PROCESSING','COMPLETED','FAILED','CANCELLED')),
    requested_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    scheduled_for           TIMESTAMPTZ,
    completed_at            TIMESTAMPTZ,
    otp_verified            BOOLEAN NOT NULL DEFAULT false,
    deletion_auth_token_hash VARCHAR(128),
    dat_expires_at          TIMESTAMPTZ,
    error_message           TEXT,
    retry_count             INTEGER NOT NULL DEFAULT 0,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_deletion_jobs_status ON "user".account_deletion_jobs(status) WHERE status NOT IN ('COMPLETED','CANCELLED');
ALTER TABLE "user".account_deletion_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_deletion_jobs" ON "user".account_deletion_jobs;
CREATE POLICY "service_role_deletion_jobs" ON "user".account_deletion_jobs FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('user','account_deletion_jobs');

-- 5.7 Account Deletion Audit
CREATE TABLE IF NOT EXISTS "user".account_deletion_audit (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deletion_job_id UUID REFERENCES "user".account_deletion_jobs(id) ON DELETE SET NULL,
    identity_id    UUID NOT NULL,
    action         VARCHAR(50) NOT NULL,
    actor          VARCHAR(50),
    metadata       JSONB,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_deletion_audit_identity ON "user".account_deletion_audit(identity_id);
ALTER TABLE "user".account_deletion_audit ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_deletion_audit" ON "user".account_deletion_audit;
CREATE POLICY "service_role_deletion_audit" ON "user".account_deletion_audit FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ==========================================
-- 6. PRODUCT SCHEMA
-- ==========================================

-- 6.1 Categories
CREATE TABLE IF NOT EXISTS product.categories (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT NOT NULL,
    type          TEXT NOT NULL DEFAULT 'product'
                      CHECK (type IN ('product','event','faq','gallery')),
    slug          TEXT,
    name_i18n     JSONB NOT NULL DEFAULT '{}'::jsonb,
    category_code VARCHAR(100) UNIQUE,
    is_active     BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (name, type)
);
CREATE INDEX IF NOT EXISTS idx_categories_type ON product.categories(type, is_active);
ALTER TABLE product.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_categories" ON product.categories;
CREATE POLICY "public_read_categories" ON product.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "service_role_categories" ON product.categories;
CREATE POLICY "service_role_categories" ON product.categories FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 6.2 Products
CREATE TABLE IF NOT EXISTS product.products (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title                  TEXT NOT NULL,
    description            TEXT NOT NULL DEFAULT '',
    slug                   TEXT UNIQUE,
    title_i18n             JSONB NOT NULL DEFAULT '{}'::jsonb,
    description_i18n       JSONB NOT NULL DEFAULT '{}'::jsonb,
    tags_i18n              JSONB NOT NULL DEFAULT '{}'::jsonb,
    benefits_i18n          JSONB NOT NULL DEFAULT '{}'::jsonb,
    price                  NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    mrp                    NUMERIC(10,2) CHECK (mrp >= 0),
    images                 TEXT[] NOT NULL DEFAULT '{}',
    category_id            UUID REFERENCES product.categories(id) ON DELETE SET NULL,
    tags                   TEXT[] NOT NULL DEFAULT '{}',
    benefits               TEXT[] NOT NULL DEFAULT '{}',
    variant_mode           TEXT NOT NULL DEFAULT 'UNIT' CHECK (variant_mode IN ('UNIT','SIZE')),
    is_returnable          BOOLEAN NOT NULL DEFAULT true,
    return_days            INTEGER NOT NULL DEFAULT 7,
    is_new                 BOOLEAN NOT NULL DEFAULT false,
    is_active              BOOLEAN NOT NULL DEFAULT true,
    rating                 NUMERIC(3,2) NOT NULL DEFAULT 0,
    rating_count           INTEGER NOT NULL DEFAULT 0,
    review_count           INTEGER NOT NULL DEFAULT 0,
    default_hsn_code       TEXT,
    default_gst_rate       NUMERIC(5,2) NOT NULL DEFAULT 0,
    price_includes_tax     BOOLEAN NOT NULL DEFAULT true,
    weight_grams           NUMERIC(10,2) NOT NULL DEFAULT 0,
    return_logistics_fee   NUMERIC(10,2) NOT NULL DEFAULT 0,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_category      ON product.products(category_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_active_created ON product.products(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_tags          ON product.products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_products_search        ON product.products USING GIN(to_tsvector('english', title || ' ' || COALESCE(description,'')));
ALTER TABLE product.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_products" ON product.products;
CREATE POLICY "public_read_products" ON product.products FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "service_role_products" ON product.products;
CREATE POLICY "service_role_products" ON product.products FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('product','products');

-- 6.3 Product Variants
CREATE TABLE IF NOT EXISTS product.product_variants (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id          UUID NOT NULL REFERENCES product.products(id) ON DELETE CASCADE,
    sku                 TEXT UNIQUE,
    size_label          TEXT,
    size_label_i18n     JSONB NOT NULL DEFAULT '{}'::jsonb,
    size_value          NUMERIC(10,2) NOT NULL DEFAULT 0,
    unit                TEXT NOT NULL DEFAULT 'kg',
    description         TEXT,
    description_i18n    JSONB NOT NULL DEFAULT '{}'::jsonb,
    variant_image_url   TEXT,
    attributes          JSONB,
    selling_price       NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (selling_price >= 0),
    mrp                 NUMERIC(10,2) CHECK (mrp >= 0),
    stock_quantity      INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    low_stock_threshold INTEGER NOT NULL DEFAULT 10,
    is_default          BOOLEAN NOT NULL DEFAULT false,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    delivery_charge     NUMERIC(10,2),
    tax_applicable      BOOLEAN NOT NULL DEFAULT true,
    gst_rate            NUMERIC(5,2) NOT NULL DEFAULT 0,
    price_includes_tax  BOOLEAN NOT NULL DEFAULT true,
    hsn_code            VARCHAR(8),
    weight_grams        NUMERIC(10,2),
    razorpay_item_id    TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_variants_product_id  ON product.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_active       ON product.product_variants(product_id, is_active);
CREATE INDEX IF NOT EXISTS idx_variants_low_stock    ON product.product_variants(stock_quantity) WHERE stock_quantity <= low_stock_threshold AND is_active = true;
ALTER TABLE product.product_variants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_variants" ON product.product_variants;
CREATE POLICY "public_read_variants" ON product.product_variants FOR SELECT USING (true);
DROP POLICY IF EXISTS "service_role_variants" ON product.product_variants;
CREATE POLICY "service_role_variants" ON product.product_variants FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('product','product_variants');

-- 6.4 Delivery Configs
CREATE TABLE IF NOT EXISTS product.delivery_configs (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope                 TEXT NOT NULL CHECK (scope IN ('PRODUCT','VARIANT')),
    product_id            UUID REFERENCES product.products(id) ON DELETE CASCADE,
    variant_id            UUID REFERENCES product.product_variants(id) ON DELETE CASCADE,
    calculation_type      TEXT NOT NULL DEFAULT 'FLAT_PER_ORDER'
                              CHECK (calculation_type IN ('FLAT_PER_ORDER','PER_ITEM','PER_PACKAGE','WEIGHT_BASED')),
    base_delivery_charge  NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (base_delivery_charge >= 0),
    max_items_per_package INTEGER NOT NULL DEFAULT 3 CHECK (max_items_per_package >= 1),
    unit_weight           NUMERIC(10,3),
    gst_percentage        NUMERIC(5,2) NOT NULL DEFAULT 18 CHECK (gst_percentage >= 0 AND gst_percentage <= 100),
    is_taxable            BOOLEAN NOT NULL DEFAULT true,
    delivery_refund_policy TEXT NOT NULL DEFAULT 'NON_REFUNDABLE'
                               CHECK (delivery_refund_policy IN ('REFUNDABLE','NON_REFUNDABLE')),
    delivery_days_min     INTEGER,
    delivery_days_max     INTEGER,
    is_active             BOOLEAN NOT NULL DEFAULT true,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_delivery_scope CHECK (
        (scope = 'PRODUCT' AND product_id IS NOT NULL AND variant_id IS NULL) OR
        (scope = 'VARIANT' AND variant_id IS NOT NULL AND product_id IS NULL)
    )
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_delivery_cfg_product ON product.delivery_configs(product_id) WHERE scope = 'PRODUCT' AND product_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_delivery_cfg_variant ON product.delivery_configs(variant_id) WHERE scope = 'VARIANT' AND variant_id IS NOT NULL;
ALTER TABLE product.delivery_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_delivery_configs" ON product.delivery_configs;
CREATE POLICY "public_read_delivery_configs" ON product.delivery_configs FOR SELECT USING (true);
DROP POLICY IF EXISTS "service_role_delivery_configs" ON product.delivery_configs;
CREATE POLICY "service_role_delivery_configs" ON product.delivery_configs FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('product','delivery_configs');

-- 6.5 Inventory (atomic stock ledger)
CREATE TABLE IF NOT EXISTS product.inventory (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id         UUID NOT NULL UNIQUE REFERENCES product.product_variants(id) ON DELETE CASCADE,
    available_quantity INTEGER NOT NULL DEFAULT 0 CHECK (available_quantity >= 0),
    reserved_quantity  INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    version            INTEGER NOT NULL DEFAULT 1,
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON product.inventory(available_quantity) WHERE available_quantity < 10;
ALTER TABLE product.inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_inventory" ON product.inventory;
CREATE POLICY "service_role_inventory" ON product.inventory FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('product','inventory');

-- 6.6 Inventory Reservations (cart holds)
CREATE TABLE IF NOT EXISTS product.inventory_reservations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id  UUID NOT NULL REFERENCES product.product_variants(id) ON DELETE CASCADE,
    session_id  VARCHAR(255) NOT NULL,
    quantity    INTEGER NOT NULL CHECK (quantity > 0),
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_inv_res_variant    ON product.inventory_reservations(variant_id);
CREATE INDEX IF NOT EXISTS idx_inv_res_session    ON product.inventory_reservations(session_id);
CREATE INDEX IF NOT EXISTS idx_inv_res_expires    ON product.inventory_reservations(expires_at);
ALTER TABLE product.inventory_reservations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_inv_reservations" ON product.inventory_reservations;
CREATE POLICY "service_role_inv_reservations" ON product.inventory_reservations FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 6.7 Product Reviews
CREATE TABLE IF NOT EXISTS product.reviews (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id           UUID NOT NULL REFERENCES product.products(id) ON DELETE CASCADE,
    user_id              UUID NOT NULL REFERENCES "user".profiles(id) ON DELETE CASCADE,
    rating               INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title                TEXT,
    comment              TEXT,
    is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
    is_approved          BOOLEAN NOT NULL DEFAULT true,
    helpful_count        INTEGER NOT NULL DEFAULT 0,
    not_helpful_count    INTEGER NOT NULL DEFAULT 0,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (product_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_reviews_product   ON product.reviews(product_id, is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_rating    ON product.reviews(product_id, rating);
ALTER TABLE product.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_reviews" ON product.reviews;
CREATE POLICY "public_read_reviews" ON product.reviews FOR SELECT USING (is_approved = true);
DROP POLICY IF EXISTS "service_role_reviews" ON product.reviews;
CREATE POLICY "service_role_reviews" ON product.reviews FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('product','reviews');

-- ==========================================
-- 7. CART SCHEMA
-- ==========================================

-- 7.1 Coupons
CREATE TABLE IF NOT EXISTS cart.coupons (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code               VARCHAR(50) NOT NULL UNIQUE,
    type               VARCHAR(20) NOT NULL CHECK (type IN ('PERCENTAGE','FLAT','FREE_SHIPPING','PRODUCT','CATEGORY')),
    discount_percentage NUMERIC(5,2),
    discount_amount    NUMERIC(10,2),
    target_id          TEXT,
    min_purchase_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    max_discount_amount NUMERIC(10,2),
    valid_from         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until        TIMESTAMPTZ NOT NULL,
    usage_limit        INTEGER,
    usage_count        INTEGER NOT NULL DEFAULT 0,
    is_active          BOOLEAN NOT NULL DEFAULT true,
    description        TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_coupons_code_active ON cart.coupons(lower(code), is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_valid       ON cart.coupons(valid_until) WHERE is_active = true;
ALTER TABLE cart.coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_coupons" ON cart.coupons;
CREATE POLICY "service_role_coupons" ON cart.coupons FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_read_coupons" ON cart.coupons;
CREATE POLICY "public_read_coupons" ON cart.coupons FOR SELECT USING (is_active = true AND valid_until > NOW());
SELECT public.create_updated_at_trigger('cart','coupons');

-- 7.2 Coupon Usage
CREATE TABLE IF NOT EXISTS cart.coupon_usage (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id      UUID NOT NULL REFERENCES cart.coupons(id) ON DELETE CASCADE,
    user_id        UUID NOT NULL REFERENCES "user".profiles(id) ON DELETE CASCADE,
    order_id       UUID,   -- soft ref, FK added after order table created
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon ON cart.coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user   ON cart.coupon_usage(user_id);
ALTER TABLE cart.coupon_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_coupon_usage" ON cart.coupon_usage;
CREATE POLICY "service_role_coupon_usage" ON cart.coupon_usage FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 7.3 Carts
CREATE TABLE IF NOT EXISTS cart.carts (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID UNIQUE REFERENCES "user".profiles(id) ON DELETE CASCADE,
    session_id       VARCHAR(255) UNIQUE,
    status           VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','CHECKED_OUT','ABANDONED','EXPIRED')),
    applied_coupon_id UUID REFERENCES cart.coupons(id) ON DELETE SET NULL,
    expires_at       TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_cart_owner CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_carts_user_id   ON cart.carts(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_carts_session   ON cart.carts(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_carts_abandoned ON cart.carts(status, updated_at) WHERE status = 'ACTIVE';
ALTER TABLE cart.carts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_carts" ON cart.carts;
CREATE POLICY "service_role_carts" ON cart.carts FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('cart','carts');

-- 7.4 Cart Items
CREATE TABLE IF NOT EXISTS cart.cart_items (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id       UUID NOT NULL REFERENCES cart.carts(id) ON DELETE CASCADE,
    product_id    UUID NOT NULL REFERENCES product.products(id) ON DELETE CASCADE,
    variant_id    UUID REFERENCES product.product_variants(id) ON DELETE CASCADE,
    title         VARCHAR(255),
    image_url     TEXT,
    price_per_unit NUMERIC(10,2) NOT NULL CHECK (price_per_unit >= 0),
    mrp           NUMERIC(10,2),
    quantity      INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    variant_label VARCHAR(255),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (cart_id, product_id, variant_id)
);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart    ON cart.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart.cart_items(product_id);
ALTER TABLE cart.cart_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_cart_items" ON cart.cart_items;
CREATE POLICY "service_role_cart_items" ON cart.cart_items FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('cart','cart_items');

-- ==========================================
-- 8. ORDER SCHEMA
-- ==========================================

-- 8.1 Orders
CREATE TABLE IF NOT EXISTS "order".orders (
    id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number              TEXT UNIQUE,
    user_id                   UUID REFERENCES "user".profiles(id) ON DELETE SET NULL,
    customer_name             TEXT,
    customer_email            TEXT,
    customer_phone            TEXT,
    shipping_address_id       UUID REFERENCES "user".addresses(id) ON DELETE SET NULL,
    billing_address_id        UUID REFERENCES "user".addresses(id) ON DELETE SET NULL,
    shipping_address          JSONB,
    billing_address           JSONB,
    subtotal                  NUMERIC(12,2) NOT NULL DEFAULT 0,
    coupon_code               TEXT,
    coupon_discount           NUMERIC(12,2) NOT NULL DEFAULT 0,
    delivery_charge           NUMERIC(12,2) NOT NULL DEFAULT 0,
    delivery_gst              NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_taxable_amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_cgst                NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_sgst                NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_igst                NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount              NUMERIC(12,2) NOT NULL DEFAULT 0,
    status                    TEXT NOT NULL DEFAULT 'pending'
                                  CHECK (status IN ('pending','confirmed','processing','packed','shipped',
                                                    'out_for_delivery','delivered','delivery_unsuccessful',
                                                    'return_requested','return_approved','return_rejected',
                                                    'return_picked_up','return_completed','refunded',
                                                    'cancelled','failed')),
    previous_status           TEXT,
    payment_status            TEXT NOT NULL DEFAULT 'pending'
                                  CHECK (payment_status IN ('pending','paid','failed','refunded','partially_refunded')),
    payment_id                TEXT,
    invoice_id                UUID,
    invoice_url               TEXT,
    invoice_status            TEXT,
    is_delivery_refundable    BOOLEAN NOT NULL DEFAULT true,
    delivery_unsuccessful_reason TEXT,
    currency                  TEXT NOT NULL DEFAULT 'INR',
    notes                     TEXT,
    metadata                  JSONB NOT NULL DEFAULT '{}'::jsonb,
    version                   INTEGER NOT NULL DEFAULT 0,
    created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_user_id        ON "order".orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status         ON "order".orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON "order".orders(payment_status) WHERE payment_status = 'pending';
CREATE INDEX IF NOT EXISTS idx_orders_payment_id     ON "order".orders(payment_id) WHERE payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_number         ON "order".orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at     ON "order".orders(created_at DESC);
ALTER TABLE "order".orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_orders" ON "order".orders;
CREATE POLICY "service_role_orders" ON "order".orders FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "users_view_own_orders" ON "order".orders;
CREATE POLICY "users_view_own_orders" ON "order".orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
SELECT public.create_updated_at_trigger('order','orders');

-- Now add the deferred FK from coupon_usage
ALTER TABLE cart.coupon_usage
    ADD CONSTRAINT fk_coupon_usage_order
    FOREIGN KEY (order_id) REFERENCES "order".orders(id) ON DELETE SET NULL
    NOT VALID;

-- 8.2 Order Items
CREATE TABLE IF NOT EXISTS "order".order_items (
    id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id                     UUID NOT NULL REFERENCES "order".orders(id) ON DELETE CASCADE,
    product_id                   UUID REFERENCES product.products(id) ON DELETE SET NULL,
    variant_id                   UUID REFERENCES product.product_variants(id) ON DELETE SET NULL,
    title                        TEXT,
    quantity                     INTEGER NOT NULL CHECK (quantity > 0),
    price_per_unit               NUMERIC(12,2) NOT NULL DEFAULT 0,
    mrp                          NUMERIC(12,2),
    total_price                  NUMERIC(12,2) GENERATED ALWAYS AS (quantity * price_per_unit) STORED,
    is_returnable                BOOLEAN NOT NULL DEFAULT true,
    returned_quantity            INTEGER NOT NULL DEFAULT 0 CHECK (returned_quantity >= 0),
    delivery_charge              NUMERIC(12,2) NOT NULL DEFAULT 0,
    delivery_gst                 NUMERIC(12,2) NOT NULL DEFAULT 0,
    taxable_amount               NUMERIC(12,2) NOT NULL DEFAULT 0,
    cgst                         NUMERIC(12,2) NOT NULL DEFAULT 0,
    sgst                         NUMERIC(12,2) NOT NULL DEFAULT 0,
    igst                         NUMERIC(12,2) NOT NULL DEFAULT 0,
    gst_rate                     NUMERIC(5,2) NOT NULL DEFAULT 0,
    hsn_code                     TEXT,
    coupon_id                    UUID,
    coupon_code                  TEXT,
    coupon_discount              NUMERIC(12,2) NOT NULL DEFAULT 0,
    variant_snapshot             JSONB,
    delivery_calculation_snapshot JSONB,
    tax_snapshot                 JSONB,
    created_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id  ON "order".order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product   ON "order".order_items(product_id);
ALTER TABLE "order".order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_order_items" ON "order".order_items;
CREATE POLICY "service_role_order_items" ON "order".order_items FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 8.3 Order Status History
CREATE TABLE IF NOT EXISTS "order".order_status_history (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id   UUID NOT NULL REFERENCES "order".orders(id) ON DELETE CASCADE,
    status     TEXT NOT NULL,
    updated_by UUID REFERENCES "user".profiles(id) ON DELETE SET NULL,
    actor      TEXT NOT NULL DEFAULT 'SYSTEM' CHECK (actor IN ('SYSTEM','ADMIN','USER')),
    event_type TEXT NOT NULL DEFAULT 'STATUS_CHANGE',
    return_id  UUID,
    notes      TEXT,
    metadata   JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_osh_order_created ON "order".order_status_history(order_id, created_at DESC);
ALTER TABLE "order".order_status_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_order_status_history" ON "order".order_status_history;
CREATE POLICY "service_role_order_status_history" ON "order".order_status_history FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 8.4 Order Reservations
CREATE TABLE IF NOT EXISTS "order".order_reservations (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id            UUID REFERENCES cart.carts(id) ON DELETE CASCADE,
    user_id            UUID REFERENCES "user".profiles(id) ON DELETE CASCADE,
    order_token        TEXT UNIQUE NOT NULL,
    inventory_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
    expires_at         TIMESTAMPTZ NOT NULL,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_res_expires ON "order".order_reservations(expires_at);
ALTER TABLE "order".order_reservations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_order_reservations" ON "order".order_reservations;
CREATE POLICY "service_role_order_reservations" ON "order".order_reservations FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 8.5 Invoices
CREATE TABLE IF NOT EXISTS "order".invoices (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id       UUID NOT NULL UNIQUE REFERENCES "order".orders(id) ON DELETE CASCADE,
    invoice_number VARCHAR(30) NOT NULL UNIQUE,
    invoice_url    TEXT,
    storage_path   TEXT,
    file_type      VARCHAR(20) NOT NULL DEFAULT 'pdf',
    generated_at   TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_invoices_order ON "order".invoices(order_id);
ALTER TABLE "order".invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_invoices" ON "order".invoices;
CREATE POLICY "service_role_invoices" ON "order".invoices FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 8.6 Returns
CREATE TABLE IF NOT EXISTS "order".returns (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES "order".orders(id) ON DELETE NO ACTION,
    user_id         UUID REFERENCES "user".profiles(id) ON DELETE SET NULL,
    status          VARCHAR(50) NOT NULL DEFAULT 'requested'
                        CHECK (status IN ('requested','approved','rejected','completed','picked_up',
                                          'pickup_scheduled','pickup_attempted','pickup_completed','pickup_failed',
                                          'in_transit','in_transit_to_warehouse','item_returned',
                                          'qc_initiated','qc_passed','qc_failed',
                                          'partial_refund','zero_refund','refund_initiated','refunded','cancelled')),
    qc_status       VARCHAR(50) NOT NULL DEFAULT 'NOT_STARTED',
    refund_status   VARCHAR(50) NOT NULL DEFAULT 'NOT_STARTED',
    return_outcome  VARCHAR(50),
    refund_amount   NUMERIC(12,2),
    refund_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    reason          TEXT,
    staff_notes     TEXT,
    qc_result       JSONB,
    version         INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_returns_order_id ON "order".returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_status   ON "order".returns(status) WHERE status NOT IN ('refunded','cancelled');
ALTER TABLE "order".returns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_returns" ON "order".returns;
CREATE POLICY "service_role_returns" ON "order".returns FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('order','returns');

-- Add return_id FK on order_status_history (deferred)
ALTER TABLE "order".order_status_history
    ADD CONSTRAINT fk_osh_return_id
    FOREIGN KEY (return_id) REFERENCES "order".returns(id) ON DELETE SET NULL NOT VALID;

-- 8.7 Return Items
CREATE TABLE IF NOT EXISTS "order".return_items (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id     UUID NOT NULL REFERENCES "order".returns(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES "order".order_items(id) ON DELETE CASCADE,
    quantity      INTEGER NOT NULL CHECK (quantity > 0),
    reason        VARCHAR(100),
    status        VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    condition     VARCHAR(50),
    images        TEXT[] NOT NULL DEFAULT '{}',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_return_items_return ON "order".return_items(return_id);
ALTER TABLE "order".return_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_return_items" ON "order".return_items;
CREATE POLICY "service_role_return_items" ON "order".return_items FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('order','return_items');

-- 8.8 Return QC Results
CREATE TABLE IF NOT EXISTS "order".return_qc_results (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_item_id UUID NOT NULL UNIQUE REFERENCES "order".return_items(id) ON DELETE CASCADE,
    inspected_by   VARCHAR(100),
    condition      VARCHAR(50) NOT NULL,
    is_approved    BOOLEAN NOT NULL,
    notes          TEXT,
    photos         TEXT[],
    deduction_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    inspected_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE "order".return_qc_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_qc_results" ON "order".return_qc_results;
CREATE POLICY "service_role_qc_results" ON "order".return_qc_results FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ==========================================
-- 9. PAYMENT SCHEMA
-- ==========================================

-- 9.1 Payment Intents
CREATE TABLE IF NOT EXISTS payment.payment_intents (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES "user".profiles(id) ON DELETE CASCADE,
    order_id            UUID REFERENCES "order".orders(id) ON DELETE SET NULL,
    razorpay_order_id   VARCHAR(100) UNIQUE,
    razorpay_payment_id VARCHAR(100) UNIQUE,
    razorpay_signature  VARCHAR(255),
    amount              NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency            VARCHAR(3) NOT NULL DEFAULT 'INR',
    status              VARCHAR(30) NOT NULL DEFAULT 'CREATED'
                            CHECK (status IN ('CREATED','PENDING','CAPTURED','FAILED','REFUNDED','PARTIALLY_REFUNDED','CAPTURED_ORPHAN')),
    method              VARCHAR(30),
    checkout_id         UUID,
    is_international    BOOLEAN NOT NULL DEFAULT false,
    error_code          VARCHAR(50),
    error_description   TEXT,
    notes               JSONB,
    captured_at         TIMESTAMPTZ,
    expires_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pi_user_id     ON payment.payment_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_pi_order_id    ON payment.payment_intents(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pi_status_created ON payment.payment_intents(status, created_at) WHERE status IN ('CREATED','PENDING');
CREATE INDEX IF NOT EXISTS idx_pi_orphan      ON payment.payment_intents(status, created_at) WHERE status = 'CAPTURED_ORPHAN';
ALTER TABLE payment.payment_intents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_payment_intents" ON payment.payment_intents;
CREATE POLICY "service_role_payment_intents" ON payment.payment_intents FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 9.2 Refunds
CREATE TABLE IF NOT EXISTS payment.refunds (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_intent_id   UUID NOT NULL REFERENCES payment.payment_intents(id) ON DELETE CASCADE,
    return_id           UUID REFERENCES "order".returns(id) ON DELETE SET NULL,
    razorpay_refund_id  VARCHAR(100) UNIQUE,
    refund_amount       NUMERIC(12,2) NOT NULL CHECK (refund_amount > 0),
    reason              VARCHAR(255),
    status              VARCHAR(30) NOT NULL DEFAULT 'CREATED'
                            CHECK (status IN ('CREATED','PENDING','PROCESSED','FAILED','CANCELLED')),
    type                VARCHAR(20) NOT NULL DEFAULT 'FULL' CHECK (type IN ('FULL','PARTIAL')),
    idempotency_key     TEXT UNIQUE,
    notes               JSONB,
    processed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_refunds_payment    ON payment.refunds(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_refunds_return     ON payment.refunds(return_id) WHERE return_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_refunds_status     ON payment.refunds(status) WHERE status NOT IN ('PROCESSED','CANCELLED');
ALTER TABLE payment.refunds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_refunds" ON payment.refunds;
CREATE POLICY "service_role_refunds" ON payment.refunds FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 9.3 Webhook Logs
CREATE TABLE IF NOT EXISTS payment.webhook_logs (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider           TEXT NOT NULL DEFAULT 'razorpay',
    event_type         TEXT NOT NULL,
    event_id           TEXT,
    signature_verified BOOLEAN NOT NULL DEFAULT false,
    payload            JSONB NOT NULL DEFAULT '{}'::jsonb,
    correlation_id     TEXT,
    status             TEXT NOT NULL DEFAULT 'PENDING'
                           CHECK (status IN ('PENDING','PROCESSING','DONE','FAILED','DEAD_LETTER')),
    processed          BOOLEAN NOT NULL DEFAULT false,
    processed_at       TIMESTAMPTZ,
    processing_error   TEXT,
    retry_count        INTEGER NOT NULL DEFAULT 0,
    max_retries        INTEGER NOT NULL DEFAULT 5,
    next_retry_at      TIMESTAMPTZ,
    locked_at          TIMESTAMPTZ,
    locked_by          TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_webhook_dedup     ON payment.webhook_logs(event_id, event_type) WHERE event_id IS NOT NULL AND signature_verified = true;
CREATE INDEX        IF NOT EXISTS idx_webhook_queue     ON payment.webhook_logs(status, next_retry_at) WHERE status IN ('PENDING','FAILED');
CREATE INDEX        IF NOT EXISTS idx_webhook_locked    ON payment.webhook_logs(locked_at) WHERE locked_at IS NOT NULL AND status = 'PROCESSING';
ALTER TABLE payment.webhook_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_webhook_logs" ON payment.webhook_logs;
CREATE POLICY "service_role_webhook_logs" ON payment.webhook_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('payment','webhook_logs');

-- ==========================================
-- 10. EVENT SCHEMA
-- ==========================================

CREATE TABLE IF NOT EXISTS event.events (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title                    TEXT NOT NULL,
    slug                     TEXT UNIQUE,
    description              TEXT NOT NULL,
    title_i18n               JSONB NOT NULL DEFAULT '{}'::jsonb,
    description_i18n         JSONB NOT NULL DEFAULT '{}'::jsonb,
    start_date               TIMESTAMPTZ NOT NULL,
    end_date                 TIMESTAMPTZ,
    location                 JSONB NOT NULL DEFAULT '{}'::jsonb,
    image_url                TEXT,
    max_participants         INTEGER,
    registered_count         INTEGER NOT NULL DEFAULT 0,
    ticket_price             NUMERIC(12,2) NOT NULL DEFAULT 0,
    gst_rate                 NUMERIC(5,2) NOT NULL DEFAULT 0,
    category_id              UUID REFERENCES product.categories(id) ON DELETE SET NULL,
    status                   TEXT NOT NULL DEFAULT 'upcoming'
                                 CHECK (status IN ('upcoming','ongoing','completed','cancelled')),
    is_registration_enabled  BOOLEAN NOT NULL DEFAULT true,
    registration_deadline    TIMESTAMPTZ,
    cancellation_status      TEXT NOT NULL DEFAULT 'NONE',
    cancelled_at             TIMESTAMPTZ,
    cancellation_reason      TEXT,
    event_code               VARCHAR(100) UNIQUE,
    key_highlights           TEXT[] NOT NULL DEFAULT '{}',
    special_privileges       TEXT[] NOT NULL DEFAULT '{}',
    is_active                BOOLEAN NOT NULL DEFAULT true,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_events_status     ON event.events(status, start_date);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON event.events(start_date);
ALTER TABLE event.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_events" ON event.events;
CREATE POLICY "public_read_events" ON event.events FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "service_role_events" ON event.events;
CREATE POLICY "service_role_events" ON event.events FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('event','events');

CREATE TABLE IF NOT EXISTS event.event_registrations (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number  VARCHAR(20) UNIQUE,
    event_id             UUID NOT NULL REFERENCES event.events(id) ON DELETE CASCADE,
    user_id              UUID REFERENCES "user".profiles(id) ON DELETE SET NULL,
    full_name            TEXT NOT NULL,
    email                TEXT,
    phone                TEXT,
    attendees            INTEGER NOT NULL DEFAULT 1,
    base_price           NUMERIC(12,2),
    gst_rate             NUMERIC(5,2) NOT NULL DEFAULT 0,
    gst_amount           NUMERIC(12,2) NOT NULL DEFAULT 0,
    amount               NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_status       TEXT NOT NULL DEFAULT 'created',
    status               TEXT NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending','confirmed','cancelled','refunded','failed')),
    razorpay_order_id    TEXT,
    razorpay_payment_id  TEXT,
    razorpay_signature   TEXT,
    invoice_id           TEXT,
    invoice_url          TEXT,
    metadata             JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_event_reg_event_id  ON event.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reg_user_id   ON event.event_registrations(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_event_reg_email     ON event.event_registrations(lower(email)) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_event_reg_status    ON event.event_registrations(event_id, status);
CREATE INDEX IF NOT EXISTS idx_event_reg_rzp_order ON event.event_registrations(razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_event_reg_active_email ON event.event_registrations(event_id, lower(email))
    WHERE status NOT IN ('cancelled','refunded','failed');
ALTER TABLE event.event_registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_event_registrations" ON event.event_registrations;
CREATE POLICY "service_role_event_registrations" ON event.event_registrations FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('event','event_registrations');

CREATE TABLE IF NOT EXISTS event.donations (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                UUID REFERENCES "user".profiles(id) ON DELETE SET NULL,
    event_id               UUID REFERENCES event.events(id) ON DELETE SET NULL,
    donation_reference_id  TEXT UNIQUE NOT NULL,
    razorpay_order_id      TEXT,
    razorpay_payment_id    TEXT,
    amount                 NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency               VARCHAR(3) NOT NULL DEFAULT 'INR',
    donor_name             TEXT,
    donor_email            TEXT,
    donor_phone            TEXT,
    is_anonymous           BOOLEAN NOT NULL DEFAULT false,
    donation_type          TEXT NOT NULL DEFAULT 'ONE_TIME' CHECK (donation_type IN ('ONE_TIME','RECURRING')),
    message                TEXT,
    payment_status         TEXT NOT NULL DEFAULT 'created',
    status                 TEXT NOT NULL DEFAULT 'pending',
    metadata               JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_donations_rzp_order   ON event.donations(razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_donations_rzp_payment ON event.donations(razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_donations_status      ON event.donations(payment_status, created_at) WHERE payment_status IN ('created','pending');
ALTER TABLE event.donations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_donations" ON event.donations;
CREATE POLICY "service_role_donations" ON event.donations FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('event','donations');

CREATE TABLE IF NOT EXISTS event.donation_subscriptions (
    id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                   UUID REFERENCES "user".profiles(id) ON DELETE SET NULL,
    donation_id               UUID REFERENCES event.donations(id) ON DELETE SET NULL,
    razorpay_subscription_id  TEXT UNIQUE,
    razorpay_plan_id          TEXT,
    amount                    NUMERIC(12,2) NOT NULL,
    status                    TEXT NOT NULL DEFAULT 'created',
    donor_name                TEXT,
    donor_email               TEXT,
    is_anonymous              BOOLEAN NOT NULL DEFAULT false,
    current_start             TIMESTAMPTZ,
    current_end               TIMESTAMPTZ,
    next_billing_at           TIMESTAMPTZ,
    metadata                  JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE event.donation_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_donation_subscriptions" ON event.donation_subscriptions;
CREATE POLICY "service_role_donation_subscriptions" ON event.donation_subscriptions FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('event','donation_subscriptions');

CREATE TABLE IF NOT EXISTS event.event_cancellation_jobs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id            UUID NOT NULL REFERENCES event.events(id) ON DELETE CASCADE,
    correlation_id      UUID,
    status              TEXT NOT NULL DEFAULT 'PENDING',
    total_registrations INTEGER NOT NULL DEFAULT 0,
    processed_count     INTEGER NOT NULL DEFAULT 0,
    failed_count        INTEGER NOT NULL DEFAULT 0,
    batch_size          INTEGER NOT NULL DEFAULT 50,
    scheduled_for       TIMESTAMPTZ,
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    retry_count         INTEGER NOT NULL DEFAULT 0,
    error_log           JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_event_cancel_jobs_status ON event.event_cancellation_jobs(status) WHERE status NOT IN ('COMPLETED','FAILED');
ALTER TABLE event.event_cancellation_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_event_cancel_jobs" ON event.event_cancellation_jobs;
CREATE POLICY "service_role_event_cancel_jobs" ON event.event_cancellation_jobs FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('event','event_cancellation_jobs');

-- ==========================================
-- 11. CONTENT SCHEMA
-- ==========================================

CREATE TABLE IF NOT EXISTS content.blogs (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title          TEXT NOT NULL,
    slug           TEXT UNIQUE,
    excerpt        TEXT NOT NULL DEFAULT '',
    body           TEXT NOT NULL DEFAULT '',
    author         TEXT NOT NULL DEFAULT 'Admin',
    title_i18n     JSONB NOT NULL DEFAULT '{}'::jsonb,
    excerpt_i18n   JSONB NOT NULL DEFAULT '{}'::jsonb,
    content_i18n   JSONB NOT NULL DEFAULT '{}'::jsonb,
    tags           TEXT[] NOT NULL DEFAULT '{}',
    tags_i18n      JSONB NOT NULL DEFAULT '{}'::jsonb,
    image_url      TEXT,
    is_published   BOOLEAN NOT NULL DEFAULT false,
    published_at   TIMESTAMPTZ,
    blog_code      VARCHAR(100) UNIQUE,
    meta_description TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_blogs_published   ON content.blogs(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_tags        ON content.blogs USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_blogs_search      ON content.blogs USING GIN(to_tsvector('english', title || ' ' || COALESCE(excerpt,'')));
ALTER TABLE content.blogs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_blogs" ON content.blogs;
CREATE POLICY "public_read_blogs" ON content.blogs FOR SELECT USING (is_published = true);
DROP POLICY IF EXISTS "service_role_blogs" ON content.blogs;
CREATE POLICY "service_role_blogs" ON content.blogs FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('content','blogs');

CREATE TABLE IF NOT EXISTS content.comments (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_id      UUID NOT NULL REFERENCES content.blogs(id) ON DELETE CASCADE,
    user_id      UUID NOT NULL REFERENCES "user".profiles(id) ON DELETE CASCADE,
    parent_id    UUID REFERENCES content.comments(id) ON DELETE CASCADE,
    content      TEXT NOT NULL,
    status       VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','hidden','deleted','flagged')),
    is_flagged   BOOLEAN NOT NULL DEFAULT false,
    flag_count   INTEGER NOT NULL DEFAULT 0,
    reply_count  INTEGER NOT NULL DEFAULT 0,
    upvotes      INTEGER NOT NULL DEFAULT 0,
    edit_count   INTEGER NOT NULL DEFAULT 0,
    last_edited_at TIMESTAMPTZ,
    deleted_at   TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comments_blog   ON content.comments(blog_id, status);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON content.comments(parent_id) WHERE parent_id IS NOT NULL;
ALTER TABLE content.comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_comments" ON content.comments;
CREATE POLICY "public_read_comments" ON content.comments FOR SELECT USING (status = 'active');
DROP POLICY IF EXISTS "service_role_comments" ON content.comments;
CREATE POLICY "service_role_comments" ON content.comments FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('content','comments');

CREATE TABLE IF NOT EXISTS content.faqs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question      TEXT NOT NULL,
    answer        TEXT NOT NULL,
    question_i18n JSONB NOT NULL DEFAULT '{}'::jsonb,
    answer_i18n   JSONB NOT NULL DEFAULT '{}'::jsonb,
    category_id   UUID REFERENCES product.categories(id) ON DELETE SET NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active     BOOLEAN NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE content.faqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_faqs" ON content.faqs;
CREATE POLICY "public_read_faqs" ON content.faqs FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "service_role_faqs" ON content.faqs;
CREATE POLICY "service_role_faqs" ON content.faqs FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('content','faqs');

CREATE TABLE IF NOT EXISTS content.testimonials (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID REFERENCES "user".profiles(id) ON DELETE SET NULL,
    name          TEXT NOT NULL,
    designation   TEXT,
    email         TEXT,
    image_url     TEXT,
    content       TEXT NOT NULL,
    content_i18n  JSONB NOT NULL DEFAULT '{}'::jsonb,
    rating        INTEGER CHECK (rating >= 1 AND rating <= 5),
    is_approved   BOOLEAN NOT NULL DEFAULT false,
    is_active     BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON content.testimonials(is_approved, is_active);
ALTER TABLE content.testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_testimonials" ON content.testimonials;
CREATE POLICY "public_read_testimonials" ON content.testimonials FOR SELECT USING (is_approved = true AND is_active = true);
DROP POLICY IF EXISTS "service_role_testimonials" ON content.testimonials;
CREATE POLICY "service_role_testimonials" ON content.testimonials FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('content','testimonials');

CREATE TABLE IF NOT EXISTS content.gallery_folders (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              TEXT NOT NULL,
    slug              TEXT UNIQUE,
    description       TEXT,
    name_i18n         JSONB NOT NULL DEFAULT '{}'::jsonb,
    description_i18n  JSONB NOT NULL DEFAULT '{}'::jsonb,
    category_id       UUID REFERENCES product.categories(id) ON DELETE SET NULL,
    cover_image       TEXT,
    is_home_carousel  BOOLEAN NOT NULL DEFAULT false,
    is_mobile_carousel BOOLEAN NOT NULL DEFAULT false,
    is_hidden         BOOLEAN NOT NULL DEFAULT false,
    is_active         BOOLEAN NOT NULL DEFAULT true,
    display_order     INTEGER NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_gallery_home_carousel   ON content.gallery_folders(is_home_carousel)   WHERE is_home_carousel = true;
CREATE UNIQUE INDEX IF NOT EXISTS idx_gallery_mobile_carousel ON content.gallery_folders(is_mobile_carousel) WHERE is_mobile_carousel = true;
CREATE INDEX        IF NOT EXISTS idx_gallery_folders_order   ON content.gallery_folders(display_order);
ALTER TABLE content.gallery_folders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_gallery_folders" ON content.gallery_folders;
CREATE POLICY "public_read_gallery_folders" ON content.gallery_folders FOR SELECT USING (is_active = true AND is_hidden = false);
DROP POLICY IF EXISTS "service_role_gallery_folders" ON content.gallery_folders;
CREATE POLICY "service_role_gallery_folders" ON content.gallery_folders FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('content','gallery_folders');

CREATE TABLE IF NOT EXISTS content.gallery_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id       UUID REFERENCES content.gallery_folders(id) ON DELETE CASCADE,
    title           TEXT,
    description     TEXT,
    title_i18n      JSONB NOT NULL DEFAULT '{}'::jsonb,
    description_i18n JSONB NOT NULL DEFAULT '{}'::jsonb,
    image_url       TEXT NOT NULL,
    thumbnail_url   TEXT,
    location        TEXT,
    tags            TEXT[] NOT NULL DEFAULT '{}',
    captured_date   DATE,
    display_order   INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gallery_items_folder ON content.gallery_items(folder_id);
CREATE INDEX IF NOT EXISTS idx_gallery_items_tags   ON content.gallery_items USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_gallery_items_date   ON content.gallery_items(captured_date DESC);
ALTER TABLE content.gallery_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_gallery_items" ON content.gallery_items;
CREATE POLICY "public_read_gallery_items" ON content.gallery_items FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "service_role_gallery_items" ON content.gallery_items;
CREATE POLICY "service_role_gallery_items" ON content.gallery_items FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('content','gallery_items');

CREATE TABLE IF NOT EXISTS content.gallery_videos (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id      UUID REFERENCES content.gallery_folders(id) ON DELETE CASCADE,
    title          TEXT,
    description    TEXT,
    title_i18n     JSONB NOT NULL DEFAULT '{}'::jsonb,
    slug           TEXT,
    youtube_id     TEXT,
    youtube_url    TEXT,
    thumbnail_url  TEXT,
    tags           TEXT[] NOT NULL DEFAULT '{}',
    display_order  INTEGER NOT NULL DEFAULT 0,
    is_active      BOOLEAN NOT NULL DEFAULT true,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gallery_videos_folder ON content.gallery_videos(folder_id);
ALTER TABLE content.gallery_videos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_gallery_videos" ON content.gallery_videos;
CREATE POLICY "service_role_gallery_videos" ON content.gallery_videos FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('content','gallery_videos');

CREATE TABLE IF NOT EXISTS content.policies (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_type    TEXT NOT NULL CHECK (policy_type IN ('privacy','terms','shipping-refund')),
    title          TEXT NOT NULL,
    content_html   TEXT NOT NULL,
    title_i18n     JSONB NOT NULL DEFAULT '{}'::jsonb,
    content_i18n   JSONB NOT NULL DEFAULT '{}'::jsonb,
    storage_path   TEXT NOT NULL DEFAULT '',
    file_type      TEXT NOT NULL DEFAULT 'pdf',
    version        INTEGER NOT NULL DEFAULT 1,
    is_active      BOOLEAN NOT NULL DEFAULT true,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_policies_active_type ON content.policies(policy_type) WHERE is_active = true;
ALTER TABLE content.policies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_policies" ON content.policies;
CREATE POLICY "public_read_policies" ON content.policies FOR SELECT TO anon, authenticated USING (is_active = true);
DROP POLICY IF EXISTS "service_role_policies" ON content.policies;
CREATE POLICY "service_role_policies" ON content.policies FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('content','policies');

-- About section tables
CREATE TABLE IF NOT EXISTS content.about_cards (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title         TEXT NOT NULL,
    description   TEXT NOT NULL,
    title_i18n    JSONB NOT NULL DEFAULT '{}'::jsonb,
    desc_i18n     JSONB NOT NULL DEFAULT '{}'::jsonb,
    icon          TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE content.about_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_about_cards" ON content.about_cards;
CREATE POLICY "public_read_about_cards" ON content.about_cards FOR SELECT USING (true);
DROP POLICY IF EXISTS "service_role_about_cards" ON content.about_cards;
CREATE POLICY "service_role_about_cards" ON content.about_cards FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('content','about_cards');

CREATE TABLE IF NOT EXISTS content.about_team_members (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT NOT NULL,
    role          TEXT NOT NULL,
    bio           TEXT NOT NULL,
    name_i18n     JSONB NOT NULL DEFAULT '{}'::jsonb,
    role_i18n     JSONB NOT NULL DEFAULT '{}'::jsonb,
    bio_i18n      JSONB NOT NULL DEFAULT '{}'::jsonb,
    image_url     TEXT,
    social_links  JSONB NOT NULL DEFAULT '{}'::jsonb,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE content.about_team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_team" ON content.about_team_members;
CREATE POLICY "public_read_team" ON content.about_team_members FOR SELECT USING (true);
DROP POLICY IF EXISTS "service_role_team" ON content.about_team_members;
CREATE POLICY "service_role_team" ON content.about_team_members FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('content','about_team_members');

CREATE TABLE IF NOT EXISTS content.about_impact_stats (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    value         TEXT NOT NULL,
    label         TEXT NOT NULL,
    label_i18n    JSONB NOT NULL DEFAULT '{}'::jsonb,
    icon          TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE content.about_impact_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_impact_stats" ON content.about_impact_stats;
CREATE POLICY "public_read_impact_stats" ON content.about_impact_stats FOR SELECT USING (true);
DROP POLICY IF EXISTS "service_role_impact_stats" ON content.about_impact_stats;
CREATE POLICY "service_role_impact_stats" ON content.about_impact_stats FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('content','about_impact_stats');

CREATE TABLE IF NOT EXISTS content.contact_info (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    address_line1    TEXT,
    address_line2    TEXT,
    city             TEXT,
    state            TEXT,
    pincode          TEXT,
    country          TEXT NOT NULL DEFAULT 'India',
    google_maps_link TEXT,
    map_latitude     NUMERIC(10,7),
    map_longitude    NUMERIC(10,7),
    address_i18n     JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE content.contact_info ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_contact_info" ON content.contact_info;
CREATE POLICY "public_read_contact_info" ON content.contact_info FOR SELECT USING (true);
DROP POLICY IF EXISTS "service_role_contact_info" ON content.contact_info;
CREATE POLICY "service_role_contact_info" ON content.contact_info FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('content','contact_info');

CREATE TABLE IF NOT EXISTS content.bank_details (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_name    TEXT NOT NULL,
    account_number  TEXT NOT NULL,
    ifsc_code       TEXT NOT NULL,
    bank_name       TEXT NOT NULL,
    branch_name     TEXT,
    upi_id          TEXT,
    type            TEXT NOT NULL CHECK (type IN ('general','donation')),
    qr_code_url     TEXT,
    use_manual_qr   BOOLEAN NOT NULL DEFAULT false,
    display_order   INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE content.bank_details ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_bank_details" ON content.bank_details;
CREATE POLICY "public_read_bank_details" ON content.bank_details FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "service_role_bank_details" ON content.bank_details;
CREATE POLICY "service_role_bank_details" ON content.bank_details FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('content','bank_details');

CREATE TABLE IF NOT EXISTS content.social_media (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform      TEXT NOT NULL,
    url           TEXT NOT NULL,
    icon          TEXT,
    is_active     BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE content.social_media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_social_media" ON content.social_media;
CREATE POLICY "public_read_social_media" ON content.social_media FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "service_role_social_media" ON content.social_media;
CREATE POLICY "service_role_social_media" ON content.social_media FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('content','social_media');

CREATE TABLE IF NOT EXISTS content.carousel_slides (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title         TEXT NOT NULL,
    subtitle      TEXT,
    title_i18n    JSONB NOT NULL DEFAULT '{}'::jsonb,
    subtitle_i18n JSONB NOT NULL DEFAULT '{}'::jsonb,
    image_url     TEXT,
    link_url      TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active     BOOLEAN NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE content.carousel_slides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_carousel" ON content.carousel_slides;
CREATE POLICY "public_read_carousel" ON content.carousel_slides FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "service_role_carousel" ON content.carousel_slides;
CREATE POLICY "service_role_carousel" ON content.carousel_slides FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('content','carousel_slides');

CREATE TABLE IF NOT EXISTS content.translations (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    namespace  TEXT NOT NULL,
    key        TEXT NOT NULL,
    locale     VARCHAR(5) NOT NULL,
    value      TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (namespace, key, locale)
);
CREATE INDEX IF NOT EXISTS idx_translations_ns_locale ON content.translations(namespace, locale);
ALTER TABLE content.translations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_translations" ON content.translations;
CREATE POLICY "public_read_translations" ON content.translations FOR SELECT USING (true);
DROP POLICY IF EXISTS "service_role_translations" ON content.translations;
CREATE POLICY "service_role_translations" ON content.translations FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('content','translations');

-- ==========================================
-- 12. COMMUNICATION SCHEMA
-- ==========================================

CREATE TABLE IF NOT EXISTS communication.email_templates (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_key VARCHAR(100) NOT NULL UNIQUE,
    name         VARCHAR(255) NOT NULL,
    subject      VARCHAR(500) NOT NULL,
    html_body    TEXT NOT NULL,
    text_body    TEXT,
    variables    JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active    BOOLEAN NOT NULL DEFAULT true,
    version      INTEGER NOT NULL DEFAULT 1,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE communication.email_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_email_templates" ON communication.email_templates;
CREATE POLICY "service_role_email_templates" ON communication.email_templates FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('communication','email_templates');

CREATE TABLE IF NOT EXISTS communication.email_queue (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    to_email      TEXT NOT NULL,
    to_name       TEXT,
    template_key  VARCHAR(100),
    subject       VARCHAR(500),
    html_body     TEXT,
    text_body     TEXT,
    template_data JSONB,
    provider      VARCHAR(20) NOT NULL DEFAULT 'ses',
    status        VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PROCESSING','SENT','FAILED','CANCELLED')),
    attempts      INTEGER NOT NULL DEFAULT 0,
    max_attempts  INTEGER NOT NULL DEFAULT 3,
    error_message TEXT,
    reference_id  TEXT,
    reference_type TEXT,
    priority      VARCHAR(20) NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW','NORMAL','HIGH','CRITICAL')),
    scheduled_at  TIMESTAMPTZ,
    sent_at       TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_email_queue_status    ON communication.email_queue(status, priority) WHERE status IN ('PENDING','FAILED');
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON communication.email_queue(scheduled_at) WHERE status = 'PENDING';
ALTER TABLE communication.email_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_email_queue" ON communication.email_queue;
CREATE POLICY "service_role_email_queue" ON communication.email_queue FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS communication.contact_messages (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID REFERENCES "user".profiles(id) ON DELETE SET NULL,
    name       VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    phone      VARCHAR(20),
    subject    VARCHAR(255),
    message    TEXT NOT NULL,
    status     VARCHAR(20) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW','READ','REPLIED','ARCHIVED')),
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON communication.contact_messages(status) WHERE status = 'NEW';
ALTER TABLE communication.contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_contact_messages" ON communication.contact_messages;
CREATE POLICY "service_role_contact_messages" ON communication.contact_messages FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('communication','contact_messages');

CREATE TABLE IF NOT EXISTS communication.admin_alerts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type        TEXT NOT NULL CHECK (type IN ('order','product','user','payment','system','event','donation')),
    priority    TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
    status      TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread','read','resolved','archived')),
    title       TEXT NOT NULL,
    message     TEXT NOT NULL,
    reference_id TEXT,
    metadata    JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by  UUID REFERENCES "user".profiles(id) ON DELETE SET NULL,
    resolved_by UUID REFERENCES "user".profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_status   ON communication.admin_alerts(status, priority) WHERE status = 'unread';
CREATE INDEX IF NOT EXISTS idx_admin_alerts_created  ON communication.admin_alerts(created_at DESC);
ALTER TABLE communication.admin_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_admin_alerts" ON communication.admin_alerts;
CREATE POLICY "service_role_admin_alerts" ON communication.admin_alerts FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('communication','admin_alerts');

CREATE TABLE IF NOT EXISTS communication.order_notifications (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id   UUID REFERENCES "order".orders(id) ON DELETE CASCADE,
    admin_id   UUID REFERENCES "user".profiles(id) ON DELETE CASCADE,
    type       TEXT NOT NULL,
    title      TEXT,
    message    TEXT,
    metadata   JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_read    BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_notif_admin_unread ON communication.order_notifications(admin_id, is_read) WHERE is_read = false;
ALTER TABLE communication.order_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_order_notifications" ON communication.order_notifications;
CREATE POLICY "service_role_order_notifications" ON communication.order_notifications FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('communication','order_notifications');

-- ==========================================
-- 13. ANALYTICS SCHEMA
-- ==========================================

CREATE TABLE IF NOT EXISTS analytics.audit_logs (
    id          UUID DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES "user".profiles(id) ON DELETE SET NULL,
    action      TEXT NOT NULL,
    entity_type TEXT,
    entity_id   TEXT,
    ip_address  INET,
    user_agent  TEXT,
    metadata    JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Monthly partitions for the next 6 months (extend as needed)
CREATE TABLE IF NOT EXISTS analytics.audit_logs_2026_05 PARTITION OF analytics.audit_logs
    FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE IF NOT EXISTS analytics.audit_logs_2026_06 PARTITION OF analytics.audit_logs
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE IF NOT EXISTS analytics.audit_logs_2026_07 PARTITION OF analytics.audit_logs
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE IF NOT EXISTS analytics.audit_logs_2026_08 PARTITION OF analytics.audit_logs
    FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE IF NOT EXISTS analytics.audit_logs_default PARTITION OF analytics.audit_logs DEFAULT;

CREATE INDEX IF NOT EXISTS idx_audit_logs_user    ON analytics.audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action  ON analytics.audit_logs(action, entity_type);
ALTER TABLE analytics.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_audit_logs" ON analytics.audit_logs;
CREATE POLICY "service_role_audit_logs" ON analytics.audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS analytics.request_logs (
    id            UUID DEFAULT gen_random_uuid(),
    method        TEXT NOT NULL,
    path          TEXT NOT NULL,
    status_code   INTEGER NOT NULL,
    response_time INTEGER NOT NULL DEFAULT 0,
    user_id       UUID,
    ip_address    INET,
    correlation_id TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);
CREATE TABLE IF NOT EXISTS analytics.request_logs_2026_05 PARTITION OF analytics.request_logs
    FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE IF NOT EXISTS analytics.request_logs_default PARTITION OF analytics.request_logs DEFAULT;
CREATE INDEX IF NOT EXISTS idx_req_logs_path_status ON analytics.request_logs(path, status_code, created_at DESC);
ALTER TABLE analytics.request_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_request_logs" ON analytics.request_logs;
CREATE POLICY "service_role_request_logs" ON analytics.request_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS analytics.realtime_events (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type   TEXT NOT NULL,
    channel      TEXT NOT NULL CHECK (channel IN ('admin','user','order','payment')),
    user_id      UUID REFERENCES "user".profiles(id) ON DELETE SET NULL,
    payload      JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_broadcast BOOLEAN NOT NULL DEFAULT false,
    expires_at   TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_realtime_events_expires ON analytics.realtime_events(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_realtime_events_channel ON analytics.realtime_events(channel, created_at DESC);
ALTER TABLE analytics.realtime_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_realtime_events" ON analytics.realtime_events;
CREATE POLICY "service_role_realtime_events" ON analytics.realtime_events FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ==========================================
-- 14. STORAGE SCHEMA
-- ==========================================

CREATE TABLE IF NOT EXISTS storage.file_records (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_name TEXT NOT NULL,
    filename      TEXT NOT NULL,
    mimetype      TEXT NOT NULL,
    size          BIGINT NOT NULL,
    url           TEXT NOT NULL,
    storage_path  TEXT,
    bucket        TEXT NOT NULL DEFAULT 'uploads',
    user_id       UUID REFERENCES "user".profiles(id) ON DELETE SET NULL,
    entity_type   TEXT,
    entity_id     TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_files_user_id    ON storage.file_records(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_files_entity     ON storage.file_records(entity_type, entity_id) WHERE entity_type IS NOT NULL;
ALTER TABLE storage.file_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_file_records" ON storage.file_records;
CREATE POLICY "service_role_file_records" ON storage.file_records FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ==========================================
-- 15. CRON SCHEMA
-- ==========================================

CREATE TABLE IF NOT EXISTS cron.cron_jobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id          TEXT NOT NULL UNIQUE,
    name            TEXT NOT NULL,
    type            TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','processing','completed','failed','cancelled')),
    priority        TEXT NOT NULL DEFAULT 'normal'
                        CHECK (priority IN ('low','normal','high','critical')),
    payload         JSONB,
    result          JSONB,
    error           TEXT,
    cron_expression TEXT,
    is_recurring    BOOLEAN NOT NULL DEFAULT false,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    description     TEXT,
    max_retries     INTEGER NOT NULL DEFAULT 3,
    retry_count     INTEGER NOT NULL DEFAULT 0,
    timeout_seconds INTEGER,
    created_by      UUID REFERENCES "user".profiles(id) ON DELETE SET NULL,
    scheduled_at    TIMESTAMPTZ,
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    last_run_at     TIMESTAMPTZ,
    next_run_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cron_jobs_status     ON cron.cron_jobs(status, scheduled_at) WHERE status IN ('pending','processing');
CREATE INDEX IF NOT EXISTS idx_cron_jobs_next_run   ON cron.cron_jobs(next_run_at) WHERE is_recurring = true AND is_active = true;
ALTER TABLE cron.cron_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_cron_jobs" ON cron.cron_jobs;
CREATE POLICY "service_role_cron_jobs" ON cron.cron_jobs FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('cron','cron_jobs');

CREATE TABLE IF NOT EXISTS cron.job_runs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id       TEXT NOT NULL,
    cron_job_id  UUID REFERENCES cron.cron_jobs(id) ON DELETE SET NULL,
    status       TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','processing','completed','failed','cancelled')),
    payload      JSONB,
    result       JSONB,
    error        TEXT,
    retry_count  INTEGER NOT NULL DEFAULT 0,
    started_at   TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_job_runs_cron_job ON cron.job_runs(cron_job_id);
CREATE INDEX IF NOT EXISTS idx_job_runs_status   ON cron.job_runs(status, created_at DESC) WHERE status NOT IN ('completed','cancelled');
ALTER TABLE cron.job_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_job_runs" ON cron.job_runs;
CREATE POLICY "service_role_job_runs" ON cron.job_runs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ==========================================
-- 16. CROSS-SCHEMA HELPER FUNCTIONS
-- ==========================================

-- 16.1 Check if caller is admin or manager
CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT EXISTS (
        SELECT 1 FROM "user".profiles p
        JOIN config.roles r ON r.id = p.role_id
        WHERE p.id = auth.uid() AND r.name IN ('admin','manager') AND p.is_deleted = false
    );
$$;

-- 16.2 Check if caller owns a given order
CREATE OR REPLACE FUNCTION public.user_owns_order(p_order_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT EXISTS (
        SELECT 1 FROM "order".orders WHERE id = p_order_id AND user_id = auth.uid()
    );
$$;

-- ==========================================
-- 17. RPCs (Stored Procedures)
-- ==========================================

-- 17.1 Generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
    RETURN 'ODR-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-'
        || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 8));
END; $$;

-- 17.2 Acquire idempotency lock
CREATE OR REPLACE FUNCTION public.acquire_idempotency_lock(
    p_cache_key TEXT, p_user_id TEXT, p_idempotency_key TEXT,
    p_correlation_id TEXT, p_ttl_seconds INTEGER DEFAULT 300
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_existing JSONB;
    v_expires  TIMESTAMPTZ := NOW() + (p_ttl_seconds || ' seconds')::INTERVAL;
BEGIN
    SELECT jsonb_build_object('in_progress', in_progress, 'status_code', status_code, 'response', response)
    INTO v_existing
    FROM config.idempotency_keys
    WHERE cache_key = p_cache_key AND expires_at > NOW();

    IF FOUND THEN RETURN v_existing || '{"found": true}'::jsonb; END IF;

    INSERT INTO config.idempotency_keys
        (cache_key, user_id, idempotency_key, correlation_id, in_progress, expires_at)
    VALUES (p_cache_key, p_user_id, p_idempotency_key, p_correlation_id, true, v_expires)
    ON CONFLICT (cache_key) DO UPDATE
        SET in_progress = true, updated_at = NOW(), expires_at = v_expires;

    RETURN '{"found": false}'::jsonb;
END; $$;

-- 17.3 Complete idempotency entry
CREATE OR REPLACE FUNCTION public.complete_idempotency_lock(
    p_cache_key TEXT, p_status_code INTEGER, p_response JSONB
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    UPDATE config.idempotency_keys
    SET in_progress = false, status_code = p_status_code,
        response = p_response, completed_at = NOW(), updated_at = NOW()
    WHERE cache_key = p_cache_key;
END; $$;

-- 17.4 Atomic batch inventory decrement (with optimistic locking)
CREATE OR REPLACE FUNCTION public.batch_decrement_inventory(p_items JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_item       JSONB;
    v_variant_id UUID;
    v_qty        INTEGER;
    v_rows       INTEGER;
BEGIN
    FOR v_item IN SELECT * FROM jsonb_array_elements(COALESCE(p_items, '[]'::jsonb)) LOOP
        v_variant_id := (v_item->>'variant_id')::UUID;
        v_qty        := COALESCE((v_item->>'quantity')::INTEGER, 0);

        UPDATE product.product_variants
        SET stock_quantity = stock_quantity - v_qty, updated_at = NOW()
        WHERE id = v_variant_id AND stock_quantity >= v_qty AND is_active = true;
        GET DIAGNOSTICS v_rows := ROW_COUNT;

        IF v_rows = 0 THEN
            RAISE EXCEPTION 'INSUFFICIENT_STOCK: variant_id=% qty=%', v_variant_id, v_qty;
        END IF;
    END LOOP;
    RETURN '{"success": true}'::jsonb;
END; $$;

-- 17.5 Atomic batch inventory increment (on return/cancel)
CREATE OR REPLACE FUNCTION public.batch_increment_inventory(p_items JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_item JSONB;
BEGIN
    FOR v_item IN SELECT * FROM jsonb_array_elements(COALESCE(p_items, '[]'::jsonb)) LOOP
        UPDATE product.product_variants
        SET stock_quantity = COALESCE(stock_quantity, 0) + COALESCE((v_item->>'quantity')::INTEGER, 0),
            updated_at = NOW()
        WHERE id = (v_item->>'variant_id')::UUID;
    END LOOP;
    RETURN '{"success": true}'::jsonb;
END; $$;

-- 17.6 Increment coupon usage atomically
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(p_coupon_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    UPDATE cart.coupons
    SET usage_count = COALESCE(usage_count, 0) + 1, updated_at = NOW()
    WHERE id = p_coupon_id;
END; $$;

-- 17.7 Decrement coupon usage (on order cancel)
CREATE OR REPLACE FUNCTION public.decrement_coupon_usage(p_coupon_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    UPDATE cart.coupons
    SET usage_count = GREATEST(COALESCE(usage_count, 0) - 1, 0), updated_at = NOW()
    WHERE id = p_coupon_id;
END; $$;

-- 17.8 Increment event registered count
CREATE OR REPLACE FUNCTION public.increment_event_registrations(p_event_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    UPDATE event.events
    SET registered_count = COALESCE(registered_count, 0) + 1, updated_at = NOW()
    WHERE id = p_event_id;
END; $$;

-- 17.9 Decrement event registered count
CREATE OR REPLACE FUNCTION public.decrement_event_registrations(p_event_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    UPDATE event.events
    SET registered_count = GREATEST(COALESCE(registered_count, 0) - 1, 0), updated_at = NOW()
    WHERE id = p_event_id;
END; $$;

-- 17.10 Upsert product review and recalculate product rating
CREATE OR REPLACE FUNCTION public.upsert_review_and_recalc_rating(
    p_product_id UUID, p_user_id UUID, p_rating INTEGER,
    p_title TEXT, p_comment TEXT
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    INSERT INTO product.reviews (product_id, user_id, rating, title, comment)
    VALUES (p_product_id, p_user_id, p_rating, p_title, p_comment)
    ON CONFLICT (product_id, user_id) DO UPDATE
        SET rating = EXCLUDED.rating, title = EXCLUDED.title,
            comment = EXCLUDED.comment, updated_at = NOW();

    UPDATE product.products p
    SET rating       = (SELECT ROUND(AVG(r.rating)::NUMERIC, 2) FROM product.reviews r WHERE r.product_id = p_product_id AND r.is_approved),
        review_count = (SELECT COUNT(*) FROM product.reviews r WHERE r.product_id = p_product_id AND r.is_approved),
        updated_at   = NOW()
    WHERE p.id = p_product_id;
END; $$;

-- 17.11 Atomic set primary address
CREATE OR REPLACE FUNCTION public.set_primary_address(p_address_id UUID, p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    UPDATE "user".addresses SET is_primary = false, updated_at = NOW()
    WHERE user_id = p_user_id AND id <> p_address_id;
    UPDATE "user".addresses SET is_primary = true, updated_at = NOW()
    WHERE id = p_address_id AND user_id = p_user_id;
END; $$;

-- 17.12 Cleanup expired sessions (cron target)
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_deleted INTEGER;
BEGIN
    DELETE FROM auth.sessions WHERE expires_at < NOW() OR revoked_at IS NOT NULL;
    GET DIAGNOSTICS v_deleted := ROW_COUNT;
    RETURN v_deleted;
END; $$;

-- 17.13 Cleanup expired OTPs (cron target)
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_deleted INTEGER;
BEGIN
    DELETE FROM auth.otp_codes WHERE expires_at < NOW() OR verified = true;
    GET DIAGNOSTICS v_deleted := ROW_COUNT;
    RETURN v_deleted;
END; $$;

-- 17.14 Cleanup expired inventory reservations
CREATE OR REPLACE FUNCTION public.cleanup_expired_reservations()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_deleted INTEGER;
BEGIN
    DELETE FROM product.inventory_reservations WHERE expires_at < NOW();
    GET DIAGNOSTICS v_deleted := ROW_COUNT;
    RETURN v_deleted;
END; $$;

-- 17.15 Cleanup expired idempotency keys
CREATE OR REPLACE FUNCTION public.cleanup_expired_idempotency_keys()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_deleted INTEGER;
BEGIN
    DELETE FROM config.idempotency_keys WHERE expires_at < NOW();
    GET DIAGNOSTICS v_deleted := ROW_COUNT;
    RETURN v_deleted;
END; $$;

-- 17.16 Webhook lock acquire (prevent duplicate processing)
CREATE OR REPLACE FUNCTION public.acquire_webhook_lock(
    p_event_id TEXT, p_event_type TEXT, p_worker_id TEXT,
    p_ttl_seconds INTEGER DEFAULT 60
)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_lock_expires TIMESTAMPTZ := NOW() + (p_ttl_seconds || ' seconds')::INTERVAL;
    v_updated      INTEGER;
BEGIN
    UPDATE payment.webhook_logs
    SET locked_at = NOW(), locked_by = p_worker_id,
        status = 'PROCESSING', updated_at = NOW()
    WHERE event_id = p_event_id AND event_type = p_event_type
      AND status IN ('PENDING', 'FAILED')
      AND (locked_at IS NULL OR locked_at < NOW() - (p_ttl_seconds || ' seconds')::INTERVAL);
    GET DIAGNOSTICS v_updated := ROW_COUNT;
    RETURN v_updated > 0;
END; $$;

-- 17.17 Create manager atomically
CREATE OR REPLACE FUNCTION public.create_manager_atomic(
    p_identity_id UUID,
    p_name        TEXT,
    p_phone       TEXT,
    p_creator_id  UUID,
    p_permissions JSONB
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_manager_id   UUID;
    v_perm_result  JSONB;
BEGIN
    INSERT INTO "user".managers (identity_id, name, phone, creator_id)
    VALUES (p_identity_id, p_name, p_phone, p_creator_id)
    RETURNING id INTO v_manager_id;

    INSERT INTO "user".manager_permissions (
        manager_id,
        can_manage_products, can_manage_categories, can_manage_orders,
        can_manage_returns, can_manage_refunds, can_manage_events,
        can_manage_blogs, can_manage_testimonials, can_manage_gallery,
        can_manage_faqs, can_manage_coupons, can_manage_donations,
        can_manage_about_us, can_manage_contact_info, can_manage_policies,
        can_manage_delivery, can_manage_emails, can_manage_translations,
        can_manage_jobs, can_manage_managers, can_manage_system, can_view_analytics
    ) VALUES (
        v_manager_id,
        COALESCE((p_permissions->>'can_manage_products')::BOOLEAN, false),
        COALESCE((p_permissions->>'can_manage_categories')::BOOLEAN, false),
        COALESCE((p_permissions->>'can_manage_orders')::BOOLEAN, false),
        COALESCE((p_permissions->>'can_manage_returns')::BOOLEAN, false),
        COALESCE((p_permissions->>'can_manage_refunds')::BOOLEAN, false),
        COALESCE((p_permissions->>'can_manage_events')::BOOLEAN, false),
        COALESCE((p_permissions->>'can_manage_blogs')::BOOLEAN, false),
        COALESCE((p_permissions->>'can_manage_testimonials')::BOOLEAN, false),
        COALESCE((p_permissions->>'can_manage_gallery')::BOOLEAN, false),
        COALESCE((p_permissions->>'can_manage_faqs')::BOOLEAN, false),
        COALESCE((p_permissions->>'can_manage_coupons')::BOOLEAN, false),
        COALESCE((p_permissions->>'can_manage_donations')::BOOLEAN, false),
        COALESCE((p_permissions->>'can_manage_about_us')::BOOLEAN, false),
        COALESCE((p_permissions->>'can_manage_contact_info')::BOOLEAN, false),
        COALESCE((p_permissions->>'can_manage_policies')::BOOLEAN, false),
        COALESCE((p_permissions->>'can_manage_delivery')::BOOLEAN, false),
        COALESCE((p_permissions->>'can_manage_emails')::BOOLEAN, false),
        COALESCE((p_permissions->>'can_manage_translations')::BOOLEAN, false),
        COALESCE((p_permissions->>'can_manage_jobs')::BOOLEAN, false),
        COALESCE((p_permissions->>'can_manage_managers')::BOOLEAN, false),
        COALESCE((p_permissions->>'can_manage_system')::BOOLEAN, false),
        COALESCE((p_permissions->>'can_view_analytics')::BOOLEAN, false)
    ) RETURNING to_jsonb("user".manager_permissions.*) INTO v_perm_result;

    RETURN jsonb_build_object('manager_id', v_manager_id, 'permissions', v_perm_result);
END; $$;

-- ==========================================
-- 18. MAINTENANCE / CLEANUP PROCEDURES
-- ==========================================

-- Run all cleanup routines (called by cron)
CREATE OR REPLACE FUNCTION public.run_maintenance_cleanup()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_sessions     INTEGER;
    v_otps         INTEGER;
    v_reservations INTEGER;
    v_idempotency  INTEGER;
BEGIN
    v_sessions     := public.cleanup_expired_sessions();
    v_otps         := public.cleanup_expired_otps();
    v_reservations := public.cleanup_expired_reservations();
    v_idempotency  := public.cleanup_expired_idempotency_keys();

    -- Prune old request logs > 7 days
    DELETE FROM analytics.request_logs WHERE created_at < NOW() - INTERVAL '7 days';

    -- Prune old realtime events > 1 day
    DELETE FROM analytics.realtime_events WHERE expires_at IS NOT NULL AND expires_at < NOW();

    RETURN jsonb_build_object(
        'sessions_removed', v_sessions,
        'otps_removed', v_otps,
        'reservations_removed', v_reservations,
        'idempotency_removed', v_idempotency
    );
END; $$;

-- ==========================================
-- 19. GRANTS (search_path for all schemas)
-- ==========================================
GRANT USAGE ON SCHEMA config      TO authenticated, anon, service_role;
GRANT USAGE ON SCHEMA auth        TO service_role;
GRANT USAGE ON SCHEMA "user"      TO authenticated, service_role;
GRANT USAGE ON SCHEMA product     TO authenticated, anon, service_role;
GRANT USAGE ON SCHEMA cart        TO authenticated, service_role;
GRANT USAGE ON SCHEMA "order"     TO authenticated, service_role;
GRANT USAGE ON SCHEMA payment     TO service_role;
GRANT USAGE ON SCHEMA event       TO authenticated, anon, service_role;
GRANT USAGE ON SCHEMA content     TO authenticated, anon, service_role;
GRANT USAGE ON SCHEMA communication TO service_role;
GRANT USAGE ON SCHEMA analytics   TO service_role;
GRANT USAGE ON SCHEMA storage     TO service_role;
GRANT USAGE ON SCHEMA cron        TO service_role;

-- service_role gets full table access (RLS bypassed by policy above)
GRANT ALL ON ALL TABLES IN SCHEMA config      TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth        TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA "user"      TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA product     TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA cart        TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA "order"     TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA payment     TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA event       TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA content     TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA communication TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA analytics   TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA storage     TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA cron        TO service_role;

GRANT ALL ON ALL SEQUENCES IN SCHEMA config   TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA "user"   TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA cron     TO service_role;

-- ==========================================
-- 20. COMPLETION MARKER
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE '✅ Modular monolith baseline migration complete.
Schemas: config | auth | user | product | cart | order | payment | event | content | communication | analytics | storage | cron
RPCs: 17 stored procedures created.
Cleanup: run_maintenance_cleanup() handles session/OTP/reservation/idempotency pruning.
Partitions: audit_logs and request_logs partitioned by month.';
END $$;
