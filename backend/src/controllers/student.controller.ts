import { Request, Response } from 'express';
import { StudentService } from '@services/student.service';
import { sendSuccess } from '@utils/response';
import {
  createStudentSchema,
  updateStudentSchema,
  studentQuerySchema,
} from '@validators/student.validator';

const service = new StudentService();

// GET /api/students
export const getStudents = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const query = studentQuerySchema.parse(req.query);
  const result = await service.getAll(userId, query);

  res.json({
    success: true,
    data: result.students,
    message: "O'quvchilar ro'yxati",
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
  });
};

// GET /api/students/:id
export const getStudentById = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const student = await service.getById(String(req.params.id), userId);
  sendSuccess(res, student, "O'quvchi ma'lumotlari");
};

// POST /api/students
export const createStudent = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const data = createStudentSchema.parse(req.body);
  const student = await service.create(userId, data);
  sendSuccess(res, student, "O'quvchi muvaffaqiyatli qo'shildi", 201);
};

// PATCH /api/students/:id
export const updateStudent = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const data = updateStudentSchema.parse(req.body);
  const student = await service.update(String(req.params.id), userId, data);
  sendSuccess(res, student, "O'quvchi muvaffaqiyatli yangilandi");
};

// DELETE /api/students/:id
export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  await service.delete(String(req.params.id), userId);
  sendSuccess(res, null, "O'quvchi muvaffaqiyatli o'chirildi");
};

// GET /api/students/stats
export const getStudentStats = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const stats = await service.getStats(userId);
  sendSuccess(res, stats, 'Statistika');
};
