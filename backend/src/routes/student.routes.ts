import { Router } from 'express';
import { asyncHandler, authenticate, upload } from '@middleware/index';
import * as studentController from '@controllers/student.controller';
import { importController } from '@controllers/import.controller';
import { exportController } from '@controllers/export.controller';

const router = Router();

// All student routes require authentication
router.use(authenticate);

// Import/Export routes
router.post('/import', upload.single('file'), asyncHandler(importController.importStudents));
router.get('/export', asyncHandler(exportController.exportStudents));
router.get('/template', importController.getStudentTemplate);

// Regular CRUD routes
router.get('/stats', asyncHandler(studentController.getStudentStats));
router.get('/', asyncHandler(studentController.getStudents));
router.get('/:id', asyncHandler(studentController.getStudentById));
router.post('/', asyncHandler(studentController.createStudent));
router.patch('/:id', asyncHandler(studentController.updateStudent));
router.delete('/:id', asyncHandler(studentController.deleteStudent));

export default router;
