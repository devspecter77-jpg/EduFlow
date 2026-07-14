import { Router } from 'express';
import { groupController } from '@/controllers/group.controller';
import { authenticate, upload } from '@/middleware/index';
import asyncHandler from '@/middleware/asyncHandler';
import { importController } from '@/controllers/import.controller';
import { exportController } from '@/controllers/export.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Import/Export routes
router.post('/import', upload.single('file'), asyncHandler(importController.importGroups));
router.get('/export', asyncHandler(exportController.exportGroups));
router.get('/template', importController.getGroupTemplate);

// Group CRUD
router.post('/', asyncHandler(groupController.create.bind(groupController)));
router.get('/', asyncHandler(groupController.getAll.bind(groupController)));
router.get('/:id', asyncHandler(groupController.getById.bind(groupController)));
router.patch('/:id', asyncHandler(groupController.update.bind(groupController)));
router.delete('/:id', asyncHandler(groupController.delete.bind(groupController)));

// Student management in group
router.post('/:id/students', asyncHandler(groupController.addStudent.bind(groupController)));
router.delete('/:id/students/:studentId', asyncHandler(groupController.removeStudent.bind(groupController)));
router.get('/:id/students', asyncHandler(groupController.getStudents.bind(groupController)));

export default router;
