-- ================================================================
-- MERIGAUMATA — MODULAR MONOLITH BASELINE MIGRATION
-- Version: 1.0.0
-- Date: 2026-05-16
-- Strategy: Single Supabase DB, one PostgreSQL schema per domain
--
-- Schemas:
--   config      — system_switches, store_settings, roles, permissions, role_permissions, brand_assets, geo/currency cache
--   auth        — users, sessions, OTP challenges, OAuth, refresh tokens
--   user        — profiles, addresses, managers, deletion
--   product     — products, variants, categories, delivery, inventory, reviews
--   cart        — carts, items, coupons
--   order       — orders, items, invoices, returns, QC, reservations
--   payment     — payment_intents, refunds, webhookLogs
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


CREATE SCHEMA IF NOT EXISTS app_auth;

GRANT ALL ON SCHEMA app_auth TO PUBLIC;
GRANT ALL ON SCHEMA app_auth TO postgres;
GRANT ALL ON SCHEMA app_auth TO authenticated;
GRANT ALL ON SCHEMA app_auth TO service_role;

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


CREATE SCHEMA IF NOT EXISTS app_auth;
CREATE SCHEMA IF NOT EXISTS "user";
CREATE SCHEMA IF NOT EXISTS "order";
CREATE SCHEMA IF NOT EXISTS config;
CREATE SCHEMA IF NOT EXISTS product;
CREATE SCHEMA IF NOT EXISTS cart;
CREATE SCHEMA IF NOT EXISTS payment;
CREATE SCHEMA IF NOT EXISTS event;
CREATE SCHEMA IF NOT EXISTS content;
CREATE SCHEMA IF NOT EXISTS communication;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS cron;








-- ==========================================
-- 2. SHARED UTILITY: updatedAt TRIGGER
-- ==========================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updatedAt = NOW(); RETURN NEW; END; $$;

-- Helper macro: call after each table that has updatedAt
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
CREATE TABLE IF NOT EXISTS app_auth.roles (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name        TEXT NOT NULL UNIQUE,
    description TEXT,
    is_system   BOOLEAN NOT NULL DEFAULT false,
    createdAt  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE app_auth.roles ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE app_auth.roles ALTER COLUMN updatedAt SET DEFAULT NOW();
INSERT INTO app_auth.roles (name, description, is_system) VALUES 
    ('ADMIN', 'System Administrator with full access', true),
    ('MANAGER', 'Store Manager with limited management access', true),
    ('CUSTOMER', 'Regular Customer with shopping access', true),
    ('admin', 'Legacy Administrator', true),
    ('manager', 'Legacy Manager', true),
    ('customer', 'Legacy Customer', true)
ON CONFLICT (name) DO NOTHING;

-- 3.1.2 Permissions & Role Permissions
CREATE TABLE IF NOT EXISTS app_auth.permissions (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    action      TEXT NOT NULL,
    resource    TEXT NOT NULL,
    description TEXT,
    createdAt  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (action, resource)
);
ALTER TABLE app_auth.permissions ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE app_auth.permissions ALTER COLUMN updatedAt SET DEFAULT NOW();

CREATE TABLE IF NOT EXISTS app_auth.role_permissions (
    id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    role_id       TEXT NOT NULL REFERENCES app_auth.roles(id) ON DELETE CASCADE,
    permission_id TEXT NOT NULL REFERENCES app_auth.permissions(id) ON DELETE CASCADE,
    createdAt    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (role_id, permission_id)
);
ALTER TABLE app_auth.role_permissions ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

ALTER TABLE app_auth.roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_roles" ON app_auth.roles;
CREATE POLICY "service_role_roles" ON app_auth.roles FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_read_roles" ON app_auth.roles;
CREATE POLICY "authenticated_read_roles" ON app_auth.roles FOR SELECT TO authenticated USING (true);

ALTER TABLE app_auth.permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_permissions" ON app_auth.permissions;
CREATE POLICY "service_role_permissions" ON app_auth.permissions FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE app_auth.role_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_role_permissions" ON app_auth.role_permissions;
CREATE POLICY "service_role_role_permissions" ON app_auth.role_permissions FOR ALL TO service_role USING (true) WITH CHECK (true);

SELECT public.create_updated_at_trigger('app_auth', 'roles');
SELECT public.create_updated_at_trigger('app_auth', 'permissions');

-- 3.2 System Switches (dynamic feature flags)
CREATE TABLE IF NOT EXISTS config.system_switches (
    key         TEXT PRIMARY KEY,
    value       JSONB   NOT NULL,
    description TEXT,
    updatedAt  TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
    updatedAt  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE config.store_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_store_settings" ON config.store_settings;
CREATE POLICY "service_role_store_settings" ON config.store_settings
    FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_read_store_settings" ON config.store_settings;
CREATE POLICY "public_read_store_settings" ON config.store_settings
    FOR SELECT USING (key IN ('delivery_threshold','deliveryCharge','deliveryGst','delivery_gst_mode','base_currency'));

SELECT public.create_updated_at_trigger('config','store_settings');

INSERT INTO config.store_settings (key, value, description) VALUES
('delivery_threshold', '1500',      'Min order amount for free delivery'),
('deliveryCharge',    '50',        'Standard delivery charge below threshold'),
('deliveryGst',       '0',         'GST rate for delivery charges'),
('delivery_gst_mode',  '"inclusive"','How delivery GST is applied'),
('base_currency',      '"INR"',     'Default display currency')
ON CONFLICT (key) DO NOTHING;

-- 3.4 Brand Assets
CREATE TABLE IF NOT EXISTS config.brand_assets (
    key         TEXT PRIMARY KEY,
    url         TEXT NOT NULL,
    description TEXT,
    updatedAt  TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
    userId         TEXT NOT NULL,
    idempotency_key TEXT NOT NULL,
    correlation_id  TEXT,
    in_progress     BOOLEAN NOT NULL DEFAULT true,
    statusCode     INTEGER,
    response        JSONB,
    completedAt    TIMESTAMPTZ,
    expiresAt      TIMESTAMPTZ NOT NULL,
    createdAt      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_expires ON config.idempotency_keys(expiresAt);
ALTER TABLE config.idempotency_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_idempotency" ON config.idempotency_keys;
CREATE POLICY "service_role_idempotency" ON config.idempotency_keys FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('config','idempotency_keys');

-- 3.6 Request Locks
CREATE TABLE IF NOT EXISTS config.request_locks (
    lock_key       TEXT PRIMARY KEY,
    userId        TEXT NOT NULL,
    operation      TEXT NOT NULL,
    correlation_id TEXT,
    expiresAt     TIMESTAMPTZ NOT NULL,
    createdAt     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_request_locks_expires ON config.request_locks(expiresAt);
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
    expiresAt    TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '1 day',
    createdAt    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt    TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
    expiresAt TIMESTAMPTZ,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_geo_cache_expires ON config.geo_cache(expiresAt) WHERE expiresAt IS NOT NULL;
ALTER TABLE config.geo_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_geo_cache" ON config.geo_cache;
CREATE POLICY "service_role_geo_cache" ON config.geo_cache FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ==========================================
-- 4. AUTH SCHEMA (Better-Auth Compatible)
-- ==========================================

-- 4.1 User (better-auth core model)
CREATE TABLE IF NOT EXISTS app_auth."user" (
    id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "firstName"      TEXT NOT NULL DEFAULT 'User',
    "lastName"       TEXT,
    email            TEXT NOT NULL,
    emailVerified    BOOLEAN NOT NULL DEFAULT false,
    twoFactorEnabled BOOLEAN NOT NULL DEFAULT false,
    image            TEXT,
    role             TEXT NOT NULL DEFAULT 'CUSTOMER',
    createdAt       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE app_auth."user" ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE app_auth."user" ALTER COLUMN updatedAt SET DEFAULT NOW();
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_email ON app_auth."user"(lower(email));
ALTER TABLE app_auth."user" ADD CONSTRAINT "user_role_fkey" FOREIGN KEY (role) REFERENCES app_auth.roles(name) ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS idx_user_role ON app_auth."user"(role);
ALTER TABLE app_auth."user" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_user" ON app_auth."user";
CREATE POLICY "service_role_user" ON app_auth."user" FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_user_access" ON app_auth."user";
CREATE POLICY "authenticated_user_access" ON app_auth."user" FOR ALL TO authenticated USING (id = public.uid()::text) WITH CHECK (id = public.uid()::text);
SELECT public.create_updated_at_trigger('app_auth', 'user');

-- 4.2 Session (better-auth core model)
CREATE TABLE IF NOT EXISTS app_auth.session (
    id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    expiresAt  TIMESTAMPTZ NOT NULL,
    token       TEXT NOT NULL,
    createdAt  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ipAddress  TEXT,
    userAgent  TEXT,
    userId     TEXT NOT NULL REFERENCES app_auth."user"(id) ON DELETE CASCADE,
    twoFactorVerified BOOLEAN
);
ALTER TABLE app_auth.session ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE app_auth.session ALTER COLUMN updatedAt SET DEFAULT NOW();
CREATE UNIQUE INDEX IF NOT EXISTS idx_session_token ON app_auth.session(token);
CREATE INDEX IF NOT EXISTS idx_session_user_id ON app_auth.session(userId);
ALTER TABLE app_auth.session ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_session" ON app_auth.session;
CREATE POLICY "service_role_session" ON app_auth.session FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_session_access" ON app_auth.session;
CREATE POLICY "authenticated_session_access" ON app_auth.session FOR ALL TO authenticated USING (userId = public.uid()::text) WITH CHECK (userId = public.uid()::text);
SELECT public.create_updated_at_trigger('app_auth', 'session');

-- 4.3 Account (better-auth - replaces oauth_identities)
CREATE TABLE IF NOT EXISTS app_auth.account (
    id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    account_id               TEXT NOT NULL,
    providerId              TEXT NOT NULL,
    userId                  TEXT NOT NULL REFERENCES app_auth."user"(id) ON DELETE CASCADE,
    accessToken             TEXT,
    refreshToken            TEXT,
    id_token                 TEXT,
    access_token_expires_at  TIMESTAMPTZ,
    refresh_token_expires_at TIMESTAMPTZ,
    scope                    TEXT,
    password                 TEXT,
    createdAt               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE app_auth.account ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE app_auth.account ALTER COLUMN updatedAt SET DEFAULT NOW();
CREATE UNIQUE INDEX IF NOT EXISTS idx_account_provider ON app_auth.account(providerId, account_id);
CREATE INDEX IF NOT EXISTS idx_account_user_id ON app_auth.account(userId);
ALTER TABLE app_auth.account ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_account" ON app_auth.account;
CREATE POLICY "service_role_account" ON app_auth.account FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_account_access" ON app_auth.account;
CREATE POLICY "authenticated_account_access" ON app_auth.account FOR SELECT TO authenticated USING (userId = public.uid()::text);
SELECT public.create_updated_at_trigger('app_auth', 'account');

-- 4.4 Verification (better-auth - replaces password_reset_tokens)
CREATE TABLE IF NOT EXISTS app_auth.verification (
    id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    identifier TEXT NOT NULL,
    value      TEXT NOT NULL,
    expiresAt  TIMESTAMPTZ NOT NULL,
    createdAt  TIMESTAMPTZ DEFAULT NOW(),
    updatedAt  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE app_auth.verification ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE app_auth.verification ALTER COLUMN updatedAt SET DEFAULT NOW();
CREATE INDEX IF NOT EXISTS idx_verification_identifier ON app_auth.verification(identifier);
ALTER TABLE app_auth.verification ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_verification" ON app_auth.verification;
CREATE POLICY "service_role_verification" ON app_auth.verification FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 4.5 Two Factors (better-auth twoFactor plugin - uses camelCase in DB)
CREATE TABLE IF NOT EXISTS app_auth.two_factors (
    id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    userId       TEXT NOT NULL REFERENCES app_auth."user"(id) ON DELETE CASCADE,
    secret       TEXT NOT NULL,
    backupCodes  TEXT[] NOT NULL,
    verified     BOOLEAN NOT NULL DEFAULT true,
    createdAt    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE app_auth.two_factors ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE app_auth.two_factors ALTER COLUMN updatedAt SET DEFAULT NOW();
CREATE UNIQUE INDEX IF NOT EXISTS idx_two_factors_userId ON app_auth.two_factors(userId);
CREATE INDEX IF NOT EXISTS idx_two_factors_createdAt ON app_auth.two_factors(createdAt);
ALTER TABLE app_auth.two_factors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_two_factors" ON app_auth.two_factors;
CREATE POLICY "service_role_two_factors" ON app_auth.two_factors FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_two_factors_access" ON app_auth.two_factors;
CREATE POLICY "authenticated_two_factors_access" ON app_auth.two_factors FOR ALL TO authenticated USING (userId = public.uid()::text) WITH CHECK (userId = public.uid()::text);
SELECT public.create_updated_at_trigger('app_auth', 'two_factors');



-- 4.7 Security Events (audit logging)
CREATE TABLE IF NOT EXISTS app_auth.security_events (
    id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    userId        TEXT REFERENCES app_auth."user"(id) ON DELETE SET NULL,
    email          TEXT,
    eventType     TEXT NOT NULL,
    status         TEXT NOT NULL,
    ipAddress     TEXT,
    userAgent     TEXT,
    correlation_id TEXT,
    metadata       JSONB DEFAULT '{}'::jsonb,
    createdAt     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE app_auth.security_events ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
CREATE INDEX IF NOT EXISTS idx_security_events_event_type_created ON app_auth.security_events(eventType, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_user_created ON app_auth.security_events(userId, createdAt DESC);
ALTER TABLE app_auth.security_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_security_events" ON app_auth.security_events;
CREATE POLICY "service_role_security_events" ON app_auth.security_events FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_security_events_access" ON app_auth.security_events;
CREATE POLICY "authenticated_security_events_access" ON app_auth.security_events FOR SELECT TO authenticated USING (userId = public.uid()::text);

-- 4.8 OTP Email History (custom - tracks OTP emails sent)
CREATE TABLE IF NOT EXISTS app_auth.otp_email_history (
    id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    userId    TEXT REFERENCES app_auth."user"(id) ON DELETE SET NULL,
    email      TEXT NOT NULL,
    subject    TEXT NOT NULL,
    body       TEXT NOT NULL,
    status     TEXT NOT NULL,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE app_auth.otp_email_history ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
CREATE INDEX IF NOT EXISTS idx_otp_email_history_user ON app_auth.otp_email_history(userId);
ALTER TABLE app_auth.otp_email_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_otp_email_history" ON app_auth.otp_email_history;
CREATE POLICY "service_role_otp_email_history" ON app_auth.otp_email_history FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_otp_history_access" ON app_auth.otp_email_history;
CREATE POLICY "authenticated_otp_history_access" ON app_auth.otp_email_history FOR SELECT TO authenticated USING (userId = public.uid()::text);

-- ==========================================
-- 5. USER SCHEMA
-- ==========================================

-- 5.1 Profiles
CREATE TABLE IF NOT EXISTS "user".profiles (
    id                   TEXT PRIMARY KEY,  -- mirrors users.id
    identityId          TEXT UNIQUE REFERENCES app_auth."user"(id) ON DELETE CASCADE,
    role_id              TEXT REFERENCES app_auth.roles(id),
    firstName           VARCHAR(100) NOT NULL DEFAULT 'User',
    lastName            VARCHAR(100),
    display_name         TEXT,
    email                TEXT,
    phone                VARCHAR(20),
    avatarUrl           TEXT,
    preferredLanguage   VARCHAR(5) NOT NULL DEFAULT 'en'
                             CHECK (preferredLanguage IN ('en','hi','ta','te')),
    preferred_currency   TEXT NOT NULL DEFAULT 'INR',
    defaultAddressId   UUID,
    preferences          JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_deleted           BOOLEAN NOT NULL DEFAULT false,
    deletedAt           TIMESTAMPTZ,
    is_blocked           BOOLEAN NOT NULL DEFAULT false,
    is_flagged           BOOLEAN NOT NULL DEFAULT false,
    flag_reason          TEXT,
    deletion_status      VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    scheduled_deletion_at TIMESTAMPTZ,
    welcome_email_sent   BOOLEAN NOT NULL DEFAULT false,
    version              INTEGER NOT NULL DEFAULT 0,
    createdAt           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
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
CREATE POLICY "authenticated_view_own_profile" ON "user".profiles FOR SELECT TO authenticated USING (uid()::text = id);
SELECT public.create_updated_at_trigger('user','profiles');

-- 5.2 Addresses
CREATE TABLE IF NOT EXISTS "user".addresses (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId       TEXT NOT NULL REFERENCES "user".profiles(id) ON DELETE CASCADE,
    label         VARCHAR(100) NOT NULL DEFAULT 'Home',
    fullName     VARCHAR(255) NOT NULL,
    phone         VARCHAR(20) NOT NULL,
    addressLine1 VARCHAR(255) NOT NULL,
    addressLine2 VARCHAR(255),
    landmark      VARCHAR(255),
    city          VARCHAR(100) NOT NULL,
    state         VARCHAR(100) NOT NULL,
    pincode       VARCHAR(10) NOT NULL,
    country       VARCHAR(100) NOT NULL DEFAULT 'India',
    addressType  VARCHAR(20) NOT NULL DEFAULT 'SHIPPING'
                     CHECK (addressType IN ('SHIPPING','BILLING','BOTH')),
    isPrimary    BOOLEAN NOT NULL DEFAULT false,
    createdAt    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id  ON "user".addresses(userId);
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_primary_address ON "user".addresses(userId) WHERE isPrimary = true;
ALTER TABLE "user".addresses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_addresses" ON "user".addresses;
CREATE POLICY "service_role_addresses" ON "user".addresses FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "users_own_addresses" ON "user".addresses;
CREATE POLICY "users_own_addresses" ON "user".addresses FOR ALL TO authenticated
    USING (uid()::text = userId) WITH CHECK (uid()::text = userId);
SELECT public.create_updated_at_trigger('user','addresses');

-- Enforce single primary address per user
CREATE OR REPLACE FUNCTION "user".ensure_one_primary_address()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    IF NEW.isPrimary = true THEN
        UPDATE "user".addresses SET isPrimary = false, updatedAt = NOW()
        WHERE userId = NEW.userId AND id IS DISTINCT FROM NEW.id AND isPrimary = true;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM "user".addresses
        WHERE userId = NEW.userId AND id IS DISTINCT FROM NEW.id
    ) THEN NEW.isPrimary = true; END IF;
    RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_one_primary_address ON "user".addresses;
CREATE TRIGGER trg_one_primary_address
    BEFORE INSERT OR UPDATE ON "user".addresses
    FOR EACH ROW EXECUTE FUNCTION "user".ensure_one_primary_address();

-- 5.3 User Settings
CREATE TABLE IF NOT EXISTS "user".settings (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId     TEXT NOT NULL UNIQUE REFERENCES "user".profiles(id) ON DELETE CASCADE,
    email_notifications BOOLEAN NOT NULL DEFAULT true,
    sms_notifications   BOOLEAN NOT NULL DEFAULT false,
    push_notifications  BOOLEAN NOT NULL DEFAULT true,
    marketing_emails    BOOLEAN NOT NULL DEFAULT true,
    two_factor_enabled  BOOLEAN NOT NULL DEFAULT false,
    preferences         JSONB NOT NULL DEFAULT '{}'::jsonb,
    updatedAt          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE "user".settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_settings" ON "user".settings;
CREATE POLICY "service_role_settings" ON "user".settings FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('user','settings');

-- 5.4 Managers
CREATE TABLE IF NOT EXISTS "user".managers (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identityId TEXT NOT NULL UNIQUE REFERENCES app_auth."user"(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    phone       VARCHAR(20),
    role        VARCHAR(20) NOT NULL DEFAULT 'manager',
    creatorId  TEXT REFERENCES "user".profiles(id) ON DELETE SET NULL,
    isActive   BOOLEAN NOT NULL DEFAULT true,
    createdAt  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE "user".managers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_managers" ON "user".managers;
CREATE POLICY "service_role_managers" ON "user".managers FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('user','managers');

-- 5.5 Manager Permissions
CREATE TABLE IF NOT EXISTS "user".manager_permissions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    managerId              UUID NOT NULL UNIQUE REFERENCES "user".managers(id) ON DELETE CASCADE,
    canManageProducts     BOOLEAN NOT NULL DEFAULT false,
    can_manage_categories   BOOLEAN NOT NULL DEFAULT false,
    canManageOrders       BOOLEAN NOT NULL DEFAULT false,
    canManageReturns      BOOLEAN NOT NULL DEFAULT false,
    canManageRefunds      BOOLEAN NOT NULL DEFAULT false,
    canManageEvents       BOOLEAN NOT NULL DEFAULT false,
    canManageBlogs        BOOLEAN NOT NULL DEFAULT false,
    canManageTestimonials BOOLEAN NOT NULL DEFAULT false,
    canManageGallery      BOOLEAN NOT NULL DEFAULT false,
    canManageFaqs         BOOLEAN NOT NULL DEFAULT false,
    canManageCoupons      BOOLEAN NOT NULL DEFAULT false,
    canManageDonations    BOOLEAN NOT NULL DEFAULT false,
    canManageAboutUs     BOOLEAN NOT NULL DEFAULT false,
    can_manage_contact_info BOOLEAN NOT NULL DEFAULT false,
    canManagePolicies     BOOLEAN NOT NULL DEFAULT false,
    can_manage_delivery     BOOLEAN NOT NULL DEFAULT false,
    canManageEmails       BOOLEAN NOT NULL DEFAULT false,
    canManageTranslations BOOLEAN NOT NULL DEFAULT false,
    canManageJobs         BOOLEAN NOT NULL DEFAULT false,
    canManageManagers     BOOLEAN NOT NULL DEFAULT false,
    canManageSystem       BOOLEAN NOT NULL DEFAULT false,
    canViewAnalytics      BOOLEAN NOT NULL DEFAULT false,
    canViewLogs           BOOLEAN NOT NULL DEFAULT false,
    createdAt              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE "user".manager_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_manager_permissions" ON "user".manager_permissions;
CREATE POLICY "service_role_manager_permissions" ON "user".manager_permissions FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('user','manager_permissions');

-- 5.6 Account Deletion Jobs
CREATE TABLE IF NOT EXISTS "user".account_deletion_jobs (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identityId             TEXT NOT NULL REFERENCES app_auth."user"(id) ON DELETE CASCADE,
    userId                 TEXT NOT NULL REFERENCES "user".profiles(id) ON DELETE CASCADE,
    status                  VARCHAR(30) NOT NULL DEFAULT 'PENDING'
                                CHECK (status IN ('PENDING','OTP_VERIFIED','SCHEDULED','PROCESSING','COMPLETED','FAILED','CANCELLED')),
    requestedAt            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    scheduledFor           TIMESTAMPTZ,
    completedAt            TIMESTAMPTZ,
    otpVerified            BOOLEAN NOT NULL DEFAULT false,
    deletion_auth_token_hash VARCHAR(128),
    datExpiresAt          TIMESTAMPTZ,
    errorMessage           TEXT,
    retryCount             INTEGER NOT NULL DEFAULT 0,
    createdAt              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_deletion_jobs_status ON "user".account_deletion_jobs(status) WHERE status NOT IN ('COMPLETED','CANCELLED');
ALTER TABLE "user".account_deletion_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_deletion_jobs" ON "user".account_deletion_jobs;
CREATE POLICY "service_role_deletion_jobs" ON "user".account_deletion_jobs FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('user','account_deletion_jobs');

-- 5.7 Account Deletion Audit
CREATE TABLE IF NOT EXISTS "user".account_deletion_audit (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deletionJobId UUID REFERENCES "user".account_deletion_jobs(id) ON DELETE SET NULL,
    identityId    TEXT NOT NULL,
    action         VARCHAR(50) NOT NULL,
    actor          VARCHAR(50),
    metadata       JSONB,
    createdAt     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_deletion_audit_identity ON "user".account_deletion_audit(identityId);
ALTER TABLE "user".account_deletion_audit ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_deletion_audit" ON "user".account_deletion_audit;
CREATE POLICY "service_role_deletion_audit" ON "user".account_deletion_audit FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ==========================================
-- 6. PRODUCT SCHEMA
-- ==========================================

-- 6.1 Categories
CREATE TABLE IF NOT EXISTS categories (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT NOT NULL,
    type          TEXT NOT NULL DEFAULT 'product'
                      CHECK (type IN ('product','event','faq','gallery')),
    slug          TEXT,
    nameI18n     JSONB NOT NULL DEFAULT '{}'::jsonb,
    category_code VARCHAR(100) UNIQUE,
    isActive     BOOLEAN NOT NULL DEFAULT true,
    displayOrder INTEGER NOT NULL DEFAULT 0,
    createdAt    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (name, type)
);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type, isActive);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "service_role_categories" ON categories;
CREATE POLICY "service_role_categories" ON categories FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 6.2 Products
CREATE TABLE IF NOT EXISTS products (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title                  TEXT NOT NULL,
    description            TEXT NOT NULL DEFAULT '',
    slug                   TEXT UNIQUE,
    titleI18n             JSONB NOT NULL DEFAULT '{}'::jsonb,
    descriptionI18n       JSONB NOT NULL DEFAULT '{}'::jsonb,
    tagsI18n              JSONB NOT NULL DEFAULT '{}'::jsonb,
    benefitsI18n          JSONB NOT NULL DEFAULT '{}'::jsonb,
    price                  NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    mrp                    NUMERIC(10,2) CHECK (mrp >= 0),
    images                 TEXT[] NOT NULL DEFAULT '{}',
    categoryId            UUID REFERENCES categories(id) ON DELETE SET NULL,
    tags                   TEXT[] NOT NULL DEFAULT '{}',
    benefits               TEXT[] NOT NULL DEFAULT '{}',
    variantMode           TEXT NOT NULL DEFAULT 'UNIT' CHECK (variantMode IN ('UNIT','SIZE')),
    isReturnable          BOOLEAN NOT NULL DEFAULT true,
    returnDays            INTEGER NOT NULL DEFAULT 7,
    isNew                 BOOLEAN NOT NULL DEFAULT false,
    isActive              BOOLEAN NOT NULL DEFAULT true,
    rating                 NUMERIC(3,2) NOT NULL DEFAULT 0,
    ratingCount           INTEGER NOT NULL DEFAULT 0,
    reviewCount           INTEGER NOT NULL DEFAULT 0,
    defaultHsnCode       TEXT,
    defaultGstRate       NUMERIC(5,2) NOT NULL DEFAULT 0,
    priceIncludesTax     BOOLEAN NOT NULL DEFAULT true,
    weight_grams           NUMERIC(10,2) NOT NULL DEFAULT 0,
    return_logistics_fee   NUMERIC(10,2) NOT NULL DEFAULT 0,
    createdAt             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_category      ON products(categoryId) WHERE isActive = true;
CREATE INDEX IF NOT EXISTS idx_products_active_created ON products(isActive, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_products_tags          ON products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_products_search        ON products USING GIN(to_tsvector('english', title || ' ' || COALESCE(description,'')));
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT USING (isActive = true);
DROP POLICY IF EXISTS "service_role_products" ON products;
CREATE POLICY "service_role_products" ON products FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('product','products');

-- 6.3 Product Variants
CREATE TABLE IF NOT EXISTS productVariants (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    productId          UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku                 TEXT UNIQUE,
    sizeLabel          TEXT,
    sizeLabelI18n     JSONB NOT NULL DEFAULT '{}'::jsonb,
    sizeValue          NUMERIC(10,2) NOT NULL DEFAULT 0,
    unit                TEXT NOT NULL DEFAULT 'kg',
    description         TEXT,
    descriptionI18n    JSONB NOT NULL DEFAULT '{}'::jsonb,
    variantImageUrl   TEXT,
    attributes          JSONB,
    sellingPrice       NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (sellingPrice >= 0),
    mrp                 NUMERIC(10,2) CHECK (mrp >= 0),
    stockQuantity      INTEGER NOT NULL DEFAULT 0 CHECK (stockQuantity >= 0),
    lowStockThreshold INTEGER NOT NULL DEFAULT 10,
    isDefault          BOOLEAN NOT NULL DEFAULT false,
    isActive           BOOLEAN NOT NULL DEFAULT true,
    deliveryCharge     NUMERIC(10,2),
    taxApplicable      BOOLEAN NOT NULL DEFAULT true,
    gstRate            NUMERIC(5,2) NOT NULL DEFAULT 0,
    priceIncludesTax  BOOLEAN NOT NULL DEFAULT true,
    hsnCode            VARCHAR(8),
    weight_grams        NUMERIC(10,2),
    razorpayItemId    TEXT,
    createdAt          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_variants_product_id  ON productVariants(productId);
CREATE INDEX IF NOT EXISTS idx_variants_active       ON productVariants(productId, isActive);
CREATE INDEX IF NOT EXISTS idx_variants_low_stock    ON productVariants(stockQuantity) WHERE stockQuantity <= lowStockThreshold AND isActive = true;
ALTER TABLE productVariants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_variants" ON productVariants;
CREATE POLICY "public_read_variants" ON productVariants FOR SELECT USING (true);
DROP POLICY IF EXISTS "service_role_variants" ON productVariants;
CREATE POLICY "service_role_variants" ON productVariants FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('product','productVariants');

-- 6.4 Delivery Configs
CREATE TABLE IF NOT EXISTS delivery_configs (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope                 TEXT NOT NULL CHECK (scope IN ('PRODUCT','VARIANT')),
    productId            UUID REFERENCES products(id) ON DELETE CASCADE,
    variantId            UUID REFERENCES productVariants(id) ON DELETE CASCADE,
    calculationType      TEXT NOT NULL DEFAULT 'FLAT_PER_ORDER'
                              CHECK (calculationType IN ('FLAT_PER_ORDER','PER_ITEM','PER_PACKAGE','WEIGHT_BASED')),
    baseDeliveryCharge  NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (baseDeliveryCharge >= 0),
    maxItemsPerPackage INTEGER NOT NULL DEFAULT 3 CHECK (maxItemsPerPackage >= 1),
    unitWeight           NUMERIC(10,3),
    gstPercentage        NUMERIC(5,2) NOT NULL DEFAULT 18 CHECK (gstPercentage >= 0 AND gstPercentage <= 100),
    isTaxable            BOOLEAN NOT NULL DEFAULT true,
    deliveryRefundPolicy TEXT NOT NULL DEFAULT 'NON_REFUNDABLE'
                               CHECK (deliveryRefundPolicy IN ('REFUNDABLE','NON_REFUNDABLE')),
    deliveryDaysMin     INTEGER,
    deliveryDaysMax     INTEGER,
    isActive             BOOLEAN NOT NULL DEFAULT true,
    createdAt            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_delivery_scope CHECK (
        (scope = 'PRODUCT' AND productId IS NOT NULL AND variantId IS NULL) OR
        (scope = 'VARIANT' AND variantId IS NOT NULL AND productId IS NULL)
    )
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_delivery_cfg_product ON delivery_configs(productId) WHERE scope = 'PRODUCT' AND productId IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_delivery_cfg_variant ON delivery_configs(variantId) WHERE scope = 'VARIANT' AND variantId IS NOT NULL;
ALTER TABLE delivery_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_delivery_configs" ON delivery_configs;
CREATE POLICY "public_read_delivery_configs" ON delivery_configs FOR SELECT USING (true);
DROP POLICY IF EXISTS "service_role_delivery_configs" ON delivery_configs;
CREATE POLICY "service_role_delivery_configs" ON delivery_configs FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('product','delivery_configs');

-- 6.5 Inventory (atomic stock ledger)
CREATE TABLE IF NOT EXISTS inventory (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variantId         UUID NOT NULL UNIQUE REFERENCES productVariants(id) ON DELETE CASCADE,
    availableQuantity INTEGER NOT NULL DEFAULT 0 CHECK (availableQuantity >= 0),
    reservedQuantity  INTEGER NOT NULL DEFAULT 0 CHECK (reservedQuantity >= 0),
    version            INTEGER NOT NULL DEFAULT 1,
    updatedAt         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON inventory(availableQuantity) WHERE availableQuantity < 10;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_inventory" ON inventory;
CREATE POLICY "service_role_inventory" ON inventory FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('product','inventory');

-- 6.6 Inventory Reservations (cart holds)
CREATE TABLE IF NOT EXISTS inventory_reservations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variantId  UUID NOT NULL REFERENCES productVariants(id) ON DELETE CASCADE,
    sessionId  VARCHAR(255) NOT NULL,
    quantity    INTEGER NOT NULL CHECK (quantity > 0),
    expiresAt  TIMESTAMPTZ NOT NULL,
    createdAt  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_inv_res_variant    ON inventory_reservations(variantId);
CREATE INDEX IF NOT EXISTS idx_inv_res_session    ON inventory_reservations(sessionId);
CREATE INDEX IF NOT EXISTS idx_inv_res_expires    ON inventory_reservations(expiresAt);
ALTER TABLE inventory_reservations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_inv_reservations" ON inventory_reservations;
CREATE POLICY "service_role_inv_reservations" ON inventory_reservations FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 6.7 Product Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    productId           UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    userId              TEXT NOT NULL REFERENCES "user".profiles(id) ON DELETE CASCADE,
    rating               INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title                TEXT,
    comment              TEXT,
    isVerifiedPurchase BOOLEAN NOT NULL DEFAULT false,
    isApproved          BOOLEAN NOT NULL DEFAULT true,
    helpfulCount        INTEGER NOT NULL DEFAULT 0,
    notHelpfulCount    INTEGER NOT NULL DEFAULT 0,
    createdAt           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (productId, userId)
);
CREATE INDEX IF NOT EXISTS idx_reviews_product   ON reviews(productId, isApproved);
CREATE INDEX IF NOT EXISTS idx_reviews_rating    ON reviews(productId, rating);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_reviews" ON reviews;
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT USING (isApproved = true);
DROP POLICY IF EXISTS "service_role_reviews" ON reviews;
CREATE POLICY "service_role_reviews" ON reviews FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('product','reviews');

-- ==========================================
-- 7. CART SCHEMA
-- ==========================================

-- 7.1 Coupons
CREATE TABLE IF NOT EXISTS coupons (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code               VARCHAR(50) NOT NULL UNIQUE,
    type               VARCHAR(20) NOT NULL CHECK (type IN ('PERCENTAGE','FLAT','FREE_SHIPPING','PRODUCT','CATEGORY')),
    discountPercentage NUMERIC(5,2),
    discountAmount    NUMERIC(10,2),
    targetId          TEXT,
    minPurchaseAmount NUMERIC(10,2) NOT NULL DEFAULT 0,
    maxDiscountAmount NUMERIC(10,2),
    validFrom         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    validUntil        TIMESTAMPTZ NOT NULL,
    usageLimit        INTEGER,
    usageCount        INTEGER NOT NULL DEFAULT 0,
    isActive          BOOLEAN NOT NULL DEFAULT true,
    description        TEXT,
    createdAt         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_coupons_code_active ON coupons(lower(code), isActive);
CREATE INDEX IF NOT EXISTS idx_coupons_valid       ON coupons(validUntil) WHERE isActive = true;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_coupons" ON coupons;
CREATE POLICY "service_role_coupons" ON coupons FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_read_coupons" ON coupons;
CREATE POLICY "public_read_coupons" ON coupons FOR SELECT USING (isActive = true AND validUntil > NOW());
SELECT public.create_updated_at_trigger('cart','coupons');

-- 7.2 Coupon Usage
CREATE TABLE IF NOT EXISTS coupon_usage (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couponId      UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    userId        TEXT NOT NULL REFERENCES "user".profiles(id) ON DELETE CASCADE,
    orderId       UUID,   -- soft ref, FK added after order table created
    discountAmount NUMERIC(10,2) NOT NULL DEFAULT 0,
    createdAt     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon ON coupon_usage(couponId);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user   ON coupon_usage(userId);
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_coupon_usage" ON coupon_usage;
CREATE POLICY "service_role_coupon_usage" ON coupon_usage FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 7.3 Carts
CREATE TABLE IF NOT EXISTS carts (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId          TEXT UNIQUE REFERENCES "user".profiles(id) ON DELETE CASCADE,
    sessionId       VARCHAR(255) UNIQUE,
    status           VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','CHECKED_OUT','ABANDONED','EXPIRED')),
    appliedCouponId UUID REFERENCES coupons(id) ON DELETE SET NULL,
    expiresAt       TIMESTAMPTZ,
    createdAt       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_cart_owner CHECK (userId IS NOT NULL OR sessionId IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_carts_user_id   ON carts(userId) WHERE userId IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_carts_session   ON carts(sessionId) WHERE sessionId IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_carts_abandoned ON carts(status, updatedAt) WHERE status = 'ACTIVE';
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_carts" ON carts;
CREATE POLICY "service_role_carts" ON carts FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('cart','carts');

-- 7.4 Cart Items
CREATE TABLE IF NOT EXISTS cart_items (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cartId       UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    productId    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variantId    UUID REFERENCES productVariants(id) ON DELETE CASCADE,
    title         VARCHAR(255),
    imageUrl     TEXT,
    pricePerUnit NUMERIC(10,2) NOT NULL CHECK (pricePerUnit >= 0),
    mrp           NUMERIC(10,2),
    quantity      INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    variantLabel VARCHAR(255),
    createdAt    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (cartId, productId, variantId)
);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart    ON cart_items(cartId);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(productId);
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_cart_items" ON cart_items;
CREATE POLICY "service_role_cart_items" ON cart_items FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('cart','cart_items');

-- ==========================================
-- 8. ORDER SCHEMA
-- ==========================================

-- 8.1 Orders
CREATE TABLE IF NOT EXISTS "order".orders (
    id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orderNumber              TEXT UNIQUE,
    userId                   TEXT REFERENCES "user".profiles(id) ON DELETE SET NULL,
    customerName             TEXT,
    customerEmail            TEXT,
    customerPhone            TEXT,
    shippingAddressId       UUID REFERENCES "user".addresses(id) ON DELETE SET NULL,
    billingAddressId        UUID REFERENCES "user".addresses(id) ON DELETE SET NULL,
    shippingAddress          JSONB,
    billingAddress           JSONB,
    subtotal                  NUMERIC(12,2) NOT NULL DEFAULT 0,
    couponCode               TEXT,
    couponDiscount           NUMERIC(12,2) NOT NULL DEFAULT 0,
    deliveryCharge           NUMERIC(12,2) NOT NULL DEFAULT 0,
    deliveryGst              NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_taxable_amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_cgst                NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_sgst                NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_igst                NUMERIC(12,2) NOT NULL DEFAULT 0,
    totalAmount              NUMERIC(12,2) NOT NULL DEFAULT 0,
    status                    TEXT NOT NULL DEFAULT 'pending'
                                  CHECK (status IN ('pending','confirmed','processing','packed','shipped',
                                                    'out_for_delivery','delivered','delivery_unsuccessful',
                                                    'return_requested','return_approved','return_rejected',
                                                    'return_picked_up','return_completed','refunded',
                                                    'cancelled','failed')),
    previous_status           TEXT,
    paymentStatus            TEXT NOT NULL DEFAULT 'pending'
                                  CHECK (paymentStatus IN ('pending','paid','failed','refunded','partially_refunded')),
    paymentId                TEXT,
    invoiceId                UUID,
    invoiceUrl               TEXT,
    invoiceStatus            TEXT,
    is_delivery_refundable    BOOLEAN NOT NULL DEFAULT true,
    delivery_unsuccessful_reason TEXT,
    currency                  TEXT NOT NULL DEFAULT 'INR',
    notes                     TEXT,
    metadata                  JSONB NOT NULL DEFAULT '{}'::jsonb,
    version                   INTEGER NOT NULL DEFAULT 0,
    createdAt                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_user_id        ON "order".orders(userId);
CREATE INDEX IF NOT EXISTS idx_orders_status         ON "order".orders(status, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON "order".orders(paymentStatus) WHERE paymentStatus = 'pending';
CREATE INDEX IF NOT EXISTS idx_orders_payment_id     ON "order".orders(paymentId) WHERE paymentId IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_number         ON "order".orders(orderNumber);
CREATE INDEX IF NOT EXISTS idx_orders_created_at     ON "order".orders(createdAt DESC);
ALTER TABLE "order".orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_orders" ON "order".orders;
CREATE POLICY "service_role_orders" ON "order".orders FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "users_view_own_orders" ON "order".orders;
CREATE POLICY "users_view_own_orders" ON "order".orders FOR SELECT TO authenticated USING (uid()::text = userId);
SELECT public.create_updated_at_trigger('order','orders');

-- Now add the deferred FK from coupon_usage
ALTER TABLE coupon_usage
    ADD CONSTRAINT fk_coupon_usage_order
    FOREIGN KEY (orderId) REFERENCES "order".orders(id) ON DELETE SET NULL
    NOT VALID;

-- 8.2 Order Items
CREATE TABLE IF NOT EXISTS "order".orderItems (
    id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orderId                     UUID NOT NULL REFERENCES "order".orders(id) ON DELETE CASCADE,
    productId                   UUID REFERENCES products(id) ON DELETE SET NULL,
    variantId                   UUID REFERENCES productVariants(id) ON DELETE SET NULL,
    title                        TEXT,
    quantity                     INTEGER NOT NULL CHECK (quantity > 0),
    pricePerUnit               NUMERIC(12,2) NOT NULL DEFAULT 0,
    mrp                          NUMERIC(12,2),
    totalPrice                  NUMERIC(12,2) GENERATED ALWAYS AS (quantity * pricePerUnit) STORED,
    isReturnable                BOOLEAN NOT NULL DEFAULT true,
    returnedQuantity            INTEGER NOT NULL DEFAULT 0 CHECK (returnedQuantity >= 0),
    deliveryCharge              NUMERIC(12,2) NOT NULL DEFAULT 0,
    deliveryGst                 NUMERIC(12,2) NOT NULL DEFAULT 0,
    taxableAmount               NUMERIC(12,2) NOT NULL DEFAULT 0,
    cgst                         NUMERIC(12,2) NOT NULL DEFAULT 0,
    sgst                         NUMERIC(12,2) NOT NULL DEFAULT 0,
    igst                         NUMERIC(12,2) NOT NULL DEFAULT 0,
    gstRate                     NUMERIC(5,2) NOT NULL DEFAULT 0,
    hsnCode                     TEXT,
    couponId                    UUID,
    couponCode                  TEXT,
    couponDiscount              NUMERIC(12,2) NOT NULL DEFAULT 0,
    variantSnapshot             JSONB,
    deliveryCalculationSnapshot JSONB,
    tax_snapshot                 JSONB,
    createdAt                   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id  ON "order".orderItems(orderId);
CREATE INDEX IF NOT EXISTS idx_order_items_product   ON "order".orderItems(productId);
ALTER TABLE "order".orderItems ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_order_items" ON "order".orderItems;
CREATE POLICY "service_role_order_items" ON "order".orderItems FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 8.3 Order Status History
CREATE TABLE IF NOT EXISTS "order".order_status_history (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orderId   UUID NOT NULL REFERENCES "order".orders(id) ON DELETE CASCADE,
    status     TEXT NOT NULL,
    updatedBy TEXT REFERENCES "user".profiles(id) ON DELETE SET NULL,
    actor      TEXT NOT NULL DEFAULT 'SYSTEM' CHECK (actor IN ('SYSTEM','ADMIN','USER')),
    eventType TEXT NOT NULL DEFAULT 'STATUS_CHANGE',
    returnId  UUID,
    notes      TEXT,
    metadata   JSONB NOT NULL DEFAULT '{}'::jsonb,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_osh_order_created ON "order".order_status_history(orderId, createdAt DESC);
ALTER TABLE "order".order_status_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_order_status_history" ON "order".order_status_history;
CREATE POLICY "service_role_order_status_history" ON "order".order_status_history FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 8.4 Order Reservations
CREATE TABLE IF NOT EXISTS "order".order_reservations (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cartId            UUID REFERENCES carts(id) ON DELETE CASCADE,
    userId            TEXT REFERENCES "user".profiles(id) ON DELETE CASCADE,
    order_token        TEXT UNIQUE NOT NULL,
    inventory_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
    expiresAt         TIMESTAMPTZ NOT NULL,
    createdAt         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_res_expires ON "order".order_reservations(expiresAt);
ALTER TABLE "order".order_reservations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_order_reservations" ON "order".order_reservations;
CREATE POLICY "service_role_order_reservations" ON "order".order_reservations FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 8.5 Invoices
CREATE TABLE IF NOT EXISTS "order".invoices (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orderId       UUID NOT NULL UNIQUE REFERENCES "order".orders(id) ON DELETE CASCADE,
    invoiceNumber VARCHAR(30) NOT NULL UNIQUE,
    invoiceUrl    TEXT,
    storagePath   TEXT,
    fileType      VARCHAR(20) NOT NULL DEFAULT 'pdf',
    generatedAt   TIMESTAMPTZ,
    createdAt     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_invoices_order ON "order".invoices(orderId);
ALTER TABLE "order".invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_invoices" ON "order".invoices;
CREATE POLICY "service_role_invoices" ON "order".invoices FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 8.6 Returns
CREATE TABLE IF NOT EXISTS "order".returns (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orderId        UUID NOT NULL REFERENCES "order".orders(id) ON DELETE NO ACTION,
    userId         TEXT REFERENCES "user".profiles(id) ON DELETE SET NULL,
    status          VARCHAR(50) NOT NULL DEFAULT 'requested'
                        CHECK (status IN ('requested','approved','rejected','completed','picked_up',
                                          'pickup_scheduled','pickup_attempted','pickup_completed','pickup_failed',
                                          'in_transit','in_transit_to_warehouse','item_returned',
                                          'qc_initiated','qc_passed','qc_failed',
                                          'partial_refund','zero_refund','refund_initiated','refunded','cancelled')),
    qc_status       VARCHAR(50) NOT NULL DEFAULT 'NOT_STARTED',
    refund_status   VARCHAR(50) NOT NULL DEFAULT 'NOT_STARTED',
    return_outcome  VARCHAR(50),
    refundAmount   NUMERIC(12,2),
    refund_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    reason          TEXT,
    staff_notes     TEXT,
    qcResult       JSONB,
    version         INTEGER NOT NULL DEFAULT 0,
    createdAt      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_returns_order_id ON "order".returns(orderId);
CREATE INDEX IF NOT EXISTS idx_returns_status   ON "order".returns(status) WHERE status NOT IN ('refunded','cancelled');
ALTER TABLE "order".returns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_returns" ON "order".returns;
CREATE POLICY "service_role_returns" ON "order".returns FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('order','returns');

-- Add returnId FK on order_status_history (deferred)
ALTER TABLE "order".order_status_history
    ADD CONSTRAINT fk_osh_return_id
    FOREIGN KEY (returnId) REFERENCES "order".returns(id) ON DELETE SET NULL NOT VALID;

-- 8.7 Return Items
CREATE TABLE IF NOT EXISTS "order".returnItems (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    returnId     UUID NOT NULL REFERENCES "order".returns(id) ON DELETE CASCADE,
    orderItemId UUID NOT NULL REFERENCES "order".orderItems(id) ON DELETE CASCADE,
    quantity      INTEGER NOT NULL CHECK (quantity > 0),
    reason        VARCHAR(100),
    status        VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    condition     VARCHAR(50),
    images        TEXT[] NOT NULL DEFAULT '{}',
    createdAt    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_return_items_return ON "order".returnItems(returnId);
ALTER TABLE "order".returnItems ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_return_items" ON "order".returnItems;
CREATE POLICY "service_role_return_items" ON "order".returnItems FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('order','returnItems');

-- 8.8 Return QC Results
CREATE TABLE IF NOT EXISTS "order".returnQcResults (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    returnItemId UUID NOT NULL UNIQUE REFERENCES "order".returnItems(id) ON DELETE CASCADE,
    inspectedBy   VARCHAR(100),
    condition      VARCHAR(50) NOT NULL,
    isApproved    BOOLEAN NOT NULL,
    notes          TEXT,
    photos         TEXT[],
    deduction_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    inspectedAt   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE "order".returnQcResults ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_qc_results" ON "order".returnQcResults;
CREATE POLICY "service_role_qc_results" ON "order".returnQcResults FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ==========================================
-- 9. PAYMENT SCHEMA
-- ==========================================

-- 9.1 Payment Intents
CREATE TABLE IF NOT EXISTS payment_intents (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId             TEXT NOT NULL REFERENCES "user".profiles(id) ON DELETE CASCADE,
    orderId            UUID REFERENCES "order".orders(id) ON DELETE SET NULL,
    razorpayOrderId   VARCHAR(100) UNIQUE,
    razorpayPaymentId VARCHAR(100) UNIQUE,
    razorpaySignature  VARCHAR(255),
    amount              NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency            VARCHAR(3) NOT NULL DEFAULT 'INR',
    status              VARCHAR(30) NOT NULL DEFAULT 'CREATED'
                            CHECK (status IN ('CREATED','PENDING','CAPTURED','FAILED','REFUNDED','PARTIALLY_REFUNDED','CAPTURED_ORPHAN')),
    method              VARCHAR(30),
    checkoutId         UUID,
    isInternational    BOOLEAN NOT NULL DEFAULT false,
    errorCode          VARCHAR(50),
    errorDescription   TEXT,
    notes               JSONB,
    capturedAt         TIMESTAMPTZ,
    expiresAt          TIMESTAMPTZ,
    createdAt          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pi_user_id     ON payment_intents(userId);
CREATE INDEX IF NOT EXISTS idx_pi_order_id    ON payment_intents(orderId) WHERE orderId IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pi_status_created ON payment_intents(status, createdAt) WHERE status IN ('CREATED','PENDING');
CREATE INDEX IF NOT EXISTS idx_pi_orphan      ON payment_intents(status, createdAt) WHERE status = 'CAPTURED_ORPHAN';
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_payment_intents" ON payment_intents;
CREATE POLICY "service_role_payment_intents" ON payment_intents FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 9.2 Refunds
CREATE TABLE IF NOT EXISTS refunds (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paymentIntentId   UUID NOT NULL REFERENCES payment_intents(id) ON DELETE CASCADE,
    returnId           UUID REFERENCES "order".returns(id) ON DELETE SET NULL,
    razorpayRefundId  VARCHAR(100) UNIQUE,
    refundAmount       NUMERIC(12,2) NOT NULL CHECK (refundAmount > 0),
    reason              VARCHAR(255),
    status              VARCHAR(30) NOT NULL DEFAULT 'CREATED'
                            CHECK (status IN ('CREATED','PENDING','PROCESSED','FAILED','CANCELLED')),
    type                VARCHAR(20) NOT NULL DEFAULT 'FULL' CHECK (type IN ('FULL','PARTIAL')),
    idempotency_key     TEXT UNIQUE,
    notes               JSONB,
    processedAt        TIMESTAMPTZ,
    createdAt          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_refunds_payment    ON refunds(paymentIntentId);
CREATE INDEX IF NOT EXISTS idx_refunds_return     ON refunds(returnId) WHERE returnId IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_refunds_status     ON refunds(status) WHERE status NOT IN ('PROCESSED','CANCELLED');
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_refunds" ON refunds;
CREATE POLICY "service_role_refunds" ON refunds FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 9.3 Webhook Logs
CREATE TABLE IF NOT EXISTS webhookLogs (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider           TEXT NOT NULL DEFAULT 'razorpay',
    eventType         TEXT NOT NULL,
    eventId           TEXT,
    signature_verified BOOLEAN NOT NULL DEFAULT false,
    payload            JSONB NOT NULL DEFAULT '{}'::jsonb,
    correlation_id     TEXT,
    status             TEXT NOT NULL DEFAULT 'PENDING'
                           CHECK (status IN ('PENDING','PROCESSING','DONE','FAILED','DEAD_LETTER')),
    processed          BOOLEAN NOT NULL DEFAULT false,
    processedAt       TIMESTAMPTZ,
    processingError   TEXT,
    retryCount        INTEGER NOT NULL DEFAULT 0,
    maxRetries        INTEGER NOT NULL DEFAULT 5,
    next_retry_at      TIMESTAMPTZ,
    locked_at          TIMESTAMPTZ,
    locked_by          TEXT,
    createdAt         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_webhook_dedup     ON webhookLogs(eventId, eventType) WHERE eventId IS NOT NULL AND signature_verified = true;
CREATE INDEX        IF NOT EXISTS idx_webhook_queue     ON webhookLogs(status, next_retry_at) WHERE status IN ('PENDING','FAILED');
CREATE INDEX        IF NOT EXISTS idx_webhook_locked    ON webhookLogs(locked_at) WHERE locked_at IS NOT NULL AND status = 'PROCESSING';
ALTER TABLE webhookLogs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_webhook_logs" ON webhookLogs;
CREATE POLICY "service_role_webhook_logs" ON webhookLogs FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('payment','webhookLogs');

-- ==========================================
-- 10. EVENT SCHEMA
-- ==========================================

CREATE TABLE IF NOT EXISTS events (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title                    TEXT NOT NULL,
    slug                     TEXT UNIQUE,
    description              TEXT NOT NULL,
    titleI18n               JSONB NOT NULL DEFAULT '{}'::jsonb,
    descriptionI18n         JSONB NOT NULL DEFAULT '{}'::jsonb,
    startDate               TIMESTAMPTZ NOT NULL,
    endDate                 TIMESTAMPTZ,
    location                 JSONB NOT NULL DEFAULT '{}'::jsonb,
    imageUrl                TEXT,
    maxParticipants         INTEGER,
    registered_count         INTEGER NOT NULL DEFAULT 0,
    ticketPrice             NUMERIC(12,2) NOT NULL DEFAULT 0,
    gstRate                 NUMERIC(5,2) NOT NULL DEFAULT 0,
    categoryId              UUID REFERENCES categories(id) ON DELETE SET NULL,
    status                   TEXT NOT NULL DEFAULT 'upcoming'
                                 CHECK (status IN ('upcoming','ongoing','completed','cancelled')),
    is_registration_enabled  BOOLEAN NOT NULL DEFAULT true,
    registrationDeadline    TIMESTAMPTZ,
    cancellation_status      TEXT NOT NULL DEFAULT 'NONE',
    cancelledAt             TIMESTAMPTZ,
    cancellationReason      TEXT,
    event_code               VARCHAR(100) UNIQUE,
    key_highlights           TEXT[] NOT NULL DEFAULT '{}',
    special_privileges       TEXT[] NOT NULL DEFAULT '{}',
    isActive                BOOLEAN NOT NULL DEFAULT true,
    createdAt               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_events_status     ON events(status, startDate);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(startDate);
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_events" ON events;
CREATE POLICY "public_read_events" ON events FOR SELECT USING (isActive = true);
DROP POLICY IF EXISTS "service_role_events" ON events;
CREATE POLICY "service_role_events" ON events FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('event','events');

CREATE TABLE IF NOT EXISTS eventRegistrations (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number  VARCHAR(20) UNIQUE,
    eventId             UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    userId              TEXT REFERENCES "user".profiles(id) ON DELETE SET NULL,
    fullName            TEXT NOT NULL,
    email                TEXT,
    phone                TEXT,
    attendees            INTEGER NOT NULL DEFAULT 1,
    basePrice           NUMERIC(12,2),
    gstRate             NUMERIC(5,2) NOT NULL DEFAULT 0,
    gst_amount           NUMERIC(12,2) NOT NULL DEFAULT 0,
    amount               NUMERIC(12,2) NOT NULL DEFAULT 0,
    paymentStatus       TEXT NOT NULL DEFAULT 'created',
    status               TEXT NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending','confirmed','cancelled','refunded','failed')),
    razorpayOrderId    TEXT,
    razorpayPaymentId  TEXT,
    razorpaySignature   TEXT,
    invoiceId           TEXT,
    invoiceUrl          TEXT,
    metadata             JSONB NOT NULL DEFAULT '{}'::jsonb,
    createdAt           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_event_reg_event_id  ON eventRegistrations(eventId);
CREATE INDEX IF NOT EXISTS idx_event_reg_user_id   ON eventRegistrations(userId) WHERE userId IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_event_reg_email     ON eventRegistrations(lower(email)) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_event_reg_status    ON eventRegistrations(eventId, status);
CREATE INDEX IF NOT EXISTS idx_event_reg_rzp_order ON eventRegistrations(razorpayOrderId) WHERE razorpayOrderId IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_event_reg_active_email ON eventRegistrations(eventId, lower(email))
    WHERE status NOT IN ('cancelled','refunded','failed');
ALTER TABLE eventRegistrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_event_registrations" ON eventRegistrations;
CREATE POLICY "service_role_event_registrations" ON eventRegistrations FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('event','eventRegistrations');

CREATE TABLE IF NOT EXISTS donations (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId                TEXT REFERENCES "user".profiles(id) ON DELETE SET NULL,
    eventId               UUID REFERENCES events(id) ON DELETE SET NULL,
    donation_reference_id  TEXT UNIQUE NOT NULL,
    razorpayOrderId      TEXT,
    razorpayPaymentId    TEXT,
    amount                 NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency               VARCHAR(3) NOT NULL DEFAULT 'INR',
    donorName             TEXT,
    donorEmail            TEXT,
    donor_phone            TEXT,
    isAnonymous           BOOLEAN NOT NULL DEFAULT false,
    donation_type          TEXT NOT NULL DEFAULT 'ONE_TIME' CHECK (donation_type IN ('ONE_TIME','RECURRING')),
    message                TEXT,
    paymentStatus         TEXT NOT NULL DEFAULT 'created',
    status                 TEXT NOT NULL DEFAULT 'pending',
    metadata               JSONB NOT NULL DEFAULT '{}'::jsonb,
    createdAt             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_donations_rzp_order   ON donations(razorpayOrderId) WHERE razorpayOrderId IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_donations_rzp_payment ON donations(razorpayPaymentId) WHERE razorpayPaymentId IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_donations_status      ON donations(paymentStatus, createdAt) WHERE paymentStatus IN ('created','pending');
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_donations" ON donations;
CREATE POLICY "service_role_donations" ON donations FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('event','donations');

CREATE TABLE IF NOT EXISTS donation_subscriptions (
    id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId                   TEXT REFERENCES "user".profiles(id) ON DELETE SET NULL,
    donation_id               UUID REFERENCES donations(id) ON DELETE SET NULL,
    razorpay_subscription_id  TEXT UNIQUE,
    razorpay_plan_id          TEXT,
    amount                    NUMERIC(12,2) NOT NULL,
    status                    TEXT NOT NULL DEFAULT 'created',
    donorName                TEXT,
    donorEmail               TEXT,
    isAnonymous              BOOLEAN NOT NULL DEFAULT false,
    current_start             TIMESTAMPTZ,
    current_end               TIMESTAMPTZ,
    next_billing_at           TIMESTAMPTZ,
    metadata                  JSONB NOT NULL DEFAULT '{}'::jsonb,
    createdAt                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE donation_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_donation_subscriptions" ON donation_subscriptions;
CREATE POLICY "service_role_donation_subscriptions" ON donation_subscriptions FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('event','donation_subscriptions');

CREATE TABLE IF NOT EXISTS event_cancellation_jobs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    eventId            UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    correlation_id      UUID,
    status              TEXT NOT NULL DEFAULT 'PENDING',
    total_registrations INTEGER NOT NULL DEFAULT 0,
    processed_count     INTEGER NOT NULL DEFAULT 0,
    failed_count        INTEGER NOT NULL DEFAULT 0,
    batch_size          INTEGER NOT NULL DEFAULT 50,
    scheduledFor       TIMESTAMPTZ,
    startedAt          TIMESTAMPTZ,
    completedAt        TIMESTAMPTZ,
    retryCount         INTEGER NOT NULL DEFAULT 0,
    error_log           JSONB NOT NULL DEFAULT '[]'::jsonb,
    createdAt          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_event_cancel_jobs_status ON event_cancellation_jobs(status) WHERE status NOT IN ('COMPLETED','FAILED');
ALTER TABLE event_cancellation_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_event_cancel_jobs" ON event_cancellation_jobs;
CREATE POLICY "service_role_event_cancel_jobs" ON event_cancellation_jobs FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('event','event_cancellation_jobs');

-- ==========================================
-- 11. CONTENT SCHEMA
-- ==========================================

CREATE TABLE IF NOT EXISTS blogs (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title          TEXT NOT NULL,
    slug           TEXT UNIQUE,
    excerpt        TEXT NOT NULL DEFAULT '',
    body           TEXT NOT NULL DEFAULT '',
    author         TEXT NOT NULL DEFAULT 'Admin',
    titleI18n     JSONB NOT NULL DEFAULT '{}'::jsonb,
    excerpt_i18n   JSONB NOT NULL DEFAULT '{}'::jsonb,
    content_i18n   JSONB NOT NULL DEFAULT '{}'::jsonb,
    tags           TEXT[] NOT NULL DEFAULT '{}',
    tagsI18n      JSONB NOT NULL DEFAULT '{}'::jsonb,
    imageUrl      TEXT,
    isPublished   BOOLEAN NOT NULL DEFAULT false,
    publishedAt   TIMESTAMPTZ,
    blog_code      VARCHAR(100) UNIQUE,
    metaDescription TEXT,
    createdAt     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_blogs_published   ON blogs(isPublished, publishedAt DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_tags        ON blogs USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_blogs_search      ON blogs USING GIN(to_tsvector('english', title || ' ' || COALESCE(excerpt,'')));
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_blogs" ON blogs;
CREATE POLICY "public_read_blogs" ON blogs FOR SELECT USING (isPublished = true);
DROP POLICY IF EXISTS "service_role_blogs" ON blogs;
CREATE POLICY "service_role_blogs" ON blogs FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('content','blogs');

CREATE TABLE IF NOT EXISTS comments (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_id      UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    userId      TEXT NOT NULL REFERENCES "user".profiles(id) ON DELETE CASCADE,
    parentId    UUID REFERENCES comments(id) ON DELETE CASCADE,
    content      TEXT NOT NULL,
    status       VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','hidden','deleted','flagged')),
    is_flagged   BOOLEAN NOT NULL DEFAULT false,
    flag_count   INTEGER NOT NULL DEFAULT 0,
    reply_count  INTEGER NOT NULL DEFAULT 0,
    upvotes      INTEGER NOT NULL DEFAULT 0,
    edit_count   INTEGER NOT NULL DEFAULT 0,
    last_edited_at TIMESTAMPTZ,
    deletedAt   TIMESTAMPTZ,
    createdAt   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comments_blog   ON comments(blog_id, status);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parentId) WHERE parentId IS NOT NULL;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_comments" ON comments;
CREATE POLICY "public_read_comments" ON comments FOR SELECT USING (status = 'active');
DROP POLICY IF EXISTS "service_role_comments" ON comments;
CREATE POLICY "service_role_comments" ON comments FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('content','comments');

CREATE TABLE IF NOT EXISTS faqs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question      TEXT NOT NULL,
    answer        TEXT NOT NULL,
    question_i18n JSONB NOT NULL DEFAULT '{}'::jsonb,
    answer_i18n   JSONB NOT NULL DEFAULT '{}'::jsonb,
    categoryId   UUID REFERENCES categories(id) ON DELETE SET NULL,
    displayOrder INTEGER NOT NULL DEFAULT 0,
    isActive     BOOLEAN NOT NULL DEFAULT true,
    createdAt    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_faqs" ON faqs;
CREATE POLICY "public_read_faqs" ON faqs FOR SELECT USING (isActive = true);
DROP POLICY IF EXISTS "service_role_faqs" ON faqs;
CREATE POLICY "service_role_faqs" ON faqs FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('content','faqs');

CREATE TABLE IF NOT EXISTS testimonials (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId       TEXT REFERENCES "user".profiles(id) ON DELETE SET NULL,
    name          TEXT NOT NULL,
    designation   TEXT,
    email         TEXT,
    imageUrl     TEXT,
    content       TEXT NOT NULL,
    content_i18n  JSONB NOT NULL DEFAULT '{}'::jsonb,
    rating        INTEGER CHECK (rating >= 1 AND rating <= 5),
    isApproved   BOOLEAN NOT NULL DEFAULT false,
    isActive     BOOLEAN NOT NULL DEFAULT true,
    displayOrder INTEGER NOT NULL DEFAULT 0,
    createdAt    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(isApproved, isActive);
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_testimonials" ON testimonials;
CREATE POLICY "public_read_testimonials" ON testimonials FOR SELECT USING (isApproved = true AND isActive = true);
DROP POLICY IF EXISTS "service_role_testimonials" ON testimonials;
CREATE POLICY "service_role_testimonials" ON testimonials FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('content','testimonials');

CREATE TABLE IF NOT EXISTS gallery_folders (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              TEXT NOT NULL,
    slug              TEXT UNIQUE,
    description       TEXT,
    nameI18n         JSONB NOT NULL DEFAULT '{}'::jsonb,
    descriptionI18n  JSONB NOT NULL DEFAULT '{}'::jsonb,
    categoryId       UUID REFERENCES categories(id) ON DELETE SET NULL,
    coverImage       TEXT,
    is_home_carousel  BOOLEAN NOT NULL DEFAULT false,
    is_mobile_carousel BOOLEAN NOT NULL DEFAULT false,
    isHidden         BOOLEAN NOT NULL DEFAULT false,
    isActive         BOOLEAN NOT NULL DEFAULT true,
    displayOrder     INTEGER NOT NULL DEFAULT 0,
    createdAt        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_gallery_home_carousel   ON gallery_folders(is_home_carousel)   WHERE is_home_carousel = true;
CREATE UNIQUE INDEX IF NOT EXISTS idx_gallery_mobile_carousel ON gallery_folders(is_mobile_carousel) WHERE is_mobile_carousel = true;
CREATE INDEX        IF NOT EXISTS idx_gallery_folders_order   ON gallery_folders(displayOrder);
ALTER TABLE gallery_folders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_gallery_folders" ON gallery_folders;
CREATE POLICY "public_read_gallery_folders" ON gallery_folders FOR SELECT USING (isActive = true AND isHidden = false);
DROP POLICY IF EXISTS "service_role_gallery_folders" ON gallery_folders;
CREATE POLICY "service_role_gallery_folders" ON gallery_folders FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('content','gallery_folders');

CREATE TABLE IF NOT EXISTS gallery_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folderId       UUID REFERENCES gallery_folders(id) ON DELETE CASCADE,
    title           TEXT,
    description     TEXT,
    titleI18n      JSONB NOT NULL DEFAULT '{}'::jsonb,
    descriptionI18n JSONB NOT NULL DEFAULT '{}'::jsonb,
    imageUrl       TEXT NOT NULL,
    thumbnailUrl   TEXT,
    location        TEXT,
    tags            TEXT[] NOT NULL DEFAULT '{}',
    captured_date   DATE,
    displayOrder   INTEGER NOT NULL DEFAULT 0,
    isActive       BOOLEAN NOT NULL DEFAULT true,
    createdAt      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gallery_items_folder ON gallery_items(folderId);
CREATE INDEX IF NOT EXISTS idx_gallery_items_tags   ON gallery_items USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_gallery_items_date   ON gallery_items(captured_date DESC);
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_gallery_items" ON gallery_items;
CREATE POLICY "public_read_gallery_items" ON gallery_items FOR SELECT USING (isActive = true);
DROP POLICY IF EXISTS "service_role_gallery_items" ON gallery_items;
CREATE POLICY "service_role_gallery_items" ON gallery_items FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('content','gallery_items');

CREATE TABLE IF NOT EXISTS gallery_videos (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folderId      UUID REFERENCES gallery_folders(id) ON DELETE CASCADE,
    title          TEXT,
    description    TEXT,
    titleI18n     JSONB NOT NULL DEFAULT '{}'::jsonb,
    slug           TEXT,
    youtube_id     TEXT,
    youtube_url    TEXT,
    thumbnailUrl  TEXT,
    tags           TEXT[] NOT NULL DEFAULT '{}',
    displayOrder  INTEGER NOT NULL DEFAULT 0,
    isActive      BOOLEAN NOT NULL DEFAULT true,
    createdAt     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gallery_videos_folder ON gallery_videos(folderId);
ALTER TABLE gallery_videos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_gallery_videos" ON gallery_videos;
CREATE POLICY "service_role_gallery_videos" ON gallery_videos FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('content','gallery_videos');

CREATE TABLE IF NOT EXISTS policies (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_type    TEXT NOT NULL CHECK (policy_type IN ('privacy','terms','shipping-refund')),
    title          TEXT NOT NULL,
    content_html   TEXT NOT NULL,
    titleI18n     JSONB NOT NULL DEFAULT '{}'::jsonb,
    content_i18n   JSONB NOT NULL DEFAULT '{}'::jsonb,
    storagePath   TEXT NOT NULL DEFAULT '',
    fileType      TEXT NOT NULL DEFAULT 'pdf',
    version        INTEGER NOT NULL DEFAULT 1,
    isActive      BOOLEAN NOT NULL DEFAULT true,
    createdAt     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_policies_active_type ON policies(policy_type) WHERE isActive = true;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_policies" ON policies;
CREATE POLICY "public_read_policies" ON policies FOR SELECT TO anon, authenticated USING (isActive = true);
DROP POLICY IF EXISTS "service_role_policies" ON policies;
CREATE POLICY "service_role_policies" ON policies FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('content','policies');

-- About section tables
CREATE TABLE IF NOT EXISTS aboutCards (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title         TEXT NOT NULL,
    description   TEXT NOT NULL,
    titleI18n    JSONB NOT NULL DEFAULT '{}'::jsonb,
    desc_i18n     JSONB NOT NULL DEFAULT '{}'::jsonb,
    icon          TEXT,
    displayOrder INTEGER NOT NULL DEFAULT 0,
    createdAt    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE aboutCards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_about_cards" ON aboutCards;
CREATE POLICY "public_read_about_cards" ON aboutCards FOR SELECT USING (true);
DROP POLICY IF EXISTS "service_role_about_cards" ON aboutCards;
CREATE POLICY "service_role_about_cards" ON aboutCards FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('content','aboutCards');

CREATE TABLE IF NOT EXISTS about_team_members (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT NOT NULL,
    role          TEXT NOT NULL,
    bio           TEXT NOT NULL,
    nameI18n     JSONB NOT NULL DEFAULT '{}'::jsonb,
    roleI18n     JSONB NOT NULL DEFAULT '{}'::jsonb,
    bioI18n      JSONB NOT NULL DEFAULT '{}'::jsonb,
    imageUrl     TEXT,
    social_links  JSONB NOT NULL DEFAULT '{}'::jsonb,
    displayOrder INTEGER NOT NULL DEFAULT 0,
    createdAt    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE about_team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_team" ON about_team_members;
CREATE POLICY "public_read_team" ON about_team_members FOR SELECT USING (true);
DROP POLICY IF EXISTS "service_role_team" ON about_team_members;
CREATE POLICY "service_role_team" ON about_team_members FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('content','about_team_members');

CREATE TABLE IF NOT EXISTS about_impact_stats (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    value         TEXT NOT NULL,
    label         TEXT NOT NULL,
    labelI18n    JSONB NOT NULL DEFAULT '{}'::jsonb,
    icon          TEXT,
    displayOrder INTEGER NOT NULL DEFAULT 0,
    createdAt    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE about_impact_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_impact_stats" ON about_impact_stats;
CREATE POLICY "public_read_impact_stats" ON about_impact_stats FOR SELECT USING (true);
DROP POLICY IF EXISTS "service_role_impact_stats" ON about_impact_stats;
CREATE POLICY "service_role_impact_stats" ON about_impact_stats FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('content','about_impact_stats');

CREATE TABLE IF NOT EXISTS contactInfo (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    addressLine1    TEXT,
    addressLine2    TEXT,
    city             TEXT,
    state            TEXT,
    pincode          TEXT,
    country          TEXT NOT NULL DEFAULT 'India',
    google_maps_link TEXT,
    map_latitude     NUMERIC(10,7),
    map_longitude    NUMERIC(10,7),
    address_i18n     JSONB NOT NULL DEFAULT '{}'::jsonb,
    createdAt       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE contactInfo ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_contact_info" ON contactInfo;
CREATE POLICY "public_read_contact_info" ON contactInfo FOR SELECT USING (true);
DROP POLICY IF EXISTS "service_role_contact_info" ON contactInfo;
CREATE POLICY "service_role_contact_info" ON contactInfo FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('content','contactInfo');

CREATE TABLE IF NOT EXISTS bankDetails (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    accountName    TEXT NOT NULL,
    accountNumber  TEXT NOT NULL,
    ifscCode       TEXT NOT NULL,
    bankName       TEXT NOT NULL,
    branchName     TEXT,
    upi_id          TEXT,
    type            TEXT NOT NULL CHECK (type IN ('general','donation')),
    qr_code_url     TEXT,
    use_manual_qr   BOOLEAN NOT NULL DEFAULT false,
    displayOrder   INTEGER NOT NULL DEFAULT 0,
    isActive       BOOLEAN NOT NULL DEFAULT true,
    createdAt      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE bankDetails ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_bank_details" ON bankDetails;
CREATE POLICY "public_read_bank_details" ON bankDetails FOR SELECT USING (isActive = true);
DROP POLICY IF EXISTS "service_role_bank_details" ON bankDetails;
CREATE POLICY "service_role_bank_details" ON bankDetails FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('content','bankDetails');

CREATE TABLE IF NOT EXISTS socialMedia (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform      TEXT NOT NULL,
    url           TEXT NOT NULL,
    icon          TEXT,
    isActive     BOOLEAN NOT NULL DEFAULT true,
    displayOrder INTEGER NOT NULL DEFAULT 0,
    createdAt    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE socialMedia ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_social_media" ON socialMedia;
CREATE POLICY "public_read_social_media" ON socialMedia FOR SELECT USING (isActive = true);
DROP POLICY IF EXISTS "service_role_social_media" ON socialMedia;
CREATE POLICY "service_role_social_media" ON socialMedia FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('content','socialMedia');

CREATE TABLE IF NOT EXISTS carousel_slides (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title         TEXT NOT NULL,
    subtitle      TEXT,
    titleI18n    JSONB NOT NULL DEFAULT '{}'::jsonb,
    subtitle_i18n JSONB NOT NULL DEFAULT '{}'::jsonb,
    imageUrl     TEXT,
    link_url      TEXT,
    displayOrder INTEGER NOT NULL DEFAULT 0,
    isActive     BOOLEAN NOT NULL DEFAULT true,
    createdAt    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE carousel_slides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_carousel" ON carousel_slides;
CREATE POLICY "public_read_carousel" ON carousel_slides FOR SELECT USING (isActive = true);
DROP POLICY IF EXISTS "service_role_carousel" ON carousel_slides;
CREATE POLICY "service_role_carousel" ON carousel_slides FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('content','carousel_slides');

CREATE TABLE IF NOT EXISTS translations (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    namespace  TEXT NOT NULL,
    key        TEXT NOT NULL,
    locale     VARCHAR(5) NOT NULL,
    value      TEXT NOT NULL,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (namespace, key, locale)
);
CREATE INDEX IF NOT EXISTS idx_translations_ns_locale ON translations(namespace, locale);
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_translations" ON translations;
CREATE POLICY "public_read_translations" ON translations FOR SELECT USING (true);
DROP POLICY IF EXISTS "service_role_translations" ON translations;
CREATE POLICY "service_role_translations" ON translations FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('content','translations');

-- ==========================================
-- 12. COMMUNICATION SCHEMA
-- ==========================================

CREATE TABLE IF NOT EXISTS email_templates (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    templateKey VARCHAR(100) NOT NULL UNIQUE,
    name         VARCHAR(255) NOT NULL,
    subject      VARCHAR(500) NOT NULL,
    htmlBody    TEXT NOT NULL,
    textBody    TEXT,
    variables    JSONB NOT NULL DEFAULT '[]'::jsonb,
    isActive    BOOLEAN NOT NULL DEFAULT true,
    version      INTEGER NOT NULL DEFAULT 1,
    createdAt   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_email_templates" ON email_templates;
CREATE POLICY "service_role_email_templates" ON email_templates FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('communication','email_templates');

CREATE TABLE IF NOT EXISTS email_queue (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    toEmail      TEXT NOT NULL,
    toName       TEXT,
    templateKey  VARCHAR(100),
    subject       VARCHAR(500),
    htmlBody     TEXT,
    textBody     TEXT,
    templateData JSONB,
    provider      VARCHAR(20) NOT NULL DEFAULT 'ses',
    status        VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PROCESSING','SENT','FAILED','CANCELLED')),
    attempts      INTEGER NOT NULL DEFAULT 0,
    maxAttempts  INTEGER NOT NULL DEFAULT 3,
    errorMessage TEXT,
    referenceId  TEXT,
    referenceType TEXT,
    priority      VARCHAR(20) NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW','NORMAL','HIGH','CRITICAL')),
    scheduledAt  TIMESTAMPTZ,
    sentAt       TIMESTAMPTZ,
    createdAt    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_email_queue_status    ON email_queue(status, priority) WHERE status IN ('PENDING','FAILED');
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduledAt) WHERE status = 'PENDING';
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_email_queue" ON email_queue;
CREATE POLICY "service_role_email_queue" ON email_queue FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS contact_messages (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId    TEXT REFERENCES "user".profiles(id) ON DELETE SET NULL,
    name       VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    phone      VARCHAR(20),
    subject    VARCHAR(255),
    message    TEXT NOT NULL,
    status     VARCHAR(20) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW','READ','REPLIED','ARCHIVED')),
    ipAddress TEXT,
    userAgent TEXT,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status) WHERE status = 'NEW';
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_contact_messages" ON contact_messages;
CREATE POLICY "service_role_contact_messages" ON contact_messages FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('communication','contact_messages');

CREATE TABLE IF NOT EXISTS admin_alerts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type        TEXT NOT NULL CHECK (type IN ('order','product','user','payment','system','event','donation')),
    priority    TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
    status      TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread','read','resolved','archived')),
    title       TEXT NOT NULL,
    message     TEXT NOT NULL,
    referenceId TEXT,
    metadata    JSONB NOT NULL DEFAULT '{}'::jsonb,
    createdBy  TEXT REFERENCES "user".profiles(id) ON DELETE SET NULL,
    resolvedBy TEXT REFERENCES "user".profiles(id) ON DELETE SET NULL,
    resolvedAt TIMESTAMPTZ,
    createdAt  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_status   ON admin_alerts(status, priority) WHERE status = 'unread';
CREATE INDEX IF NOT EXISTS idx_admin_alerts_created  ON admin_alerts(createdAt DESC);
ALTER TABLE admin_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_admin_alerts" ON admin_alerts;
CREATE POLICY "service_role_admin_alerts" ON admin_alerts FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('communication','admin_alerts');

CREATE TABLE IF NOT EXISTS order_notifications (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orderId   UUID REFERENCES "order".orders(id) ON DELETE CASCADE,
    admin_id   TEXT REFERENCES "user".profiles(id) ON DELETE CASCADE,
    type       TEXT NOT NULL,
    title      TEXT,
    message    TEXT,
    metadata   JSONB NOT NULL DEFAULT '{}'::jsonb,
    isRead    BOOLEAN NOT NULL DEFAULT false,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_notif_admin_unread ON order_notifications(admin_id, isRead) WHERE isRead = false;
ALTER TABLE order_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_order_notifications" ON order_notifications;
CREATE POLICY "service_role_order_notifications" ON order_notifications FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('communication','order_notifications');

-- ==========================================
-- 13. ANALYTICS SCHEMA
-- ==========================================

-- Security Events table moved to Auth section (4.7)

CREATE TABLE IF NOT EXISTS audit_logs (
    id          UUID DEFAULT gen_random_uuid(),
    userId     TEXT REFERENCES "user".profiles(id) ON DELETE SET NULL,
    action      TEXT NOT NULL,
    entityType TEXT,
    entityId   TEXT,
    ipAddress  INET,
    userAgent  TEXT,
    metadata    JSONB NOT NULL DEFAULT '{}'::jsonb,
    createdAt  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, createdAt)
) PARTITION BY RANGE (createdAt);

-- Monthly partitions for the next 6 months (extend as needed)
CREATE TABLE IF NOT EXISTS audit_logs_2026_05 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE IF NOT EXISTS audit_logs_2026_06 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE IF NOT EXISTS audit_logs_2026_07 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE IF NOT EXISTS audit_logs_2026_08 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE IF NOT EXISTS audit_logs_default PARTITION OF audit_logs DEFAULT;

CREATE INDEX IF NOT EXISTS idx_audit_logs_user    ON audit_logs(userId, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action  ON audit_logs(action, entityType);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_audit_logs" ON audit_logs;
CREATE POLICY "service_role_audit_logs" ON audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS request_logs (
    id            UUID DEFAULT gen_random_uuid(),
    method        TEXT NOT NULL,
    path          TEXT NOT NULL,
    statusCode   INTEGER NOT NULL,
    responseTime INTEGER NOT NULL DEFAULT 0,
    userId       UUID,
    ipAddress    INET,
    correlation_id TEXT,
    createdAt    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, createdAt)
) PARTITION BY RANGE (createdAt);
CREATE TABLE IF NOT EXISTS request_logs_2026_05 PARTITION OF request_logs
    FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE IF NOT EXISTS request_logs_default PARTITION OF request_logs DEFAULT;
CREATE INDEX IF NOT EXISTS idx_req_logs_path_status ON request_logs(path, statusCode, createdAt DESC);
ALTER TABLE request_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_request_logs" ON request_logs;
CREATE POLICY "service_role_request_logs" ON request_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS realtime_events (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    eventType   TEXT NOT NULL,
    channel      TEXT NOT NULL CHECK (channel IN ('admin','user','order','payment')),
    userId      TEXT REFERENCES "user".profiles(id) ON DELETE SET NULL,
    payload      JSONB NOT NULL DEFAULT '{}'::jsonb,
    isBroadcast BOOLEAN NOT NULL DEFAULT false,
    expiresAt   TIMESTAMPTZ,
    createdAt   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_realtime_events_expires ON realtime_events(expiresAt) WHERE expiresAt IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_realtime_events_channel ON realtime_events(channel, createdAt DESC);
ALTER TABLE realtime_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_realtime_events" ON realtime_events;
CREATE POLICY "service_role_realtime_events" ON realtime_events FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ==========================================
-- 14. STORAGE SCHEMA
-- ==========================================

CREATE TABLE IF NOT EXISTS file_records (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    originalName TEXT NOT NULL,
    filename      TEXT NOT NULL,
    mimetype      TEXT NOT NULL,
    size          BIGINT NOT NULL,
    url           TEXT NOT NULL,
    storagePath  TEXT,
    bucket        TEXT NOT NULL DEFAULT 'uploads',
    userId       TEXT REFERENCES "user".profiles(id) ON DELETE SET NULL,
    entityType   TEXT,
    entityId     TEXT,
    createdAt    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_files_user_id    ON file_records(userId) WHERE userId IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_files_entity     ON file_records(entityType, entityId) WHERE entityType IS NOT NULL;
ALTER TABLE file_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_file_records" ON file_records;
CREATE POLICY "service_role_file_records" ON file_records FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ==========================================
-- 15. CRON SCHEMA
-- ==========================================

CREATE TABLE IF NOT EXISTS cronJobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jobId          TEXT NOT NULL UNIQUE,
    name            TEXT NOT NULL,
    type            TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','processing','completed','failed','cancelled')),
    priority        TEXT NOT NULL DEFAULT 'normal'
                        CHECK (priority IN ('low','normal','high','critical')),
    payload         JSONB,
    result          JSONB,
    error           TEXT,
    cronExpression TEXT,
    isRecurring    BOOLEAN NOT NULL DEFAULT false,
    isActive       BOOLEAN NOT NULL DEFAULT true,
    description     TEXT,
    maxRetries     INTEGER NOT NULL DEFAULT 3,
    retryCount     INTEGER NOT NULL DEFAULT 0,
    timeoutSeconds INTEGER,
    createdBy      TEXT REFERENCES "user".profiles(id) ON DELETE SET NULL,
    scheduledAt    TIMESTAMPTZ,
    startedAt      TIMESTAMPTZ,
    completedAt    TIMESTAMPTZ,
    lastRunAt     TIMESTAMPTZ,
    nextRunAt     TIMESTAMPTZ,
    createdAt      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cron_jobs_status     ON cronJobs(status, scheduledAt) WHERE status IN ('pending','processing');
CREATE INDEX IF NOT EXISTS idx_cron_jobs_next_run   ON cronJobs(nextRunAt) WHERE isRecurring = true AND isActive = true;
ALTER TABLE cronJobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_cron_jobs" ON cronJobs;
CREATE POLICY "service_role_cron_jobs" ON cronJobs FOR ALL TO service_role USING (true) WITH CHECK (true);
SELECT public.create_updated_at_trigger('cron','cronJobs');

CREATE TABLE IF NOT EXISTS jobRuns (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jobId       TEXT NOT NULL,
    cronJobId  UUID REFERENCES cronJobs(id) ON DELETE SET NULL,
    status       TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','processing','completed','failed','cancelled')),
    payload      JSONB,
    result       JSONB,
    error        TEXT,
    retryCount  INTEGER NOT NULL DEFAULT 0,
    startedAt   TIMESTAMPTZ,
    completedAt TIMESTAMPTZ,
    createdAt   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_job_runs_cron_job ON jobRuns(cronJobId);
CREATE INDEX IF NOT EXISTS idx_job_runs_status   ON jobRuns(status, createdAt DESC) WHERE status NOT IN ('completed','cancelled');
ALTER TABLE jobRuns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_job_runs" ON jobRuns;
CREATE POLICY "service_role_job_runs" ON jobRuns FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ==========================================
-- 16. CROSS-SCHEMA HELPER FUNCTIONS
-- ==========================================

-- 16.1 Check if caller is admin or manager
CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT EXISTS (
        SELECT 1 FROM app_auth."user"
        WHERE id = uid()::text AND role IN ('admin','manager','ADMIN','MANAGER')
    );
$$;

-- 16.2 Check if caller owns a given order
CREATE OR REPLACE FUNCTION public.user_owns_order(p_order_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT EXISTS (
        SELECT 1 FROM "order".orders WHERE id = p_order_id AND userId = uid()::text
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
    SELECT jsonb_build_object('in_progress', in_progress, 'statusCode', statusCode, 'response', response)
    INTO v_existing
    FROM idempotency_keys
    WHERE cache_key = p_cache_key AND expiresAt > NOW();

    IF FOUND THEN RETURN v_existing || '{"found": true}'::jsonb; END IF;

    INSERT INTO idempotency_keys
        (cache_key, userId, idempotency_key, correlation_id, in_progress, expiresAt)
    VALUES (p_cache_key, p_user_id, p_idempotency_key, p_correlation_id, true, v_expires)
    ON CONFLICT (cache_key) DO UPDATE
        SET in_progress = true, updatedAt = NOW(), expiresAt = v_expires;

    RETURN '{"found": false}'::jsonb;
END; $$;

-- 17.3 Complete idempotency entry
CREATE OR REPLACE FUNCTION public.complete_idempotency_lock(
    p_cache_key TEXT, p_status_code INTEGER, p_response JSONB
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    UPDATE idempotency_keys
    SET in_progress = false, statusCode = p_status_code,
        response = p_response, completedAt = NOW(), updatedAt = NOW()
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
        v_variant_id := (v_item->>'variantId')::UUID;
        v_qty        := COALESCE((v_item->>'quantity')::INTEGER, 0);

        UPDATE productVariants
        SET stockQuantity = stockQuantity - v_qty, updatedAt = NOW()
        WHERE id = v_variant_id AND stockQuantity >= v_qty AND isActive = true;
        GET DIAGNOSTICS v_rows := ROW_COUNT;

        IF v_rows = 0 THEN
            RAISE EXCEPTION 'INSUFFICIENT_STOCK: variantId=% qty=%', v_variant_id, v_qty;
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
        UPDATE productVariants
        SET stockQuantity = COALESCE(stockQuantity, 0) + COALESCE((v_item->>'quantity')::INTEGER, 0),
            updatedAt = NOW()
        WHERE id = (v_item->>'variantId')::UUID;
    END LOOP;
    RETURN '{"success": true}'::jsonb;
END; $$;

-- 17.6 Increment coupon usage atomically
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(p_coupon_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    UPDATE coupons
    SET usageCount = COALESCE(usageCount, 0) + 1, updatedAt = NOW()
    WHERE id = p_coupon_id;
END; $$;

-- 17.7 Decrement coupon usage (on order cancel)
CREATE OR REPLACE FUNCTION public.decrement_coupon_usage(p_coupon_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    UPDATE coupons
    SET usageCount = GREATEST(COALESCE(usageCount, 0) - 1, 0), updatedAt = NOW()
    WHERE id = p_coupon_id;
END; $$;

-- 17.8 Increment event registered count
CREATE OR REPLACE FUNCTION public.increment_event_registrations(p_event_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    UPDATE events
    SET registered_count = COALESCE(registered_count, 0) + 1, updatedAt = NOW()
    WHERE id = p_event_id;
END; $$;

-- 17.9 Decrement event registered count
CREATE OR REPLACE FUNCTION public.decrement_event_registrations(p_event_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    UPDATE events
    SET registered_count = GREATEST(COALESCE(registered_count, 0) - 1, 0), updatedAt = NOW()
    WHERE id = p_event_id;
END; $$;

-- 17.10 Upsert product review and recalculate product rating
CREATE OR REPLACE FUNCTION public.upsert_review_and_recalc_rating(
    p_product_id UUID, p_user_id UUID, p_rating INTEGER,
    p_title TEXT, p_comment TEXT
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    INSERT INTO reviews (productId, userId, rating, title, comment)
    VALUES (p_product_id, p_user_id, p_rating, p_title, p_comment)
    ON CONFLICT (productId, userId) DO UPDATE
        SET rating = EXCLUDED.rating, title = EXCLUDED.title,
            comment = EXCLUDED.comment, updatedAt = NOW();

    UPDATE products p
    SET rating       = (SELECT ROUND(AVG(r.rating)::NUMERIC, 2) FROM reviews r WHERE r.productId = p_product_id AND r.isApproved),
        reviewCount = (SELECT COUNT(*) FROM reviews r WHERE r.productId = p_product_id AND r.isApproved),
        updatedAt   = NOW()
    WHERE p.id = p_product_id;
END; $$;

-- 17.11 Atomic set primary address
CREATE OR REPLACE FUNCTION public.set_primary_address(p_address_id UUID, p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    UPDATE "user".addresses SET isPrimary = false, updatedAt = NOW()
    WHERE userId = p_user_id AND id <> p_address_id;
    UPDATE "user".addresses SET isPrimary = true, updatedAt = NOW()
    WHERE id = p_address_id AND userId = p_user_id;
END; $$;

-- 17.12 Cleanup expired sessions (cron target)
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_deleted INTEGER;
BEGIN
    DELETE FROM app_auth.sessions WHERE expiresAt < NOW() OR is_revoked = true;
    GET DIAGNOSTICS v_deleted := ROW_COUNT;
    RETURN v_deleted;
END; $$;

-- 17.13 Cleanup expired verifications (better-auth replacement for OTPs)
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_deleted INTEGER;
BEGIN
    DELETE FROM app_auth.verification WHERE expiresAt < NOW();
    GET DIAGNOSTICS v_deleted := ROW_COUNT;
    RETURN v_deleted;
END; $$;

-- 17.14 Cleanup expired inventory reservations
CREATE OR REPLACE FUNCTION public.cleanup_expired_reservations()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_deleted INTEGER;
BEGIN
    DELETE FROM inventory_reservations WHERE expiresAt < NOW();
    GET DIAGNOSTICS v_deleted := ROW_COUNT;
    RETURN v_deleted;
END; $$;

-- 17.15 Cleanup expired idempotency keys
CREATE OR REPLACE FUNCTION public.cleanup_expired_idempotency_keys()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_deleted INTEGER;
BEGIN
    DELETE FROM idempotency_keys WHERE expiresAt < NOW();
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
    UPDATE webhookLogs
    SET locked_at = NOW(), locked_by = p_worker_id,
        status = 'PROCESSING', updatedAt = NOW()
    WHERE eventId = p_event_id AND eventType = p_event_type
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
    INSERT INTO "user".managers (identityId, name, phone, creatorId)
    VALUES (p_identity_id, p_name, p_phone, p_creator_id)
    RETURNING id INTO v_manager_id;

    INSERT INTO "user".manager_permissions (
        managerId,
        canManageProducts, can_manage_categories, canManageOrders,
        canManageReturns, canManageRefunds, canManageEvents,
        canManageBlogs, canManageTestimonials, canManageGallery,
        canManageFaqs, canManageCoupons, canManageDonations,
        canManageAboutUs, can_manage_contact_info, canManagePolicies,
        can_manage_delivery, canManageEmails, canManageTranslations,
        canManageJobs, canManageManagers, canManageSystem, canViewAnalytics
    ) VALUES (
        v_manager_id,
        COALESCE((p_permissions->>'canManageProducts')::BOOLEAN, false),
        COALESCE((p_permissions->>'can_manage_categories')::BOOLEAN, false),
        COALESCE((p_permissions->>'canManageOrders')::BOOLEAN, false),
        COALESCE((p_permissions->>'canManageReturns')::BOOLEAN, false),
        COALESCE((p_permissions->>'canManageRefunds')::BOOLEAN, false),
        COALESCE((p_permissions->>'canManageEvents')::BOOLEAN, false),
        COALESCE((p_permissions->>'canManageBlogs')::BOOLEAN, false),
        COALESCE((p_permissions->>'canManageTestimonials')::BOOLEAN, false),
        COALESCE((p_permissions->>'canManageGallery')::BOOLEAN, false),
        COALESCE((p_permissions->>'canManageFaqs')::BOOLEAN, false),
        COALESCE((p_permissions->>'canManageCoupons')::BOOLEAN, false),
        COALESCE((p_permissions->>'canManageDonations')::BOOLEAN, false),
        COALESCE((p_permissions->>'canManageAboutUs')::BOOLEAN, false),
        COALESCE((p_permissions->>'can_manage_contact_info')::BOOLEAN, false),
        COALESCE((p_permissions->>'canManagePolicies')::BOOLEAN, false),
        COALESCE((p_permissions->>'can_manage_delivery')::BOOLEAN, false),
        COALESCE((p_permissions->>'canManageEmails')::BOOLEAN, false),
        COALESCE((p_permissions->>'canManageTranslations')::BOOLEAN, false),
        COALESCE((p_permissions->>'canManageJobs')::BOOLEAN, false),
        COALESCE((p_permissions->>'canManageManagers')::BOOLEAN, false),
        COALESCE((p_permissions->>'canManageSystem')::BOOLEAN, false),
        COALESCE((p_permissions->>'canViewAnalytics')::BOOLEAN, false)
    ) RETURNING to_jsonb("user".manager_permissions.*) INTO v_perm_result;

    RETURN jsonb_build_object('managerId', v_manager_id, 'permissions', v_perm_result);
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
    DELETE FROM request_logs WHERE createdAt < NOW() - INTERVAL '7 days';

    -- Prune old realtime events > 1 day
    DELETE FROM realtime_events WHERE expiresAt IS NOT NULL AND expiresAt < NOW();

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
GRANT USAGE ON SCHEMA app_auth    TO service_role;
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
GRANT ALL ON ALL TABLES IN SCHEMA app_auth    TO service_role;
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

-- ================================================================
-- 20. SUPABASE AUTOMATIC USER SYNC TRIGGERS
-- ================================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'auth' AND table_name = 'users'
  ) THEN
    -- 20.1 Sync User Function
    EXECUTE '
    CREATE OR REPLACE FUNCTION public.handle_supabase_user_sync()
    RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $body$
    DECLARE
      default_role_id TEXT;
    BEGIN
      INSERT INTO app_auth."user" (
        id,
        "firstName",
        "lastName",
        email,
        emailVerified,
        createdAt,
        updatedAt
      ) VALUES (
        NEW.id::text,
        COALESCE(NEW.raw_user_meta_data->>''first_name'', NEW.raw_user_meta_data->>''name'', NEW.email),
        NEW.raw_user_meta_data->>''last_name'',
        NEW.email,
        (NEW.email_confirmed_at IS NOT NULL),
        COALESCE(NEW.createdAt, NOW()),
        COALESCE(NEW.updatedAt, NOW())
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        emailVerified = EXCLUDED.emailVerified,
        updatedAt = NOW();



      RETURN NEW;
    END;
    $body$;
    ';

    -- Bind sync trigger
    DROP TRIGGER IF EXISTS on_supabase_user_sync ON auth.users;
    CREATE TRIGGER on_supabase_user_sync
      AFTER INSERT OR UPDATE OF email, email_confirmed_at ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_supabase_user_sync();

    -- 20.2 Sync Soft Delete Function (no-op with better-auth - user table doesn't track deleted)
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

-- ==========================================
-- 21. COMPLETION MARKER
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE '✅ Modular monolith baseline migration complete.
Schemas: config | app_auth | user | product | cart | order | payment | event | content | communication | analytics | storage | cron
RPCs: 17 stored procedures created.
Cleanup: run_maintenance_cleanup() handles session/OTP/reservation/idempotency pruning.
Partitions: audit_logs and request_logs partitioned by month.';
END $$;
