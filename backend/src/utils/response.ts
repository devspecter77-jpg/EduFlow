import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '@/types';

export class ApiResponseUtil {
  static success<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode: number = 200
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      ...(data && { data }),
      ...(message && { message }),
    };
    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    details?: unknown
  ): Response {
    return res.status(statusCode).json({
      success: false,
      error: {
        message,
        code: statusCode.toString(),
        ...(details ? { details } : {}),
      },
    });
  }

  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string
  ): Response {
    const response: PaginatedResponse<T[]> = {
      success: true,
      data,
      ...(message && { message }),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    return res.status(200).json(response);
  }
}

// Helper function for sendSuccess
export function sendSuccess<T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200
): Response {
  return ApiResponseUtil.success(res, data, message, statusCode);
}

// Helper function for sendError
export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  details?: unknown
): Response {
  return ApiResponseUtil.error(res, message, statusCode, details);
}

export default ApiResponseUtil;
