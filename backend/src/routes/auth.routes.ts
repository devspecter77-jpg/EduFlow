import { Router } from 'express';
import * as authController from '@controllers/auth.controller';
import { asyncHandler, authenticate, authorize } from '@middleware/index';
import { authRateLimiter } from '@middleware/rateLimiter';
import { Role } from '@prisma/client';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authRateLimiter, asyncHandler(authController.register));

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authRateLimiter, asyncHandler(authController.login));

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', asyncHandler(authController.refresh));

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Public
 */
router.post('/logout', asyncHandler(authController.logout));

/**
 * @route   POST /api/auth/logout-all
 * @desc    Logout from all devices
 * @access  Private
 */
router.post('/logout-all', authenticate, asyncHandler(authController.logoutAll));

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, asyncHandler(authController.getMe));

/**
 * @route   GET /api/auth/admin-only
 * @desc    Example: Admin-only route
 * @access  Private (Admin only)
 */
router.get('/admin-only', authenticate, authorize(Role.ADMIN), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome Admin!',
    data: { role: req.user?.role },
  });
});

/**
 * @route   GET /api/auth/manager-or-admin
 * @desc    Example: Manager or Admin route
 * @access  Private (Manager, Admin)
 */
router.get(
  '/manager-or-admin',
  authenticate,
  authorize(Role.MANAGER, Role.ADMIN),
  (req, res) => {
    res.json({
      success: true,
      message: 'Welcome Manager or Admin!',
      data: { role: req.user?.role },
    });
  }
);

export default router;
