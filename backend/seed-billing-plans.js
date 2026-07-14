/**
 * Seed Billing Plans for Step 15
 * Run: node backend/seed-billing-plans.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding billing plans...');

  // 1. Trial Plan
  const trialPlan = await prisma.plan.upsert({
    where: { type: 'TRIAL' },
    update: {},
    create: {
      type: 'TRIAL',
      name: 'Sinov',
      durationMonths: 0,
      price: 0,
      maxStudents: 50,
      maxTeachers: 5,
      maxGroups: 5,
      features: JSON.stringify([
        '10 kunlik bepul sinov',
        'Barcha funksiyalar',
        'SMS xabarnomalar',
        'Telegram bot',
        'Online support',
      ]),
      description: '10 kunlik bepul sinov davri. Barcha funksiyalardan foydalanish.',
      isActive: true,
    },
  });
  console.log('✅ Trial Plan:', trialPlan.id);

  // 2. Premium Plan
  const premiumPlan = await prisma.plan.upsert({
    where: { type: 'PREMIUM' },
    update: {},
    create: {
      type: 'PREMIUM',
      name: 'Premium',
      durationMonths: 1,
      price: 200000,
      maxStudents: 200,
      maxTeachers: 20,
      maxGroups: 30,
      features: JSON.stringify([
        'Cheklanmagan o\'quvchilar',
        'Cheklanmagan guruhlar',
        'Excel import/export',
        'SMS xabarnomalar',
        'Telegram bot integratsiya',
        'To\'lov izlash',
        'Davomat tizimi',
        'Hisobotlar',
        'Priority support',
        '24/7 yordam',
      ]),
      description: '30 kunlik Premium obuna. Barcha Professional funksiyalar.',
      isActive: true,
    },
  });
  console.log('✅ Premium Plan:', premiumPlan.id);

  console.log('\n✅ Seeding completed successfully!');
  console.log('\nPlans:');
  console.log('- Trial: 10 days free, 50 students, 5 teachers, 5 groups');
  console.log('- Premium: 200,000 UZS/month, 200 students, 20 teachers, 30 groups');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding plans:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

