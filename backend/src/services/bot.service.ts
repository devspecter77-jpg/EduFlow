import TelegramBot from 'node-telegram-bot-api';

let botInstance: TelegramBot | null = null;

export function startBotPolling(token: string): void {
  if (botInstance) {
    try { botInstance.stopPolling(); } catch { /* ignore */ }
  }

  botInstance = new TelegramBot(token, { polling: true });

  // /start command — chat ID ni ko'rsatadi
  botInstance.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from?.first_name || 'Foydalanuvchi';

    await botInstance!.sendMessage(
      chatId,
      `👋 Salom, <b>${firstName}</b>!\n\n` +
      `✅ EduFlow CRM bot ga xush kelibsiz.\n\n` +
      `📋 Sizning <b>Chat ID</b>: <code>${chatId}</code>\n\n` +
      `Bu ID ni o'quvchi profiliga kiriting — bildirishnomalar shu raqamga keladi.`,
      { parse_mode: 'HTML' }
    );
  });

  // /id command — faqat chat ID ko'rsatadi
  botInstance.onText(/\/id/, async (msg) => {
    const chatId = msg.chat.id;
    await botInstance!.sendMessage(
      chatId,
      `🆔 Sizning Chat ID: <code>${chatId}</code>`,
      { parse_mode: 'HTML' }
    );
  });

  // Polling error handler
  botInstance.on('polling_error', (err) => {
    // Suppress common polling errors silently
    if (err.message.includes('ETELEGRAM: 409')) {
      // Another instance running — stop this one
      try { botInstance?.stopPolling(); } catch { /* ignore */ }
    }
  });

  process.stdout.write(`[BOT] @EduFlow_nazorat_bot polling started\n`);
}

export function stopBotPolling(): void {
  if (botInstance) {
    try { botInstance.stopPolling(); } catch { /* ignore */ }
    botInstance = null;
  }
}
