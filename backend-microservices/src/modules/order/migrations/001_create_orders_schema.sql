-- Order Service Database Migration
-- Run this against the Supabase PostgreSQL instance

-- Create orders schema
CREATE SCHEMA IF NOT EXISTS orders;

-- Orders
CREATE TABLE IF NOT EXISTS orders.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orderNumber VARCHAR(20) UNIQUE NOT NULL,
  userId UUID NOT NULL,
  customerName VARCHAR(255),
  customerEmail VARCHAR(255),
  customerPhone VARCHAR(20),
  status VARCHAR(30) NOT NULL DEFAULT 'CREATED',
  paymentStatus VARCHAR(20) DEFAULT 'PENDING',
  paymentMethod VARCHAR(30),
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  deliveryCharge NUMERIC(10,2) DEFAULT 0,
  deliveryGst NUMERIC(10,2) DEFAULT 0,
  couponDiscount NUMERIC(10,2) DEFAULT 0,
  totalAmount NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'INR',
  shippingAddressId UUID,
  billingAddressId UUID,
  shippingAddress JSONB,
  billingAddress JSONB,
  paymentId VARCHAR(100),
  invoiceId UUID,
  invoiceUrl TEXT,
  invoiceStatus VARCHAR(20),
  notes TEXT,
  metadata JSONB,
  version INTEGER DEFAULT 1,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_orders_user ON orders.orders(userId);
CREATE INDEX idx_orders_status ON orders.orders(status);
CREATE INDEX idx_orders_number ON orders.orders(orderNumber);
CREATE INDEX idx_orders_created ON orders.orders(createdAt DESC);

-- Order Items
CREATE TABLE IF NOT EXISTS orders.orderItems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orderId UUID REFERENCES orders.orders(id) ON DELETE CASCADE NOT NULL,
  productId UUID NOT NULL,
  variantId UUID,
  sku VARCHAR(100),
  title VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  pricePerUnit NUMERIC(12,2) NOT NULL,
  hsnCode VARCHAR(10),
  gstRate NUMERIC(5,2),
  taxableAmount NUMERIC(12,2) DEFAULT 0,
  cgst NUMERIC(10,2) DEFAULT 0,
  sgst NUMERIC(10,2) DEFAULT 0,
  igst NUMERIC(10,2) DEFAULT 0,
  deliveryCharge NUMERIC(10,2) DEFAULT 0,
  deliveryGst NUMERIC(10,2) DEFAULT 0,
  returnedQuantity INTEGER DEFAULT 0,
  isReturnable BOOLEAN DEFAULT true,
  variantSnapshot JSONB,
  deliveryCalculationSnapshot JSONB,
  createdAt TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_order_items_order ON orders.orderItems(orderId);

-- Order Status History
CREATE TABLE IF NOT EXISTS orders.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orderId UUID REFERENCES orders.orders(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(30) NOT NULL,
  eventType VARCHAR(50) NOT NULL,
  actor VARCHAR(20) DEFAULT 'SYSTEM',
  updatedBy UUID,
  notes TEXT,
  metadata JSONB,
  createdAt TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_order_history_order ON orders.order_status_history(orderId);

-- Returns
CREATE TABLE IF NOT EXISTS orders.returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orderId UUID REFERENCES orders.orders(id) NOT NULL,
  userId UUID NOT NULL,
  status VARCHAR(30) DEFAULT 'REQUESTED',
  reason TEXT,
  refundAmount NUMERIC(12,2),
  qcResult JSONB,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_returns_order ON orders.returns(orderId);
CREATE INDEX idx_returns_user ON orders.returns(userId);
CREATE INDEX idx_returns_status ON orders.returns(status);

-- Return Items
CREATE TABLE IF NOT EXISTS orders.returnItems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  returnId UUID REFERENCES orders.returns(id) ON DELETE CASCADE NOT NULL,
  orderItemId UUID REFERENCES orders.orderItems(id) NOT NULL,
  quantity INTEGER NOT NULL,
  reason VARCHAR(100),
  status VARCHAR(30) DEFAULT 'PENDING',
  refundAmount NUMERIC(12,2),
  createdAt TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_return_items_return ON orders.returnItems(returnId);

-- Return QC Results
CREATE TABLE IF NOT EXISTS orders.returnQcResults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  returnItemId UUID REFERENCES orders.returnItems(id) NOT NULL,
  inspectedBy UUID,
  condition VARCHAR(50),
  isApproved BOOLEAN,
  notes TEXT,
  photos JSONB DEFAULT '[]',
  createdAt TIMESTAMPTZ DEFAULT now()
);

-- Invoices
CREATE TABLE IF NOT EXISTS orders.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orderId UUID REFERENCES orders.orders(id) UNIQUE NOT NULL,
  invoiceNumber VARCHAR(30) UNIQUE NOT NULL,
  invoiceUrl TEXT,
  storagePath TEXT,
  fileType VARCHAR(20) DEFAULT 'pdf',
  generatedAt TIMESTAMPTZ,
  createdAt TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_invoices_order ON orders.invoices(orderId);
CREATE INDEX idx_invoices_number ON orders.invoices(invoiceNumber);