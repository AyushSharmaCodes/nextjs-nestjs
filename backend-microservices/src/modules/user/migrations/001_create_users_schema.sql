-- User Service Database Migration

CREATE SCHEMA IF NOT EXISTS users;

-- Profiles
CREATE TABLE IF NOT EXISTS users.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_id UUID NOT NULL UNIQUE,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  avatar_url TEXT,
  preferred_language VARCHAR(5) DEFAULT 'en',
  preferences JSONB DEFAULT '{}',
  default_address_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_identity ON users.profiles(identity_id);

-- Addresses
CREATE TABLE IF NOT EXISTS users.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users.profiles(id) NOT NULL,
  label VARCHAR(50) DEFAULT 'Home',
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  country VARCHAR(100) DEFAULT 'India',
  landmark VARCHAR(255),
  is_primary BOOLEAN DEFAULT false,
  address_type VARCHAR(20) DEFAULT 'both',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_addresses_user ON users.addresses(user_id);

-- Managers
CREATE TABLE IF NOT EXISTS users.managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_id UUID NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'manager',
  creator_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_managers_identity ON users.managers(identity_id);

-- Manager Permissions
CREATE TABLE IF NOT EXISTS users.manager_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID REFERENCES users.managers(id) ON DELETE CASCADE UNIQUE NOT NULL,
  can_manage_products BOOLEAN DEFAULT false,
  can_manage_orders BOOLEAN DEFAULT false,
  can_manage_coupons BOOLEAN DEFAULT false,
  can_manage_blogs BOOLEAN DEFAULT false,
  can_manage_faqs BOOLEAN DEFAULT false,
  can_manage_gallery BOOLEAN DEFAULT false,
  can_manage_events BOOLEAN DEFAULT false,
  can_manage_donations BOOLEAN DEFAULT false,
  can_manage_testimonials BOOLEAN DEFAULT false,
  can_manage_policies BOOLEAN DEFAULT false,
  can_manage_about_us BOOLEAN DEFAULT false,
  can_manage_managers BOOLEAN DEFAULT false,
  can_manage_settings BOOLEAN DEFAULT false,
  can_manage_emails BOOLEAN DEFAULT false,
  can_manage_translations BOOLEAN DEFAULT false,
  can_manage_webhooks BOOLEAN DEFAULT false,
  can_manage_social BOOLEAN DEFAULT false,
  can_manage_jobs BOOLEAN DEFAULT false,
  can_manage_returns BOOLEAN DEFAULT false,
  can_manage_refunds BOOLEAN DEFAULT false,
  can_manage_admin BOOLEAN DEFAULT false,
  can_manage_system BOOLEAN DEFAULT false,
  can_view_analytics BOOLEAN DEFAULT false,
  can_view_logs BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Store Settings
CREATE TABLE IF NOT EXISTS users.store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  category VARCHAR(50),
  is_public BOOLEAN DEFAULT false,
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_settings_key ON users.store_settings(key);

-- System Switches
CREATE TABLE IF NOT EXISTS users.system_switches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  switch_key VARCHAR(100) UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Admin Alerts
CREATE TABLE IF NOT EXISTS users.admin_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  severity VARCHAR(20) DEFAULT 'info',
  reference_type VARCHAR(50),
  reference_id UUID,
  is_read BOOLEAN DEFAULT false,
  read_by UUID,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Admin Notifications
CREATE TABLE IF NOT EXISTS users.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(50),
  reference_url TEXT,
  is_read BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Account Deletion
CREATE TABLE IF NOT EXISTS users.account_deletion_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_id UUID NOT NULL,
  user_id UUID NOT NULL,
  status VARCHAR(30) DEFAULT 'PENDING',
  requested_at TIMESTAMPTZ DEFAULT now(),
  scheduled_for TIMESTAMPTZ,
  otp_verified BOOLEAN DEFAULT false,
  deletion_authorization_token_hash VARCHAR(128),
  dat_expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users.account_deletion_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deletion_job_id UUID,
  identity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  actor VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);