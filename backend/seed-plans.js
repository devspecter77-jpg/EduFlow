const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedPlans() {
  console.log('🌱 Seeding plans...');

  // Check if plans exist
  const existingPlans = await prisma.plan.findMany();
  if (existingPlans.length > 0) {
    console.log('✅ Plans already exist. Skipping...');
    return;
  }

  // Create plans
  const plans = [
    {
      type: 'FREE',
      name: 'Sinov (Trial)',
      price: 0,
      maxStudents: 50,
      maxTeachers: 3,
      maxGroups: 5,
      trialDays: 10, // 10 days trial
      features: JSON.stringify([
        'Asosiy CRM funksiyalari',
        'Davomat nazorati',
        "To'lovlarni boshqarish",
        'Telegram bot',
        '10 kun bepul sinov',
      ]),
      isActive: true,
    },
    {
      type: 'PREMIUM',
      name: 'Premium',
      price: 200000, // 200,000 UZS/month
      maxStudents: 1000, // Large limit
      maxTeachers: 50,
      maxGroups: 100,
      trialDays: 0,
      features: JSON.stringify([
        'Barcha funksiyalar',
        'Analitika va hisobotlar',
        'Excel/PDF export',
        'SMS va Telegram bildirishnomalar',
        'Texnik yordam',
        'Cheksiz darajada o\'quvchilar',
        'API integratsiya',
      ]),
      isActive: true,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.create({ data: plan });
    console.log(`✅ Created: ${plan.name}`);
  }

  console.log('🎉 Plans seeded successfully!');
}

seedPlans()
  .catch((e) => {
    console.error('❌ Error seeding plans:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
