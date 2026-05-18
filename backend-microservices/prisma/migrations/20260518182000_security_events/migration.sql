CREATE TABLE IF NOT EXISTS "security_events" (
  "id" TEXT NOT NULL,
  "user_id" TEXT,
  "email" TEXT,
  "event_type" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "correlation_id" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "security_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "security_events_event_type_created_at_idx"
ON "security_events"("event_type", "created_at");

CREATE INDEX IF NOT EXISTS "security_events_user_id_created_at_idx"
ON "security_events"("user_id", "created_at");

ALTER TABLE "security_events"
ADD CONSTRAINT "security_events_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
