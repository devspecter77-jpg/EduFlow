/**
 * Output Sanitization Utilities — Step 13
 * Prevent sensitive data leakage in API responses.
 */

/** Fields that should never appear in API responses */
const SENSITIVE_FIELDS = new Set([
  'password',
  'hashedPassword',
  'refreshToken',
  'secretKey',
  'telegramBotToken',
  'privateKey',
  'secret',
]);

/** Recursively strip sensitive fields from an object */
export function sanitizeOutput<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeOutput) as T;

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (SENSITIVE_FIELDS.has(key)) {
      continue; // skip sensitive field
    }
    sanitized[key] = sanitizeOutput(value);
  }
  return sanitized as T;
}

/** Mask a phone number for display (e.g. +998 ** *** 4567) */
export function maskPhone(phone: string): string {
  if (phone.length < 6) return '***';
  return phone.slice(0, 4) + ' ** *** ' + phone.slice(-4);
}

/** Mask an email address (e.g. j***@gmail.com) */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  return local.charAt(0) + '***@' + domain;
}
