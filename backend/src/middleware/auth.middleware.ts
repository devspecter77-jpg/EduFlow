import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '@utils/jwt';
import type { ApiResponse } from '@/types';
import { Role } from '@prisma/client';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header
 */
export const authenticate = (
  req: Request,
  res: Response<ApiResponse<null>>,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Kirish tokeni talab qilinadi',
      });
      return;
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : 'Noto\'g\'ri yoki muddati tugagan token',
    });
  }
};

export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response<ApiResponse<null>>, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Autentifikatsiya talab qilinadi',
      });
      return;
    }

    const userRole = req.user.role as Role;

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        message: 'Bu resursga kirishga ruxsatingiz yo\'q',
      });
      return;
    }

    next();
  };
};
