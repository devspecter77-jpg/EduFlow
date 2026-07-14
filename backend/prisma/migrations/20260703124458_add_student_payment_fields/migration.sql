-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('MONTHLY', 'YEARLY');

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "next_payment_date" TIMESTAMP(3),
ADD COLUMN     "payment_amount" DOUBLE PRECISION,
ADD COLUMN     "payment_type" "PaymentType" NOT NULL DEFAULT 'MONTHLY',
ADD COLUMN     "start_date" TIMESTAMP(3);
