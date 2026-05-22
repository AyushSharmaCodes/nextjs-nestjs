-- ================================================================
-- MODULE: USER DOMAIN BASELINE MIGRATION
-- Version: 1.1.0
-- Date: 2026-05-22
--
-- This migration initializes the User module entities including
-- Profiles, Addresses, and Managerial structures.
-- ================================================================

CREATE SCHEMA IF NOT EXISTS app_auth;
CREATE SCHEMA IF NOT EXISTS app_user;

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
-- 1. PROFILE MANAGEMENT
-- ================================================================

-- 1.1 Profiles: Enriched user data (bio, preferences, etc.) linked to Auth identities
CREATE TABLE IF NOT EXISTS app_user.profiles (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId"      TEXT UNIQUE NOT NULL REFERENCES app_auth."user"(id) ON DELETE CASCADE,
    "roleId"      TEXT NOT NULL REFERENCES app_auth.roles(id) ON DELETE RESTRICT,
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

-- 1.2 User Addresses: Physical shipping/billing addresses for profiles
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

-- 1.3 User Phone Numbers: Multiple contact numbers for profiles
CREATE TABLE IF NOT EXISTS app_user.user_phone_numbers (
    id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "profileId"     TEXT NOT NULL REFERENCES app_user.profiles(id) ON DELETE CASCADE,
    number        TEXT NOT NULL,
    label         TEXT NOT NULL DEFAULT 'MOBILE',
    "isDefault"    BOOLEAN NOT NULL DEFAULT false,
    "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_profileId ON app_user.user_phone_numbers("profileId");

-- ================================================================
-- 2. MANAGERIAL STRUCTURE
-- ================================================================

-- 2.1 Managers: High-level staff accounts with management capabilities
CREATE TABLE IF NOT EXISTS app_user.managers (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "identityId" TEXT NOT NULL UNIQUE REFERENCES app_auth."user"(id) ON DELETE CASCADE,
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

-- ================================================================
-- 3. RLS & STORAGE
-- ================================================================

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

-- 3.1 Storage Buckets: Infrastructure for user-generated assets
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'storage') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('user-avatars', 'user-avatars', false, 5242880, '{"image/jpeg","image/png","image/webp"}')
    ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('user-covers', 'user-covers', false, 10485760, '{"image/jpeg","image/png","image/webp"}')
    ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

    -- Bucket Policies: Restrict access to owner only
    DROP POLICY IF EXISTS "Users can access own avatars" ON storage.objects;
    CREATE POLICY "Users can access own avatars" ON storage.objects FOR ALL TO authenticated
      USING (bucket_id = 'user-avatars' AND (storage.foldername(name))[1] = public.uid()::text);
    DROP POLICY IF EXISTS "Users can access own covers" ON storage.objects;
    CREATE POLICY "Users can access own covers" ON storage.objects FOR ALL TO authenticated
      USING (bucket_id = 'user-covers' AND (storage.foldername(name))[1] = public.uid()::text);
    DROP POLICY IF EXISTS "Service role full access to user assets" ON storage.objects;
    CREATE POLICY "Service role full access to user assets" ON storage.objects FOR ALL TO service_role
      USING (bucket_id IN ('user-avatars','user-covers'));
  END IF;
END $$;

-- ================================================================
-- 4. AUTOMATIC PROFILE INITIALIZATION (ACID SYNC)
-- ================================================================

-- 4.1 Sync Function: Creates a default profile for every new identity
CREATE OR REPLACE FUNCTION app_user.handle_new_user_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_customer_role_id TEXT;
BEGIN
    -- Resolve the standard CUSTOMER role ID
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

-- 4.2 Trigger: Bind to app_auth.user AFTER INSERT
DROP TRIGGER IF EXISTS on_auth_user_created ON app_auth."user";
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON app_auth."user"
  FOR EACH ROW EXECUTE FUNCTION app_user.handle_new_user_profile();

-- Triggers
SELECT public.create_updated_at_trigger('app_user','profiles');
SELECT public.create_updated_at_trigger('app_user','user_addresses');
SELECT public.create_updated_at_trigger('app_user','user_phone_numbers');
SELECT public.create_updated_at_trigger('app_user','managers');
