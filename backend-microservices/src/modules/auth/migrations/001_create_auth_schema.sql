-- Auth Service Database Migration
-- Run this against the Supabase PostgreSQL instance

-- Create auth schema
CREATE SCHEMA IF NOT EXISTS auth;

-- Core identity table
CREATE TABLE IF NOT EXISTS auth.identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  email_verified BOOLEAN DEFAULT false,
  email_verification_token VARCHAR(128),
  email_verification_expires_at TIMESTAMPTZ,
  role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('admin', 'manager', 'customer')),
  is_blocked BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  deletion_status VARCHAR(20),
  auth_provider VARCHAR(20) DEFAULT 'local' CHECK (auth_provider IN ('local', 'google')),
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- OAuth identities
CREATE TABLE IF NOT EXISTS auth.oauth_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_id UUID REFERENCES auth.identities(id) NOT NULL,
  provider VARCHAR(20) NOT NULL,
  provider_user_id VARCHAR(255) NOT NULL,
  provider_email VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(provider, provider_user_id)
);

-- Sessions
CREATE TABLE IF NOT EXISTS auth.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_id UUID REFERENCES auth.identities(id) NOT NULL,
  refresh_token_hash VARCHAR(128) UNIQUE NOT NULL,
  device_info JSONB,
  ip_address INET,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trusted devices
CREATE TABLE IF NOT EXISTS auth.trusted_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_id UUID REFERENCES auth.identities(id) NOT NULL,
  device_fingerprint VARCHAR(255) NOT NULL,
  device_name VARCHAR(100),
  trusted_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(identity_id, device_fingerprint)
);

-- OTPs
CREATE TABLE IF NOT EXISTS auth.otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_id UUID REFERENCES auth.identities(id),
  email VARCHAR(255),
  otp_hash VARCHAR(128) NOT NULL,
  purpose VARCHAR(50) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS auth.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_id UUID REFERENCES auth.identities(id) NOT NULL,
  token_hash VARCHAR(128) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Refresh usage tracking
CREATE TABLE IF NOT EXISTS auth.refresh_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_id UUID REFERENCES auth.identities(id) NOT NULL,
  session_id UUID REFERENCES auth.sessions(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Auth event log
CREATE TABLE IF NOT EXISTS auth.auth_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_id UUID REFERENCES auth.identities(id),
  event_type VARCHAR(50) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_identities_email ON auth.identities(email);
CREATE INDEX IF NOT EXISTS idx_identities_role ON auth.identities(role);
CREATE INDEX IF NOT EXISTS idx_oauth_identities_provider ON auth.oauth_identities(provider, provider_user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_identity_id ON auth.sessions(identity_id);
CREATE INDEX IF NOT EXISTS idx_sessions_refresh_token_hash ON auth.sessions(refresh_token_hash);
CREATE INDEX IF NOT EXISTS idx_otps_email_purpose ON auth.otps(email, purpose);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash ON auth.password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_auth_events_identity_id ON auth.auth_events(identity_id);
CREATE INDEX IF NOT EXISTS idx_auth_events_created_at ON auth.auth_events(created_at);

-- Enable Row Level Security
ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.oauth_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.trusted_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.refresh_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.auth_events ENABLE ROW LEVEL SECURITY;

-- Service role policies (allow service account full access)
CREATE POLICY "Service role access identities" ON auth.identities
  FOR ALL USING (current_role = 'service_role'::name);

CREATE POLICY "Service role access sessions" ON auth.sessions
  FOR ALL USING (current_role = 'service_role'::name);

CREATE POLICY "Service role access otps" ON auth.otps
  FOR ALL USING (current_role = 'service_role'::name);

CREATE POLICY "Service role access password_reset_tokens" ON auth.password_reset_tokens
  FOR ALL USING (current_role = 'service_role'::name);

CREATE POLICY "Service role access oauth_identities" ON auth.oauth_identities
  FOR ALL USING (current_role = 'service_role'::name);

CREATE POLICY "Service role access trusted_devices" ON auth.trusted_devices
  FOR ALL USING (current_role = 'service_role'::name);

CREATE POLICY "Service role access auth_events" ON auth.auth_events
  FOR ALL USING (current_role = 'service_role'::name);

CREATE POLICY "Service role access refresh_usage" ON auth.refresh_usage
  FOR ALL USING (current_role = 'service_role'::name);

-- Anonymization policies for authenticated users (can only see their own data)
CREATE POLICY "Users can view own identity" ON auth.identities
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own sessions" ON auth.sessions
  FOR SELECT USING (auth.uid() = identity_id);