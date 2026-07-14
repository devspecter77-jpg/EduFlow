/**
 * Global Error Handler — Step 13
 * Handles Zod, Prisma, JWT, and custom errors with structured responses.
 * Logs all errors with context. Never leaks stack traces in production.
 */

import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { env } from "@/config";
import { logger } from "./logger.middleware";

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
    stack?: string;
  };
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = "Ichki server xatosi";
  let details: unknown = undefined;
  let code: string | undefined;

  // ─── Zod Validation Errors ─────────────────────────────────────────────
  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validatsiya xatosi";
    code = "VALIDATION_ERROR";
    details = err.errors.map((error) => ({
      path: error.path.join("."),
      message: error.message,
    }));
  }
  // ─── Prisma Known Request Errors ─────────────────────────────────────────
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;
    switch (err.code) {
      case "P2002":
        message = "Bu ma'lumot allaqachon mavjud";
        code = "DUPLICATE_ENTRY";
        details = { field: err.meta?.target };
        break;
      case "P2025":
        statusCode = 404;
        message = "Ma'lumot topilmadi";
        code = "NOT_FOUND";
        break;
      case "P2003":
        message = "Bog'liq ma'lumot xatosi";
        code = "FOREIGN_KEY_VIOLATION";
        break;
      case "P2014":
        message = "Bog'liq ma'lumot mavjud, o'chirib bo'lmaydi";
        code = "RELATED_DATA_EXISTS";
        break;
      default:
        message = "Ma'lumotlar bazasi xatosi";
        code = `DB_ERROR_${err.code}`;
    }
    logger.error(`Prisma error ${err.code}`, err, { path: req.path }, 'DB');
  }
  // ─── Prisma Validation Errors ─────────────────────────────────────────────
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Noto'g'ri ma'lumot yuborildi";
    code = "INVALID_DATA";
    logger.error('Prisma validation error', err, { path: req.path }, 'DB');
  }
  // ─── Prisma Connection Errors ─────────────────────────────────────────────
  else if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 503;
    message = "Ma'lumotlar bazasiga ulanishda xatolik";
    code = "DB_CONNECTION_ERROR";
    logger.error('Prisma initialization error', err, {}, 'DB');
  }
  // ─── Custom App Errors ───────────────────────────────────────────────────
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
    if (statusCode >= 500) {
      logger.error(`AppError: ${message}`, err, { path: req.path }, 'APP');
    }
  }
  // ─── JWT Errors ──────────────────────────────────────────────────────────
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Noto'g'ri token";
    code = "INVALID_TOKEN";
  }
  else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token muddati tugagan";
    code = "TOKEN_EXPIRED";
  }
  // ─── Multer Errors ────────────────────────────────────────────────────────
  else if (err.name === "MulterError") {
    statusCode = 400;
    message = "Fayl yuklashda xatolik";
    code = "UPLOAD_ERROR";
  }
  // ─── Syntax Error (invalid JSON body) ────────────────────────────────────
  else if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    message = "Noto'g'ri JSON format";
    code = "INVALID_JSON";
  }
  // ─── Generic Errors ──────────────────────────────────────────────────────
  else {
    // In production, don't leak internal error details
    message = env.NODE_ENV === 'production' ? 'Ichki server xatosi' : (err.message || 'Ichki server xatosi');
    logger.error(`Unhandled error: ${err.message}`, err, {
      method: req.method,
      path: req.path,
      ip: req.ip,
    }, 'ERROR');
  }

  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message,
      code,
      ...(details ? { details } : {}),
      ...(env.NODE_ENV === "development" ? { stack: err.stack } : {}),
    },
  };

  res.status(statusCode).json(errorResponse);
};

export default errorHandler;
