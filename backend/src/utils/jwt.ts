import jwt from 'jsonwebtoken';
import { env } from '@config/env';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  centerId?: string;
  /** Present only on tokens minted via Super Admin impersonation (see superAdmin.controller.ts) */
  imp?: true;
  /** userId of the Super Admin who initiated the impersonation; set only when imp is true */
  impersonatedBy?: string;
}

/**
 * Generate access token
 */
export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch {
    throw new Error('Noto\'g\'ri yoki muddati tugagan access token');
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
  } catch {
    throw new Error('Noto\'g\'ri yoki muddati tugagan refresh token');
  }
}
