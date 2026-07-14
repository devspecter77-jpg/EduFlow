import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (use Redis in production for multi-instance)
const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);

interface RateLimitOptions {
  windowMs: number;   // Time window in milliseconds
  max: number;        // Max requests per window
  message?: string;   // Error message
  keyPrefix?: string; // Key prefix to differentiate limiters
}

/**
 * Rate limiter middleware factory
 */
export function rateLimiter(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    message = 'Juda ko\'p so\'rov yuborildi. Biroz kutib qayta urinib ko\'ring.',
    keyPrefix = 'rl',
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();

    const entry = store.get(key);

    if (!entry || entry.resetAt < now) {
      // New window
      store.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (entry.count >= max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      res.status(429).json({
        success: false,
        message,
        retryAfter,
      });
      return;
    }

    entry.count++;
    next();
  };
}

// Preset rate limiters

// Auth endpoints: 10 requests per 15 minutes
export const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Juda ko\'p urinish. 15 daqiqadan so\'ng qayta urinib ko\'ring.',
  keyPrefix: 'auth',
});

// General API: 300 requests per minute
export const apiRateLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 300,
  message: 'Juda ko\'p so\'rov. Biroz kutib qayta urinib ko\'ring.',
  keyPrefix: 'api',
});

// Password change: 5 requests per hour
export const passwordRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Parol almashtirish limiti. 1 soatdan so\'ng qayta urinib ko\'ring.',
  keyPrefix: 'pwd',
});
