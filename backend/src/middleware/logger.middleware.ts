/**
 * Structured Logger Middleware — Step 13
 * Production-grade logging with levels, structured JSON output,
 * request/response logging, error logging, and cron logging.
 */

import { Request, Response, NextFunction } from 'express';
import { env } from '@/config';
import * as fs from 'fs';
import * as path from 'path';

// ─── Log Levels ────────────────────────────────────────────────────────────────

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'security' | 'audit' | 'cron';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  meta?: Record<string, unknown>;
  requestId?: string;
  userId?: string;
  ip?: string;
  duration?: number;
  statusCode?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

// ─── Logger Class ──────────────────────────────────────────────────────────────

class Logger {
  private isDev: boolean;
  private logsDir: string;

  constructor() {
    this.isDev = env.NODE_ENV !== 'production';
    this.logsDir = path.join(process.cwd(), 'logs');
    this.ensureLogsDir();
  }

  private ensureLogsDir(): void {
    try {
      if (!fs.existsSync(this.logsDir)) {
        fs.mkdirSync(this.logsDir, { recursive: true });
      }
    } catch {
      // If we can't create the logs directory, skip file logging
    }
  }

  private formatDevLog(entry: LogEntry): string {
    const colors: Record<LogLevel, string> = {
      debug: '\x1b[36m',   // cyan
      info: '\x1b[32m',    // green
      warn: '\x1b[33m',    // yellow
      error: '\x1b[31m',   // red
      security: '\x1b[35m', // magenta
      audit: '\x1b[34m',   // blue
      cron: '\x1b[90m',    // gray
    };
    const reset = '\x1b[0m';
    const color = colors[entry.level] || reset;

    let line = `${color}[${entry.level.toUpperCase()}]${reset} ${entry.timestamp}`;
    if (entry.context) line += ` [${entry.context}]`;
    line += ` ${entry.message}`;
    if (entry.duration !== undefined) line += ` (${entry.duration}ms)`;
    if (entry.statusCode) line += ` → ${entry.statusCode}`;
    if (entry.meta && Object.keys(entry.meta).length > 0) {
      line += `\n  ${JSON.stringify(entry.meta)}`;
    }
    if (entry.error) {
      line += `\n  Error: ${entry.error.message}`;
      if (this.isDev && entry.error.stack) line += `\n  ${entry.error.stack}`;
    }
    return line;
  }

  private writeToFile(level: LogLevel, entry: LogEntry): void {
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = path.join(this.logsDir, `${level}-${dateStr}.log`);
      const line = JSON.stringify(entry) + '\n';
      fs.appendFileSync(filename, line, 'utf8');
    } catch {
      // Silently fail file writes to not break app
    }
  }

  log(level: LogLevel, message: string, meta?: Record<string, unknown>, context?: string): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      meta,
    };

    if (this.isDev) {
      process.stdout.write(this.formatDevLog(entry) + '\n');
    } else {
      process.stdout.write(JSON.stringify(entry) + '\n');
      if (level === 'error' || level === 'security') {
        this.writeToFile(level, entry);
      }
    }
  }

  debug(message: string, meta?: Record<string, unknown>, context?: string): void {
    if (this.isDev) this.log('debug', message, meta, context);
  }

  info(message: string, meta?: Record<string, unknown>, context?: string): void {
    this.log('info', message, meta, context);
  }

  warn(message: string, meta?: Record<string, unknown>, context?: string): void {
    this.log('warn', message, meta, context);
  }

  error(message: string, error?: unknown, meta?: Record<string, unknown>, context?: string): void {
    const errorMeta: LogEntry['error'] = error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : { name: 'Unknown', message: String(error) };

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      context,
      meta,
      error: errorMeta,
    };

    if (this.isDev) {
      process.stderr.write(this.formatDevLog(entry) + '\n');
    } else {
      process.stderr.write(JSON.stringify(entry) + '\n');
      this.writeToFile('error', entry);
    }
  }

  security(message: string, meta?: Record<string, unknown>): void {
    this.log('security', message, meta, 'SECURITY');
    this.writeToFile('security', {
      timestamp: new Date().toISOString(),
      level: 'security',
      message,
      context: 'SECURITY',
      meta,
    });
  }

  audit(message: string, meta?: Record<string, unknown>): void {
    this.log('audit', message, meta, 'AUDIT');
  }

  cron(message: string, meta?: Record<string, unknown>): void {
    this.log('cron', message, meta, 'CRON');
  }
}

export const logger = new Logger();

// ─── HTTP Request Logger Middleware ───────────────────────────────────────────

export function httpLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const ip = req.ip || req.socket.remoteAddress || 'unknown';

  // Skip health checks in logs to reduce noise
  if (req.path.includes('/health')) {
    return next();
  }

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const level: LogLevel = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    logger.log(level, `${req.method} ${req.originalUrl}`, {
      ip,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('user-agent'),
      contentLength: res.get('content-length'),
    }, 'HTTP');
  });

  next();
}
