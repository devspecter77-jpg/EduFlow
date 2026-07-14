import { TeacherRepository } from '@repositories/teacher.repository';
import { prisma } from '@/config/database';
import type {
  CreateTeacherInput,
  UpdateTeacherInput,
  TeacherQuery,
} from '@validators/teacher.validator';

type Teacher = {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  birthDate: Date | null;
  gender: 'MALE' | 'FEMALE';
  address: string | null;
  groupIds: string[];
  experience: number;
  education: string | null;
  salary: number | null;
  hireDate: Date | null;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  notes: string | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class TeacherService {
  private repo: TeacherRepository;

  constructor() {
    this.repo = new TeacherRepository();
  }

  async create(userId: string, data: CreateTeacherInput): Promise<Teacher> {
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
      throw new Error('Faol obuna topilmadi');
    }

    const plan = user.center.subscriptions[0].plan;
    
    // Count current active teachers
    const teacherCount = await this.repo.countByUserId(userId);

    if (teacherCount >= plan.maxTeachers) {
      throw new Error(
        `Tarif limiti yetdi. Maksimal ${plan.maxTeachers} ta o'qituvchi qo'shish mumkin. ` +
        `Hozirda: ${teacherCount} ta o'qituvchi. Tarifni yangilang.`
      );
    }

    return this.repo.create(userId, data);
  }

  async getAll(
    userId: string,
    query: TeacherQuery
  ): Promise<{
    teachers: Teacher[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page, limit, search, status, groupId } = query;
    const { teachers, total } = await this.repo.findAll(userId, {
      page,
      limit,
      search,
      status,
      groupId,
    });

    return {
      teachers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(id: string, userId: string): Promise<Teacher> {
    const teacher = await this.repo.findById(id, userId);
    if (!teacher) {
      throw new Error('O\'qituvchi topilmadi');
    }
    return teacher;
  }

  async update(
    id: string,
    userId: string,
    data: UpdateTeacherInput
  ): Promise<Teacher> {
    // Verify exists
    await this.getById(id, userId);
    return this.repo.update(id, userId, data);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.repo.softDelete(id, userId);
  }

  async getStats(userId: string): Promise<{ total: number }> {
    const total = await this.repo.countByUserId(userId);
    return { total };
  }
}
