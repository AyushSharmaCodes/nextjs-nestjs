-- ================================================================
-- SCHEMA: PUBLIC (INFRASTRUCTURE, EXTENSIONS & SHARED HELPERS)
-- ================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- 2. USER ROLES FOR DATABASE
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN CREATE ROLE service_role; END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated; END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon; END IF;
END $$;

-- 3. SCHEMA DECLARATIONS
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


-- 4. SHARED UTILITIES & PROCEDURES

-- 4.1 uid(): Resolves current user ID from Supabase context
CREATE OR REPLACE FUNCTION public.uid()
RETURNS UUID LANGUAGE plpgsql STABLE AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'auth' AND p.proname = 'uid') THEN
    RETURN auth.uid();
  ELSE
    RETURN NULL::UUID;
  END IF;
END; $$;

-- 4.2 set_updated_at(): Shared updatedAt trigger handler
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW."updatedAt" = NOW(); RETURN NEW; END; $$;

-- 4.3 create_updated_at_trigger(): Helper to generate trigger on tables
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

-- 4.4 is_admin_or_manager(): RBAC check for stored procedures
CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT EXISTS (SELECT 1 FROM app_auth."user" WHERE id = uid()::text AND role IN ('ADMIN','MANAGER'));
$$;

-- 5. MODULE: AI LOGS (public.ai_nim_logs)
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
