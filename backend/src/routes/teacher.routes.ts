import { Router } from 'express';
import { TeacherController } from '@controllers/teacher.controller';
import { authenticate, upload } from '@middleware/index';
import { importController } from '@controllers/import.controller';
import { exportController } from '@controllers/export.controller';

const router = Router();
const controller = new TeacherController();

// All routes require authentication
router.use(authenticate);

// Import/Export routes
router.post('/import', upload.single('file'), importController.importTeachers);
router.get('/export', exportController.exportTeachers);
router.get('/template', importController.getTeacherTemplate);

// Regular CRUD routes
router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.patch('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
