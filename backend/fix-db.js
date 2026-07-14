// Fix: make teacher_id optional in groups table
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Run raw SQL to make teacher_id nullable
    await prisma.$executeRawUnsafe('ALTER TABLE "public"."groups" ALTER COLUMN "teacher_id" DROP NOT NULL');
    console.log('SUCCESS: teacher_id is now nullable in groups table');
    
    // Also mark migration as applied
    await prisma.$executeRawUnsafe(`
      INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
      VALUES (
        gen_random_uuid()::text,
        'manual',
        NOW(),
        '20260704120000_make_teacher_optional_in_group',
        NULL,
        NULL,
        NOW(),
        1
      ) ON CONFLICT (migration_name) DO NOTHING
    `);
    console.log('Migration recorded');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
