import type { Request, Response } from 'express';
import { prisma } from '@/config/database';
import { validateBotToken, sendAndLog, getUserTelegramSettings } from '@/services/telegram.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export class SmartNotificationController {

  /**
   * GET /api/smart-notifications/history
   * Notification logs with pagination and filters
   */
  async getHistory(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;
    const channel = req.query.channel as string | undefined;

    const where: Record<string, unknown> = { userId };
    if (status) where.status = status;
    if (channel) where.channel = channel;

    const [data, total] = await Promise.all([
      db.notificationLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.notificationLog.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }

  /**
   * GET /api/smart-notifications/settings
   * Get Telegram notification settings
   */
  async getSettings(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const s = await getUserTelegramSettings(userId);
    res.json({ success: true, data: s });
  }

  /**
   * PATCH /api/smart-notifications/settings
   * Update Telegram notification settings
   */
  async updateSettings(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const {
      telegramEnabled,
      telegramBotToken,
      telegramAdminChatId,
      paymentReminderEnabled,
      attendanceAlertEnabled,
      reminderDaysBefore,
    } = req.body;

    await db.settings.update({
      where: { userId },
      data: {
        ...(typeof telegramEnabled === 'boolean' && { telegramEnabled }),
        ...(telegramBotToken !== undefined && { telegramBotToken }),
        ...(telegramAdminChatId !== undefined && { telegramAdminChatId }),
        ...(typeof paymentReminderEnabled === 'boolean' && { paymentReminderEnabled }),
        ...(typeof attendanceAlertEnabled === 'boolean' && { attendanceAlertEnabled }),
        ...(reminderDaysBefore !== undefined && { reminderDaysBefore: Number(reminderDaysBefore) }),
      },
    });

    res.json({ success: true, message: 'Sozlamalar saqlandi' });
  }

  /**
   * POST /api/smart-notifications/validate-bot
   * Validate Telegram Bot Token
   */
  async validateBot(req: Request, res: Response): Promise<void> {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ success: false, message: 'Token kiritilmagan' });
      return;
    }

    const result = await validateBotToken(token);
    res.json({ success: result.ok, botName: result.botName, error: result.error });
  }

  /**
   * POST /api/smart-notifications/send-test
   * Send a test Telegram message
   */
  async sendTest(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { chatId, message } = req.body;

    if (!chatId || !message) {
      res.status(400).json({ success: false, message: 'chatId va message talab qilinadi' });
      return;
    }

    const settings = await getUserTelegramSettings(userId);
    if (!settings.token) {
      res.status(400).json({ success: false, message: 'Bot token sozlanmagan' });
      return;
    }

    const ok = await sendAndLog({
      userId,
      token: settings.token,
      chatId,
      recipientName: 'Test',
      title: 'Test xabar',
      message,
      entityType: 'System',
    });

    res.json({ success: ok, message: ok ? 'Xabar yuborildi' : 'Yuborishda xatolik' });
  }

  /**
   * POST /api/smart-notifications/send-group
   * Send message to a group's students (with telegramId)
   */
  async sendToGroup(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { groupId, message, title } = req.body;

    if (!groupId || !message) {
      res.status(400).json({ success: false, message: 'groupId va message talab qilinadi' });
      return;
    }

    const settings = await getUserTelegramSettings(userId);
    if (!settings.enabled || !settings.token) {
      res.status(400).json({ success: false, message: 'Telegram sozlanmagan yoki o\'chirilgan' });
      return;
    }

    // Get students in group with telegramId
    const students = await db.student.findMany({
      where: {
        userId,
        isDeleted: false,
        status: 'ACTIVE',
        telegramId: { not: null },
        groups: { some: { groupId, isActive: true } },
      },
      select: { id: true, fullName: true, telegramId: true },
    });

    if (students.length === 0) {
      res.json({ success: true, sent: 0, message: 'Telegram ID ga ega faol o\'quvchi topilmadi' });
      return;
    }

    let sent = 0;
    let failed = 0;

    for (const student of students) {
      const ok = await sendAndLog({
        userId,
        token: settings.token,
        chatId: student.telegramId,
        recipientName: student.fullName,
        title: title || 'Guruh xabari',
        message,
        entityType: 'Student',
        entityId: student.id,
      });
      if (ok) sent++; else failed++;
    }

    res.json({ success: true, sent, failed, total: students.length });
  }

  /**
   * POST /api/smart-notifications/send-all
   * Send message to all active students (with telegramId)
   */
  async sendToAll(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { message, title } = req.body;

    if (!message) {
      res.status(400).json({ success: false, message: 'message talab qilinadi' });
      return;
    }

    const settings = await getUserTelegramSettings(userId);
    if (!settings.enabled || !settings.token) {
      res.status(400).json({ success: false, message: 'Telegram sozlanmagan yoki o\'chirilgan' });
      return;
    }

    const students = await db.student.findMany({
      where: { userId, isDeleted: false, status: 'ACTIVE', telegramId: { not: null } },
      select: { id: true, fullName: true, telegramId: true },
    });

    if (students.length === 0) {
      res.json({ success: true, sent: 0, message: 'Telegram ID ga ega faol o\'quvchi topilmadi' });
      return;
    }

    let sent = 0;
    let failed = 0;

    for (const student of students) {
      const ok = await sendAndLog({
        userId,
        token: settings.token,
        chatId: student.telegramId,
        recipientName: student.fullName,
        title: title || 'Umumiy xabar',
        message,
        entityType: 'Student',
        entityId: student.id,
      });
      if (ok) sent++; else failed++;
    }

    res.json({ success: true, sent, failed, total: students.length });
  }

  /**
   * GET /api/smart-notifications/stats
   * Notification statistics
   */
  async getStats(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;

    const [total, sent, failed, pending] = await Promise.all([
      db.notificationLog.count({ where: { userId } }),
      db.notificationLog.count({ where: { userId, status: 'SENT' } }),
      db.notificationLog.count({ where: { userId, status: 'FAILED' } }),
      db.notificationLog.count({ where: { userId, status: 'PENDING' } }),
    ]);

    // Students with telegramId
    const studentsWithTelegram = await db.student.count({
      where: { userId, isDeleted: false, telegramId: { not: null } },
    });

    res.json({
      success: true,
      data: { total, sent, failed, pending, studentsWithTelegram },
    });
  }
}

export const smartNotificationController = new SmartNotificationController();
