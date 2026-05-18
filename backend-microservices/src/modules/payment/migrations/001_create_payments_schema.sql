-- Payment Service Database Migration

CREATE SCHEMA IF NOT EXISTS payments;

-- Payment Intents
CREATE TABLE IF NOT EXISTS payments.payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  order_id UUID,
  razorpay_order_id VARCHAR(100) UNIQUE,
  razorpay_payment_id VARCHAR(100) UNIQUE,
  razorpay_signature VARCHAR(255),
  amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  status VARCHAR(30) DEFAULT 'CREATED',
  method VARCHAR(30),
  checkout_id UUID,
  is_international BOOLEAN DEFAULT false,
  notes JSONB,
  error_code VARCHAR(50),
  error_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  captured_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_payments_user ON payments.payment_intents(user_id);
CREATE INDEX idx_payments_order ON payments.payment_intents(order_id);
CREATE INDEX idx_payments_razorpay_order ON payments.payment_intents(razorpay_order_id);

-- Refunds
CREATE TABLE IF NOT EXISTS payments.refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_intent_id UUID REFERENCES payments.payment_intents(id) NOT NULL,
  razorpay_refund_id VARCHAR(100) UNIQUE,
  refund_amount NUMERIC(12,2) NOT NULL,
  reason VARCHAR(255),
  status VARCHAR(30) DEFAULT 'CREATED',
  type VARCHAR(20) DEFAULT 'FULL',
  return_id UUID,
  notes JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX idx_refunds_payment ON payments.refunds(payment_intent_id);
CREATE INDEX idx_refunds_return ON payments.refunds(return_id);

-- Webhook Logs
CREATE TABLE IF NOT EXISTS payments.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  razorpay_event_id VARCHAR(100) UNIQUE NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processing_error TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_webhooks_event ON payments.webhook_logs(event_type);
CREATE INDEX idx_webhooks_processed ON payments.webhook_logs(processed);