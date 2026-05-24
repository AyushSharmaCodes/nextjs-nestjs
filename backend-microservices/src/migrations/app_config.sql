-- ================================================================
-- SCHEMA: APP_CONFIG (SYSTEM VARIABLES & IDEMPOTENCY CACHE)
-- ================================================================

-- 1. SYSTEM SWITCHES: Dynamic feature flags
CREATE TABLE IF NOT EXISTS app_config.system_switches (
    key         TEXT PRIMARY KEY,
    value       JSONB   NOT NULL,
    description TEXT,
    "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE app_config.system_switches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_system_switches" ON app_config.system_switches FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_read_system_switches" ON app_config.system_switches FOR SELECT TO authenticated USING (true);

-- 2. IDEMPOTENCY KEYS: Prevent duplicate operations
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
