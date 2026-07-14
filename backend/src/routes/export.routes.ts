import { Router } from 'express';
import { authenticate } from '@/middleware/auth.middleware';
import { exportController } from '@/controllers/export.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Export endpoints
router.get('/students', (req, res) => exportController.exportStudents(req, res));
router.get('/teachers', (req, res) => exportController.exportTeachers(req, res));
router.get('/groups', (req, res) => exportController.exportGroups(req, res));
router.get('/payments', (req, res) => exportController.exportPayments(req, res));
router.get('/attendances', (req, res) => exportController.exportAttendances(req, res));

export default router;
