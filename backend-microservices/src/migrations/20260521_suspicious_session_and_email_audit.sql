-- ================================================================
-- SUSPICIOUS SESSION & EMAIL AUDIT MIGRATION
-- ================================================================

-- 1. Create Enums
CREATE TYPE "app_auth"."EmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED');
CREATE TYPE "app_auth"."DeviceType" AS ENUM ('DESKTOP', 'MOBILE', 'TABLET', 'BOT', 'UNKNOWN');
CREATE TYPE "app_auth"."SessionRiskLevel" AS ENUM ('NORMAL', 'SUSPICIOUS', 'HIGH_RISK');
CREATE TYPE "app_auth"."AuditResolution" AS ENUM ('CONFIRMED_BY_USER', 'REVOKED_BY_USER', 'AUTO_REVOKED', 'EXPIRED');

-- 2. Create Email Audit Table
CREATE TABLE "app_auth"."email_audit" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "toEmail" TEXT NOT NULL,
    "status" "app_auth"."EmailStatus" NOT NULL,
    "providerMessageId" TEXT,
    "failReason" TEXT,
    "requestId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "email_audit_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "email_audit_eventId_key" ON "app_auth"."email_audit"("eventId");
CREATE INDEX "email_audit_userId_createdAt_idx" ON "app_auth"."email_audit"("userId", "createdAt");
CREATE INDEX "email_audit_status_createdAt_idx" ON "app_auth"."email_audit"("status", "createdAt");
CREATE INDEX "email_audit_eventName_createdAt_idx" ON "app_auth"."email_audit"("eventName", "createdAt");

-- 3. Create Device Sessions Table
CREATE TABLE "app_auth"."device_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "betterAuthSessionId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "city" TEXT,
    "region" TEXT,
    "country" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isp" TEXT,
    "deviceType" "app_auth"."DeviceType" NOT NULL,
    "os" TEXT NOT NULL,
    "osVersion" TEXT NOT NULL,
    "browser" TEXT NOT NULL,
    "browserVersion" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "isTrusted" BOOLEAN NOT NULL DEFAULT false,
    "trustGrantedAt" TIMESTAMP(3),
    "riskLevel" "app_auth"."SessionRiskLevel" NOT NULL,
    "suspicionReasons" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "device_sessions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "device_sessions_betterAuthSessionId_key" ON "app_auth"."device_sessions"("betterAuthSessionId");
CREATE UNIQUE INDEX "device_sessions_sessionId_key" ON "app_auth"."device_sessions"("sessionId");
CREATE INDEX "device_sessions_userId_createdAt_idx" ON "app_auth"."device_sessions"("userId", "createdAt" DESC);
CREATE INDEX "device_sessions_userId_fingerprint_idx" ON "app_auth"."device_sessions"("userId", "fingerprint");
CREATE INDEX "device_sessions_userId_ipAddress_idx" ON "app_auth"."device_sessions"("userId", "ipAddress");
ALTER TABLE "app_auth"."device_sessions" ADD CONSTRAINT "device_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app_auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. Create Suspicious Session Audits Table
CREATE TABLE "app_auth"."suspicious_session_audits" (
    "id" TEXT NOT NULL,
    "deviceSessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "riskLevel" "app_auth"."SessionRiskLevel" NOT NULL,
    "suspicionReasons" TEXT[],
    "ipAddress" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolution" "app_auth"."AuditResolution",
    "emailSentAt" TIMESTAMP(3),
    "requestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "suspicious_session_audits_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "suspicious_session_audits_eventId_key" ON "app_auth"."suspicious_session_audits"("eventId");
CREATE INDEX "suspicious_session_audits_userId_createdAt_idx" ON "app_auth"."suspicious_session_audits"("userId", "createdAt" DESC);
CREATE INDEX "suspicious_session_audits_deviceSessionId_idx" ON "app_auth"."suspicious_session_audits"("deviceSessionId");

-- 5. Set up Row Level Security (RLS)
ALTER TABLE "app_auth"."email_audit" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_email_audit" ON "app_auth"."email_audit" FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE "app_auth"."device_sessions" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_device_sessions" ON "app_auth"."device_sessions" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_device_sessions_access" ON "app_auth"."device_sessions" FOR SELECT TO authenticated USING ("userId" = public.uid()::text);

ALTER TABLE "app_auth"."suspicious_session_audits" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_suspicious_session_audits" ON "app_auth"."suspicious_session_audits" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_suspicious_session_audits_access" ON "app_auth"."suspicious_session_audits" FOR SELECT TO authenticated USING ("userId" = public.uid()::text);

-- 6. Set up updatedAt triggers
SELECT public.create_updated_at_trigger('app_auth', 'email_audit');
SELECT public.create_updated_at_trigger('app_auth', 'device_sessions');
