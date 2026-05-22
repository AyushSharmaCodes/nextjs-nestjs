-- ================================================================
-- MERIGAUMATA — MODULAR MONOLITH BASELINE MIGRATION
-- Version: 2.1.0
-- Date: 2026-05-16
--
-- This migration sets up the shared database infrastructure,
-- schemas, and non-auth core modules for the platform.
-- ================================================================

-- ================================================================
-- 0. EXTENSIONS & COMPATIBILITY
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

-- ================================================================
-- 1. SCHEMAS
-- ================================================================
CREATE SCHEMA IF NOT EXISTS config;        -- System configuration & RBAC metadata
CREATE SCHEMA IF NOT EXISTS app_auth;      -- Auth identities & sessions
CREATE SCHEMA IF NOT EXISTS app_user;      -- User profiles & domain entities
CREATE SCHEMA IF NOT EXISTS product;       -- Catalog & Inventory
CREATE SCHEMA IF NOT EXISTS cart;          -- Shopping carts
CREATE SCHEMA IF NOT EXISTS "order";       -- Order processing
CREATE SCHEMA IF NOT EXISTS payment;       -- Payment records
CREATE SCHEMA IF NOT EXISTS event;         -- Event registrations
CREATE SCHEMA IF NOT EXISTS content;       -- CMS (Blogs, FAQs, etc.)
CREATE SCHEMA IF NOT EXISTS communication; -- Email & Messaging
CREATE SCHEMA IF NOT EXISTS analytics;     -- System logs
CREATE SCHEMA IF NOT EXISTS storage;       -- Media metadata
CREATE SCHEMA IF NOT EXISTS cron;          -- Scheduled tasks

-- ================================================================
-- 2. SHARED UTILITIES
-- ================================================================

-- 2.1 uid(): Resolves current user ID from Supabase context
CREATE OR REPLACE FUNCTION public.uid()
RETURNS UUID LANGUAGE plpgsql STABLE AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'auth' AND p.proname = 'uid') THEN
    RETURN auth.uid();
  ELSE
    RETURN NULL::UUID;
  END IF;
END; $$;

-- 2.2 Shared updatedAt trigger
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
-- 3. MODULE: SYSTEM CONFIG
-- ================================================================

-- 3.1 System Switches: Dynamic feature flags
CREATE TABLE IF NOT EXISTS config.system_switches (
    key         TEXT PRIMARY KEY,
    value       JSONB   NOT NULL,
    description TEXT,
    "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE config.system_switches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_system_switches" ON config.system_switches FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_read_system_switches" ON config.system_switches FOR SELECT TO authenticated USING (true);

-- 3.2 Idempotency Keys: Prevent duplicate operations
CREATE TABLE IF NOT EXISTS config.idempotency_keys (
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
CREATE INDEX IF NOT EXISTS idx_idempotency_userId ON config.idempotency_keys("userId");
CREATE INDEX IF NOT EXISTS idx_idempotency_expiresAt ON config.idempotency_keys("expiresAt");

ALTER TABLE config.idempotency_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_idempotency" ON config.idempotency_keys FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ================================================================
-- 4. MODULE: PRODUCT CATALOG
-- ================================================================

CREATE TABLE IF NOT EXISTS product.categories (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT NOT NULL,
    "isActive"     BOOLEAN NOT NULL DEFAULT true,
    "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_categories_isActive ON product.categories("isActive");

CREATE TABLE IF NOT EXISTS product.products (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title                  TEXT NOT NULL,
    price                  NUMERIC(10,2) NOT NULL,
    "isActive"              BOOLEAN NOT NULL DEFAULT true,
    "createdAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_isActive ON product.products("isActive");
CREATE INDEX IF NOT EXISTS idx_products_createdAt ON product.products("createdAt" DESC);

-- ================================================================
-- 5. MODULE: ORDER PROCESSING
-- ================================================================

CREATE TABLE IF NOT EXISTS "order".orders (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderNumber"    TEXT UNIQUE,
    "totalAmount"    NUMERIC(12,2) NOT NULL DEFAULT 0,
    status           TEXT NOT NULL DEFAULT 'pending',
    "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_status ON "order".orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_createdAt ON "order".orders("createdAt" DESC);

-- ================================================================
-- 6. GLOBAL RPCs & HELPERS
-- ================================================================

-- 6.1 is_admin_or_manager(): RBAC check for stored procedures
CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT EXISTS (SELECT 1 FROM app_auth."user" WHERE id = uid()::text AND role IN ('ADMIN','MANAGER'));
$$;

-- ================================================================
-- 7. SUPABASE AUTOMATIC USER SYNC
-- ================================================================
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

-- ================================================================
-- 8. GRANTS & COMPLETION
-- ================================================================
GRANT USAGE ON SCHEMA config, app_auth, app_user, product, cart, "order", payment, event, content, communication, analytics, storage, cron TO authenticated, anon, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA config, app_auth, app_user, product, cart, "order", payment, event, content, communication, analytics, storage, cron TO service_role;

DO $$ BEGIN RAISE NOTICE '✅ Shared baseline migration complete.'; END $$;
