/**
 * Script: Setup Telegram Bot Token for all users
 * Run: npx ts-node -r tsconfig-paths/register scripts/setup-telegram.ts
 */

import { PrismaClient } from '@prisma/client';
import TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

async function main() {
  if (!TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN not set in .env');
    process.exit(1);
  }

  // Validate token
  console.log('Validating bot token...');
  const bot = new TelegramBot(TOKEN, { polling: false });
  const me = await bot.getMe();
  console.log(`✅ Bot connected: @${me.username} (${me.first_name})`);

  // Update all settings records
  const result = await (prisma as any).settings.updateMany({
    data: {
      telegramEnabled: true,
      telegramBotToken: TOKEN,
      paymentReminderEnabled: true,
      attendanceAlertEnabled: true,
      reminderDaysBefore: 3,
    },
  });

  console.log(`✅ Updated ${result.count} user settings with Telegram token`);

  // List all users
  const users = await (prisma as any).user.findMany({
    select: { id: true, fullName: true, phone: true, centerName: true },
  });
  console.log(`\n📋 Users in system (${users.length} ta):`);
  users.forEach((u: any) => {
    console.log(`  - ${u.fullName} | ${u.centerName} | ${u.phone}`);
  });

  await prisma.$disconnect();
  console.log('\n✅ Done! Telegram bot ready to send messages.');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
