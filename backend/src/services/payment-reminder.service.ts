import { prisma } from '@/config/database';
import { sendAndLog } from './telegram.service';
import { createNotification } from './notification.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

/**
 * Check all students and send payment reminders 1 day before due date
 */
export async function sendPaymentReminders(): Promise<void> {
  try {
    console.log('[PaymentReminder] Starting daily check...');

    // Get all active students with upcoming payments (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    const students = await db.student.findMany({
      where: {
        isDeleted: false,
        status: 'ACTIVE',
        nextPaymentDate: {
          gte: tomorrow,
          lt: dayAfterTomorrow,
        },
      },
      include: {
        user: {
          include: {
            settings: true,
          },
        },
      },
    });

    console.log(`[PaymentReminder] Found ${students.length} students with payments due tomorrow`);

    for (const student of students) {
      try {
        await sendReminderForStudent(student);
      } catch (err) {
        console.error(`[PaymentReminder] Error processing student ${student.id}:`, err);
      }
    }

    console.log('[PaymentReminder] Daily check completed');
  } catch (err) {
    console.error('[PaymentReminder] Error in sendPaymentReminders:', err);
  }
}

/**
 * Send reminder to admin (CRM notification) and parent (Telegram)
 */
async function sendReminderForStudent(student: any): Promise<void> {
  const userId = student.userId;
  const settings = student.user.settings;

  // Format payment info
  const paymentDate = new Date(student.nextPaymentDate);
  const formattedDate = paymentDate.toLocaleDateString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const amount = student.paymentAmount?.toLocaleString('uz-UZ') || '0';

  // 1. Send CRM notification to admin
  await createNotification({
    userId,
    type: 'PAYMENT_OVERDUE',
    title: "To'lov eslatmasi",
    message: `${student.fullName}: Ertaga (${formattedDate}) ${amount} so'm to'lov muddati`,
    entityType: 'Student',
    entityId: student.id,
  });

  // 2. Send Telegram notification to parent (if configured)
  if (settings?.telegramEnabled && settings?.paymentReminderEnabled) {
    const token = settings.telegramBotToken;
    const parentTelegramId = student.telegramId;

    if (token && parentTelegramId) {
      const message = `
🔔 <b>To'lov eslatmasi</b>

👨‍🎓 O'quvchi: <b>${student.fullName}</b>
💰 Summa: <b>${amount} so'm</b>
📅 Sana: <b>${formattedDate}</b>

⏰ To'lov muddati ertaga! Iltimos, o'z vaqtida to'lovni amalga oshiring.

Savol bo'lsa, biz bilan bog'laning: ${student.user.phone || '+998 XX XXX XX XX'}
      `.trim();

      await sendAndLog({
        userId,
        token,
        chatId: parentTelegramId,
        recipientName: student.parentFullName || student.fullName,
        title: "To'lov eslatmasi",
        message,
        entityType: 'Student',
        entityId: student.id,
      });
    }
  }
}

/**
 * Check and send reminders for overdue payments
 */
export async function sendOverduePaymentNotifications(): Promise<void> {
  try {
    console.log('[PaymentReminder] Checking overdue payments...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const students = await db.student.findMany({
      where: {
        isDeleted: false,
        status: 'ACTIVE',
        nextPaymentDate: {
          lt: today,
        },
        paymentStatus: {
          in: ['PENDING', 'PARTIAL'],
        },
      },
      include: {
        user: {
          include: {
            settings: true,
          },
        },
      },
    });

    console.log(`[PaymentReminder] Found ${students.length} students with overdue payments`);

    for (const student of students) {
      try {
        await sendOverdueNotification(student);
      } catch (err) {
        console.error(`[PaymentReminder] Error processing overdue for student ${student.id}:`, err);
      }
    }

    console.log('[PaymentReminder] Overdue check completed');
  } catch (err) {
    console.error('[PaymentReminder] Error in sendOverduePaymentNotifications:', err);
  }
}

/**
 * Send overdue notification
 */
async function sendOverdueNotification(student: any): Promise<void> {
  const userId = student.userId;
  const settings = student.user.settings;

  const daysOverdue = Math.floor(
    (new Date().getTime() - new Date(student.nextPaymentDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  const amount = student.remainingAmount?.toLocaleString('uz-UZ') || '0';

  // 1. CRM notification
  await createNotification({
    userId,
    type: 'PAYMENT_OVERDUE',
    title: "To'lov muddati o'tgan",
    message: `${student.fullName}: ${amount} so'm qarzdorlik (${daysOverdue} kun o'tgan)`,
    entityType: 'Student',
    entityId: student.id,
  });

  // 2. Telegram to parent
  if (settings?.telegramEnabled && settings?.paymentReminderEnabled) {
    const token = settings.telegramBotToken;
    const parentTelegramId = student.telegramId;

    if (token && parentTelegramId) {
      const message = `
⚠️ <b>To'lov muddati o'tgan!</b>

👨‍🎓 O'quvchi: <b>${student.fullName}</b>
💰 Qarzdorlik: <b>${amount} so'm</b>
📅 ${daysOverdue} kun o'tgan

Iltimos, imkon qadar tezroq to'lovni amalga oshiring.

Savol bo'lsa, biz bilan bog'laning: ${student.user.phone || '+998 XX XXX XX XX'}
      `.trim();

      await sendAndLog({
        userId,
        token,
        chatId: parentTelegramId,
        recipientName: student.parentFullName || student.fullName,
        title: "To'lov muddati o'tgan",
        message,
        entityType: 'Student',
        entityId: student.id,
      });
    }
  }
}
