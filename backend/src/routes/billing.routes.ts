/**
 * Billing Routes — Step 15
 * Admin: view own subscription, submit payment request
 * SuperAdmin: manage all payment requests, subscriptions
 */
import { Router } from 'express';
import { authenticate } from '@/middleware/auth.middleware';
import asyncHandler from '@/middleware/asyncHandler';
import type { Request, Response, NextFunction } from 'express';
import {
  getMySubscription,
  createPaymentRequest,
  getMyPaymentRequests,
  listPaymentRequests,
  approvePaymentRequest,
  rejectPaymentRequest,
  listSubscriptions,
} from '@/controllers/billing.controller';

const router = Router();

// Note: GET /plans (public) is mounted directly in routes/index.ts, ahead of
// the authenticated '/billing' mount that wraps this whole router — it can't
// live here, since that outer authenticate would gate it before it arrives.
router.use(authenticate);

// ─── Admin / Center User Routes ───────────────────────────────────────────
// Get my subscription status
router.get('/my-subscription', asyncHandler(getMySubscription));

// Submit payment request
router.post('/payment-requests', asyncHandler(createPaymentRequest));

// Get my payment history
router.get('/payment-requests/my', asyncHandler(getMyPaymentRequests));

// ─── Super Admin Only Routes ──────────────────────────────────────────────
const requireSuperAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'SUPER_ADMIN') {
    res.status(403).json({ success: false, message: 'Faqat Super Admin uchun' });
    return;
  }
  next();
};

// All payment requests (for admin review)
router.get('/admin/payment-requests', requireSuperAdmin, asyncHandler(listPaymentRequests));
router.post('/admin/payment-requests/:id/approve', requireSuperAdmin, asyncHandler(approvePaymentRequest));
router.post('/admin/payment-requests/:id/reject', requireSuperAdmin, asyncHandler(rejectPaymentRequest));

// All subscriptions list
router.get('/admin/subscriptions', requireSuperAdmin, asyncHandler(listSubscriptions));

export default router;
