-- Product Service Database Migration
-- Run this against the Supabase PostgreSQL instance

-- Create catalog schema
CREATE SCHEMA IF NOT EXISTS catalog;

-- Categories
CREATE TABLE IF NOT EXISTS catalog.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  nameI18n JSONB DEFAULT '{}',
  slug VARCHAR(150) UNIQUE NOT NULL,
  description TEXT,
  descriptionI18n JSONB DEFAULT '{}',
  imageUrl TEXT,
  parentId UUID REFERENCES catalog.categories(id),
  type VARCHAR(20) NOT NULL CHECK (type IN ('product', 'event', 'faq', 'gallery', 'blog')),
  displayOrder INTEGER DEFAULT 0,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_categories_type ON catalog.categories(type);
CREATE INDEX idx_categories_parent ON catalog.categories(parentId);
CREATE INDEX idx_categories_slug ON catalog.categories(slug);

-- Products
CREATE TABLE IF NOT EXISTS catalog.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  titleI18n JSONB DEFAULT '{}',
  slug VARCHAR(300) UNIQUE NOT NULL,
  description TEXT,
  descriptionI18n JSONB DEFAULT '{}',
  sellingPrice NUMERIC(12,2) NOT NULL,
  mrp NUMERIC(12,2),
  images JSONB DEFAULT '[]',
  categoryId UUID REFERENCES catalog.categories(id),
  variantMode VARCHAR(10) DEFAULT 'UNIT' CHECK (variantMode IN ('UNIT', 'SIZE')),
  tags JSONB DEFAULT '[]',
  tagsI18n JSONB DEFAULT '{}',
  benefits JSONB DEFAULT '[]',
  benefitsI18n JSONB DEFAULT '{}',
  isNew BOOLEAN DEFAULT false,
  isReturnable BOOLEAN DEFAULT true,
  returnDays INTEGER DEFAULT 7,
  rating NUMERIC(3,2) DEFAULT 0,
  ratingCount INTEGER DEFAULT 0,
  reviewCount INTEGER DEFAULT 0,
  defaultHsnCode VARCHAR(10),
  defaultGstRate NUMERIC(5,2),
  defaultTaxApplicable BOOLEAN DEFAULT true,
  defaultPriceIncludesTax BOOLEAN DEFAULT false,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_category ON catalog.products(categoryId);
CREATE INDEX idx_products_slug ON catalog.products(slug);
CREATE INDEX idx_products_selling_price ON catalog.products(sellingPrice);
CREATE INDEX idx_products_is_active ON catalog.products(isActive);

-- Product Variants
CREATE TABLE IF NOT EXISTS catalog.productVariants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  productId UUID REFERENCES catalog.products(id) ON DELETE CASCADE NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  sizeLabel VARCHAR(50),
  sizeLabelI18n JSONB DEFAULT '{}',
  sizeValue VARCHAR(50),
  unit VARCHAR(10),
  description TEXT,
  descriptionI18n JSONB DEFAULT '{}',
  mrp NUMERIC(12,2),
  sellingPrice NUMERIC(12,2),
  stockQuantity INTEGER DEFAULT 0,
  variantImageUrl TEXT,
  isDefault BOOLEAN DEFAULT false,
  hsnCode VARCHAR(10),
  gstRate NUMERIC(5,2),
  taxApplicable BOOLEAN,
  priceIncludesTax BOOLEAN,
  razorpayItemId VARCHAR(100),
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_variants_product ON catalog.productVariants(productId);
CREATE INDEX idx_variants_sku ON catalog.productVariants(sku);

-- Inventory
CREATE TABLE IF NOT EXISTS catalog.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variantId UUID REFERENCES catalog.productVariants(id) ON DELETE CASCADE NOT NULL UNIQUE,
  availableQuantity INTEGER DEFAULT 0,
  reservedQuantity INTEGER DEFAULT 0,
  version INTEGER DEFAULT 1,
  updatedAt TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_inventory_variant ON catalog.inventory(variantId);

-- Inventory Reservations
CREATE TABLE IF NOT EXISTS catalog.inventory_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variantId UUID REFERENCES catalog.productVariants(id) NOT NULL,
  sessionId VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  expiresAt TIMESTAMPTZ NOT NULL,
  createdAt TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reservations_variant ON catalog.inventory_reservations(variantId);
CREATE INDEX idx_reservations_expires ON catalog.inventory_reservations(expiresAt);

-- Delivery Configs
CREATE TABLE IF NOT EXISTS catalog.delivery_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope VARCHAR(10) NOT NULL CHECK (scope IN ('GLOBAL', 'PRODUCT', 'VARIANT')),
  productId UUID REFERENCES catalog.products(id),
  variantId UUID REFERENCES catalog.productVariants(id),
  calculationType VARCHAR(20) NOT NULL CHECK (calculationType IN ('FLAT_PER_ORDER', 'WEIGHT_BASED', 'PER_PACKAGE')),
  baseDeliveryCharge NUMERIC(10,2) NOT NULL,
  maxItemsPerPackage INTEGER DEFAULT 10,
  unitWeight NUMERIC(10,3),
  gstPercentage NUMERIC(5,2) DEFAULT 0,
  isTaxable BOOLEAN DEFAULT true,
  deliveryRefundPolicy TEXT,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_delivery_scope ON catalog.delivery_configs(scope);
CREATE INDEX idx_delivery_product ON catalog.delivery_configs(productId);
CREATE INDEX idx_delivery_variant ON catalog.delivery_configs(variantId);

-- Insert default delivery config
INSERT INTO catalog.delivery_configs (scope, calculationType, baseDeliveryCharge, maxItemsPerPackage, isActive)
VALUES ('GLOBAL', 'FLAT_PER_ORDER', 0, 10, true)
ON CONFLICT DO NOTHING;