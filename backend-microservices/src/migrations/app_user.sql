-- ================================================================
-- SCHEMA: APP_USER (DOMAINS, PROFILES, ADDRESSES & COUNTRIES)
-- ================================================================

-- 1. COUNTRIES MASTER TABLE (Cleaned Schema)
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

-- 2. PROFILES
CREATE TABLE IF NOT EXISTS app_user.profiles (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId"      TEXT UNIQUE NOT NULL, -- references app_auth.user(id) [added as FK in app_auth schema definition]
    "roleId"      TEXT NOT NULL,        -- references app_auth.roles(id)
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

-- 3. USER ADDRESSES
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

-- 4. USER PHONE NUMBERS
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

-- 5. MANAGERS
CREATE TABLE IF NOT EXISTS app_user.managers (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "identityId" TEXT NOT NULL UNIQUE, -- references app_auth.user(id)
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

-- 6. ROW LEVEL SECURITY (RLS)
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

-- 7. PROFILE AUTO INITIALIZER SYNC FUNCTION
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
