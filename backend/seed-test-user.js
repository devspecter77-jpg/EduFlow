const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Seeding test users...');

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { phone: '+998901234567' }
    });

    if (existingUser) {
      console.log('✅ Test user already exists');
      console.log('Phone: +998901234567');
      console.log('Password: Test123456');
      console.log('Role:', existingUser.role);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Test123456', 10);

    // Create test user
    const user = await prisma.user.create({
      data: {
        centerName: 'Test Academy',
        fullName: 'Test Admin',
        phone: '+998901234567',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true
      }
    });

    console.log('✅ Test user created successfully!');
    console.log('Phone: +998901234567');
    console.log('Password: Test123456');
    console.log('Role:', user.role);

    // Create settings for test user
    await prisma.settings.create({
      data: {
        userId: user.id,
        centerName: 'Test Academy',
        phone: '+998901234567',
        address: 'Toshkent, Chilonzor'
      }
    });

    console.log('✅ Settings created for test user');

  } catch (error) {
    console.error('❌ Error seeding:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
