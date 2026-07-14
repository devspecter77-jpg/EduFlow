import { prisma } from '@/config/database';
import type { Prisma } from '@prisma/client';
import type { CreateGroupInput, UpdateGroupInput, GroupFilters } from '@/validators/group.validator';

export class GroupRepository {
  async create(userId: string, data: CreateGroupInput) {
    // Auto-generate dates if not provided
    const startDate = data.startDate ? new Date(data.startDate) : new Date();
    const endDate = data.endDate ? new Date(data.endDate) : (() => {
      const auto = new Date(startDate);
      auto.setMonth(auto.getMonth() + 3); // Default 3 months
      return auto;
    })();

    return await prisma.group.create({
      data: {
        userId,
        name: data.name,
        subject: data.subject,
        level: data.level,
        teacherId: data.teacherId || undefined,
        startDate,
        endDate,
        schedule: data.schedule,
        courseFee: data.courseFee || 0,
        maxStudents: data.maxStudents || 20,
        room: data.room || null,
        status: data.status || 'ACTIVE',
        description: data.description || null,
      },
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
    });
  }

  async findById(id: string, userId: string) {
    return await prisma.group.findFirst({
      where: {
        id,
        userId,
        isDeleted: false,
      },
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            experience: true,
          },
        },
        students: {
          where: {
            isActive: true,
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
        },
        _count: {
          select: {
            students: true,
            attendances: true,
            payments: true,
          },
        },
      },
    });
  }

  async findAll(userId: string, filters: GroupFilters) {
    const { page = 1, limit = 10, search, status, teacherId } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.GroupWhereInput = {
      userId,
      isDeleted: false,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { level: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (teacherId) {
      where.teacherId = teacherId;
    }

    const [data, total] = await Promise.all([
      prisma.group.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          teacher: {
            select: {
              id: true,
              fullName: true,
              phone: true,
            },
          },
        },
      }),
      prisma.group.count({ where }),
    ]);

    // Manually count active students for each group
    const dataWithCounts = await Promise.all(
      data.map(async (group) => {
        const studentCount = await prisma.student.count({
          where: {
            groupId: group.id,
            isDeleted: false,
            status: 'ACTIVE',
          },
        });
        return {
          ...group,
          _count: {
            students: studentCount,
          },
        };
      })
    );

    return {
      data: dataWithCounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, data: UpdateGroupInput) {
    const updateData: Prisma.GroupUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.subject !== undefined) updateData.subject = data.subject;
    if (data.level !== undefined) updateData.level = data.level;
    if (data.teacherId !== undefined) {
      if (data.teacherId) {
        updateData.teacher = { connect: { id: data.teacherId } };
      }
      // If teacherId is null/empty, keep existing teacher (optional field)
    }
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.schedule !== undefined) updateData.schedule = data.schedule;
    if (data.courseFee !== undefined) updateData.courseFee = data.courseFee;
    if (data.maxStudents !== undefined) updateData.maxStudents = data.maxStudents;
    if (data.room !== undefined) updateData.room = data.room;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.description !== undefined) updateData.description = data.description;

    return await prisma.group.update({
      where: { id },
      data: updateData,
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return await prisma.group.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async exists(id: string, userId: string): Promise<boolean> {
    const count = await prisma.group.count({
      where: {
        id,
        userId,
        isDeleted: false,
      },
    });
    return count > 0;
  }

  async countActive(userId: string): Promise<number> {
    return await prisma.group.count({
      where: {
        userId,
        status: 'ACTIVE',
        isDeleted: false,
      },
    });
  }

  async getRecentGroups(userId: string, limit: number = 5) {
    const groups = await prisma.group.findMany({
      where: {
        userId,
        isDeleted: false,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    // Manually count active students for each group
    const groupsWithCounts = await Promise.all(
      groups.map(async (group) => {
        const studentCount = await prisma.student.count({
          where: {
            groupId: group.id,
            isDeleted: false,
            status: 'ACTIVE',
          },
        });
        return {
          ...group,
          _count: {
            students: studentCount,
          },
        };
      })
    );

    return groupsWithCounts;
  }

  async addStudent(groupId: string, studentId: string) {
    return await prisma.studentGroup.create({
      data: {
        groupId,
        studentId,
      },
    });
  }

  async removeStudent(groupId: string, studentId: string) {
    return await prisma.studentGroup.updateMany({
      where: {
        groupId,
        studentId,
        isActive: true,
      },
      data: {
        isActive: false,
        leftAt: new Date(),
      },
    });
  }

  async getGroupStudents(groupId: string) {
    return await prisma.studentGroup.findMany({
      where: {
        groupId,
        isActive: true,
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

  async countByUserId(userId: string): Promise<number> {
    return await prisma.group.count({
      where: {
        userId,
        isDeleted: false,
      },
    });
  }
}

export const groupRepository = new GroupRepository();
