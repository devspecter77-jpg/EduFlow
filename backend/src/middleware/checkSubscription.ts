import type { Request, Response, NextFunction } from 'express';
import { prisma } from '@/config/database';

/**
 * Middleware: Subscription va trial muddatini tekshiradi.
 * - SUPER_ADMIN → bypass
 * - Trial davri (10 kun) → to'liq ruxsat
 * - Trial tugagan va EXPIRED subscription → GET ruxsat, CRUD (POST/PATCH/DELETE) block
 */
export async function checkSubscription(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user;

    // Super Admin bypass
    if (!user || user.role === 'SUPER_ADMIN') {
      return next();
    }

    // No centerId → legacy user, allow
    if (!user.centerId) {
      return next();
    }

    const center = await prisma.center.findUnique({
      where: { id: user.centerId },
      include: {
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!center) {
      res.status(404).json({ success: false, message: 'Markaz topilmadi' });
      return;
    }

    if (center.isDeleted) {
      res.status(403).json({ success: false, message: 'Markazingiz o\'chirilgan', code: 'CENTER_DELETED' });
      return;
    }

    // Check trial period (10 days from user creation)
    const userRecord = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { createdAt: true },
    });

    if (userRecord) {
      const trialEndDate = new Date(userRecord.createdAt);
      trialEndDate.setDate(trialEndDate.getDate() + 10);
      const now = new Date();

      // If still in trial period, allow all operations
      if (now <= trialEndDate) {
        return next();
      }
    }

    // Trial expired, check subscription
    const subscription = center.subscriptions[0];
    const now = new Date();
    const isExpired =
      !subscription ||
      new Date(subscription.endDate) < now ||
      subscription.status === 'EXPIRED' ||
      subscription.status === 'SUSPENDED' ||
      center.status === 'BLOCKED';

    if (isExpired) {
      // READ-ONLY mode: allow GET requests
      if (req.method === 'GET') {
        return next();
      }
      // Block all CRUD mutations
      res.status(403).json({
        success: false,
        message: 'Sinov muddatingiz tugagan. To\'lov qilgandan so\'ng barcha funksiyalar qayta ochiladi.',
        code: 'TRIAL_EXPIRED',
        isExpired: true,
      });
      return;
    }

    next();
  } catch (error) {
    console.error('[SUBSCRIPTION CHECK ERROR]', error);
    res.status(500).json({ success: false, message: 'Obunani tekshirishda xatolik' });
  }
}
