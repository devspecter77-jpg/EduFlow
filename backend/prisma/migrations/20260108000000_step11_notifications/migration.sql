-- Step 11: Smart Notification System

-- Add telegramId to students
ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "telegram_id" TEXT;

-- Add Telegram settings to settings table
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "telegram_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "telegram_bot_token" TEXT;
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "telegram_admin_chat_id" TEXT;
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "payment_reminder_enabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "attendance_alert_enabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "NotificationChannel" AS ENUM ('TELEGRAM', 'SYSTEM', 'SMS');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "NotificationLogStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable: notification_logs
CREATE TABLE IF NOT EXISTS "notification_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "status" "NotificationLogStatus" NOT NULL DEFAULT 'PENDING',
    "recipient_name" TEXT NOT NULL,
    "recipient_id" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "error_message" TEXT,
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "notification_logs_user_id_idx" ON "notification_logs"("user_id");
CREATE INDEX IF NOT EXISTS "notification_logs_channel_idx" ON "notification_logs"("channel");
CREATE INDEX IF NOT EXISTS "notification_logs_status_idx" ON "notification_logs"("status");
CREATE INDEX IF NOT EXISTS "notification_logs_created_at_idx" ON "notification_logs"("created_at");

-- AddForeignKey
ALTER TABLE "notification_logs" DROP CONSTRAINT IF EXISTS "notification_logs_user_id_fkey";
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_user_id_fkey" 
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
