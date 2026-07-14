import app from './app';
import { env, testDatabaseConnection, disconnectDatabase } from '@/config';
import { startCronJobs } from '@/services/cron.service';
import { startBotPolling, stopBotPolling } from '@/services/bot.service';

const PORT = env.PORT || 5000;
const MAX_DB_RETRIES = 10;
const DB_RETRY_DELAY_MS = 8000;

/**
 * Wait helper
 */
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Try to connect to database with retries
 */
const connectWithRetry = async (): Promise<boolean> => {
  for (let attempt = 1; attempt <= MAX_DB_RETRIES; attempt++) {
    process.stdout.write(`[DB] Connection attempt ${attempt}/${MAX_DB_RETRIES}...\n`);
    const connected = await testDatabaseConnection();
    if (connected) return true;

    if (attempt < MAX_DB_RETRIES) {
      process.stdout.write(`[DB] Retrying in ${DB_RETRY_DELAY_MS / 1000}s...\n`);
      await wait(DB_RETRY_DELAY_MS);
    }
  }
  return false;
};

/**
 * Start Express server
 */
const startServer = async (): Promise<void> => {
  try {
    const dbConnected = await connectWithRetry();

    if (!dbConnected) {
      process.stderr.write('[ERROR] Failed to connect to database after all retries. Exiting...\n');
      process.exit(1);
    }

    const server = app.listen(PORT, () => {
      process.stdout.write(`[SERVER] Started on port ${PORT} | ENV: ${env.NODE_ENV} | API: ${env.API_PREFIX}\n`);
      // Start cron jobs after server is ready
      startCronJobs();
      // Start Telegram bot polling
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (botToken) {
        startBotPolling(botToken);
      }
    });

    const gracefulShutdown = async (signal: string): Promise<void> => {
      process.stdout.write(`[SERVER] ${signal} received. Shutting down...\n`);
      stopBotPolling();
      server.close(async () => {
        await disconnectDatabase();
        process.stdout.write('[SERVER] Graceful shutdown completed\n');
        process.exit(0);
      });

      setTimeout(() => {
        process.stderr.write('[SERVER] Forcing shutdown after timeout\n');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('uncaughtException', (error: Error) => {
      process.stderr.write(`[ERROR] Uncaught Exception: ${error.message}\n`);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason: unknown) => {
      process.stderr.write(`[ERROR] Unhandled Rejection: ${reason}\n`);
      process.exit(1);
    });
  } catch (error) {
    process.stderr.write(`[ERROR] Failed to start server: ${error}\n`);
    process.exit(1);
  }
};

// Start the server
startServer();
