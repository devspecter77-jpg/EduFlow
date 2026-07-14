import { attendanceRepository } from '@/repositories/attendance.repository';
import { groupRepository } from '@/repositories/group.repository';
import { StudentRepository } from '@/repositories/student.repository';
import type { CreateAttendanceInput, UpdateAttendanceInput, AttendanceFilters, BulkAttendanceInput } from '@/validators/attendance.validator';
import { AppError } from '@/middleware/errorHandler';
import { prisma } from '@/config/database';

const studentRepository = new StudentRepository();

export class AttendanceService {
  async createAttendance(userId: string, data: CreateAttendanceInput) {
    // Verify group exists
    const group = await groupRepository.findById(data.groupId, userId);
    if (!group) {
      throw new AppError('Guruh topilmadi', 404);
    }

    // Verify student exists
    const student = await prisma.student.findFirst({
      where: { id: data.studentId, isDeleted: false },
    });
    if (!student) {
      throw new AppError('Talaba topilmadi', 404);
    }

    return await attendanceRepository.create(data);
  }

  async bulkCreateAttendance(userId: string, data: BulkAttendanceInput) {
    // Verify group exists
    const group = await groupRepository.findById(data.groupId, userId);
    if (!group) {
      throw new AppError('Guruh topilmadi', 404);
    }

    const date = new Date(data.date);

    const attendances = data.attendances.map(att => ({
      studentId: att.studentId,
      groupId: data.groupId,
      date,
      status: att.status as 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED',
      notes: att.notes || null,
    }));

    await attendanceRepository.bulkCreate(attendances);

    return { success: true, count: attendances.length };
  }

  async getAttendanceById(id: string, userId: string) {
    const attendance = await attendanceRepository.findById(id, userId);
    if (!attendance) {
      throw new AppError('Davomat topilmadi', 404);
    }
    return attendance;
  }

  async getAllAttendances(userId: string, filters: AttendanceFilters) {
    return await attendanceRepository.findAll(userId, filters);
  }

  async updateAttendance(id: string, userId: string, data: UpdateAttendanceInput) {
    const exists = await attendanceRepository.exists(id, userId);
    if (!exists) {
      throw new AppError('Davomat topilmadi', 404);
    }
    return await attendanceRepository.update(id, userId, data);
  }

  async deleteAttendance(id: string, userId: string) {
    const exists = await attendanceRepository.exists(id, userId);
    if (!exists) {
      throw new AppError('Davomat topilmadi', 404);
    }
    return await attendanceRepository.delete(id, userId);
  }

  async getGroupAttendanceByDate(groupId: string, userId: string, date: string) {
    const group = await groupRepository.findById(groupId, userId);
    if (!group) {
      throw new AppError('Guruh topilmadi', 404);
    }
    return await attendanceRepository.getByGroupAndDate(groupId, new Date(date));
  }

  async getGroupStats(groupId: string, userId: string, startDate?: string, endDate?: string) {
    const group = await groupRepository.findById(groupId, userId);
    if (!group) {
      throw new AppError('Guruh topilmadi', 404);
    }
    return await attendanceRepository.getStatsByGroup(
      groupId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
  }

  async getStudentStats(studentId: string, userId: string, startDate?: string, endDate?: string) {
    const student = await studentRepository.findById(studentId, userId);
    if (!student) {
      throw new AppError('Talaba topilmadi', 404);
    }
    return await attendanceRepository.getStatsByStudent(
      studentId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
  }
}

export const attendanceService = new AttendanceService();
