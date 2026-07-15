import { Router } from 'express';
import asyncHandler from '@middleware/asyncHandler';
import { authenticate } from '@middleware/auth.middleware';
import { Request, Response } from 'express';
import { prisma } from '@config/database';
import { sendSuccess } from '@utils/response';

const router = Router();
router.use(authenticate);

router.get('/stats', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

  const [totalStudents, totalTeachers, activeGroups, attendanceToday, monthlyRevenue, todayPayments, overdueCount] = await Promise.all([
    prisma.student.count({
      where: { userId, isDeleted: false, status: 'ACTIVE' },
    }),
    prisma.teacher.count({
      where: { userId, isDeleted: false, status: 'ACTIVE' },
    }),
    prisma.group.count({
      where: { userId, isDeleted: false, status: 'ACTIVE' },
    }),
    prisma.attendance.count({
      where: { date: { gte: today, lt: tomorrow }, student: { userId } },
    }),
    prisma.payment.aggregate({
      where: {
        isDeleted: false,
        status: 'PAID',
        paidDate: { gte: startOfMonth, lte: endOfMonth },
        student: { userId },
      },
      _sum: { paidAmount: true },
    }),
    prisma.payment.aggregate({
      where: {
        isDeleted: false,
        paidDate: { gte: today, lt: tomorrow },
        student: { userId },
      },
      _sum: { paidAmount: true },
    }),
    prisma.payment.count({
      where: { isDeleted: false, status: 'OVERDUE', student: { userId } },
    }),
  ]);

  sendSuccess(res, {
    totalStudents,
    totalTeachers,
    activeGroups,
    attendanceToday,
    monthlyRevenue: monthlyRevenue._sum.paidAmount || 0,
    todayPayments: todayPayments._sum.paidAmount || 0,
    overdueCount,
  }, 'Dashboard statistikasi');
}));

// Recent Students
router.get('/recent-students', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  
  const students = await prisma.student.findMany({
    where: { userId, isDeleted: false },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      fullName: true,
      phone: true,
      status: true,
      createdAt: true,
    },
  });

  sendSuccess(res, students, 'Oxirgi o\'quvchilar');
}));

// Recent Teachers
router.get('/recent-teachers', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  
  const teachers = await prisma.teacher.findMany({
    where: { userId, isDeleted: false },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      fullName: true,
      phone: true,
      status: true,
      createdAt: true,
    },
  });

  sendSuccess(res, teachers, 'Oxirgi o\'qituvchilar');
}));

// Recent Groups
router.get('/recent-groups', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  
  const groups = await prisma.group.findMany({
    where: { userId, isDeleted: false },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      name: true,
      subject: true,
      level: true,
      status: true,
      createdAt: true,
      teacher: {
        select: { fullName: true },
      },
      _count: {
        select: { students: true },
      },
    },
  });

  const mapped = groups.map((g) => ({
    id: g.id,
    name: g.name,
    subject: g.subject,
    level: g.level,
    status: g.status,
    createdAt: g.createdAt,
    teacherName: g.teacher?.fullName ?? null,
    studentCount: g._count.students,
  }));

  sendSuccess(res, mapped, 'Oxirgi guruhlar');
}));

// Recent Payments
router.get('/recent-payments', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;

  const payments = await prisma.payment.findMany({
    where: {
      isDeleted: false,
      student: { userId },
    },
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      amount: true,
      paidAmount: true,
      paidDate: true,
      status: true,
      method: true,
      createdAt: true,
      student: {
        select: { fullName: true },
      },
      group: {
        select: { name: true },
      },
    },
  });

  const mapped = payments.map((p) => ({
    id: p.id,
    amount: p.amount,
    paidAmount: p.paidAmount,
    paymentDate: p.paidDate ?? p.createdAt,
    status: p.status,
    method: p.method,
    createdAt: p.createdAt,
    studentName: p.student.fullName,
    groupName: p.group?.name ?? null,
  }));

  sendSuccess(res, mapped, 'Oxirgi to\'lovlar');
}));

export default router;
