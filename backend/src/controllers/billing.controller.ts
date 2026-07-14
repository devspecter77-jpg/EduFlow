/**
 * Billing Controller — Step 15
 * Handles subscription info for center admins and payment requests
 */
import type { Request, Response } from 'express';
import { prisma } from '@/config/database';
import { sendSuccess, sendError } from '@/utils/response';

const db = prisma as any;

// ─── Admin: Get my subscription info ──────────────────────────────────────
export async function getMySubscription(req: Request, res: Response): Promise<void> {
  try {
    const centerId = req.user!.centerId;
    if (!centerId) {
      sendError(res, 'Markaz topilmadi', 404);
      return;
    }

    const center = await db.center.findUnique({
      where: { id: centerId },
      include: {
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { plan: true },
        },
      },
    });

    if (!center) {
      sendError(res, 'Markaz topilmadi', 404);
      return;
    }

    const subscription = center.subscriptions[0] || null;
    const now = new Date();
    let daysLeft = 0;

    if (subscription) {
      const endDate = new Date(subscription.endDate);
      daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    }

    sendSuccess(res, {
      center: {
        id: center.id,
        name: center.name,
        status: center.status,
      },
      subscription,
      daysLeft,
      isExpired: subscription ? new Date(subscription.endDate) < now : true,
      isTrial: subscription?.status === 'TRIAL',
      isActive: subscription?.status === 'ACTIVE',
    }, 'Obuna ma\'lumotlari');
  } catch (err) {
    console.error('[BILLING] getMySubscription error:', err);
    sendError(res, 'Obuna ma\'lumotlarini yuklashda xatolik', 500);
  }
}

// ─── Admin: Submit payment request ────────────────────────────────────────
export async function createPaymentRequest(req: Request, res: Response): Promise<void> {
  try {
    const centerId = req.user!.centerId;
    if (!centerId) {
      sendError(res, 'Markaz topilmadi', 404);
      return;
    }

    const { amount, receiptImage, notes } = req.body;

    if (!amount || amount <= 0) {
      sendError(res, 'To\'lov miqdori kiritilishi shart', 400);
      return;
    }

    // Check for existing pending request
    const existing = await db.paymentRequest.findFirst({
      where: { centerId, status: 'PENDING' },
    });

    if (existing) {
      sendError(res, 'Sizning kutilayotgan to\'lov so\'rovingiz allaqachon mavjud', 400);
      return;
    }

    const request = await db.paymentRequest.create({
      data: {
        centerId,
        amount: Number(amount),
        receiptImage: receiptImage || null,
        notes: notes || null,
        status: 'PENDING',
        method: 'MANUAL',
      },
    });

    sendSuccess(res, request, 'To\'lov so\'rovi yuborildi. Administrator tez orada ko\'rib chiqadi.', 201);
  } catch (err) {
    console.error('[BILLING] createPaymentRequest error:', err);
    sendError(res, 'To\'lov so\'rovini yuborishda xatolik', 500);
  }
}

// ─── Admin: Get my payment history ────────────────────────────────────────
export async function getMyPaymentRequests(req: Request, res: Response): Promise<void> {
  try {
    const centerId = req.user!.centerId;
    if (!centerId) {
      sendError(res, 'Markaz topilmadi', 404);
      return;
    }

    const requests = await db.paymentRequest.findMany({
      where: { centerId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    sendSuccess(res, requests, 'To\'lov tarixi');
  } catch (err) {
    console.error('[BILLING] getMyPaymentRequests error:', err);
    sendError(res, 'To\'lov tarixini yuklashda xatolik', 500);
  }
}

// ─── SuperAdmin: List all payment requests ────────────────────────────────
export async function listPaymentRequests(req: Request, res: Response): Promise<void> {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      db.paymentRequest.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          center: {
            include: {
              users: {
                where: { role: 'ADMIN' },
                select: { id: true, fullName: true, phone: true },
                take: 1,
              },
            },
          },
        },
      }),
      db.paymentRequest.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error('[BILLING] listPaymentRequests error:', err);
    sendError(res, 'To\'lov so\'rovlarini yuklashda xatolik', 500);
  }
}

// ─── SuperAdmin: Approve payment request ──────────────────────────────────
export async function approvePaymentRequest(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const adminId = req.user!.userId;

    const paymentRequest = await db.paymentRequest.findUnique({
      where: { id },
      include: { center: { include: { subscriptions: { orderBy: { createdAt: 'desc' }, take: 1, include: { plan: true } } } } },
    });

    if (!paymentRequest) {
      sendError(res, 'To\'lov so\'rovi topilmadi', 404);
      return;
    }
    if (paymentRequest.status !== 'PENDING') {
      sendError(res, 'Bu so\'rov allaqachon ko\'rib chiqilgan', 400);
      return;
    }

    // Get premium plan
    const premiumPlan = await db.plan.findFirst({
      where: { type: 'PREMIUM' },
    });
    if (!premiumPlan) {
      sendError(res, 'Premium tarif topilmadi', 404);
      return;
    }

    const centerId = paymentRequest.centerId;
    const now = new Date();

    // Calculate new end date — extend from current end or from now
    const currentSub = paymentRequest.center?.subscriptions[0];
    const baseDate = currentSub && new Date(currentSub.endDate) > now
      ? new Date(currentSub.endDate)
      : now;

    const newEndDate = new Date(baseDate);
    newEndDate.setDate(newEndDate.getDate() + 30);

    // Transaction: approve request + create new subscription + unblock center
    await db.$transaction(async (tx: any) => {
      // 1. Mark payment request approved
      await tx.paymentRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedById: adminId,
          approvedAt: now,
        },
      });

      // 2. Create new ACTIVE subscription (30 days)
      await tx.subscription.create({
        data: {
          centerId,
          planId: premiumPlan.id,
          status: 'ACTIVE',
          startDate: now,
          endDate: newEndDate,
          price: paymentRequest.amount,
          notes: `To'lov #${id} tasdiqlandi`,
        },
      });

      // 3. Unblock center
      await tx.center.update({
        where: { id: centerId },
        data: { status: 'ACTIVE' },
      });

      // 4. Reactivate all center users
      await tx.user.updateMany({
        where: { centerId, isActive: false },
        data: { isActive: true },
      });
    });

    sendSuccess(res, null, 'To\'lov tasdiqlandi. 30 kunlik obuna faollashtirildi.');
  } catch (err) {
    console.error('[BILLING] approvePaymentRequest error:', err);
    sendError(res, 'To\'lovni tasdiqlashda xatolik', 500);
  }
}

// ─── SuperAdmin: Reject payment request ───────────────────────────────────
export async function rejectPaymentRequest(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { rejectionNote } = req.body;
    const adminId = req.user!.userId;

    const paymentRequest = await db.paymentRequest.findUnique({ where: { id } });
    if (!paymentRequest) {
      sendError(res, 'To\'lov so\'rovi topilmadi', 404);
      return;
    }
    if (paymentRequest.status !== 'PENDING') {
      sendError(res, 'Bu so\'rov allaqachon ko\'rib chiqilgan', 400);
      return;
    }

    await db.paymentRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionNote: rejectionNote || 'Sabab ko\'rsatilmagan',
        approvedById: adminId,
        approvedAt: new Date(),
      },
    });

    sendSuccess(res, null, 'To\'lov so\'rovi rad etildi.');
  } catch (err) {
    console.error('[BILLING] rejectPaymentRequest error:', err);
    sendError(res, 'To\'lovni rad etishda xatolik', 500);
  }
}

// ─── SuperAdmin: List all subscriptions ───────────────────────────────────
export async function listSubscriptions(req: Request, res: Response): Promise<void> {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      db.subscription.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          center: {
            include: {
              users: {
                where: { role: 'ADMIN' },
                select: { id: true, fullName: true, phone: true },
                take: 1,
              },
            },
          },
          plan: true,
        },
      }),
      db.subscription.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error('[BILLING] listSubscriptions error:', err);
    sendError(res, 'Obunalarni yuklashda xatolik', 500);
  }
}
