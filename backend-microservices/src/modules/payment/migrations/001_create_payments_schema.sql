-- Payment Service Database Migration

CREATE SCHEMA IF NOT EXISTS payments;

-- Payment Intents
CREATE TABLE IF NOT EXISTS payments.payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL,
  orderId UUID,
  razorpayOrderId VARCHAR(100) UNIQUE,
  razorpayPaymentId VARCHAR(100) UNIQUE,
  razorpaySignature VARCHAR(255),
  amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  status VARCHAR(30) DEFAULT 'CREATED',
  method VARCHAR(30),
  checkoutId UUID,
  isInternational BOOLEAN DEFAULT false,
  notes JSONB,
  errorCode VARCHAR(50),
  errorDescription TEXT,
  createdAt TIMESTAMPTZ DEFAULT now(),
  capturedAt TIMESTAMPTZ,
  expiresAt TIMESTAMPTZ
);

CREATE INDEX idx_payments_user ON payments.payment_intents(userId);
CREATE INDEX idx_payments_order ON payments.payment_intents(orderId);
CREATE INDEX idx_payments_razorpay_order ON payments.payment_intents(razorpayOrderId);

-- Refunds
CREATE TABLE IF NOT EXISTS payments.refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paymentIntentId UUID REFERENCES payments.payment_intents(id) NOT NULL,
  razorpayRefundId VARCHAR(100) UNIQUE,
  refundAmount NUMERIC(12,2) NOT NULL,
  reason VARCHAR(255),
  status VARCHAR(30) DEFAULT 'CREATED',
  type VARCHAR(20) DEFAULT 'FULL',
  returnId UUID,
  notes JSONB,
  createdAt TIMESTAMPTZ DEFAULT now(),
  processedAt TIMESTAMPTZ
);

CREATE INDEX idx_refunds_payment ON payments.refunds(paymentIntentId);
CREATE INDEX idx_refunds_return ON payments.refunds(returnId);

-- Webhook Logs
CREATE TABLE IF NOT EXISTS payments.webhookLogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eventType VARCHAR(100) NOT NULL,
  razorpayEventId VARCHAR(100) UNIQUE NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processingError TEXT,
  createdAt TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_webhooks_event ON payments.webhookLogs(eventType);
CREATE INDEX idx_webhooks_processed ON payments.webhookLogs(processed);