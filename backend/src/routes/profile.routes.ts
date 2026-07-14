import { Router } from 'express';
import { profileController } from '@controllers/profile.controller';
import { authenticate } from '@middleware/auth.middleware';
import asyncHandler from '@middleware/asyncHandler';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/profile - Get current user profile
router.get('/', asyncHandler((req, res) => profileController.getProfile(req, res)));

// PUT /api/profile - Update profile
router.put('/', asyncHandler((req, res) => profileController.updateProfile(req, res)));

// PUT /api/profile/password - Change password
router.put('/password', asyncHandler((req, res) => profileController.changePassword(req, res)));

export default router;
