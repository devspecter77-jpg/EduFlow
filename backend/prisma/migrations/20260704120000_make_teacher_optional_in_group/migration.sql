-- Make teacher_id optional in groups table
ALTER TABLE "public"."groups" ALTER COLUMN "teacher_id" DROP NOT NULL;
