/**
 * Password Utilities — Step 13
 * bcrypt hashing + password strength validation.
 */

import bcrypt from 'bcrypt';
import { env } from '@config/env';

/** Hash password using bcrypt */
export async function hashPassword(password: string): Promise<string> {
  const rounds = env.BCRYPT_ROUNDS;
  return bcrypt.hash(password, rounds);
}

/** Compare plain password with hashed version */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export interface PasswordStrength {
  valid: boolean;
  score: number; // 0–5
  level: 'weak' | 'fair' | 'good' | 'strong';
  issues: string[];
}

/** Validate password strength — returns score and issues */
export function checkPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  const issues: string[] = [];

  if (password.length >= 8) score++;
  else issues.push('Kamida 8 ta belgi bo\'lishi kerak');

  if (password.length >= 12) score++;

  if (/[A-Z]/.test(password)) score++;
  else issues.push('Kamida 1 ta katta harf (A-Z)');

  if (/[0-9]/.test(password)) score++;
  else issues.push('Kamida 1 ta raqam (0-9)');

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else issues.push('Kamida 1 ta maxsus belgi (!@#$%^&*)');

  const level: PasswordStrength['level'] =
    score <= 1 ? 'weak' : score <= 2 ? 'fair' : score <= 3 ? 'good' : 'strong';

  return { valid: score >= 2, score, level, issues };
}

/** Generate a secure random password */
export function generateSecurePassword(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
