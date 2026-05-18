-- Product Service Database Migration
-- Run this against the Supabase PostgreSQL instance

-- Create catalog schema
CREATE SCHEMA IF NOT EXISTS catalog;

-- Categories
CREATE TABLE IF NOT EXISTS catalog.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  name_i18n JSONB DEFAULT '{}',
  slug VARCHAR(150) UNIQUE NOT NULL,
  description TEXT,
  description_i18n JSONB DEFAULT '{}',
  image_url TEXT,
  parent_id UUID REFERENCES catalog.categories(id),
  type VARCHAR(20) NOT NULL CHECK (type IN ('product', 'event', 'faq', 'gallery', 'blog')),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_categories_type ON catalog.categories(type);
CREATE INDEX idx_categories_parent ON catalog.categories(parent_id);
CREATE INDEX idx_categories_slug ON catalog.categories(slug);

-- Products
CREATE TABLE IF NOT EXISTS catalog.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  title_i18n JSONB DEFAULT '{}',
  slug VARCHAR(300) UNIQUE NOT NULL,
  description TEXT,
  description_i18n JSONB DEFAULT '{}',
  selling_price NUMERIC(12,2) NOT NULL,
  mrp NUMERIC(12,2),
  images JSONB DEFAULT '[]',
  category_id UUID REFERENCES catalog.categories(id),
  variant_mode VARCHAR(10) DEFAULT 'UNIT' CHECK (variant_mode IN ('UNIT', 'SIZE')),
  tags JSONB DEFAULT '[]',
  tags_i18n JSONB DEFAULT '{}',
  benefits JSONB DEFAULT '[]',
  benefits_i18n JSONB DEFAULT '{}',
  is_new BOOLEAN DEFAULT false,
  is_returnable BOOLEAN DEFAULT true,
  return_days INTEGER DEFAULT 7,
  rating NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  default_hsn_code VARCHAR(10),
  default_gst_rate NUMERIC(5,2),
  default_tax_applicable BOOLEAN DEFAULT true,
  default_price_includes_tax BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_category ON catalog.products(category_id);
CREATE INDEX idx_products_slug ON catalog.products(slug);
CREATE INDEX idx_products_selling_price ON catalog.products(selling_price);
CREATE INDEX idx_products_is_active ON catalog.products(is_active);

-- Product Variants
CREATE TABLE IF NOT EXISTS catalog.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES catalog.products(id) ON DELETE CASCADE NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  size_label VARCHAR(50),
  size_label_i18n JSONB DEFAULT '{}',
  size_value VARCHAR(50),
  unit VARCHAR(10),
  description TEXT,
  description_i18n JSONB DEFAULT '{}',
  mrp NUMERIC(12,2),
  selling_price NUMERIC(12,2),
  stock_quantity INTEGER DEFAULT 0,
  variant_image_url TEXT,
  is_default BOOLEAN DEFAULT false,
  hsn_code VARCHAR(10),
  gst_rate NUMERIC(5,2),
  tax_applicable BOOLEAN,
  price_includes_tax BOOLEAN,
  razorpay_item_id VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_variants_product ON catalog.product_variants(product_id);
CREATE INDEX idx_variants_sku ON catalog.product_variants(sku);

-- Inventory
CREATE TABLE IF NOT EXISTS catalog.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID REFERENCES catalog.product_variants(id) ON DELETE CASCADE NOT NULL UNIQUE,
  available_quantity INTEGER DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0,
  version INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_inventory_variant ON catalog.inventory(variant_id);

-- Inventory Reservations
CREATE TABLE IF NOT EXISTS catalog.inventory_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID REFERENCES catalog.product_variants(id) NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reservations_variant ON catalog.inventory_reservations(variant_id);
CREATE INDEX idx_reservations_expires ON catalog.inventory_reservations(expires_at);

-- Delivery Configs
CREATE TABLE IF NOT EXISTS catalog.delivery_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope VARCHAR(10) NOT NULL CHECK (scope IN ('GLOBAL', 'PRODUCT', 'VARIANT')),
  product_id UUID REFERENCES catalog.products(id),
  variant_id UUID REFERENCES catalog.product_variants(id),
  calculation_type VARCHAR(20) NOT NULL CHECK (calculation_type IN ('FLAT_PER_ORDER', 'WEIGHT_BASED', 'PER_PACKAGE')),
  base_delivery_charge NUMERIC(10,2) NOT NULL,
  max_items_per_package INTEGER DEFAULT 10,
  unit_weight NUMERIC(10,3),
  gst_percentage NUMERIC(5,2) DEFAULT 0,
  is_taxable BOOLEAN DEFAULT true,
  delivery_refund_policy TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_delivery_scope ON catalog.delivery_configs(scope);
CREATE INDEX idx_delivery_product ON catalog.delivery_configs(product_id);
CREATE INDEX idx_delivery_variant ON catalog.delivery_configs(variant_id);

-- Insert default delivery config
INSERT INTO catalog.delivery_configs (scope, calculation_type, base_delivery_charge, max_items_per_package, is_active)
VALUES ('GLOBAL', 'FLAT_PER_ORDER', 0, 10, true)
ON CONFLICT DO NOTHING;