-- AlterTable
ALTER TABLE "students" ADD COLUMN     "paid_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "remaining_amount" DOUBLE PRECISION NOT NULL DEFAULT 0;
