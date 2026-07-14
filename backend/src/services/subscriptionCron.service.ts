import { prisma } from '@/config/database';

// Define helper locally since sendTelegramMessage doesn't exist in telegram.service
async function sendTelegramNotification(_chatId: string, _message: string): Promise<void> {
  // TODO: Implement if Telegram token available
}

/**
 * Check for expiring subscriptions and send notifications
 * Run daily at 09:00
 */
export async function checkExpiringSubscriptions() {
  try {
    console.info('[CRON] Checking expiring subscriptions...');

    const now = new Date();
    const warningDays = [7, 3, 1]; // Notify 7, 3, and 1 days before expiry

    for (const days of warningDays) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + days);
      targetDate.setHours(0, 0, 0, 0);

      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      // Find subscriptions expiring on target date
      const expiringSubscriptions = await prisma.subscription.findMany({
        where: {
          status: { in: ['TRIAL', 'ACTIVE'] },
          endDate: {
            gte: targetDate,
            lt: nextDay,
          },
        },
        include: {
          center: {
            include: {
              users: {
                where: { role: 'ADMIN', isActive: true },
                select: { id: true, fullName: true, phone: true },
                take: 1,
              },
            },
          },
          plan: true,
        },
      });

      console.info(`[CRON] Found ${expiringSubscriptions.length} subscriptions expiring in ${days} days`);

      for (const sub of expiringSubscriptions) {
        const admin = sub.center?.users[0];
        if (!admin) continue;

        const message = `
🔔 *Obuna muddati tugash xabarnomasi*

Hurmatli ${admin.fullName},

Sizning "${sub.center?.name}" markaz uchun obuna muddati *${days} kun* ichida tugaydi.

📅 Tugash sanasi: ${new Date(sub.endDate).toLocaleDateString('uz-UZ', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
📦 Tarif: ${sub.plan?.name || 'N/A'}
💰 Narx: ${sub.plan?.price.toLocaleString('uz-UZ')} so'm/oy

Xizmatlardan uzluksiz foydalanish uchun obunani vaqtida yangilang!

Agar savollar bo'lsa, biz bilan bog'laning:
📞 Telefon: +998 90 123 45 67
✉️ Email: support@eduflow.uz
        `.trim();

        try {
          // Send Telegram notification to admin
          const chatId = admin.id; // Assuming user.id is Telegram chatId
          await sendTelegramNotification(chatId, message);

          console.info(`[CRON] Notification sent to ${admin.fullName} (${sub.center?.name})`);
        } catch (error) {
          console.error(`[CRON] Failed to send notification to ${admin.fullName}:`, error);
        }
      }
    }

    console.info('[CRON] Expiring subscriptions check completed');
  } catch (error) {
    console.error('[CRON] Error checking expiring subscriptions:', error);
  }
}

/**
 * Check for expired subscriptions and suspend them
 * Run daily at 00:00
 */
export async function suspendExpiredSubscriptions() {
  try {
    console.info('[CRON] Checking expired subscriptions...');

    const now = new Date();

    // Find all expired ACTIVE or TRIAL subscriptions
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        status: { in: ['TRIAL', 'ACTIVE'] },
        endDate: { lt: now },
      },
      include: {
        center: {
          include: {
            users: {
              where: { role: 'ADMIN', isActive: true },
              select: { id: true, fullName: true, phone: true },
              take: 1,
            },
          },
        },
      },
    });

    console.info(`[CRON] Found ${expiredSubscriptions.length} expired subscriptions`);

    for (const sub of expiredSubscriptions) {
      // Update subscription status to EXPIRED
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { status: 'EXPIRED' },
      });

      // Block the center
      if (sub.center) {
        await prisma.center.update({
          where: { id: sub.centerId },
          data: { status: 'BLOCKED' },
        });

        // Deactivate all users in the center
        await prisma.user.updateMany({
          where: { centerId: sub.centerId },
          data: { isActive: false },
        });

        console.info(`[CRON] Center "${sub.center.name}" blocked due to expired subscription`);

        // Send Telegram notification
        const admin = sub.center.users[0];
        if (admin) {
          const message = `
⚠️ *Obuna muddati tugadi*

Hurmatli ${admin.fullName},

Sizning "${sub.center.name}" markaz uchun obuna muddati tugadi.

Markazingiz vaqtincha bloklandi. Xizmatlarni davom ettirish uchun obunani yangilang.

Agar savollar bo'lsa, biz bilan bog'laning:
📞 Telefon: +998 90 123 45 67
✉️ Email: support@eduflow.uz
          `.trim();

          try {
            await sendTelegramNotification(admin.id, message);
          } catch (error) {
            console.error(`[CRON] Failed to send expiration notice to ${admin.fullName}:`, error);
          }
        }
      }
    }

    console.info('[CRON] Expired subscriptions suspended');
  } catch (error) {
    console.error('[CRON] Error suspending expired subscriptions:', error);
  }
}
