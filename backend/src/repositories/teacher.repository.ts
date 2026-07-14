import { prisma } from '@config/database';
import type { CreateTeacherInput, UpdateTeacherInput } from '@validators/teacher.validator';

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

export class TeacherRepository {
  async create(userId: string, data: CreateTeacherInput): Promise<Teacher> {
    return prisma.teacher.create({
      data: {
        userId,
        fullName: data.fullName,
        phone: data.phone,
        birthDate: data.birthDate,
        gender: data.gender,
        address: data.address || null,
        groupIds: data.groupIds || [],
        experience: data.experience,
        education: data.education || null,
        salary: data.salary || null,
        hireDate: data.hireDate,
        status: data.status,
        notes: data.notes || null,
      },
    });
  }

  async findAll(
    userId: string,
    options: {
      page: number;
      limit: number;
      search?: string;
      status?: string;
      groupId?: string;
    }
  ): Promise<{ teachers: Teacher[]; total: number }> {
    const { page, limit, search, status, groupId } = options;
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
      isDeleted: false,
    };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (groupId) {
      where.groupIds = { has: groupId };
    }

    const [teachers, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.teacher.count({ where }),
    ]);

    return { teachers, total };
  }

  async findById(id: string, userId: string): Promise<Teacher | null> {
    return prisma.teacher.findFirst({
      where: { id, userId, isDeleted: false },
    });
  }

  async update(
    id: string,
    _userId: string,
    data: UpdateTeacherInput
  ): Promise<Teacher> {
    return prisma.teacher.update({
      where: { id },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        birthDate: data.birthDate,
        gender: data.gender,
        address: data.address || null,
        groupIds: data.groupIds,
        experience: data.experience,
        education: data.education || null,
        salary: data.salary || null,
        hireDate: data.hireDate,
        status: data.status,
        notes: data.notes || null,
      },
    });
  }

  async softDelete(id: string, _userId: string): Promise<void> {
    // O'chirilganda telefon raqamni o'zgartirish - unique constraint muammosini hal qilish
    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (teacher) {
      await prisma.teacher.update({
        where: { id },
        data: {
          isDeleted: true,
          phone: `${teacher.phone}_deleted_${Date.now()}`, // Telefon raqamni noyob qilish
        },
      });
    }
  }

  async countByUserId(userId: string): Promise<number> {
    return prisma.teacher.count({
      where: { userId, isDeleted: false, status: 'ACTIVE' },
    });
  }
}
