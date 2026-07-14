import { StudentRepository } from '@repositories/student.repository';
import { prisma } from '@/config/database';
import type {
  CreateStudentInput,
  UpdateStudentInput,
  StudentQuery,
} from '@validators/student.validator';

type Student = {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  parentPhone: string | null;
  birthDate: Date | null;
  gender: 'MALE' | 'FEMALE';
  address: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'EXPELLED';
  notes: string | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class StudentService {
  private repo: StudentRepository;

  constructor() {
    this.repo = new StudentRepository();
  }

  async create(userId: string, data: CreateStudentInput): Promise<Student> {
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
    
    // Count current active students
    const studentCount = await this.repo.countByUserId(userId);

    if (studentCount >= plan.maxStudents) {
      throw new Error(
        `Tarif limiti yetdi. Maksimal ${plan.maxStudents} ta talaba qo'shish mumkin. ` +
        `Hozirda: ${studentCount} ta talaba. Tarifni yangilang.`
      );
    }

    return this.repo.create(userId, data);
  }

  async getAll(
    userId: string,
    query: StudentQuery
  ): Promise<{
    students: Student[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page, limit, search, status, gender } = query;
    const { students, total } = await this.repo.findAll(userId, {
      page,
      limit,
      search,
      status,
      gender,
    });

    return {
      students,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(id: string, userId: string): Promise<Student> {
    const student = await this.repo.findById(id, userId);
    if (!student) {
      throw new Error('O\'quvchi topilmadi');
    }
    return student;
  }

  async update(
    id: string,
    userId: string,
    data: UpdateStudentInput
  ): Promise<Student> {
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
