import { prisma } from '@config/database';
import type { Prisma } from '@prisma/client';
import type { CreateStudentInput, UpdateStudentInput } from '@validators/student.validator';

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
  startDate: Date | null;
  paymentType: 'MONTHLY' | 'YEARLY';
  paymentAmount: number | null;
  nextPaymentDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class StudentRepository {
  async create(userId: string, data: CreateStudentInput): Promise<Student> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (prisma as any).student.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        parentFullName: data.parentFullName || null,
        parentPhone: data.parentPhone || null,
        birthDate: data.birthDate || null,
        gender: data.gender,
        address: data.address || null,
        groupId: data.groupId || null,
        status: data.status,
        notes: data.notes || null,
        startDate: data.startDate || null,
        paymentType: data.paymentType,
        paymentAmount: data.paymentAmount ?? null,
        nextPaymentDate: data.nextPaymentDate || null,
        userId,
      },
    });
  }

  async findAll(
    userId: string,
    params: {
      page: number;
      limit: number;
      search?: string;
      status?: string;
      gender?: string;
    }
  ): Promise<{ students: Student[]; total: number }> {
    const { page, limit, search, status, gender } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.InputJsonObject = {
      userId,
      isDeleted: false,
      ...(status && { status }),
      ...(gender && { gender }),
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
        ],
      }),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = prisma as any;
    const [students, total] = await prisma.$transaction([
      p.student.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      p.student.count({ where }),
    ]);

    return { students, total };
  }

  async findById(id: string, userId: string): Promise<Student | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (prisma as any).student.findFirst({
      where: { id, userId, isDeleted: false },
    });
  }

  async update(id: string, _userId: string, data: UpdateStudentInput): Promise<Student> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (prisma as any).student.update({
      where: { id },
      data: {
        ...(data.fullName !== undefined && { fullName: data.fullName }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.parentFullName !== undefined && { parentFullName: data.parentFullName || null }),
        ...(data.parentPhone !== undefined && { parentPhone: data.parentPhone || null }),
        ...(data.birthDate !== undefined && { birthDate: data.birthDate || null }),
        ...(data.gender !== undefined && { gender: data.gender }),
        ...(data.address !== undefined && { address: data.address || null }),
        ...(data.groupId !== undefined && { groupId: data.groupId || null }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
        ...(data.startDate !== undefined && { startDate: data.startDate || null }),
        ...(data.paymentType !== undefined && { paymentType: data.paymentType }),
        ...(data.paymentAmount !== undefined && { paymentAmount: data.paymentAmount ?? null }),
        ...(data.nextPaymentDate !== undefined && { nextPaymentDate: data.nextPaymentDate || null }),
      },
    });
  }

  async softDelete(id: string, userId: string): Promise<Student> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = prisma as any;
    const existing = await p.student.findFirst({
      where: { id, userId, isDeleted: false },
    });
    if (!existing) throw new Error('O\'quvchi topilmadi');
    
    // O'chirilganda telefon raqamni o'zgartirish - unique constraint muammosini hal qilish
    return p.student.update({
      where: { id },
      data: {
        isDeleted: true,
        phone: `${existing.phone}_deleted_${Date.now()}`, // Telefon raqamni noyob qilish
      },
    });
  }

  async countByUserId(userId: string): Promise<number> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (prisma as any).student.count({
      where: { userId, isDeleted: false, status: 'ACTIVE' },
    });
  }

  async getByPhone(phone: string, userId: string): Promise<Student | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (prisma as any).student.findFirst({
      where: { phone, userId, isDeleted: false },
    });
  }
}
