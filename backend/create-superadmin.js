const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Usage:
//   SUPER_ADMIN_PHONE=+998901234567 SUPER_ADMIN_PASSWORD=YourStrongPassword node create-superadmin.js
// If SUPER_ADMIN_PASSWORD is omitted, a random one is generated and printed once.
async function main() {
  console.log('🌱 Creating SUPER ADMIN user...');

  const phone = process.env.SUPER_ADMIN_PHONE;
  if (!phone) {
    console.error('❌ SUPER_ADMIN_PHONE environment variable is required.');
    console.error('   Example: SUPER_ADMIN_PHONE=+998901234567 SUPER_ADMIN_PASSWORD=YourStrongPassword node create-superadmin.js');
    process.exit(1);
  }

  const generatedPassword = crypto.randomBytes(9).toString('base64url');
  const password = process.env.SUPER_ADMIN_PASSWORD || generatedPassword;

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      centerName: 'System',
      fullName: 'Super Administrator',
      phone,
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true
    }
  });

  console.log('✅ SUPER ADMIN created!');
  console.log(`📱 Phone: ${phone}`);
  if (!process.env.SUPER_ADMIN_PASSWORD) {
    console.log(`🔑 Password (auto-generated — save it now, it will not be shown again): ${password}`);
  } else {
    console.log('🔑 Password: (the value you provided via SUPER_ADMIN_PASSWORD)');
  }
  console.log('');
  console.log('Access Super Admin Panel at: /super-admin');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
