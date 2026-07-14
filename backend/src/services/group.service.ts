import { groupRepository } from '@/repositories/group.repository';
import { TeacherRepository } from '@/repositories/teacher.repository';
import { prisma } from '@/config/database';
import type { CreateGroupInput, UpdateGroupInput, GroupFilters } from '@/validators/group.validator';
import { AppError } from '@/middleware/errorHandler';

const teacherRepository = new TeacherRepository();

export class GroupService {
  async createGroup(userId: string, data: CreateGroupInput) {
    // Check subscription limits before creating
    const user = await (prisma as any).user.findUnique({
      where: { id: userId },
      include: {
        center: {
          include: {
            subscriptions: {
              where: {
                status: { in: ['TRIAL', 'ACTIVE'] },
                endDate: { gte: new Date() },
              },
              include: { plan: true },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!user?.center?.subscriptions?.[0]?.plan) {
      throw new AppError('Faol obuna topilmadi', 403);
    }

    const plan = user.center.subscriptions[0].plan;
    
    // Count current active groups
    const groupCount = await groupRepository.countByUserId(userId);

    if (groupCount >= plan.maxGroups) {
      throw new AppError(
        `Tarif limiti yetdi. Maksimal ${plan.maxGroups} ta guruh qo'shish mumkin. ` +
        `Hozirda: ${groupCount} ta guruh. Tarifni yangilang.`,
        403
      );
    }

    // Verify teacher exists if provided
    if (data.teacherId) {
      const teacher = await teacherRepository.findById(data.teacherId, userId);
      if (!teacher) {
        throw new AppError('O\'qituvchi topilmadi', 404);
      }
      if (teacher.status !== 'ACTIVE') {
        throw new AppError('O\'qituvchi faol emas', 400);
      }
    }

    return await groupRepository.create(userId, data);
  }

  async getGroupById(id: string, userId: string) {
    const group = await groupRepository.findById(id, userId);
    if (!group) {
      throw new AppError('Guruh topilmadi', 404);
    }
    return group;
  }

  async getAllGroups(userId: string, filters: GroupFilters) {
    return await groupRepository.findAll(userId, filters);
  }

  async updateGroup(id: string, userId: string, data: UpdateGroupInput) {
    const exists = await groupRepository.exists(id, userId);
    if (!exists) {
      throw new AppError('Guruh topilmadi', 404);
    }

    // Verify teacher if being updated
    if (data.teacherId) {
      const teacher = await teacherRepository.findById(data.teacherId, userId);
      if (!teacher) {
        throw new AppError('O\'qituvchi topilmadi', 404);
      }
      if (teacher.status !== 'ACTIVE') {
        throw new AppError('O\'qituvchi faol emas', 400);
      }
    }

    return await groupRepository.update(id, data);
  }

  async deleteGroup(id: string, userId: string) {
    const exists = await groupRepository.exists(id, userId);
    if (!exists) {
      throw new AppError('Guruh topilmadi', 404);
    }

    // Check if group has active students
    const group = await groupRepository.findById(id, userId);
    if (group && group._count.students > 0) {
      throw new AppError('Guruhda faol talabalar mavjud. Avval talabalarni olib tashlang.', 400);
    }

    return await groupRepository.delete(id);
  }

  async addStudentToGroup(groupId: string, studentId: string, userId: string) {
    const groupExists = await groupRepository.exists(groupId, userId);
    if (!groupExists) {
      throw new AppError('Guruh topilmadi', 404);
    }

    // Check if group is at capacity
    const group = await groupRepository.findById(groupId, userId);
    if (group && group._count.students >= group.maxStudents) {
      throw new AppError('Guruh to\'lgan. Maksimal talabalar soni: ' + group.maxStudents, 400);
    }

    // Check if student is already in group
    const students = await groupRepository.getGroupStudents(groupId);
    const isAlreadyMember = students.some(s => s.studentId === studentId);
    if (isAlreadyMember) {
      throw new AppError('Talaba allaqachon guruhda', 400);
    }

    return await groupRepository.addStudent(groupId, studentId);
  }

  async removeStudentFromGroup(groupId: string, studentId: string, userId: string) {
    const groupExists = await groupRepository.exists(groupId, userId);
    if (!groupExists) {
      throw new AppError('Guruh topilmadi', 404);
    }

    return await groupRepository.removeStudent(groupId, studentId);
  }

  async getGroupStudents(groupId: string, userId: string) {
    const groupExists = await groupRepository.exists(groupId, userId);
    if (!groupExists) {
      throw new AppError('Guruh topilmadi', 404);
    }

    return await groupRepository.getGroupStudents(groupId);
  }
}

export const groupService = new GroupService();
