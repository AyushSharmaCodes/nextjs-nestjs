-- Cart Service Database Migration

CREATE SCHEMA IF NOT EXISTS cart;

-- Carts
CREATE TABLE IF NOT EXISTS cart.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'ACTIVE',
  expires_at TIMESTAMPTZ,
  applied_coupon_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT cart_owner CHECK ((user_id IS NOT NULL) OR (session_id IS NOT NULL))
);

CREATE UNIQUE INDEX idx_cart_user ON cart.carts(user_id) WHERE user_id IS NOT NULL AND status = 'ACTIVE';
CREATE INDEX idx_cart_session ON cart.carts(session_id) WHERE session_id IS NOT NULL AND status = 'ACTIVE';

-- Cart Items
CREATE TABLE IF NOT EXISTS cart.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES cart.carts(id) ON DELETE CASCADE NOT NULL,
  product_id UUID NOT NULL,
  variant_id UUID,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  title VARCHAR(255) NOT NULL,
  image_url TEXT,
  price_per_unit NUMERIC(12,2) NOT NULL,
  mrp NUMERIC(12,2),
  variant_label VARCHAR(50),
  is_available BOOLEAN DEFAULT true,
  available_quantity INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cart_items_cart ON cart.cart_items(cart_id);

-- Applied Coupons
CREATE TABLE IF NOT EXISTS cart.applied_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES cart.carts(id) NOT NULL UNIQUE,
  coupon_id UUID NOT NULL,
  coupon_code VARCHAR(50) NOT NULL,
  discount_amount NUMERIC(10,2) NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT now()
);

-- Coupons
CREATE TABLE IF NOT EXISTS cart.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL,
  discount_percentage NUMERIC(5,2),
  discount_amount NUMERIC(10,2),
  target_id UUID,
  min_purchase_amount NUMERIC(10,2) DEFAULT 0,
  max_discount_amount NUMERIC(10,2),
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_coupons_code ON cart.coupons(code);

-- Coupon Usage
CREATE TABLE IF NOT EXISTS cart.coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES cart.coupons(id) NOT NULL,
  user_id UUID NOT NULL,
  order_id UUID,
  discount_amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_coupon_usage_coupon ON cart.coupon_usage(coupon_id);
CREATE INDEX idx_coupon_usage_user ON cart.coupon_usage(user_id);