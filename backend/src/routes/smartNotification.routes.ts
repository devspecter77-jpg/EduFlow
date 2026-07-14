import { Router } from 'express';
import { smartNotificationController } from '@/controllers/smartNotification.controller';
import { asyncHandler, authenticate } from '@/middleware';

const router = Router();
router.use(authenticate);
const c = smartNotificationController;

// History
router.get('/history', asyncHandler((req, res) => c.getHistory(req, res)));

// Stats
router.get('/stats', asyncHandler((req, res) => c.getStats(req, res)));

// Settings
router.get('/settings', asyncHandler((req, res) => c.getSettings(req, res)));
router.patch('/settings', asyncHandler((req, res) => c.updateSettings(req, res)));

// Validate bot token
router.post('/validate-bot', asyncHandler((req, res) => c.validateBot(req, res)));

// Send messages
router.post('/send-test', asyncHandler((req, res) => c.sendTest(req, res)));
router.post('/send-group', asyncHandler((req, res) => c.sendToGroup(req, res)));
router.post('/send-all', asyncHandler((req, res) => c.sendToAll(req, res)));

export default router;
