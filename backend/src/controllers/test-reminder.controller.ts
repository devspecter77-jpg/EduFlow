import { Request, Response } from 'express';
import { prisma } from '@/config/database';
import { sendAndLog } from '@/services/telegram.service';
import { createNotification } from '@/services/notification.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

/**
 * Test payment reminder - manually trigger for a specific student
 */
export async function testPaymentReminder(req: Request, res: Response): Promise<void> {
  try {
    const { studentId } = req.body;
    const userId = req.user?.userId;

    if (!studentId) {
      res.status(400).json({ success: false, message: 'Student ID kerak' });
      return;
    }

    // Get student
    const student = await db.student.findUnique({
      where: { id: studentId },
      include: {
        user: {
          include: {
            settings: true,
          },
        },
      },
    });

    if (!student) {
      res.status(404).json({ success: false, message: 'Student topilmadi' });
      return;
    }

    // Check authorization
    if (student.userId !== userId) {
      res.status(403).json({ success: false, message: 'Ruxsat yo\'q' });
      return;
    }

    const settings = student.user.settings;
    const paymentDate = student.nextPaymentDate ? new Date(student.nextPaymentDate) : new Date();
    const formattedDate = paymentDate.toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const amount = student.paymentAmount?.toLocaleString('uz-UZ') || '0';

    // 1. Send CRM notification
    await createNotification({
      userId: student.userId,
      type: 'PAYMENT_OVERDUE',
      title: "To'lov eslatmasi (Test)",
      message: `${student.fullName}: Ertaga (${formattedDate}) ${amount} so'm to'lov muddati`,
      entityType: 'Student',
      entityId: student.id,
    });

    let telegramSent = false;

    // 2. Send Telegram notification if configured
    if (settings?.telegramEnabled && settings?.paymentReminderEnabled && settings?.telegramBotToken && student.telegramId) {
      const message = `
🔔 <b>To'lov eslatmasi (Test)</b>

👨‍🎓 O'quvchi: <b>${student.fullName}</b>
💰 Summa: <b>${amount} so'm</b>
📅 Sana: <b>${formattedDate}</b>

⏰ To'lov muddati ertaga! Iltimos, o'z vaqtida to'lovni amalga oshiring.

Savol bo'lsa, biz bilan bog'laning: ${student.user.phone || '+998 XX XXX XX XX'}
      `.trim();

      const result = await sendAndLog({
        userId: student.userId,
        token: settings.telegramBotToken,
        chatId: student.telegramId,
        recipientName: student.parentFullName || student.fullName,
        title: "To'lov eslatmasi (Test)",
        message,
        entityType: 'Student',
        entityId: student.id,
      });

      telegramSent = result;
    }

    res.json({
      success: true,
      message: 'Test eslatma yuborildi',
      data: {
        crmNotification: true,
        telegramNotification: telegramSent,
        studentName: student.fullName,
        telegramId: student.telegramId,
      },
    });
  } catch (error) {
    console.error('[TestReminder] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Eslatma yuborishda xatolik',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
