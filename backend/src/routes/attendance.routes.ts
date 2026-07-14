import { Router } from 'express';
import { attendanceController } from '@/controllers/attendance.controller';
import { authenticate } from '@/middleware/auth.middleware';
import asyncHandler from '@/middleware/asyncHandler';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Attendance CRUD
router.post('/', asyncHandler(attendanceController.create.bind(attendanceController)));
router.post('/bulk', asyncHandler(attendanceController.bulkCreate.bind(attendanceController)));
router.get('/', asyncHandler(attendanceController.getAll.bind(attendanceController)));
router.get('/:id', asyncHandler(attendanceController.getById.bind(attendanceController)));
router.patch('/:id', asyncHandler(attendanceController.update.bind(attendanceController)));
router.delete('/:id', asyncHandler(attendanceController.delete.bind(attendanceController)));

// Attendance by group and date
router.get('/group/:groupId/date', asyncHandler(attendanceController.getGroupAttendanceByDate.bind(attendanceController)));

// Statistics
router.get('/stats/group/:groupId', asyncHandler(attendanceController.getGroupStats.bind(attendanceController)));
router.get('/stats/student/:studentId', asyncHandler(attendanceController.getStudentStats.bind(attendanceController)));

export default router;
