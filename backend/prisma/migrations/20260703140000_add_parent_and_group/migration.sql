-- AlterTable
ALTER TABLE "students" ADD COLUMN     "parent_full_name" TEXT,
ADD COLUMN     "group_id" TEXT;

-- CreateIndex
CREATE INDEX "students_group_id_idx" ON "students"("group_id");
