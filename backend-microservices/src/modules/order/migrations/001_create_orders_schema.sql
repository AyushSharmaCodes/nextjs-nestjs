-- Order Service Database Migration
-- Run this against the Supabase PostgreSQL instance

-- Create orders schema
CREATE SCHEMA IF NOT EXISTS orders;

-- Orders
CREATE TABLE IF NOT EXISTS orders.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(20) UNIQUE NOT NULL,
  user_id UUID NOT NULL,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  status VARCHAR(30) NOT NULL DEFAULT 'CREATED',
  payment_status VARCHAR(20) DEFAULT 'PENDING',
  payment_method VARCHAR(30),
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  delivery_charge NUMERIC(10,2) DEFAULT 0,
  delivery_gst NUMERIC(10,2) DEFAULT 0,
  coupon_discount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'INR',
  shipping_address_id UUID,
  billing_address_id UUID,
  shipping_address JSONB,
  billing_address JSONB,
  payment_id VARCHAR(100),
  invoice_id UUID,
  invoice_url TEXT,
  invoice_status VARCHAR(20),
  notes TEXT,
  metadata JSONB,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_orders_user ON orders.orders(user_id);
CREATE INDEX idx_orders_status ON orders.orders(status);
CREATE INDEX idx_orders_number ON orders.orders(order_number);
CREATE INDEX idx_orders_created ON orders.orders(created_at DESC);

-- Order Items
CREATE TABLE IF NOT EXISTS orders.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID NOT NULL,
  variant_id UUID,
  sku VARCHAR(100),
  title VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  price_per_unit NUMERIC(12,2) NOT NULL,
  hsn_code VARCHAR(10),
  gst_rate NUMERIC(5,2),
  taxable_amount NUMERIC(12,2) DEFAULT 0,
  cgst NUMERIC(10,2) DEFAULT 0,
  sgst NUMERIC(10,2) DEFAULT 0,
  igst NUMERIC(10,2) DEFAULT 0,
  delivery_charge NUMERIC(10,2) DEFAULT 0,
  delivery_gst NUMERIC(10,2) DEFAULT 0,
  returned_quantity INTEGER DEFAULT 0,
  is_returnable BOOLEAN DEFAULT true,
  variant_snapshot JSONB,
  delivery_calculation_snapshot JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_order_items_order ON orders.order_items(order_id);

-- Order Status History
CREATE TABLE IF NOT EXISTS orders.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders.orders(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(30) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  actor VARCHAR(20) DEFAULT 'SYSTEM',
  updated_by UUID,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_order_history_order ON orders.order_status_history(order_id);

-- Returns
CREATE TABLE IF NOT EXISTS orders.returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders.orders(id) NOT NULL,
  user_id UUID NOT NULL,
  status VARCHAR(30) DEFAULT 'REQUESTED',
  reason TEXT,
  refund_amount NUMERIC(12,2),
  qc_result JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_returns_order ON orders.returns(order_id);
CREATE INDEX idx_returns_user ON orders.returns(user_id);
CREATE INDEX idx_returns_status ON orders.returns(status);

-- Return Items
CREATE TABLE IF NOT EXISTS orders.return_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id UUID REFERENCES orders.returns(id) ON DELETE CASCADE NOT NULL,
  order_item_id UUID REFERENCES orders.order_items(id) NOT NULL,
  quantity INTEGER NOT NULL,
  reason VARCHAR(100),
  status VARCHAR(30) DEFAULT 'PENDING',
  refund_amount NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_return_items_return ON orders.return_items(return_id);

-- Return QC Results
CREATE TABLE IF NOT EXISTS orders.return_qc_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_item_id UUID REFERENCES orders.return_items(id) NOT NULL,
  inspected_by UUID,
  condition VARCHAR(50),
  is_approved BOOLEAN,
  notes TEXT,
  photos JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Invoices
CREATE TABLE IF NOT EXISTS orders.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders.orders(id) UNIQUE NOT NULL,
  invoice_number VARCHAR(30) UNIQUE NOT NULL,
  invoice_url TEXT,
  storage_path TEXT,
  file_type VARCHAR(20) DEFAULT 'pdf',
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_invoices_order ON orders.invoices(order_id);
CREATE INDEX idx_invoices_number ON orders.invoices(invoice_number);