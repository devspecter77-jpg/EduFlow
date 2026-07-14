/**
 * Pagination Utilities — Step 13
 * Consistent pagination helpers across all controllers/repositories.
 */

import { Request } from 'express';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/** Extract and validate pagination params from request query */
export function getPaginationParams(req: Request, defaultLimit = 20): PaginationParams {
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
  const limit = Math.min(
    100, // max limit to prevent huge queries
    Math.max(1, parseInt(String(req.query.limit || String(defaultLimit)), 10) || defaultLimit)
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/** Build pagination metadata for response */
export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/** Extract sort params from request query */
export function getSortParams(
  req: Request,
  allowedFields: string[],
  defaultField = 'createdAt',
  defaultOrder: 'asc' | 'desc' = 'desc'
): SortParams {
  const field = allowedFields.includes(String(req.query.sortBy || ''))
    ? String(req.query.sortBy)
    : defaultField;
  const order = req.query.sortOrder === 'asc' ? 'asc' : defaultOrder;
  return { field, order };
}
