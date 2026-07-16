import { prisma } from '@config/database';

export type ProfileRow = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  centerName: string;
  role: string;
  avatar: string | null;
  isActive: boolean;
  lastLoginAt: Date | null;
  lastLoginIp: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export interface UpdateProfileInput {
  fullName?: string;
  email?: string | null;
  phone?: string;
  centerName?: string;
  avatar?: string | null;
}

const profileSelect = {
  id: true,
  fullName: true,
  phone: true,
  centerName: true,
  role: true,
  avatar: true,
  isActive: true,
  lastLoginAt: true,
  lastLoginIp: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class ProfileRepository {
  /**
   * Get user profile
   */
  async findById(userId: string): Promise<ProfileRow | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: profileSelect,
    });
    if (!user) return null;
    return { ...user, email: null } as ProfileRow;
  }

  /**
   * Update user profile
   */
  async update(userId: string, data: UpdateProfileInput): Promise<ProfileRow> {
    // Filter out email since it may not exist in old schema — update only safe fields
    const updateData: Record<string, unknown> = {};
    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.centerName !== undefined) updateData.centerName = data.centerName;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData as any,
      select: { ...profileSelect, centerId: true },
    });

    // Keep the Center record and per-user Settings copy of the name in sync —
    // both are separate denormalized copies read by the SuperAdmin panel.
    if (data.centerName !== undefined) {
      const tasks: Promise<unknown>[] = [];
      if ((user as any).centerId) {
        tasks.push(prisma.center.update({
          where: { id: (user as any).centerId },
          data: { name: data.centerName },
        }));
      }
      tasks.push(prisma.settings.updateMany({
        where: { userId },
        data: { centerName: data.centerName },
      }));
      await Promise.all(tasks);
    }

    return { ...user, email: null } as ProfileRow;
  }

  /**
   * Update password
   */
  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  /**
   * Update last login info
   */
  async updateLastLogin(userId: string, ipAddress: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
      } as any,
    });
  }

  /**
   * Check if phone is taken by another user
   */
  async isPhoneTaken(phone: string, excludeUserId?: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: {
        phone,
        ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
      },
    });
    return count > 0;
  }
}

export const profileRepository = new ProfileRepository();
