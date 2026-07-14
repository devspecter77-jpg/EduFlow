import { Router } from 'express';
import asyncHandler from '@middleware/asyncHandler';
import { authenticate } from '@middleware/auth.middleware';
import { Request, Response } from 'express';
import { prisma } from '@config/database';
import { sendSuccess } from '@utils/response';

const router = Router();
router.use(authenticate);

// ============================================================
// ANALYTICS — Overview
// ============================================================
router.get('/overview', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [
    totalStudents, activeStudents, graduatedStudents,
    totalTeachers, activeTeachers,
    totalGroups, activeGroups,
    totalPayments, monthlyRevenue, yearlyRevenue,
    overdueStudents,
    attendanceTotal, attendancePresent,
  ] = await Promise.all([
    prisma.student.count({ where: { userId, isDeleted: false } }),
    prisma.student.count({ where: { userId, isDeleted: false, status: 'ACTIVE' } }),
    prisma.student.count({ where: { userId, isDeleted: false, status: 'GRADUATED' } }),
    prisma.teacher.count({ where: { userId, isDeleted: false } }),
    prisma.teacher.count({ where: { userId, isDeleted: false, status: 'ACTIVE' } }),
    prisma.group.count({ where: { userId, isDeleted: false } }),
    prisma.group.count({ where: { userId, isDeleted: false, status: 'ACTIVE' } }),
    prisma.payment.aggregate({
      where: { isDeleted: false, student: { userId }, status: 'PAID' },
      _sum: { paidAmount: true },
    }),
    prisma.payment.aggregate({
      where: { isDeleted: false, student: { userId }, status: 'PAID', paidDate: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { paidAmount: true },
    }),
    prisma.payment.aggregate({
      where: { isDeleted: false, student: { userId }, status: 'PAID', paidDate: { gte: startOfYear } },
      _sum: { paidAmount: true },
    }),
    prisma.student.count({ where: { userId, isDeleted: false, paymentStatus: 'OVERDUE' } }),
    prisma.attendance.count({ where: { student: { userId } } }),
    prisma.attendance.count({ where: { student: { userId }, status: 'PRESENT' } }),
  ]);

  sendSuccess(res, {
    students: { total: totalStudents, active: activeStudents, graduated: graduatedStudents },
    teachers: { total: totalTeachers, active: activeTeachers },
    groups: { total: totalGroups, active: activeGroups },
    revenue: {
      total: totalPayments._sum.paidAmount || 0,
      monthly: monthlyRevenue._sum.paidAmount || 0,
      yearly: yearlyRevenue._sum.paidAmount || 0,
    },
    payments: { overdueStudents },
    attendance: {
      total: attendanceTotal,
      presentRate: attendanceTotal > 0 ? Math.round((attendancePresent / attendanceTotal) * 100) : 0,
    },
  }, 'Umumiy tahlil');
}));

// ============================================================
// ANALYTICS — Monthly Revenue (last 12 months)
// ============================================================
router.get('/monthly-revenue', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const months = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

    const result = await prisma.payment.aggregate({
      where: {
        isDeleted: false,
        student: { userId },
        status: 'PAID',
        paidDate: { gte: start, lte: end },
      },
      _sum: { paidAmount: true },
    });

    months.push({
      month: d.toLocaleDateString('uz-UZ', { month: 'short', year: 'numeric' }),
      revenue: result._sum.paidAmount || 0,
      year: d.getFullYear(),
      monthNum: d.getMonth() + 1,
    });
  }

  sendSuccess(res, months, 'Oylik tushum');
}));

// ============================================================
// ANALYTICS — Student Growth (last 12 months)
// ============================================================
router.get('/student-growth', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const months = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

    const count = await prisma.student.count({
      where: {
        userId,
        isDeleted: false,
        createdAt: { lte: end },
      },
    });

    const newThisMonth = await prisma.student.count({
      where: {
        userId,
        isDeleted: false,
        createdAt: {
          gte: new Date(d.getFullYear(), d.getMonth(), 1),
          lte: end,
        },
      },
    });

    months.push({
      month: d.toLocaleDateString('uz-UZ', { month: 'short', year: 'numeric' }),
      total: count,
      new: newThisMonth,
      year: d.getFullYear(),
      monthNum: d.getMonth() + 1,
    });
  }

  sendSuccess(res, months, 'Talabalar o\'sishi');
}));

// ============================================================
// ANALYTICS — Attendance Stats (last 30 days)
// ============================================================
router.get('/attendance-stats', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const days = Number(req.query.days) || 30;
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - days);

  const stats = await prisma.attendance.groupBy({
    by: ['status'],
    where: {
      student: { userId },
      date: { gte: startDate, lte: now },
    },
    _count: true,
  });

  const result = {
    PRESENT: 0,
    ABSENT: 0,
    LATE: 0,
    EXCUSED: 0,
  };

  stats.forEach((s) => {
    result[s.status as keyof typeof result] = s._count;
  });

  const total = Object.values(result).reduce((a, b) => a + b, 0);

  sendSuccess(res, {
    ...result,
    total,
    presentRate: total > 0 ? Math.round((result.PRESENT / total) * 100) : 0,
    absentRate: total > 0 ? Math.round((result.ABSENT / total) * 100) : 0,
  }, 'Davomat statistikasi');
}));

// ============================================================
// ANALYTICS — Payment Stats
// ============================================================
router.get('/payment-stats', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;

  const stats = await prisma.student.groupBy({
    by: ['paymentStatus'],
    where: { userId, isDeleted: false },
    _count: true,
  });

  const result = { PENDING: 0, PARTIAL: 0, PAID: 0, OVERDUE: 0, CANCELLED: 0 };
  stats.forEach((s) => {
    const key = s.paymentStatus as keyof typeof result;
    if (key in result) result[key] = s._count;
  });

  const totalRevenue = await prisma.payment.aggregate({
    where: { isDeleted: false, student: { userId }, status: 'PAID' },
    _sum: { paidAmount: true },
  });
  const totalDebt = await prisma.student.aggregate({
    where: { userId, isDeleted: false },
    _sum: { remainingAmount: true },
  });

  sendSuccess(res, {
    byStatus: result,
    totalRevenue: totalRevenue._sum.paidAmount || 0,
    totalDebt: totalDebt._sum.remainingAmount || 0,
  }, 'To\'lov statistikasi');
}));

// ============================================================
// ANALYTICS — Top Groups by students
// ============================================================
router.get('/top-groups', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const limit = Number(req.query.limit) || 5;

  const groups = await prisma.group.findMany({
    where: { userId, isDeleted: false },
    take: limit,
    orderBy: { students: { _count: 'desc' } },
    select: {
      id: true,
      name: true,
      subject: true,
      status: true,
      courseFee: true,
      _count: { select: { students: true, attendances: true, payments: true } },
    },
  });

  sendSuccess(res, groups, 'Top guruhlar');
}));

// ============================================================
// REPORTS — Students Report
// ============================================================
router.get('/students', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const search = req.query.search as string | undefined;
  const status = req.query.status as string | undefined;
  const gender = req.query.gender as string | undefined;
  const groupId = req.query.groupId as string | undefined;
  const dateFrom = req.query.dateFrom as string | undefined;
  const dateTo = req.query.dateTo as string | undefined;
  const paymentStatus = req.query.paymentStatus as string | undefined;

  const where: Record<string, unknown> = { userId, isDeleted: false };
  if (status) where.status = status;
  if (gender) where.gender = gender;
  if (groupId) where.groupId = groupId;
  if (paymentStatus) where.paymentStatus = paymentStatus;
  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { lte: new Date(dateTo) } : {}),
    };
  }
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.student.findMany({
      where: where as any,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        phone: true,
        gender: true,
        status: true,
        groupId: true,
        paymentStatus: true,
        paymentAmount: true,
        paidAmount: true,
        remainingAmount: true,
        nextPaymentDate: true,
        startDate: true,
        createdAt: true,
        groups: {
          include: {
            group: { select: { id: true, name: true, subject: true } },
          },
        },
      },
    }),
    prisma.student.count({ where: where as any }),
  ]);

  res.json({
    success: true,
    data,
    message: 'Talabalar hisoboti',
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}));

// ============================================================
// REPORTS — Attendance Report
// ============================================================
router.get('/attendances', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const search = req.query.search as string | undefined;
  const status = req.query.status as string | undefined;
  const groupId = req.query.groupId as string | undefined;
  const dateFrom = req.query.dateFrom as string | undefined;
  const dateTo = req.query.dateTo as string | undefined;

  const where: Record<string, unknown> = { student: { userId } };
  if (status) where.status = status;
  if (groupId) where.groupId = groupId;
  if (dateFrom || dateTo) {
    where.date = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { lte: new Date(dateTo + 'T23:59:59') } : {}),
    };
  }
  if (search) {
    where.student = { userId, fullName: { contains: search, mode: 'insensitive' } };
  }

  const [data, total] = await Promise.all([
    prisma.attendance.findMany({
      where: where as any,
      skip,
      take: limit,
      orderBy: { date: 'desc' },
      select: {
        id: true,
        date: true,
        status: true,
        notes: true,
        createdAt: true,
        student: { select: { id: true, fullName: true, phone: true } },
        group: { select: { id: true, name: true, subject: true } },
      },
    }),
    prisma.attendance.count({ where: where as any }),
  ]);

  res.json({
    success: true,
    data,
    message: 'Davomat hisoboti',
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}));

// ============================================================
// REPORTS — Payments Report
// ============================================================
router.get('/payments', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const search = req.query.search as string | undefined;
  const status = req.query.status as string | undefined;
  const method = req.query.method as string | undefined;
  const groupId = req.query.groupId as string | undefined;
  const dateFrom = req.query.dateFrom as string | undefined;
  const dateTo = req.query.dateTo as string | undefined;

  const where: Record<string, unknown> = { isDeleted: false, student: { userId } };
  if (status) where.status = status;
  if (method) where.method = method;
  if (groupId) where.groupId = groupId;
  if (dateFrom || dateTo) {
    where.paidDate = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { lte: new Date(dateTo + 'T23:59:59') } : {}),
    };
  }
  if (search) {
    where.student = { userId, fullName: { contains: search, mode: 'insensitive' } };
  }

  const [data, total, aggregate] = await Promise.all([
    prisma.payment.findMany({
      where: where as any,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        paidAmount: true,
        dueDate: true,
        paidDate: true,
        status: true,
        method: true,
        notes: true,
        createdAt: true,
        student: { select: { id: true, fullName: true, phone: true } },
        group: { select: { id: true, name: true, subject: true } },
      },
    }),
    prisma.payment.count({ where: where as any }),
    prisma.payment.aggregate({
      where: where as any,
      _sum: { paidAmount: true, amount: true },
    }),
  ]);

  res.json({
    success: true,
    data,
    message: 'To\'lovlar hisoboti',
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    summary: {
      totalAmount: aggregate._sum.amount || 0,
      totalPaid: aggregate._sum.paidAmount || 0,
    },
  });
}));

// ============================================================
// REPORTS — Groups Report
// ============================================================
router.get('/groups', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const search = req.query.search as string | undefined;
  const status = req.query.status as string | undefined;

  const where: Record<string, unknown> = { userId, isDeleted: false };
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { subject: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.group.findMany({
      where: where as any,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        subject: true,
        level: true,
        status: true,
        courseFee: true,
        maxStudents: true,
        startDate: true,
        createdAt: true,
        teacher: { select: { id: true, fullName: true } },
        _count: { select: { students: true, attendances: true, payments: true } },
      },
    }),
    prisma.group.count({ where: where as any }),
  ]);

  res.json({
    success: true,
    data,
    message: 'Guruhlar hisoboti',
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}));

// ============================================================
// REPORTS — Teachers Report
// ============================================================
router.get('/teachers', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const search = req.query.search as string | undefined;
  const status = req.query.status as string | undefined;

  const where: Record<string, unknown> = { userId, isDeleted: false };
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.teacher.findMany({
      where: where as any,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        phone: true,
        gender: true,
        experience: true,
        education: true,
        salary: true,
        status: true,
        hireDate: true,
        createdAt: true,
        groups: {
          select: {
            id: true,
            name: true,
            subject: true,
            status: true,
            _count: { select: { students: true } },
          },
        },
      },
    }),
    prisma.teacher.count({ where: where as any }),
  ]);

  res.json({
    success: true,
    data,
    message: 'O\'qituvchilar hisoboti',
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}));

export default router;
