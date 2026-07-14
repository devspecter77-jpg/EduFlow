import { Router } from 'express';
import { paymentController } from '@/controllers/payment.controller';
import { authenticate } from '@/middleware/auth.middleware';
import asyncHandler from '@/middleware/asyncHandler';

const router = Router();
router.use(authenticate);

// New payment-centric routes
router.get('/students-with-payment-info', asyncHandler(paymentController.getStudentsWithPaymentInfo.bind(paymentController)));
router.get('/stats', asyncHandler(paymentController.getPaymentStats.bind(paymentController)));
router.post('/process', asyncHandler(paymentController.processPayment.bind(paymentController)));

// Legacy CRUD routes
router.post('/', asyncHandler(paymentController.create.bind(paymentController)));
router.get('/', asyncHandler(paymentController.getAll.bind(paymentController)));
router.get('/overdue', asyncHandler(paymentController.getOverdueStudents.bind(paymentController)));
router.get('/:id', asyncHandler(paymentController.getById.bind(paymentController)));
router.patch('/:id', asyncHandler(paymentController.update.bind(paymentController)));
router.delete('/:id', asyncHandler(paymentController.delete.bind(paymentController)));

export default router;
