import { prisma } from '@/config/database';
import type { Prisma } from '@prisma/client';
import type { CreatePaymentInput, UpdatePaymentInput, PaymentFilters } from '@/validators/payment.validator';

export class PaymentRepository {
  async create(data: CreatePaymentInput) {
    return await prisma.payment.create({
      data: {
        studentId: data.studentId,
        groupId: data.groupId,
        amount: data.amount,
        paidAmount: data.paidAmount || 0,
        dueDate: new Date(data.dueDate),
        paidDate: data.paidDate ? new Date(data.paidDate) : null,
        status: data.status || 'PENDING',
        method: data.method || 'CASH',
        notes: data.notes || null,
      },
      include: {
        student: {
          select: { id: true, fullName: true, phone: true },
        },
        group: {
          select: { id: true, name: true, subject: true },
        },
      },
    });
  }

  async findById(id: string, userId: string) {
    return await prisma.payment.findFirst({
      where: { id, isDeleted: false, student: { userId } },
      include: {
        student: {
          select: { id: true, fullName: true, phone: true },
        },
        group: {
          select: { id: true, name: true, subject: true },
        },
      },
    });
  }

  async findAll(userId: string, filters: PaymentFilters) {
    const { page = 1, limit = 10, studentId, groupId, status, method, startDate, endDate } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = { isDeleted: false, student: { userId } };

    if (studentId) where.studentId = studentId;
    if (groupId) where.groupId = groupId;
    if (status) where.status = status;
    if (method) where.method = method;

    if (startDate || endDate) {
      where.dueDate = {};
      if (startDate) where.dueDate.gte = new Date(startDate);
      if (endDate) where.dueDate.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            select: { id: true, fullName: true, phone: true },
          },
          group: {
            select: { id: true, name: true, subject: true },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, userId: string, data: UpdatePaymentInput) {
    const updateData: Prisma.PaymentUpdateInput = {};

    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.paidAmount !== undefined) updateData.paidAmount = data.paidAmount;
    if (data.dueDate !== undefined) updateData.dueDate = new Date(data.dueDate);
    if (data.paidDate !== undefined) updateData.paidDate = data.paidDate ? new Date(data.paidDate) : null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.method !== undefined) updateData.method = data.method;
    if (data.notes !== undefined) updateData.notes = data.notes;

    return await prisma.payment.update({
      where: { id, student: { userId } },
      data: updateData,
      include: {
        student: {
          select: { id: true, fullName: true, phone: true },
        },
        group: {
          select: { id: true, name: true, subject: true },
        },
      },
    });
  }

  async delete(id: string, userId: string) {
    return await prisma.payment.update({
      where: { id, student: { userId } },
      data: { isDeleted: true },
    });
  }

  async exists(id: string, userId: string): Promise<boolean> {
    const count = await prisma.payment.count({
      where: { id, isDeleted: false, student: { userId } },
    });
    return count > 0;
  }

  async getMonthlyRevenue(year: number, month: number): Promise<number> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const result = await prisma.payment.aggregate({
      where: {
        isDeleted: false,
        status: 'PAID',
        paidDate: { gte: start, lte: end },
      },
      _sum: { paidAmount: true },
    });

    return result._sum.paidAmount || 0;
  }

  async getTotalRevenue(): Promise<number> {
    const result = await prisma.payment.aggregate({
      where: { isDeleted: false, status: 'PAID' },
      _sum: { paidAmount: true },
    });
    return result._sum.paidAmount || 0;
  }

  async getOverdueCount(): Promise<number> {
    return await prisma.payment.count({
      where: {
        isDeleted: false,
        status: 'OVERDUE',
      },
    });
  }

  async getOverdueStudents(userId: string) {
    return await prisma.payment.findMany({
      where: {
        isDeleted: false,
        status: 'OVERDUE',
        student: { userId },
      },
      include: {
        student: {
          select: { id: true, fullName: true, phone: true },
        },
        group: {
          select: { id: true, name: true },
        },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async getRecentPayments(limit: number = 5) {
    return await prisma.payment.findMany({
      where: { isDeleted: false, status: 'PAID' },
      take: limit,
      orderBy: { paidDate: 'desc' },
      include: {
        student: {
          select: { id: true, fullName: true },
        },
        group: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async getTodayPayments(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await prisma.payment.aggregate({
      where: {
        isDeleted: false,
        paidDate: { gte: today, lt: tomorrow },
      },
      _sum: { paidAmount: true },
    });

    return result._sum.paidAmount || 0;
  }
}

export const paymentRepository = new PaymentRepository();
