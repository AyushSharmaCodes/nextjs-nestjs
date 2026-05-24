-- ================================================================
-- SCHEMA: APP_PRODUCT (CATALOG CATEGORIES & PRODUCTS)
-- ================================================================

-- 1. CATEGORIES
CREATE TABLE IF NOT EXISTS app_product.categories (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT NOT NULL,
    "isActive"     BOOLEAN NOT NULL DEFAULT true,
    "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_categories_isActive ON app_product.categories("isActive");

-- 2. PRODUCTS
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
