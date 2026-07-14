const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creating admin user...');

  const hashedPassword = await bcrypt.hash('Admin123456', 10);

  const user = await prisma.user.create({
    data: {
      centerName: 'EduFlow Academy',
      fullName: 'Admin User',
      phone: '+998901234567',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true
    }
  });

  await prisma.settings.create({
    data: {
      userId: user.id,
      centerName: 'EduFlow Academy',
      phone: '+998901234567'
    }
  });

  console.log('✅ Admin user created!');
  console.log('📱 Phone: +998901234567');
  console.log('🔑 Password: Admin123456');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
