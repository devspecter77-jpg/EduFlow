import { User, Role } from '@prisma/client';
import { AuthRepository } from '@repositories/auth.repository';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  JwtPayload,
} from '@utils/index';
import { env } from '@config/env';

type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  /**
   * Calculate subscription status based on trial end date
   */
  private calculateSubscriptionStatus(user: User): SubscriptionStatus {
    // Super admins don't have subscription limits
    if (user.role === 'SUPER_ADMIN') {
      return 'ACTIVE';
    }

    if (!user.trialEndsAt) {
      return 'EXPIRED';
    }

    const now = new Date();
    const trialEnd = new Date(user.trialEndsAt);

    if (now < trialEnd) {
      return 'TRIAL';
    } else {
      return 'EXPIRED';
    }
  }

  /**
   * Format user response with subscription status
   */
  private formatUserResponse(user: User): Omit<User, 'password'> & { subscriptionStatus: SubscriptionStatus } {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      subscriptionStatus: this.calculateSubscriptionStatus(user),
    };
  }

  /**
   * Register a new user
   */
  async register(data: {
    centerName: string;
    fullName: string;
    phone: string;
    password: string;
    role?: Role;
  }): Promise<{
    user: Omit<User, 'password'>;
    accessToken: string;
    refreshToken: string;
  }> {
    // Check if user already exists
    const existingUser = await this.authRepository.findUserByPhone(data.phone);
    if (existingUser) {
      throw new Error('Bu telefon raqam bilan foydalanuvchi allaqachon ro\'yxatdan o\'tgan');
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Calculate trial end date (10 days from now)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 10);

    // Create user
    const user = await this.authRepository.createUser({
      ...data,
      password: hashedPassword,
      trialEndsAt,
    });

    // Generate tokens
    const payload: JwtPayload = {
      userId: user.id,
      email: user.phone, // Using phone as identifier
      role: user.role,
      centerId: user.centerId || undefined,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save refresh token
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(
      refreshTokenExpiry.getDate() + parseInt(env.JWT_REFRESH_EXPIRES_IN.replace('d', ''), 10)
    );

    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId: user.id,
      expiresAt: refreshTokenExpiry,
    });

    return {
      user: this.formatUserResponse(user),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login user
   */
  async login(data: {
    phone: string;
    password: string;
    rememberMe?: boolean;
  }): Promise<{
    user: Omit<User, 'password'>;
    accessToken: string;
    refreshToken: string;
  }> {
    // Find user
    const user = await this.authRepository.findUserByPhone(data.phone);
    if (!user) {
      throw new Error('Telefon raqam yoki parol noto\'g\'ri');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Sizning hisobingiz faolsizlantirilgan');
    }

    // Verify password
    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Telefon raqam yoki parol noto\'g\'ri');
    }

    // Generate tokens
    const payload: JwtPayload = {
      userId: user.id,
      email: user.phone, // Using phone as identifier
      role: user.role,
      centerId: user.centerId || undefined,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save refresh token
    const refreshTokenExpiry = new Date();
    const expiryDays = data.rememberMe ? 30 : 7;
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + expiryDays);

    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId: user.id,
      expiresAt: refreshTokenExpiry,
    });

    return {
      user: this.formatUserResponse(user),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Check if token exists in database
    const tokenRecord = await this.authRepository.findRefreshToken(refreshToken);
    if (!tokenRecord) {
      throw new Error('Noto\'g\'ri refresh token');
    }

    // Check if token is revoked
    if (tokenRecord.isRevoked) {
      throw new Error('Refresh token bekor qilingan');
    }

    // Check if token is expired
    if (new Date() > tokenRecord.expiresAt) {
      throw new Error('Refresh token muddati tugagan');
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    // Revoke old refresh token
    await this.authRepository.revokeRefreshToken(refreshToken);

    // Save new refresh token
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(
      refreshTokenExpiry.getDate() + parseInt(env.JWT_REFRESH_EXPIRES_IN.replace('d', ''), 10)
    );

    await this.authRepository.createRefreshToken({
      token: newRefreshToken,
      userId: payload.userId,
      expiresAt: refreshTokenExpiry,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logout user
   */
  async logout(refreshToken: string): Promise<void> {
    const tokenRecord = await this.authRepository.findRefreshToken(refreshToken);
    if (tokenRecord) {
      await this.authRepository.revokeRefreshToken(refreshToken);
    }
  }

  /**
   * Logout from all devices
   */
  async logoutAll(userId: string): Promise<void> {
    await this.authRepository.revokeAllUserTokens(userId);
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<(Omit<User, 'password'> & { subscriptionStatus: SubscriptionStatus }) | null> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      return null;
    }

    return this.formatUserResponse(user);
  }
}
