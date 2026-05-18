-- Performance indexes for auth session and OTP verification flows
CREATE INDEX IF NOT EXISTS "sessions_refresh_token_hash_is_revoked_idx"
  ON "sessions"("refresh_token_hash", "is_revoked");

CREATE INDEX IF NOT EXISTS "sessions_user_id_is_revoked_idx"
  ON "sessions"("user_id", "is_revoked");

CREATE INDEX IF NOT EXISTS "otp_challenges_lookup_idx"
  ON "otp_challenges"("user_id", "type", "is_verified", "created_at");

CREATE INDEX IF NOT EXISTS "otp_challenges_expires_at_idx"
  ON "otp_challenges"("expires_at");
