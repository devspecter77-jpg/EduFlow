import { Request, Response } from 'express';
import { AuthService } from '@services/auth.service';
import type { ApiResponse } from '@/types';
import { sendSuccess } from '@utils/response';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
} from '@validators/auth.validator';
import { Role } from '@prisma/client';
import { auditLogRepository } from '@repositories/auditLog.repository';
import { profileRepository } from '@repositories/profile.repository';
import { trackFailedLogin, resetBruteForce } from '@/middleware/security.middleware';

const authService = new AuthService();

// Frontend (Vercel) and backend (Railway) are different domains, so the
// refresh-token cookie is a cross-site cookie — SameSite=strict/lax would
// never be sent on those requests, silently breaking token refresh and
// forcing every user back to /login. SameSite=none requires Secure.
const isProd = process.env.NODE_ENV === 'production';
const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
};

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (
  req: Request<unknown, unknown, RegisterInput>,
  res: Response<ApiResponse<{
    user: {
      id: string;
      fullName: string;
      email: string;
      role: string;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    };
    accessToken: string;
  }>>
): Promise<void> => {
  // Validate request body
  const validatedData = registerSchema.parse(req.body);

  // Register user
  const { refreshToken, ...responseData } = await authService.register({
    centerName: validatedData.centerName,
    fullName: validatedData.fullName,
    phone: validatedData.phone,
    password: validatedData.password,
    role: Role.MANAGER, // Default role
  });

  // Set refresh token in HTTP-only cookie only — never in the JSON body
  res.cookie('refreshToken', refreshToken, {
    ...refreshCookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  sendSuccess(res, responseData, 'Registration successful', 201);
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (
  req: Request<unknown, unknown, LoginInput>,
  res: Response<ApiResponse<{
    user: {
      id: string;
      fullName: string;
      email: string;
      role: string;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    };
    accessToken: string;
  }>>
): Promise<void> => {
  const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

  // Validate request body
  const validatedData = loginSchema.parse(req.body);

  let result;
  try {
    // Login user
    result = await authService.login({
      phone: validatedData.phone,
      password: validatedData.password,
      rememberMe: validatedData.rememberMe,
    });
  } catch (error) {
    // Track failed login attempt for brute force protection
    trackFailedLogin(ipAddress);
    throw error;
  }

  // Set refresh token in HTTP-only cookie only — never in the JSON body
  const maxAge = validatedData.rememberMe
    ? 30 * 24 * 60 * 60 * 1000 // 30 days
    : 7 * 24 * 60 * 60 * 1000; // 7 days

  res.cookie('refreshToken', result.refreshToken, {
    ...refreshCookieOptions,
    maxAge,
  });

  // Reset brute force on successful login
  resetBruteForce(ipAddress);

  // Update last login info and create audit log (non-blocking)
  const userId = (result as { user?: { id: string } }).user?.id;
  if (userId) {
    Promise.all([
      profileRepository.updateLastLogin(userId, ipAddress).catch(() => {}),
      auditLogRepository.create({
        userId,
        action: 'LOGIN',
        entity: 'User',
        entityId: userId,
        description: 'Tizimga kirdi',
        ipAddress,
        userAgent: req.get('user-agent'),
      }).catch(() => {}),
    ]);
  }

  const { refreshToken: _refreshToken, ...responseData } = result;
  sendSuccess(res, responseData, 'Login successful');
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refresh = async (
  req: Request<unknown, unknown, RefreshTokenInput>,
  res: Response<ApiResponse<{
    accessToken: string;
  }>>
): Promise<void> => {
  // Get refresh token from cookie or body
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    res.status(401).json({
      success: false,
      message: 'Refresh token is required',
    });
    return;
  }

  // Validate refresh token
  refreshTokenSchema.parse({ refreshToken });

  // Refresh access token
  const result = await authService.refreshAccessToken(refreshToken);

  // Set new refresh token in HTTP-only cookie only — never in the JSON body
  res.cookie('refreshToken', result.refreshToken, {
    ...refreshCookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  sendSuccess(res, { accessToken: result.accessToken }, 'Token refreshed successfully');
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (
  req: Request,
  res: Response<ApiResponse<null>>
): Promise<void> => {
  // Get refresh token from cookie or body
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (refreshToken) {
    await authService.logout(refreshToken);
  }

  // Clear refresh token cookie
  res.clearCookie('refreshToken', refreshCookieOptions);

  sendSuccess(res, null, 'Logout successful');
};

/**
 * Logout from all devices
 * POST /api/auth/logout-all
 */
export const logoutAll = async (
  req: Request,
  res: Response<ApiResponse<null>>
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  await authService.logoutAll(req.user.userId);

  // Clear refresh token cookie
  res.clearCookie('refreshToken', refreshCookieOptions);

  sendSuccess(res, null, 'Logged out from all devices');
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getMe = async (
  req: Request,
  res: Response<ApiResponse<{
    id: string;
    fullName: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null>>
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  const user = await authService.getProfile(req.user.userId);

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found',
    });
    return;
  }

  sendSuccess(res, user, 'Profile retrieved successfully');
};
