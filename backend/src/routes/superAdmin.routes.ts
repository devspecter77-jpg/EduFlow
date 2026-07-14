import { Router } from 'express';
import { superAdminController } from '@/controllers/superAdmin.controller';
import { asyncHandler, authenticate } from '@/middleware';
import type { Request, Response, NextFunction } from 'express';

const router = Router();
const c = superAdminController;

// Middleware: only SUPER_ADMIN can access
const requireSuperAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'SUPER_ADMIN') {
    res.status(403).json({ success: false, message: 'Faqat Super Admin uchun' });
    return;
  }
  next();
};

router.use(authenticate, requireSuperAdmin);

// Dashboard
router.get('/stats', asyncHandler((req, res) => c.getStats(req, res)));

// Users
router.get('/users',                asyncHandler((req, res) => c.listUsers(req, res)));
router.patch('/users/:id/block',    asyncHandler((req, res) => c.blockUser(req, res)));
router.patch('/users/:id/unblock',  asyncHandler((req, res) => c.unblockUser(req, res)));
router.post('/users/:userId/impersonate', asyncHandler((req, res) => c.impersonateUser(req, res)));

// Centers
router.get('/centers',              asyncHandler((req, res) => c.listCenters(req, res)));
router.get('/centers/:id',          asyncHandler((req, res) => c.getCenter(req, res)));
router.get('/centers/:id/stats',    asyncHandler((req, res) => c.getCenterStats(req, res)));
router.post('/centers',             asyncHandler((req, res) => c.createCenter(req, res)));
router.patch('/centers/:id',        asyncHandler((req, res) => c.updateCenter(req, res)));
router.delete('/centers/:id',       asyncHandler((req, res) => c.deleteCenter(req, res)));
router.patch('/centers/:id/block',  asyncHandler((req, res) => c.blockCenter(req, res)));
router.patch('/centers/:id/unblock',asyncHandler((req, res) => c.unblockCenter(req, res)));

// Plans
router.get('/plans',       asyncHandler((req, res) => c.listPlans(req, res)));
router.patch('/plans/:id', asyncHandler((req, res) => c.updatePlan(req, res)));

// Subscriptions
router.post('/subscriptions/extend', asyncHandler((req, res) => c.extendSubscription(req, res)));
router.patch('/subscriptions/:id',   asyncHandler((req, res) => c.updateSubscription(req, res)));

// Impersonate
router.post('/impersonate/:centerId', asyncHandler((req, res) => c.impersonate(req, res)));

export default router;
