import { CorsOptions } from 'cors';
import { env } from './env';

// Support multiple CORS origins (comma-separated in env)
const getAllowedOrigins = (): string | string[] => {
  const origins = env.CORS_ORIGIN;
  if (origins.includes(',')) {
    return origins.split(',').map((o) => o.trim());
  }
  return origins;
};

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const allowed = getAllowedOrigins();
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) {
      callback(null, true);
      return;
    }
    const allowedArr = Array.isArray(allowed) ? allowed : [allowed];
    if (allowedArr.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} is not allowed`));
    }
  },
  credentials: env.CORS_CREDENTIALS,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours
};

export default corsOptions;
