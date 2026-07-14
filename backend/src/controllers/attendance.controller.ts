import type { Request, Response } from 'express';
import { attendanceService } from '@/services/attendance.service';
import { 
  createAttendanceSchema, 
  updateAttendanceSchema, 
  bulkAttendanceSchema,
  attendanceFiltersSchema 
} from '@/validators/attendance.validator';
import { sendSuccess } from '@/utils/response';
import { AppError } from '@/middleware/errorHandler';
import { sendAttendanceAlert } from '@/services/cron.service';
import { prisma } from '@/config/database';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export class AttendanceController {
  async create(req: Request, res: Response) {
    const userId = req.user!.userId;
    const validatedData = createAttendanceSchema.parse(req.body);
    const attendance = await attendanceService.createAttendance(userId, validatedData);

    // If student was absent and has telegramId, notify parent (non-blocking)
    if (validatedData.status === 'ABSENT') {
      db.student.findFirst({
        where: { id: validatedData.studentId, userId, isDeleted: false, telegramId: { not: null } },
        include: { groups: { include: { group: { select: { name: true } } }, where: { isActive: true }, take: 1 } },
      }).then((student: any) => {
        if (!student?.telegramId) return;
        const groupName = student.groups?.[0]?.group?.name || 'Noma\'lum guruh';
        sendAttendanceAlert(userId, student.id, student.fullName, groupName, student.telegramId);
      }).catch(() => {});
    }

    return sendSuccess(res, attendance, 'Davomat muvaffaqiyatli yaratildi', 201);
  }

  async bulkCreate(req: Request, res: Response) {
    const userId = req.user!.userId;
    const validatedData = bulkAttendanceSchema.parse(req.body);
    const result = await attendanceService.bulkCreateAttendance(userId, validatedData);
    return sendSuccess(res, result, 'Davomat muvaffaqiyatli saqlandi', 201);
  }

  async getAll(req: Request, res: Response) {
    const userId = req.user!.userId;
    const filters = attendanceFiltersSchema.parse({
      page:      req.query.page      ? Number(req.query.page)  : 1,
      limit:     req.query.limit     ? Number(req.query.limit) : 10,
      groupId:   req.query.groupId   as string | undefined,
      studentId: req.query.studentId as string | undefined,
      status:    req.query.status    as 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate:   req.query.endDate   as string | undefined,
    });

    const result = await attendanceService.getAllAttendances(userId, filters);
    return sendSuccess(res, result.data, 'Davomat muvaffaqiyatli yuklandi', 200);
  }

  async getById(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      throw new AppError('Davomat ID majburiy', 400);
    }

    const attendance = await attendanceService.getAttendanceById(id, userId);
    return sendSuccess(res, attendance, 'Davomat muvaffaqiyatli yuklandi');
  }

  async update(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      throw new AppError('Davomat ID majburiy', 400);
    }

    const validatedData = updateAttendanceSchema.parse(req.body);
    const attendance = await attendanceService.updateAttendance(id, userId, validatedData);
    return sendSuccess(res, attendance, 'Davomat muvaffaqiyatli yangilandi');
  }

  async delete(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      throw new AppError('Davomat ID majburiy', 400);
    }

    await attendanceService.deleteAttendance(id, userId);
    return sendSuccess(res, null, 'Davomat muvaffaqiyatli o\'chirildi');
  }

  async getGroupAttendanceByDate(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { groupId } = req.params;
    const { date } = req.query;
    
    if (!groupId || Array.isArray(groupId)) {
      throw new AppError('Guruh ID majburiy', 400);
    }
    
    if (!date || Array.isArray(date)) {
      throw new AppError('Sana majburiy', 400);
    }

    const attendances = await attendanceService.getGroupAttendanceByDate(groupId, userId, date as string);
    return sendSuccess(res, attendances, 'Guruh davomati muvaffaqiyatli yuklandi');
  }

  async getGroupStats(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { groupId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!groupId || Array.isArray(groupId)) {
      throw new AppError('Guruh ID majburiy', 400);
    }

    const stats = await attendanceService.getGroupStats(
      groupId, 
      userId, 
      startDate as string | undefined, 
      endDate as string | undefined
    );
    return sendSuccess(res, stats, 'Guruh statistikasi muvaffaqiyatli yuklandi');
  }

  async getStudentStats(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!studentId || Array.isArray(studentId)) {
      throw new AppError('Talaba ID majburiy', 400);
    }

    const stats = await attendanceService.getStudentStats(
      studentId, 
      userId, 
      startDate as string | undefined, 
      endDate as string | undefined
    );
    return sendSuccess(res, stats, 'Talaba statistikasi muvaffaqiyatli yuklandi');
  }
}

export const attendanceController = new AttendanceController();
