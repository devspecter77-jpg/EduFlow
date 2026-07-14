// Environment variables configuration
export const env = {
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  appName: import.meta.env.VITE_APP_NAME || "Biz Educational Center CRM",
  appVersion: import.meta.env.VITE_APP_VERSION || "1.0.0",
  env: import.meta.env.VITE_ENV || "development",
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;
