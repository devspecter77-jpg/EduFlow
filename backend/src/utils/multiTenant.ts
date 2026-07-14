import type { Request } from 'express';

/**
 * Multi-tenant helper utilities
 */

/**
 * Get centerId from authenticated user
 * Returns null for SUPER_ADMIN (they can access all data)
 */
export function getCenterId(req: Request): string | null {
  const user = req.user;
  
  // Super Admin can access all centers
  if (!user || user.role === 'SUPER_ADMIN') {
    return null;
  }

  return user.centerId || null;
}

/**
 * Build where clause for multi-tenant filtering
 * Filters by userId AND centerId (if not super admin)
 */
export function buildMultiTenantWhere(req: Request, additionalWhere: any = {}) {
  const userId = req.user?.userId; // Use userId from JwtPayload
  const centerId = getCenterId(req);

  const where: any = {
    ...additionalWhere,
    isDeleted: false,
  };

  // Always filter by userId (owner of the data)
  if (userId) {
    where.userId = userId;
  }

  // If user has centerId, add center filter
  // This ensures users can only see data from their center
  if (centerId) {
    where.user = {
      centerId,
    };
  }

  return where;
}

/**
 * Check if user can access data from a specific center
 */
export function canAccessCenter(req: Request, targetCenterId: string): boolean {
  const user = req.user;

  // Super Admin can access everything
  if (!user || user.role === 'SUPER_ADMIN') {
    return true;
  }

  // Regular users can only access their own center
  return user.centerId === targetCenterId;
}
