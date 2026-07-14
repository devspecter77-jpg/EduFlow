import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { corsOptions, env } from "@/config";
import {
  errorHandler,
  notFound,
  requestLogger,
  sanitizeInput,
  preventHPP,
  detectSuspiciousRequest,
  validateUserAgent,
  requestSizeLimiter,
  securityHeaders,
  httpLogger,
} from "@/middleware";
import routes from "@/routes";
import { apiRateLimiter } from "@middleware/rateLimiter";

const app: Application = express();

// ─── Security Headers (before everything) ─────────────────────────────────────
app.use(securityHeaders);

// ─── Helmet (comprehensive HTTP security headers) ─────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy:
      env.NODE_ENV === "production"
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", "data:", "https:"],
              connectSrc: ["'self'"],
              fontSrc: ["'self'"],
              objectSrc: ["'none'"],
              mediaSrc: ["'self'"],
              frameSrc: ["'none'"],
            },
          }
        : false,
    hsts:
      env.NODE_ENV === "production"
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
  })
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors(corsOptions));

// ─── Request Size Limiter ─────────────────────────────────────────────────────
app.use(requestSizeLimiter(10 * 1024 * 1024)); // 10MB max

// ─── User Agent Validation ────────────────────────────────────────────────────
app.use(validateUserAgent);

// ─── HTTP Request Logger ──────────────────────────────────────────────────────
app.use(httpLogger);
app.use(requestLogger);

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Cookie Parser ────────────────────────────────────────────────────────────
app.use(cookieParser());

// ─── HPP (HTTP Parameter Pollution) Protection ────────────────────────────────
app.use(preventHPP);

// ─── Input Sanitization (XSS, null bytes, etc.) ──────────────────────────────
app.use(sanitizeInput);

// ─── Suspicious Request Detection ────────────────────────────────────────────
app.use(detectSuspiciousRequest);

// ─── Trust Proxy (for production behind reverse proxy/Nginx) ─────────────────
if (env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// ─── Root Route ───────────────────────────────────────────────────────────────
app.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Biz Educational Center CRM API",
    version: "1.0.0",
    documentation: `${env.API_PREFIX}/docs`,
  });
});

// ─── API Routes (with global rate limiter) ────────────────────────────────────
app.use(env.API_PREFIX, apiRateLimiter, routes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use(notFound);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
