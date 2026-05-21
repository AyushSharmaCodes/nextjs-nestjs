-- Cart Service Database Migration

CREATE SCHEMA IF NOT EXISTS cart;

-- Carts
CREATE TABLE IF NOT EXISTS cart.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID,
  sessionId VARCHAR(255),
  status VARCHAR(20) DEFAULT 'ACTIVE',
  expiresAt TIMESTAMPTZ,
  appliedCouponId UUID,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT cart_owner CHECK ((userId IS NOT NULL) OR (sessionId IS NOT NULL))
);

CREATE UNIQUE INDEX idx_cart_user ON cart.carts(userId) WHERE userId IS NOT NULL AND status = 'ACTIVE';
CREATE INDEX idx_cart_session ON cart.carts(sessionId) WHERE sessionId IS NOT NULL AND status = 'ACTIVE';

-- Cart Items
CREATE TABLE IF NOT EXISTS cart.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cartId UUID REFERENCES cart.carts(id) ON DELETE CASCADE NOT NULL,
  productId UUID NOT NULL,
  variantId UUID,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  title VARCHAR(255) NOT NULL,
  imageUrl TEXT,
  pricePerUnit NUMERIC(12,2) NOT NULL,
  mrp NUMERIC(12,2),
  variantLabel VARCHAR(50),
  is_available BOOLEAN DEFAULT true,
  availableQuantity INTEGER,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cart_items_cart ON cart.cart_items(cartId);

-- Applied Coupons
CREATE TABLE IF NOT EXISTS cart.applied_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cartId UUID REFERENCES cart.carts(id) NOT NULL UNIQUE,
  couponId UUID NOT NULL,
  couponCode VARCHAR(50) NOT NULL,
  discountAmount NUMERIC(10,2) NOT NULL,
  appliedAt TIMESTAMPTZ DEFAULT now()
);

-- Coupons
CREATE TABLE IF NOT EXISTS cart.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL,
  discountPercentage NUMERIC(5,2),
  discountAmount NUMERIC(10,2),
  targetId UUID,
  minPurchaseAmount NUMERIC(10,2) DEFAULT 0,
  maxDiscountAmount NUMERIC(10,2),
  validFrom TIMESTAMPTZ NOT NULL,
  validUntil TIMESTAMPTZ NOT NULL,
  usageLimit INTEGER,
  usageCount INTEGER DEFAULT 0,
  isActive BOOLEAN DEFAULT true,
  description TEXT,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_coupons_code ON cart.coupons(code);

-- Coupon Usage
CREATE TABLE IF NOT EXISTS cart.coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couponId UUID REFERENCES cart.coupons(id) NOT NULL,
  userId UUID NOT NULL,
  orderId UUID,
  discountAmount NUMERIC(10,2) NOT NULL,
  createdAt TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_coupon_usage_coupon ON cart.coupon_usage(couponId);
CREATE INDEX idx_coupon_usage_user ON cart.coupon_usage(userId);