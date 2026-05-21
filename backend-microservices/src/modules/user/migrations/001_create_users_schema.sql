-- User Service Database Migration

CREATE SCHEMA IF NOT EXISTS users;

-- Profiles
CREATE TABLE IF NOT EXISTS users.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identityId UUID NOT NULL UNIQUE,
  firstName VARCHAR(255),
  lastName VARCHAR(255),
  phone VARCHAR(20),
  avatarUrl TEXT,
  preferredLanguage VARCHAR(5) DEFAULT 'en',
  preferences JSONB DEFAULT '{}',
  defaultAddressId UUID,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_identity ON users.profiles(identityId);

-- Addresses
CREATE TABLE IF NOT EXISTS users.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID REFERENCES users.profiles(id) NOT NULL,
  label VARCHAR(50) DEFAULT 'Home',
  fullName VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  addressLine1 VARCHAR(255) NOT NULL,
  addressLine2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  country VARCHAR(100) DEFAULT 'India',
  landmark VARCHAR(255),
  isPrimary BOOLEAN DEFAULT false,
  addressType VARCHAR(20) DEFAULT 'both',
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_addresses_user ON users.addresses(userId);

-- Managers
CREATE TABLE IF NOT EXISTS users.managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identityId UUID NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'manager',
  creatorId UUID,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_managers_identity ON users.managers(identityId);

-- Manager Permissions
CREATE TABLE IF NOT EXISTS users.manager_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  managerId UUID REFERENCES users.managers(id) ON DELETE CASCADE UNIQUE NOT NULL,
  canManageProducts BOOLEAN DEFAULT false,
  canManageOrders BOOLEAN DEFAULT false,
  canManageCoupons BOOLEAN DEFAULT false,
  canManageBlogs BOOLEAN DEFAULT false,
  canManageFaqs BOOLEAN DEFAULT false,
  canManageGallery BOOLEAN DEFAULT false,
  canManageEvents BOOLEAN DEFAULT false,
  canManageDonations BOOLEAN DEFAULT false,
  canManageTestimonials BOOLEAN DEFAULT false,
  canManagePolicies BOOLEAN DEFAULT false,
  canManageAboutUs BOOLEAN DEFAULT false,
  canManageManagers BOOLEAN DEFAULT false,
  canManageSettings BOOLEAN DEFAULT false,
  canManageEmails BOOLEAN DEFAULT false,
  canManageTranslations BOOLEAN DEFAULT false,
  canManageWebhooks BOOLEAN DEFAULT false,
  canManageSocial BOOLEAN DEFAULT false,
  canManageJobs BOOLEAN DEFAULT false,
  canManageReturns BOOLEAN DEFAULT false,
  canManageRefunds BOOLEAN DEFAULT false,
  canManageAdmin BOOLEAN DEFAULT false,
  canManageSystem BOOLEAN DEFAULT false,
  canViewAnalytics BOOLEAN DEFAULT false,
  canViewLogs BOOLEAN DEFAULT false,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

-- Store Settings
CREATE TABLE IF NOT EXISTS users.store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  category VARCHAR(50),
  isPublic BOOLEAN DEFAULT false,
  updatedBy UUID,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_settings_key ON users.store_settings(key);

-- System Switches
CREATE TABLE IF NOT EXISTS users.system_switches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  switchKey VARCHAR(100) UNIQUE NOT NULL,
  isEnabled BOOLEAN DEFAULT true,
  description TEXT,
  updatedAt TIMESTAMPTZ DEFAULT now()
);

-- Admin Alerts
CREATE TABLE IF NOT EXISTS users.admin_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alertType VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  severity VARCHAR(20) DEFAULT 'info',
  referenceType VARCHAR(50),
  referenceId UUID,
  isRead BOOLEAN DEFAULT false,
  readBy UUID,
  readAt TIMESTAMPTZ,
  createdAt TIMESTAMPTZ DEFAULT now()
);

-- Admin Notifications
CREATE TABLE IF NOT EXISTS users.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(50),
  referenceUrl TEXT,
  isRead BOOLEAN DEFAULT false,
  isArchived BOOLEAN DEFAULT false,
  readAt TIMESTAMPTZ,
  createdAt TIMESTAMPTZ DEFAULT now()
);

-- Account Deletion
CREATE TABLE IF NOT EXISTS users.account_deletion_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identityId UUID NOT NULL,
  userId UUID NOT NULL,
  status VARCHAR(30) DEFAULT 'PENDING',
  requestedAt TIMESTAMPTZ DEFAULT now(),
  scheduledFor TIMESTAMPTZ,
  otpVerified BOOLEAN DEFAULT false,
  deletionAuthorizationTokenHash VARCHAR(128),
  datExpiresAt TIMESTAMPTZ,
  completedAt TIMESTAMPTZ,
  errorMessage TEXT,
  retryCount INTEGER DEFAULT 0,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users.account_deletion_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deletionJobId UUID,
  identityId UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  actor VARCHAR(50),
  metadata JSONB,
  createdAt TIMESTAMPTZ DEFAULT now()
);