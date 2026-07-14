import { paymentRepository } from '@/repositories/payment.repository';
import { groupRepository } from '@/repositories/group.repository';
import { prisma } from '@/config/database';
import { Prisma } from '@prisma/client';
import type { CreatePaymentInput, UpdatePaymentInput, PaymentFilters } from '@/validators/payment.validator';
import { AppError } from '@/middleware/errorHandler';

export class PaymentService {
  /**
   * Process a new payment for a student
   * Updates student's payment tracking fields automatically
   */
  async processPayment(userId: string, data: CreatePaymentInput) {
    // Verify student exists and belongs to user
    const student = await prisma.student.findFirst({
      where: { id: data.studentId, userId, isDeleted: false },
    });
    if (!student) {
      throw new AppError('Talaba topilmadi', 404);
    }

    // Verify group exists if provided
    if (data.groupId) {
      const group = await groupRepository.findById(data.groupId, userId);
      if (!group) {
        throw new AppError('Guruh topilmadi', 404);
      }
    }

    // Create payment record
    const payment = await paymentRepository.create(data);

    // Update student payment tracking
    await this.updateStudentPaymentStatus(data.studentId);

    return payment;
  }

  /**
   * Update student's payment tracking fields
   * Calculates: paidAmount, remainingAmount, paymentStatus, nextPaymentDate
   */
  async updateStudentPaymentStatus(studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        payments: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!student) return;

    // Calculate total paid amount from all payments
    const totalPaidAmount = student.payments.reduce((sum, p) => sum + p.paidAmount, 0);

    // Calculate expected payment (from startDate to now)
    let expectedAmount = 0;
    if (student.startDate && student.paymentAmount) {
      const now = new Date();
      const start = new Date(student.startDate);
      const monthsDiff = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()) + 1;
      
      if (student.paymentType === 'MONTHLY') {
        expectedAmount = student.paymentAmount * Math.max(0, monthsDiff);
      } else {
        // YEARLY
        const yearsDiff = Math.ceil(monthsDiff / 12);
        expectedAmount = student.paymentAmount * yearsDiff;
      }
    }

    const remainingAmount = Math.max(0, expectedAmount - totalPaidAmount);

    // Determine payment status
    let paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' = 'PENDING';
    
    if (remainingAmount === 0) {
      paymentStatus = 'PAID';
    } else if (totalPaidAmount > 0) {
      paymentStatus = 'PARTIAL';
    } else if (student.nextPaymentDate && new Date(student.nextPaymentDate) < new Date()) {
      paymentStatus = 'OVERDUE';
    } else {
      paymentStatus = 'PENDING';
    }

    // Calculate next payment date
    let nextPaymentDate = student.nextPaymentDate;
    if (student.paymentType === 'MONTHLY' && student.startDate) {
      const lastPaymentDate = student.nextPaymentDate ? new Date(student.nextPaymentDate) : new Date(student.startDate);
      nextPaymentDate = new Date(lastPaymentDate);
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    }

    // Update student
    await prisma.student.update({
      where: { id: studentId },
      data: {
        paidAmount: totalPaidAmount,
        remainingAmount,
        paymentStatus,
        nextPaymentDate,
      },
    });
  }

  /**
   * Get students with payment info for payment page
   */
  async getStudentsWithPaymentInfo(userId: string, filters?: {
    search?: string;
    status?: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
    groupId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.StudentWhereInput = {
      userId,
      isDeleted: false,
    };

    if (filters?.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search } },
      ];
    }

    if (filters?.status) {
      where.paymentStatus = filters.status;
    }

    if (filters?.groupId) {
      where.groupId = filters.groupId;
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { paymentStatus: 'asc' }, // Overdue first
          { nextPaymentDate: 'asc' },
        ],
        include: {
          groups: {
            include: {
              group: {
                select: {
                  id: true,
                  name: true,
                  subject: true,
                },
              },
            },
          },
          payments: {
            where: { isDeleted: false },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
              id: true,
              amount: true,
              paidAmount: true,
              paidDate: true,
              method: true,
              notes: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.student.count({ where }),
    ]);

    return {
      data: students,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(userId: string) {
    const students = await prisma.student.findMany({
      where: { userId, isDeleted: false },
      select: {
        paymentAmount: true,
        paidAmount: true,
        remainingAmount: true,
        paymentStatus: true,
      },
    });

    const totalExpected = students.reduce((sum, s) => sum + (s.paymentAmount || 0), 0);
    const totalPaid = students.reduce((sum, s) => sum + s.paidAmount, 0);
    const totalRemaining = students.reduce((sum, s) => sum + s.remainingAmount, 0);
    
    const overdueCount = students.filter(s => s.paymentStatus === 'OVERDUE').length;
    const paidCount = students.filter(s => s.paymentStatus === 'PAID').length;
    const pendingCount = students.filter(s => s.paymentStatus === 'PENDING').length;
    const partialCount = students.filter(s => s.paymentStatus === 'PARTIAL').length;

    // Today's payments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayPayments = await prisma.payment.aggregate({
      where: {
        isDeleted: false,
        paidDate: { gte: today, lt: tomorrow },
        student: { userId },
      },
      _sum: { paidAmount: true },
    });

    return {
      totalExpected,
      totalPaid,
      totalRemaining,
      overdueCount,
      paidCount,
      pendingCount,
      partialCount,
      todayPayments: todayPayments._sum.paidAmount || 0,
    };
  }

  // Legacy methods for backward compatibility
  async createPayment(userId: string, data: CreatePaymentInput) {
    return this.processPayment(userId, data);
  }

  async getPaymentById(id: string, userId: string) {
    const payment = await paymentRepository.findById(id, userId);
    if (!payment) {
      throw new AppError('To\'lov topilmadi', 404);
    }
    return payment;
  }

  async getAllPayments(userId: string, filters: PaymentFilters) {
    return await paymentRepository.findAll(userId, filters);
  }

  async updatePayment(id: string, userId: string, data: UpdatePaymentInput) {
    const payment = await paymentRepository.findById(id, userId);
    if (!payment) {
      throw new AppError('To\'lov topilmadi', 404);
    }

    const updated = await paymentRepository.update(id, userId, data);

    // Update student payment status
    await this.updateStudentPaymentStatus(payment.studentId);

    return updated;
  }

  async deletePayment(id: string, userId: string) {
    const payment = await paymentRepository.findById(id, userId);
    if (!payment) {
      throw new AppError('To\'lov topilmadi', 404);
    }

    const result = await paymentRepository.delete(id, userId);

    // Update student payment status
    await this.updateStudentPaymentStatus(payment.studentId);

    return result;
  }

  async getOverdueStudents(userId: string) {
    return await paymentRepository.getOverdueStudents(userId);
  }
}

export const paymentService = new PaymentService();
