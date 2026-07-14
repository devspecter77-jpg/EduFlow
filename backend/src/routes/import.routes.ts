import { Router } from 'express';
import { authenticate } from '@/middleware/auth.middleware';
import { upload } from '@/middleware/upload';
import { importController } from '@/controllers/import.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Import endpoints
router.post('/students', upload.single('file'), (req, res) => importController.importStudents(req, res));
router.post('/teachers', upload.single('file'), (req, res) => importController.importTeachers(req, res));
router.post('/groups', upload.single('file'), (req, res) => importController.importGroups(req, res));

// Template download endpoints
router.get('/students/template', (req, res) => importController.getStudentTemplate(req, res));
router.get('/teachers/template', (req, res) => importController.getTeacherTemplate(req, res));
router.get('/groups/template', (req, res) => importController.getGroupTemplate(req, res));

export default router;
