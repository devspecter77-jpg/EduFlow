import { prisma } from '@/config/database';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

type NotificationType =
  | 'NEW_STUDENT' | 'NEW_GROUP' | 'PAYMENT_RECEIVED'
  | 'PAYMENT_OVERDUE' | 'CLASS_TODAY' | 'ATTENDANCE_MISSING' | 'SYSTEM';

interface CreateNotifInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
}

export async function createNotification(input: CreateNotifInput): Promise<void> {
  try {
    await db.notification.create({ data: input });
  } catch (err) {
    // notifications must never break main flow
    console.error('[Notification] Failed to create:', err);
  }
}

export async function notifyNewStudent(userId: string, studentName: string, studentId: string): Promise<void> {
  await createNotification({
    userId,
    type: 'NEW_STUDENT',
    title: "Yangi o'quvchi qo'shildi",
    message: `${studentName} tizimga qo'shildi`,
    entityType: 'Student',
    entityId: studentId,
  });
}

export async function notifyNewGroup(userId: string, groupName: string, groupId: string): Promise<void> {
  await createNotification({
    userId,
    type: 'NEW_GROUP',
    title: 'Yangi guruh yaratildi',
    message: `"${groupName}" guruhi yaratildi`,
    entityType: 'Group',
    entityId: groupId,
  });
}

export async function notifyPaymentReceived(
  userId: string, studentName: string, amount: number, paymentId: string,
): Promise<void> {
  await createNotification({
    userId,
    type: 'PAYMENT_RECEIVED',
    title: "To'lov qabul qilindi",
    message: `${studentName} tomonidan ${amount.toLocaleString('uz-UZ')} so'm to'landi`,
    entityType: 'Payment',
    entityId: paymentId,
  });
}

export async function notifyPaymentOverdue(
  userId: string, studentName: string, amount: number, studentId: string,
): Promise<void> {
  await createNotification({
    userId,
    type: 'PAYMENT_OVERDUE',
    title: "To'lov eslatmasi",
    message: `${studentName}: ${amount.toLocaleString('uz-UZ')} so'm to'lov yaqinlashmoqda`,
    entityType: 'Student',
    entityId: studentId,
  });
}

/**
 * Notify about payment reminder (1 day before due date)
 */
export async function notifyPaymentReminder(
  userId: string, studentName: string, amount: number, dueDate: string, studentId: string,
): Promise<void> {
  await createNotification({
    userId,
    type: 'PAYMENT_OVERDUE',
    title: "To'lov eslatmasi",
    message: `${studentName}: Ertaga (${dueDate}) ${amount.toLocaleString('uz-UZ')} so'm to'lov muddati`,
    entityType: 'Student',
    entityId: studentId,
  });
}
