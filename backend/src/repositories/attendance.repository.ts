import { prisma } from '@/config/database';
import type { Prisma } from '@prisma/client';
import type { CreateAttendanceInput, UpdateAttendanceInput, AttendanceFilters } from '@/validators/attendance.validator';

export class AttendanceRepository {
  async create(data: CreateAttendanceInput) {
    return await prisma.attendance.create({
      data: {
        studentId: data.studentId,
        groupId: data.groupId,
        date: new Date(data.date),
        status: data.status || 'PRESENT',
        notes: data.notes || null,
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
            subject: true,
          },
        },
      },
    });
  }

  async bulkCreate(attendances: Array<{ studentId: string; groupId: string; date: Date; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; notes?: string | null }>) {
    return await prisma.attendance.createMany({
      data: attendances,
      skipDuplicates: true,
    });
  }

  async findById(id: string, userId: string) {
    return await prisma.attendance.findFirst({
      where: { id, student: { userId } },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            status: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
            subject: true,
            level: true,
          },
        },
      },
    });
  }

  async findAll(userId: string, filters: AttendanceFilters) {
    const { page = 1, limit = 10, groupId, studentId, status, startDate, endDate } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.AttendanceWhereInput = { student: { userId } };

    if (groupId) where.groupId = groupId;
    if (studentId) where.studentId = studentId;
    if (status) where.status = status;
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              phone: true,
            },
          },
          group: {
            select: {
              id: true,
              name: true,
              subject: true,
            },
          },
        },
      }),
      prisma.attendance.count({ where }),
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

  async update(id: string, userId: string, data: UpdateAttendanceInput) {
    const updateData: Prisma.AttendanceUpdateInput = {};

    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;

    return await prisma.attendance.update({
      where: { id, student: { userId } },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
            subject: true,
          },
        },
      },
    });
  }

  async delete(id: string, userId: string) {
    return await prisma.attendance.delete({
      where: { id, student: { userId } },
    });
  }

  async exists(id: string, userId: string): Promise<boolean> {
    const count = await prisma.attendance.count({
      where: { id, student: { userId } },
    });
    return count > 0;
  }

  async getByGroupAndDate(groupId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await prisma.attendance.findMany({
      where: {
        groupId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            status: true,
          },
        },
      },
    });
  }

  async getStatsByGroup(groupId: string, startDate?: Date, endDate?: Date) {
    const where: Prisma.AttendanceWhereInput = { groupId };
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const [total, present, absent, late, excused] = await Promise.all([
      prisma.attendance.count({ where }),
      prisma.attendance.count({ where: { ...where, status: 'PRESENT' } }),
      prisma.attendance.count({ where: { ...where, status: 'ABSENT' } }),
      prisma.attendance.count({ where: { ...where, status: 'LATE' } }),
      prisma.attendance.count({ where: { ...where, status: 'EXCUSED' } }),
    ]);

    return { total, present, absent, late, excused };
  }

  async getStatsByStudent(studentId: string, startDate?: Date, endDate?: Date) {
    const where: Prisma.AttendanceWhereInput = { studentId };
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const [total, present, absent, late, excused] = await Promise.all([
      prisma.attendance.count({ where }),
      prisma.attendance.count({ where: { ...where, status: 'PRESENT' } }),
      prisma.attendance.count({ where: { ...where, status: 'ABSENT' } }),
      prisma.attendance.count({ where: { ...where, status: 'LATE' } }),
      prisma.attendance.count({ where: { ...where, status: 'EXCUSED' } }),
    ]);

    return { total, present, absent, late, excused };
  }

  async getTodayAttendanceCount(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await prisma.attendance.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
  }

  async getRecentAttendances(limit: number = 10) {
    return await prisma.attendance.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}

export const attendanceRepository = new AttendanceRepository();
