import TelegramBot from 'node-telegram-bot-api';
import { prisma } from '@/config/database';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

// Bot instances cache (one per userId/token)
const botCache = new Map<string, TelegramBot>();

/**
 * Get or create a TelegramBot instance for a given token
 */
function getBot(token: string): TelegramBot {
  if (!botCache.has(token)) {
    const bot = new TelegramBot(token, { polling: false });
    botCache.set(token, bot);
  }
  return botCache.get(token)!;
}

/**
 * Send a Telegram message to a chat ID
 */
export async function sendTelegram(
  token: string,
  chatId: string,
  text: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const bot = getBot(token);
    await bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}

/**
 * Validate bot token by calling getMe
 */
export async function validateBotToken(token: string): Promise<{
  ok: boolean;
  botName?: string;
  error?: string;
}> {
  try {
    // Clear cached bot if token changed
    botCache.delete(token);
    const bot = getBot(token);
    const me = await bot.getMe();
    return { ok: true, botName: me.username };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}

/**
 * Get user's Telegram settings
 */
export async function getUserTelegramSettings(userId: string) {
  const settings = await db.settings.findUnique({ where: { userId } });
  return {
    enabled: settings?.telegramEnabled ?? false,
    token: settings?.telegramBotToken ?? null,
    adminChatId: settings?.telegramAdminChatId ?? null,
    paymentReminderEnabled: settings?.paymentReminderEnabled ?? true,
    attendanceAlertEnabled: settings?.attendanceAlertEnabled ?? true,
    reminderDaysBefore: settings?.reminderDaysBefore ?? 3,
  };
}

/**
 * Log a notification attempt to DB
 */
export async function logNotification(params: {
  userId: string;
  channel: 'TELEGRAM' | 'SYSTEM' | 'SMS';
  status: 'SENT' | 'FAILED' | 'PENDING';
  recipientName: string;
  recipientId?: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  errorMessage?: string;
}): Promise<void> {
  try {
    await db.notificationLog.create({
      data: {
        ...params,
        sentAt: params.status === 'SENT' ? new Date() : null,
      },
    });
  } catch (err) {
    console.error('[NotificationLog] Failed to log:', err);
  }
}

/**
 * Send Telegram + log result
 */
export async function sendAndLog(params: {
  userId: string;
  token: string;
  chatId: string;
  recipientName: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
}): Promise<boolean> {
  const result = await sendTelegram(params.token, params.chatId, params.message);

  await logNotification({
    userId: params.userId,
    channel: 'TELEGRAM',
    status: result.ok ? 'SENT' : 'FAILED',
    recipientName: params.recipientName,
    recipientId: params.chatId,
    title: params.title,
    message: params.message,
    entityType: params.entityType,
    entityId: params.entityId,
    errorMessage: result.error,
  });

  return result.ok;
}
