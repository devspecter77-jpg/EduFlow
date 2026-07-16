/**
 * Axios API Client — Step 13
 * - Automatic token refresh with retry
 * - Request cancellation support
 * - Consistent error normalization
 * - Request/response logging in development
 */

import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Create Instance ──────────────────────────────────────────────────────
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies (refresh token)
  timeout: 30000, // 30 second timeout
});

// ─── Token Refresh State ─────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else if (token) resolve(token);
  });
  failedQueue = [];
}

// ─── Request Interceptor ─────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Dev logging
    if (import.meta.env.DEV) {
      console.debug(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request while token is being refreshed
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Only a previously-logged-in session actually needs to be kicked to
        // /login — an anonymous visitor (e.g. browsing the public landing
        // page, which calls some endpoints that 401 without a session) was
        // never logged in to begin with, so forcing them off whatever page
        // they're on is wrong and was the cause of the "random redirect to
        // login" reports.
        const hadSession = !!localStorage.getItem('accessToken');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        if (hadSession) {
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
        return Promise.reject(normalizeError(refreshError));
      } finally {
        isRefreshing = false;
      }
    }

    // Normalize error for consumers
    const apiError = normalizeError(error);
    return Promise.reject(apiError);
  }
);

// ─── Error Normalization ─────────────────────────────────────────────────

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
  details?: unknown;
}

export function normalizeError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const data = error.response?.data;

    if (data?.error?.message) {
      return {
        message: data.error.message,
        code: data.error.code,
        statusCode: status,
        details: data.error.details,
      };
    }

    if (data?.message) {
      return { message: data.message, statusCode: status };
    }

    if (error.code === 'ECONNABORTED') {
      return { message: 'So\'rov vaqti tugadi. Internetingizni tekshiring.', statusCode: 408 };
    }

    if (!error.response) {
      return { message: 'Serverga ulanib bo\'lmadi. Internetingizni tekshiring.', statusCode: 0 };
    }

    const httpMessages: Record<number, string> = {
      400: 'Noto\'g\'ri so\'rov',
      401: 'Tizimga kirish talab qilinadi',
      403: 'Ruxsat yo\'q',
      404: 'Ma\'lumot topilmadi',
      409: 'Ma\'lumot allaqachon mavjud',
      422: 'Validatsiya xatosi',
      429: 'Juda ko\'p so\'rov yuborildi',
      500: 'Server xatosi',
      503: 'Server vaqtincha ishlamayapti',
    };

    return {
      message: httpMessages[status] ?? `Xato: ${status}`,
      statusCode: status,
    };
  }

  if (error instanceof Error) {
    return { message: error.message, statusCode: 0 };
  }

  return { message: 'Noma\'lum xato', statusCode: 0 };
}

/** Extract error message string for display in toasts/UI */
export function getErrorMessage(error: unknown): string {
  const normalized = normalizeError(error);
  return normalized.message;
}

export default apiClient;
