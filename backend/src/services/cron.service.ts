import cron from 'node-cron';
import { prisma } from '@/config/database';
import { getUserTelegramSettings, sendAndLog } from './telegram.service';
import { checkExpiringSubscriptions, suspendExpiredSubscriptions } from './subscriptionCron.service';
import { createNotification } from './notification.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

/**
 * Format date for Uzbek locale display
 */
function fmtDate(d: Date): string {
  return d.toLocaleDateString('uz-UZ');
}

/**
 * JOB 1: Payment Reminders
 * Runs every day at 09:00
 * Notifies students/parents whose payment is due in 1 day (tomorrow)
 */
async function runPaymentReminders(): Promise<void> {
  process.stdout.write('[CRON] Running payment reminders...\n');

  try {
    // Get all users with telegram enabled
    const configs = await db.settings.findMany({
      where: { telegramEnabled: true, telegramBotToken: { not: null }, paymentReminderEnabled: true },
      select: {
        userId: true,
        telegramBotToken: true,
        user: {
          select: {
            phone: true,
            centerName: true,
          },
        },
      },
    });

    for (const config of configs) {
      // Calculate tomorrow's date range
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      // Find students with payment due tomorrow and telegramId
      const students = await db.student.findMany({
        where: {
          userId: config.userId,
          isDeleted: false,
          status: 'ACTIVE',
          telegramId: { not: null },
          nextPaymentDate: {
            gte: tomorrow,
            lt: dayAfterTomorrow,
          },
        },
        select: {
          id: true,
          fullName: true,
          parentFullName: true,
          telegramId: true,
          paymentAmount: true,
          nextPaymentDate: true,
        },
      });

      process.stdout.write(`[CRON] Found ${students.length} students with payments due tomorrow for user ${config.userId}\n`);

      for (const student of students) {
        const dueDate = new Date(student.nextPaymentDate);
        const centerPhone = config.user?.phone || '+998 XX XXX XX XX';

        // Message for parent
        const msg =
          `🔔 <b>To'lov eslatmasi</b>\n\n` +
          `👨‍🎓 O'quvchi: <b>${student.fullName}</b>\n` +
          `💰 Summa: <b>${(student.paymentAmount || 0).toLocaleString('uz-UZ')} so'm</b>\n` +
          `📅 Sana: <b>${fmtDate(dueDate)}</b>\n\n` +
          `⏰ To'lov muddati ertaga! Iltimos, o'z vaqtida to'lovni amalga oshiring.\n\n` +
          `Savol bo'lsa, biz bilan bog'laning: ${centerPhone}`;

        await sendAndLog({
          userId: config.userId,
          token: config.telegramBotToken,
          chatId: student.telegramId,
          recipientName: student.parentFullName || student.fullName,
          title: "To'lov eslatmasi",
          message: msg,
          entityType: 'Student',
          entityId: student.id,
        });
      }
    }
  } catch (err) {
    console.error('[CRON] Payment reminder error:', err);
  }
}

/**
 * JOB 2: Overdue Payment Notifications
 * Runs every day at 10:00
 * Notifies students whose payment is overdue
 */
async function runOverdueNotifications(): Promise<void> {
  process.stdout.write('[CRON] Running overdue notifications...\n');

  try {
    const configs = await db.settings.findMany({
      where: { telegramEnabled: true, telegramBotToken: { not: null }, paymentReminderEnabled: true },
      select: { userId: true, telegramBotToken: true },
    });

    for (const config of configs) {
      const students = await db.student.findMany({
        where: {
          userId: config.userId,
          isDeleted: false,
          status: 'ACTIVE',
          telegramId: { not: null },
          paymentStatus: 'OVERDUE',
        },
        select: {
          id: true,
          fullName: true,
          telegramId: true,
          remainingAmount: true,
        },
      });

      for (const student of students) {
        const msg =
          `⚠️ <b>To'lov muddati o'tdi!</b>\n\n` +
          `👤 ${student.fullName},\n` +
          `💸 Qarz miqdori: <b>${(student.remainingAmount || 0).toLocaleString('uz-UZ')} so'm</b>\n\n` +
          `Iltimos, imkon qadar tezroq to'lovni amalga oshiring.\n` +
          `📞 Batafsil ma'lumot uchun markaz bilan bog'laning.`;

        await sendAndLog({
          userId: config.userId,
          token: config.telegramBotToken,
          chatId: student.telegramId,
          recipientName: student.fullName,
          title: "To'lov muddati o'tdi",
          message: msg,
          entityType: 'Student',
          entityId: student.id,
        });
      }
    }
  } catch (err) {
    console.error('[CRON] Overdue notification error:', err);
  }
}

/**
 * Notifies the owning admin about every entity in `entities` whose
 * birthDate matches today's month/day. Shared by the student and
 * teacher birthday checks below so the matching + notification logic
 * isn't duplicated per entity type.
 */
async function notifyBirthdaysToday(
  entities: Array<{ id: string; userId: string; fullName: string; birthDate: Date | string }>,
  entityType: 'Student' | 'Teacher',
  today: Date,
  todayMonth: number,
  todayDay: number,
): Promise<number> {
  const matches = entities.filter((entity) => {
    const bday = new Date(entity.birthDate);
    return bday.getMonth() + 1 === todayMonth && bday.getDate() === todayDay;
  });

  for (const entity of matches) {
    const age = today.getFullYear() - new Date(entity.birthDate).getFullYear();

    await createNotification({
      userId: entity.userId,
      type: 'SYSTEM',
      title: "🎂 Tug'ilgan kun",
      message: `${entity.fullName}ning bugun tug'ilgan kuni! ${age} yoshga to'ldi. Tabriklaymiz! 🎉`,
      entityType,
      entityId: entity.id,
    });
  }

  return matches.length;
}

/**
 * JOB 3: Birthday Notifications
 * Runs every day at 08:00
 * Notifies admins about students' AND teachers' birthdays
 */
async function sendBirthdayNotifications(): Promise<void> {
  process.stdout.write('[CRON] Checking student and teacher birthdays...\n');

  try {
    const today = new Date();
    const todayMonth = today.getMonth() + 1; // 1-12
    const todayDay = today.getDate(); // 1-31

    // Students
    const students = await db.student.findMany({
      where: {
        isDeleted: false,
        status: 'ACTIVE',
        birthDate: { not: null },
      },
      select: {
        id: true,
        userId: true,
        fullName: true,
        birthDate: true,
      },
    });
    const studentCount = await notifyBirthdaysToday(students, 'Student', today, todayMonth, todayDay);
    process.stdout.write(`[CRON] Found ${studentCount} students with birthdays today\n`);

    // Teachers
    const teachers = await db.teacher.findMany({
      where: {
        isDeleted: false,
        status: 'ACTIVE',
        birthDate: { not: null },
      },
      select: {
        id: true,
        userId: true,
        fullName: true,
        birthDate: true,
      },
    });
    const teacherCount = await notifyBirthdaysToday(teachers, 'Teacher', today, todayMonth, todayDay);
    process.stdout.write(`[CRON] Found ${teacherCount} teachers with birthdays today\n`);
  } catch (err) {
    console.error('[CRON] Birthday notification error:', err);
  }
}

/**
 * JOB 4: Attendance Alerts
 * Runs every day at 20:00
 * Notifies parents of absent students
 */
export async function sendAttendanceAlert(
  userId: string,
  studentId: string,
  studentName: string,
  groupName: string,
  telegramId: string,
): Promise<void> {
  const settings = await getUserTelegramSettings(userId);
  if (!settings.enabled || !settings.token || !settings.attendanceAlertEnabled) return;

  const msg =
    `📋 <b>Davomat xabari</b>\n\n` +
    `👤 ${studentName} bugun darsga <b>kelmadi</b>.\n` +
    `📚 Guruh: <b>${groupName}</b>\n` +
    `📅 Sana: <b>${fmtDate(new Date())}</b>\n\n` +
    `Sababi bo'lsa, markaz bilan bog'laning.`;

  await sendAndLog({
    userId,
    token: settings.token,
    chatId: telegramId,
    recipientName: studentName,
    title: 'Davomat xabari',
    message: msg,
    entityType: 'Student',
    entityId: studentId,
  });
}

/**
 * Start all cron jobs
 */
export function startCronJobs(): void {
  // Payment reminders — every day at 09:00
  cron.schedule('0 9 * * *', runPaymentReminders, {
    timezone: 'Asia/Tashkent',
  });

  // Overdue notifications — every day at 10:00
  cron.schedule('0 10 * * *', runOverdueNotifications, {
    timezone: 'Asia/Tashkent',
  });

  // Birthday notifications — every day at 08:00
  cron.schedule('0 8 * * *', sendBirthdayNotifications, {
    timezone: 'Asia/Tashkent',
  });

  // Subscription expiry notifications — every day at 08:00
  cron.schedule('0 8 * * *', checkExpiringSubscriptions, {
    timezone: 'Asia/Tashkent',
  });

  // Suspend expired subscriptions — every day at 00:00 (midnight)
  cron.schedule('0 0 * * *', suspendExpiredSubscriptions, {
    timezone: 'Asia/Tashkent',
  });

  process.stdout.write('[CRON] Jobs started: birthday (08:00), payment-reminder (09:00), overdue (10:00), subscription-expiry (08:00), suspend-expired (00:00)\n');
}
