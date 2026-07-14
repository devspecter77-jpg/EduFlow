-- Step 12: Super Admin Panel + Multi-Tenant SaaS

-- Add SUPER_ADMIN to Role enum
DO $$ BEGIN
  ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
EXCEPTION WHEN others THEN null;
END $$;

-- CreateEnum: PlanType
DO $$ BEGIN
  CREATE TYPE "PlanType" AS ENUM ('FREE', 'STANDARD', 'PREMIUM');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- CreateEnum: SubscriptionStatus
DO $$ BEGIN
  CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'EXPIRED', 'SUSPENDED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- CreateEnum: CenterStatus
DO $$ BEGIN
  CREATE TYPE "CenterStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'DELETED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- CreateTable: centers
CREATE TABLE IF NOT EXISTS "centers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "logo" TEXT,
    "description" TEXT,
    "status" "CenterStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "centers_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "centers_slug_key" ON "centers"("slug");
CREATE INDEX IF NOT EXISTS "centers_slug_idx" ON "centers"("slug");
CREATE INDEX IF NOT EXISTS "centers_status_idx" ON "centers"("status");

-- CreateTable: plans
CREATE TABLE IF NOT EXISTS "plans" (
    "id" TEXT NOT NULL,
    "type" "PlanType" NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "max_students" INTEGER NOT NULL DEFAULT 50,
    "max_teachers" INTEGER NOT NULL DEFAULT 5,
    "max_groups" INTEGER NOT NULL DEFAULT 5,
    "trial_days" INTEGER NOT NULL DEFAULT 10,
    "features" TEXT NOT NULL DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "plans_type_key" ON "plans"("type");

-- CreateTable: subscriptions
CREATE TABLE IF NOT EXISTS "subscriptions" (
    "id" TEXT NOT NULL,
    "center_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "subscriptions_center_id_idx" ON "subscriptions"("center_id");
CREATE INDEX IF NOT EXISTS "subscriptions_status_idx" ON "subscriptions"("status");
CREATE INDEX IF NOT EXISTS "subscriptions_end_date_idx" ON "subscriptions"("end_date");

-- Add center_id to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "center_id" TEXT;
CREATE INDEX IF NOT EXISTS "users_center_id_idx" ON "users"("center_id");

-- AddForeignKey: subscriptions → centers
ALTER TABLE "subscriptions" DROP CONSTRAINT IF EXISTS "subscriptions_center_id_fkey";
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_center_id_fkey"
  FOREIGN KEY ("center_id") REFERENCES "centers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: subscriptions → plans
ALTER TABLE "subscriptions" DROP CONSTRAINT IF EXISTS "subscriptions_plan_id_fkey";
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey"
  FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON UPDATE CASCADE;

-- AddForeignKey: users → centers
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_center_id_fkey";
ALTER TABLE "users" ADD CONSTRAINT "users_center_id_fkey"
  FOREIGN KEY ("center_id") REFERENCES "centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed default plans
INSERT INTO "plans" ("id", "type", "name", "price", "max_students", "max_teachers", "max_groups", "trial_days", "features", "updated_at")
VALUES
  ('plan_free',     'FREE',     'Free',     0,        30,  3,  3,  10, '["students","teachers","groups","attendance","payments"]', CURRENT_TIMESTAMP),
  ('plan_standard', 'STANDARD', 'Standard', 299000,  200, 20, 20, 10, '["students","teachers","groups","attendance","payments","analytics","reports","notifications"]', CURRENT_TIMESTAMP),
  ('plan_premium',  'PREMIUM',  'Premium',  599000, 1000, 99, 99, 10, '["students","teachers","groups","attendance","payments","analytics","reports","notifications","telegram","export","import"]', CURRENT_TIMESTAMP)
ON CONFLICT ("type") DO NOTHING;
