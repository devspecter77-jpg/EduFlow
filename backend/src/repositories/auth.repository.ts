import { prisma } from '@config/database';
import { User, RefreshToken, Role } from '@prisma/client';

export class AuthRepository {
  /**
   * Create a new user with Center and Trial Subscription
   */
  async createUser(data: {
    centerName: string;
    fullName: string;
    phone: string;
    password: string;
    role?: Role;
    trialEndsAt?: Date;
  }): Promise<User> {
    // Create Center, User, and Trial Subscription in a transaction
    return prisma.$transaction(async (tx) => {
      // 1. Get the FREE plan (Trial)
      const trialPlan = await (tx as any).plan.findUnique({
        where: { type: 'FREE' },
      });

      if (!trialPlan) {
        throw new Error('Trial plan topilmadi. Iltimos admin bilan bog\'laning.');
      }

      // 2. Create slug from centerName
      const slug = data.centerName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        + '-' + Date.now().toString(36);

      // 3. Create Center
      const center = await (tx as any).center.create({
        data: {
          name: data.centerName,
          slug,
          status: 'ACTIVE',
        },
      });

      // 4. Create User linked to Center
      const user = await (tx as any).user.create({
        data: {
          centerName: data.centerName,
          fullName: data.fullName,
          phone: data.phone,
          password: data.password,
          role: data.role || 'ADMIN',
          centerId: center.id,
          trialEndsAt: data.trialEndsAt,
        },
      });

      // 5. Create Trial Subscription
      const startDate = new Date();
      const endDate = data.trialEndsAt || new Date();
      if (!data.trialEndsAt) {
        endDate.setDate(startDate.getDate() + trialPlan.trialDays);
      }

      await (tx as any).subscription.create({
        data: {
          centerId: center.id,
          planId: trialPlan.id,
          status: 'TRIAL',
          startDate,
          endDate,
          price: 0,
        },
      });

      return user;
    });
  }

  /**
   * Find user by phone
   */
  async findUserByPhone(phone: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { phone },
    });
  }

  /**
   * Find user by ID
   */
  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Create refresh token
   */
  async createRefreshToken(data: {
    token: string;
    userId: string;
    expiresAt: Date;
  }): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data,
    });
  }

  /**
   * Find refresh token
   */
  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  /**
   * Revoke refresh token
   */
  async revokeRefreshToken(token: string): Promise<RefreshToken> {
    return prisma.refreshToken.update({
      where: { token },
      data: { isRevoked: true },
    });
  }

  /**
   * Revoke all user refresh tokens
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  /**
   * Delete expired refresh tokens
   */
  async deleteExpiredTokens(): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  /**
   * Update user
   */
  async updateUser(
    id: string,
    data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}
