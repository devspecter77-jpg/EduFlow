import { prisma } from '@config/database';
import { $Enums, Prisma } from '@prisma/client';

export type AuditLogRow = {
  id: string;
  userId: string;
  action: $Enums.AuditAction;
  entity: string;
  entityId: string | null;
  description: string;
  metadata: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
};

export interface CreateAuditLogInput {
  userId: string;
  action: $Enums.AuditAction;
  entity: string;
  entityId?: string;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogFilters {
  userId?: string;
  action?: $Enums.AuditAction;
  entity?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export class AuditLogRepository {
  /**
   * Create audit log entry
   */
  async create(data: CreateAuditLogInput): Promise<AuditLogRow> {
    return prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        description: data.description,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  /**
   * Get paginated audit logs with filters
   */
  async findMany(
    filters: AuditLogFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: AuditLogRow[]; total: number }> {
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.entity) where.entity = filters.entity;
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {
        ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
        ...(filters.dateTo ? { lte: filters.dateTo } : {}),
      };
    }

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              role: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { data: data as unknown as AuditLogRow[], total };
  }

  /**
   * Get recent logs for a user
   */
  async findRecent(userId: string, limit: number = 10): Promise<AuditLogRow[]> {
    return prisma.auditLog.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: 'desc' },
    }) as unknown as AuditLogRow[];
  }

  /**
   * Delete logs older than N days, scoped to a single tenant/user
   */
  async deleteOlderThan(userId: string, days: number): Promise<number> {
    const date = new Date();
    date.setDate(date.getDate() - days);

    const result = await prisma.auditLog.deleteMany({
      where: {
        userId,
        createdAt: { lt: date },
      },
    });

    return result.count;
  }
}

export const auditLogRepository = new AuditLogRepository();
