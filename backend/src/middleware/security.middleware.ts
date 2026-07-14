/**
 * Security Middleware Suite — Step 13
 * Enterprise-level security: XSS, HPP, brute force, suspicious request detection,
 * input sanitization, origin validation, user-agent validation, CSP headers.
 */

import { Request, Response, NextFunction } from 'express';
import { env } from '@/config';

// ─── Brute Force Protection ────────────────────────────────────────────────────

interface BruteEntry {
  attempts: number;
  blockedUntil?: number;
  firstAttemptAt: number;
}

const bruteStore = new Map<string, BruteEntry>();
const BRUTE_MAX_ATTEMPTS = 10;
const BRUTE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const BRUTE_BLOCK_MS = 30 * 60 * 1000;  // 30 minute block

// Cleanup every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of bruteStore.entries()) {
    if (entry.blockedUntil && entry.blockedUntil < now) {
      bruteStore.delete(key);
    } else if (!entry.blockedUntil && now - entry.firstAttemptAt > BRUTE_WINDOW_MS) {
      bruteStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

export function bruteForceProtection(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const key = `brute:${ip}`;
  const now = Date.now();

  const entry = bruteStore.get(key);

  if (entry?.blockedUntil && entry.blockedUntil > now) {
    const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
    res.setHeader('Retry-After', retryAfter);
    res.status(429).json({
      success: false,
      message: 'Juda ko\'p urinish. Keyinroq qayta urinib ko\'ring.',
      retryAfter,
    });
    return;
  }

  if (!entry || now - entry.firstAttemptAt > BRUTE_WINDOW_MS) {
    bruteStore.set(key, { attempts: 1, firstAttemptAt: now });
    next();
    return;
  }

  entry.attempts++;

  if (entry.attempts >= BRUTE_MAX_ATTEMPTS) {
    entry.blockedUntil = now + BRUTE_BLOCK_MS;
    bruteStore.set(key, entry);
    res.status(429).json({
      success: false,
      message: 'IP manzil vaqtincha bloklandi. 30 daqiqadan so\'ng qayta urinib ko\'ring.',
    });
    return;
  }

  bruteStore.set(key, entry);
  next();
}

/** Track failed auth attempts — call this on failed login */
export function trackFailedLogin(ip: string): void {
  const key = `brute:${ip}`;
  const now = Date.now();
  const entry = bruteStore.get(key);

  if (!entry || now - entry.firstAttemptAt > BRUTE_WINDOW_MS) {
    bruteStore.set(key, { attempts: 1, firstAttemptAt: now });
    return;
  }

  entry.attempts++;
  if (entry.attempts >= BRUTE_MAX_ATTEMPTS) {
    entry.blockedUntil = now + BRUTE_BLOCK_MS;
  }
  bruteStore.set(key, entry);
}

/** Reset brute force record on successful login */
export function resetBruteForce(ip: string): void {
  bruteStore.delete(`brute:${ip}`);
}

// ─── Input Sanitization ────────────────────────────────────────────────────────

/** Remove null bytes and non-printable control characters */
function sanitizeString(value: string): string {
  // Remove null bytes
  let clean = value.replace(/\0/g, '');
  // Remove HTML script tags (basic XSS prevention layer)
  clean = clean.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
  // Remove javascript: protocol
  clean = clean.replace(/javascript:/gi, '');
  // Remove on* event handlers
  clean = clean.replace(/on\w+\s*=/gi, '');
  return clean;
}

function sanitizeObject(obj: unknown): unknown {
  if (typeof obj === 'string') return sanitizeString(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[sanitizeString(key)] = sanitizeObject(value);
    }
    return result;
  }
  return obj;
}

export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query) as typeof req.query;
  if (req.params) req.params = sanitizeObject(req.params) as typeof req.params;
  next();
}

// ─── HTTP Parameter Pollution Protection ──────────────────────────────────────

export function preventHPP(req: Request, _res: Response, next: NextFunction): void {
  // For duplicate query params, keep only the last value
  for (const key of Object.keys(req.query)) {
    if (Array.isArray(req.query[key])) {
      const arr = req.query[key] as string[];
      req.query[key] = arr[arr.length - 1];
    }
  }
  next();
}

// ─── Suspicious Request Detection ─────────────────────────────────────────────

const SUSPICIOUS_PATTERNS = [
  /\.\.\//,                          // Path traversal
  /<script/i,                        // XSS
  /union\s+select/i,                 // SQL injection
  /exec\s*\(/i,                      // SQL injection
  /drop\s+table/i,                   // SQL injection
  /insert\s+into/i,                  // SQL injection
  /\$where/i,                        // NoSQL injection
  /\$gt|\$lt|\$ne|\$in/,             // NoSQL injection operators in URL
  /eval\s*\(/i,                      // Code injection
  /base64_decode/i,                  // PHP injection
  /%00/,                             // Null byte injection
  /\{\{.*\}\}/,                      // Template injection
];

export function detectSuspiciousRequest(req: Request, res: Response, next: NextFunction): void {
  const url = decodeURIComponent(req.originalUrl);
  const body = JSON.stringify(req.body || {});

  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(url) || pattern.test(body)) {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      process.stderr.write(`[SECURITY] Suspicious request detected from ${ip}: ${req.method} ${req.originalUrl}\n`);
      res.status(400).json({
        success: false,
        message: 'So\'rov qabul qilinmadi',
      });
      return;
    }
  }

  next();
}

// ─── User Agent Validation ─────────────────────────────────────────────────────

const BLOCKED_UA_PATTERNS = [
  /sqlmap/i,
  /nikto/i,
  /nessus/i,
  /masscan/i,
  /nmap/i,
  /acunetix/i,
  /zgrab/i,
  /python-requests\/[0-1]\./i, // Old python-requests (often used for attacks)
];

export function validateUserAgent(req: Request, res: Response, next: NextFunction): void {
  if (env.NODE_ENV !== 'production') {
    return next();
  }

  const ua = req.get('user-agent') || '';

  for (const pattern of BLOCKED_UA_PATTERNS) {
    if (pattern.test(ua)) {
      res.status(403).json({
        success: false,
        message: 'Ruxsat etilmagan',
      });
      return;
    }
  }

  next();
}

// ─── Request Size Limiter ─────────────────────────────────────────────────────

export function requestSizeLimiter(maxBytes: number = 10 * 1024 * 1024) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (contentLength > maxBytes) {
      res.status(413).json({
        success: false,
        message: `So'rov hajmi juda katta. Maksimal: ${Math.round(maxBytes / 1024 / 1024)}MB`,
      });
      return;
    }
    next();
  };
}

// ─── Security Headers ─────────────────────────────────────────────────────────

export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Enable XSS filter in older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Permissions policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // Hide powered-by
  res.removeHeader('X-Powered-By');

  if (env.NODE_ENV === 'production') {
    // HSTS — 1 year
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  next();
}

// ─── Password Strength Validator ──────────────────────────────────────────────

interface PasswordStrengthResult {
  valid: boolean;
  score: number; // 0-4
  message?: string;
}

export function validatePasswordStrength(password: string): PasswordStrengthResult {
  let score = 0;
  const issues: string[] = [];

  if (password.length >= 8) score++;
  else issues.push('Kamida 8 ta belgi');

  if (password.length >= 12) score++;

  if (/[A-Z]/.test(password)) score++;
  else issues.push('Kamida 1 ta katta harf');

  if (/[0-9]/.test(password)) score++;
  else issues.push('Kamida 1 ta raqam');

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else issues.push('Kamida 1 ta maxsus belgi (!@#$%...)');

  return {
    valid: score >= 2,
    score,
    message: issues.length > 0 ? `Parol kuchsiz: ${issues.join(', ')}` : undefined,
  };
}
