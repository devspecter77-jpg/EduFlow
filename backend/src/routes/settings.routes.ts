import { Router } from 'express';
import { settingsController } from '@controllers/settings.controller';
import { authenticate } from '@middleware/auth.middleware';
import asyncHandler from '@middleware/asyncHandler';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/settings - Get settings
router.get('/', asyncHandler((req, res) => settingsController.getSettings(req, res)));

// PUT /api/settings - Update settings
router.put('/', asyncHandler((req, res) => settingsController.updateSettings(req, res)));

// POST /api/settings/reset - Reset to default
router.post('/reset', asyncHandler((req, res) => settingsController.resetSettings(req, res)));

export default router;
