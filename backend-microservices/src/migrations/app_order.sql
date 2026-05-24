-- ================================================================
-- SCHEMA: APP_ORDER (ORDER PROCESSING)
-- ================================================================

-- 1. ORDERS
CREATE TABLE IF NOT EXISTS app_order.orders (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderNumber"    TEXT UNIQUE,
    "totalAmount"    NUMERIC(12,2) NOT NULL DEFAULT 0,
    status           TEXT NOT NULL DEFAULT 'pending',
    "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_status ON app_order.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_createdAt ON app_order.orders("createdAt" DESC);
