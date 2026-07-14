import type { Request, Response } from 'express';
import { paymentService } from '@/services/payment.service';
import { createPaymentSchema, updatePaymentSchema, paymentFiltersSchema } from '@/validators/payment.validator';
import { sendSuccess } from '@/utils/response';
import { AppError } from '@/middleware/errorHandler';
import { notifyPaymentReceived } from '@/services/notification.service';

export class PaymentController {
  // New payment-centric endpoints
  async getStudentsWithPaymentInfo(req: Request, res: Response) {
    const userId = req.user!.userId;
    const filters = {
      search: req.query.search as string | undefined,
      status: req.query.status as 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | undefined,
      groupId: req.query.groupId as string | undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
    };

    const result = await paymentService.getStudentsWithPaymentInfo(userId, filters);
    
    return res.status(200).json({
      success: true,
      data: result.data,
      message: 'Talabalar to\'lov ma\'lumotlari',
      pagination: result.pagination,
    });
  }

  async getPaymentStats(req: Request, res: Response) {
    const userId = req.user!.userId;
    const stats = await paymentService.getPaymentStats(userId);
    return sendSuccess(res, stats, 'To\'lov statistikasi');
  }

  async processPayment(req: Request, res: Response) {
    const userId = req.user!.userId;
    const validatedData = createPaymentSchema.parse(req.body);
    const payment = await paymentService.processPayment(userId, validatedData);
    // Fire notification (non-blocking)
    if (payment.paidAmount > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = payment as any;
      const studentName = p.student?.fullName ?? 'O\'quvchi';
      notifyPaymentReceived(userId, studentName, payment.paidAmount, payment.id);
    }
    return sendSuccess(res, payment, 'To\'lov muvaffaqiyatli amalga oshirildi', 201);
  }

  // Legacy CRUD endpoints (for backward compatibility)
  async create(req: Request, res: Response) {
    const userId = req.user!.userId;
    const validatedData = createPaymentSchema.parse(req.body);
    const payment = await paymentService.createPayment(userId, validatedData);
    return sendSuccess(res, payment, 'To\'lov muvaffaqiyatli yaratildi', 201);
  }

  async getAll(req: Request, res: Response) {
    const userId = req.user!.userId;
    const filters = paymentFiltersSchema.parse({
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
      studentId: req.query.studentId as string | undefined,
      groupId: req.query.groupId as string | undefined,
      status: req.query.status as string | undefined,
      method: req.query.method as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
    });

    const result = await paymentService.getAllPayments(userId, filters);
    return sendSuccess(res, result.data, 'To\'lovlar muvaffaqiyatli yuklandi', 200);
  }

  async getById(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { id } = req.params;
    if (!id || Array.isArray(id)) throw new AppError('To\'lov ID majburiy', 400);

    const payment = await paymentService.getPaymentById(id, userId);
    return sendSuccess(res, payment, 'To\'lov muvaffaqiyatli yuklandi');
  }

  async update(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { id } = req.params;
    if (!id || Array.isArray(id)) throw new AppError('To\'lov ID majburiy', 400);

    const validatedData = updatePaymentSchema.parse(req.body);
    const payment = await paymentService.updatePayment(id, userId, validatedData);
    return sendSuccess(res, payment, 'To\'lov muvaffaqiyatli yangilandi');
  }

  async delete(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { id } = req.params;
    if (!id || Array.isArray(id)) throw new AppError('To\'lov ID majburiy', 400);

    await paymentService.deletePayment(id, userId);
    return sendSuccess(res, null, 'To\'lov muvaffaqiyatli o\'chirildi');
  }

  async getOverdueStudents(req: Request, res: Response) {
    const userId = req.user!.userId;
    const students = await paymentService.getOverdueStudents(userId);
    return sendSuccess(res, students, 'Qarzdor talabalar');
  }
}

export const paymentController = new PaymentController();
