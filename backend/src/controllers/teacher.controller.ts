import { Request, Response } from 'express';
import { TeacherService } from '@services/teacher.service';
import {
  createTeacherSchema,
  updateTeacherSchema,
  teacherQuerySchema,
} from '@validators/teacher.validator';
import asyncHandler from '@middleware/asyncHandler';
import { sendSuccess } from '@utils/response';

export class TeacherController {
  private service: TeacherService;

  constructor() {
    this.service = new TeacherService();
  }

  create = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId; // ✅ Fixed: was req.user.id
    const data = createTeacherSchema.parse(req.body);
    const teacher = await this.service.create(userId, data);
    sendSuccess(res, teacher, 'O\'qituvchi muvaffaqiyatli qo\'shildi', 201);
  });

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId; // ✅ Fixed: was req.user.id
    const query = teacherQuerySchema.parse(req.query);
    const result = await this.service.getAll(userId, query);

    res.json({
      success: true,
      data: result.teachers,
      message: 'O\'qituvchilar muvaffaqiyatli olindi',
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId; // ✅ Fixed: was req.user.id
    const teacher = await this.service.getById(id as string, userId);
    sendSuccess(res, teacher, 'O\'qituvchi muvaffaqiyatli olindi');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId; // ✅ Fixed: was req.user.id
    const data = updateTeacherSchema.parse(req.body);
    const teacher = await this.service.update(id as string, userId, data);
    sendSuccess(res, teacher, 'O\'qituvchi muvaffaqiyatli yangilandi');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId; // ✅ Fixed: was req.user.id
    await this.service.delete(id as string, userId);
    sendSuccess(res, null, 'O\'qituvchi muvaffaqiyatli o\'chirildi');
  });
}
