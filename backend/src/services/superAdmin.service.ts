import { prisma } from '@/config/database';
import bcrypt from 'bcrypt';
import { env } from '@/config/env';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

// ─── Users ────────────────────────────────────────────────────────────────────

export async function listUsers(params: {
  page?: number; limit?: number; role?: string; isActive?: boolean; search?: string;
}) {
  const { page = 1, limit = 20, role, isActive, search } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { role: { not: 'SUPER_ADMIN' } };
  if (role) where.role = role;
  if (isActive !== undefined) where.isActive = isActive;
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
      { centerName: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    db.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      // Explicit select (no password/email/avatar/trialEndsAt/etc.) — never return
      // credential material from a list endpoint, matching getUserById below.
      select: {
        id: true,
        fullName: true,
        phone: true,
        centerName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        center: {
          select: { id: true, name: true, status: true },
        },
      },
    }),
    db.user.count({ where }),
  ]);

  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getUserById(id: string) {
  // isActive: true mirrors getImpersonateToken below — a blocked/inactive
  // account must never be usable as an impersonation target.
  return db.user.findFirst({
    where: { id, isActive: true },
    select: { id: true, fullName: true, phone: true, role: true, centerName: true, isActive: true, centerId: true },
  });
}

export async function blockUser(id: string) {
  return db.user.update({ where: { id }, data: { isActive: false } });
}

export async function unblockUser(id: string) {
  return db.user.update({ where: { id }, data: { isActive: true } });
}

// ─── Center ───────────────────────────────────────────────────────────────────

export async function listCenters(params: {
  page?: number; limit?: number; status?: string; search?: string;
}) {
  const { page = 1, limit = 20, status, search } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { isDeleted: false };
  if (status) where.status = status;
  if (search) where.name = { contains: search, mode: 'insensitive' };

  const [data, total] = await Promise.all([
    db.center.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { plan: true },
        },
        _count: { select: { users: true } },
      },
    }),
    db.center.count({ where }),
  ]);

  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getCenterById(id: string) {
  const center = await db.center.findFirst({
    where: { id, isDeleted: false },
    include: {
      subscriptions: { orderBy: { createdAt: 'desc' }, take: 1, include: { plan: true } },
      users: {
        where: { role: { not: 'SUPER_ADMIN' } },
        select: { id: true, fullName: true, phone: true, role: true, lastLoginAt: true, isActive: true },
        take: 10,
      },
      _count: { select: { users: true } },
    },
  });
  return center;
}

export async function getCenterStats(centerId: string) {
  // Get the center's primary (earliest-registered) user — self-registered
  // centers default to MANAGER, not ADMIN, so this must not hardcode a role.
  const adminUser = await db.user.findFirst({
    where: { centerId, role: { not: 'SUPER_ADMIN' } },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });

  if (!adminUser) {
    return { students: 0, teachers: 0, groups: 0, totalRevenue: 0 };
  }

  const userId = adminUser.id;
  const [students, teachers, groups, payments] = await Promise.all([
    db.student.count({ where: { userId, isDeleted: false } }),
    db.teacher.count({ where: { userId, isDeleted: false } }),
    db.group.count({ where: { userId, isDeleted: false } }),
    db.payment.aggregate({
      where: { student: { userId }, isDeleted: false, status: 'PAID' },
      _sum: { paidAmount: true },
    }),
  ]);

  return {
    students,
    teachers,
    groups,
    totalRevenue: payments._sum.paidAmount || 0,
  };
}

export async function createCenter(data: {
  name: string; phone?: string; email?: string; address?: string;
  adminFullName: string; adminPhone: string; adminPassword: string;
  planType?: string;
}) {
  const slug = data.name.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 50) + '-' + Date.now().toString(36);

  // Get plan
  const plan = await db.plan.findFirst({
    where: { type: data.planType || 'FREE', isActive: true },
  });
  if (!plan) throw new Error('Plan topilmadi');

  // Create center + admin user + subscription in transaction
  const result = await db.$transaction(async (tx: any) => {
    // Create center
    const center = await tx.center.create({
      data: { name: data.name, slug, phone: data.phone, email: data.email, address: data.address },
    });

    // Create admin user
    const hashedPassword = await bcrypt.hash(data.adminPassword, env.BCRYPT_ROUNDS);
    const admin = await tx.user.create({
      data: {
        centerName: data.name,
        fullName: data.adminFullName,
        phone: data.adminPhone,
        password: hashedPassword,
        role: 'ADMIN',
        centerId: center.id,
      },
    });

    // Create settings for admin
    await tx.settings.create({
      data: {
        userId: admin.id,
        centerName: data.name,
        phone: data.phone,
        address: data.address,
      },
    });

    // Create trial subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.trialDays);

    const subscription = await tx.subscription.create({
      data: {
        centerId: center.id,
        planId: plan.id,
        status: 'TRIAL',
        startDate,
        endDate,
        price: 0,
      },
    });

    return { center, admin, subscription };
  });

  return result;
}

export async function updateCenter(id: string, data: {
  name?: string; phone?: string; email?: string; address?: string;
  status?: string; logo?: string; description?: string;
}) {
  return db.center.update({ where: { id }, data });
}

export async function deleteCenter(id: string) {
  return db.center.update({
    where: { id },
    data: { isDeleted: true, status: 'DELETED' },
  });
}

export async function blockCenter(id: string) {
  await db.center.update({ where: { id }, data: { status: 'BLOCKED' } });
  // Deactivate all users
  await db.user.updateMany({ where: { centerId: id }, data: { isActive: false } });
}

export async function unblockCenter(id: string) {
  await db.center.update({ where: { id }, data: { status: 'ACTIVE' } });
  await db.user.updateMany({ where: { centerId: id }, data: { isActive: true } });
}

// ─── Plans ────────────────────────────────────────────────────────────────────

export async function listPlans() {
  return db.plan.findMany({ where: { isActive: true }, orderBy: { price: 'asc' } });
}

export async function updatePlan(id: string, data: {
  name?: string; price?: number;
  maxStudents?: number; maxTeachers?: number; maxGroups?: number;
  features?: string[];
}) {
  return db.plan.update({
    where: { id },
    data: { ...data, ...(data.features && { features: JSON.stringify(data.features) }) },
  });
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

export async function updateSubscription(id: string, data: {
  status?: string; endDate?: Date; planId?: string; price?: number; notes?: string;
}) {
  return db.subscription.update({ where: { id }, data });
}

export async function extendSubscription(centerId: string, planId: string, months: number, price: number) {
  const plan = await db.plan.findUnique({ where: { id: planId } });
  if (!plan) throw new Error('Plan topilmadi');

  const existing = await db.subscription.findFirst({
    where: { centerId },
    orderBy: { createdAt: 'desc' },
  });

  const startDate = new Date();
  // Bug fix: previously fell back to the *same* Date instance as startDate,
  // so the .setMonth() below silently corrupted startDate too whenever
  // there was no still-active existing subscription to extend from.
  const endDate = existing?.endDate && new Date(existing.endDate) > startDate
    ? new Date(existing.endDate)
    : new Date(startDate);
  endDate.setMonth(endDate.getMonth() + months);

  // Extending must also lift any auto-suspension from a lapsed subscription —
  // otherwise the center stays blocked/its users stay deactivated even though
  // a fresh, active subscription period was just paid for.
  const [subscription] = await db.$transaction([
    db.subscription.create({
      data: {
        centerId,
        planId,
        status: 'ACTIVE',
        startDate,
        endDate,
        price,
      },
    }),
    db.center.update({ where: { id: centerId }, data: { status: 'ACTIVE' } }),
    db.user.updateMany({ where: { centerId }, data: { isActive: true } }),
  ]);

  return subscription;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export async function getSuperAdminStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalCenters,
    activeCenters,
    blockedCenters,
    trialSubs,
    expiredSubs,
    activeSubs,
    recentCenters,
    monthlyRevenue,
  ] = await Promise.all([
    db.center.count({ where: { isDeleted: false } }),
    db.center.count({ where: { isDeleted: false, status: 'ACTIVE' } }),
    db.center.count({ where: { isDeleted: false, status: 'BLOCKED' } }),
    db.subscription.count({ where: { status: 'TRIAL' } }),
    db.subscription.count({ where: { status: 'EXPIRED' } }),
    db.subscription.count({ where: { status: 'ACTIVE' } }),
    db.center.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        subscriptions: { take: 1, orderBy: { createdAt: 'desc' }, include: { plan: true } },
      },
    }),
    db.subscription.aggregate({
      where: { status: 'ACTIVE', createdAt: { gte: startOfMonth } },
      _sum: { price: true },
    }),
  ]);

  return {
    totalCenters,
    activeCenters,
    blockedCenters,
    subscriptions: { trial: trialSubs, active: activeSubs, expired: expiredSubs },
    monthlyRevenue: monthlyRevenue._sum.price || 0,
    recentCenters,
  };
}

// ─── Impersonate ──────────────────────────────────────────────────────────────

export async function getImpersonateToken(centerId: string) {
  const admin = await db.user.findFirst({
    where: { centerId, role: 'ADMIN', isActive: true },
    select: { id: true, phone: true, role: true, fullName: true, centerName: true, centerId: true },
  });
  if (!admin) throw new Error('Bu center uchun admin topilmadi');
  return admin;
}
