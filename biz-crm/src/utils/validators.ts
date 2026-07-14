/**
 * Email validation
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Phone number validation (Uzbekistan format)
 */
export function isValidPhone(phone: string): boolean {
  // Format: +998 XX XXX XX XX or 998XXXXXXXXX or 998 XX XXX XX XX
  const phoneRegex = /^(\+?998)?[\s-]?(\d{2})[\s-]?(\d{3})[\s-]?(\d{2})[\s-]?(\d{2})$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

/**
 * Password strength validation
 */
export function isStrongPassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Parol kamida 8 ta belgidan iborat bo'lishi kerak");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Parol kamida bitta katta harf bo'lishi kerak");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Parol kamida bitta kichik harf bo'lishi kerak");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Parol kamida bitta raqam bo'lishi kerak");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Parol kamida bitta maxsus belgi bo'lishi kerak");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * URL validation
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Passport number validation (Uzbekistan)
 */
export function isValidPassport(passport: string): boolean {
  // Format: AA1234567 or АА1234567
  const passportRegex = /^[A-Z]{2}\d{7}$/i;
  return passportRegex.test(passport.replace(/\s/g, ""));
}

/**
 * PINFL validation (Uzbekistan personal identification number)
 */
export function isValidPINFL(pinfl: string): boolean {
  // Format: 14 digits
  const pinflRegex = /^\d{14}$/;
  return pinflRegex.test(pinfl);
}

/**
 * Number range validation
 */
export function isInRange(
  value: number,
  min: number,
  max: number
): boolean {
  return value >= min && value <= max;
}

/**
 * Date range validation
 */
export function isValidDateRange(
  startDate: Date | string,
  endDate: Date | string
): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return !isNaN(start.getTime()) && 
         !isNaN(end.getTime()) && 
         start <= end;
}

/**
 * Required field validation
 */
export function isRequired(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * Min length validation
 */
export function hasMinLength(value: string, minLength: number): boolean {
  return value.length >= minLength;
}

/**
 * Max length validation
 */
export function hasMaxLength(value: string, maxLength: number): boolean {
  return value.length <= maxLength;
}
