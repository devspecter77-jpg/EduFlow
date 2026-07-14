import cron from 'node-cron';
import { sendPaymentReminders, sendOverduePaymentNotifications } from './payment-reminder.service';

/**
 * Initialize all scheduled jobs
 */
export function initializeScheduler(): void {
  console.log('[Scheduler] Initializing scheduled jobs...');

  // Run payment reminders daily at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('[Scheduler] Running payment reminder job...');
    await sendPaymentReminders();
  }, {
    timezone: 'Asia/Tashkent',
  });

  // Run overdue payment notifications daily at 10:00 AM
  cron.schedule('0 10 * * *', async () => {
    console.log('[Scheduler] Running overdue payment notification job...');
    await sendOverduePaymentNotifications();
  }, {
    timezone: 'Asia/Tashkent',
  });

  // For testing: Run every minute (comment out in production)
  // cron.schedule('* * * * *', async () => {
  //   console.log('[Scheduler] Running test job...');
  //   await sendPaymentReminders();
  // });

  console.log('[Scheduler] All jobs scheduled:');
  console.log('  - Payment reminders: Daily at 9:00 AM (Asia/Tashkent)');
  console.log('  - Overdue notifications: Daily at 10:00 AM (Asia/Tashkent)');
}
