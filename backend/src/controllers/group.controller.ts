import type { Request, Response } from 'express';
import { groupService } from '@/services/group.service';
import { createGroupSchema, updateGroupSchema, groupFiltersSchema } from '@/validators/group.validator';
import { sendSuccess } from '@/utils/response';
import { AppError } from '@/middleware/errorHandler';

export class GroupController {
  async create(req: Request, res: Response) {
    const userId = req.user!.userId;
    const validatedData = createGroupSchema.parse(req.body);
    const group = await groupService.createGroup(userId, validatedData);
    return sendSuccess(res, group, 'Guruh muvaffaqiyatli yaratildi', 201);
  }

  async getAll(req: Request, res: Response) {
    const userId = req.user!.userId;
    const filters = groupFiltersSchema.parse({
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
      search: req.query.search as string | undefined,
      status: req.query.status as 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'CANCELLED' | undefined,
      teacherId: req.query.teacherId as string | undefined,
    });

    const result = await groupService.getAllGroups(userId, filters);
    return sendSuccess(res, result.data, 'Guruhlar muvaffaqiyatli yuklandi', 200);
  }

  async getById(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { id } = req.params;
    
    if (!id || Array.isArray(id)) {
      throw new AppError('Guruh ID majburiy', 400);
    }

    const group = await groupService.getGroupById(id, userId);
    return sendSuccess(res, group, 'Guruh muvaffaqiyatli yuklandi');
  }

  async update(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { id } = req.params;
    
    if (!id || Array.isArray(id)) {
      throw new AppError('Guruh ID majburiy', 400);
    }

    const validatedData = updateGroupSchema.parse(req.body);
    const group = await groupService.updateGroup(id, userId, validatedData);
    return sendSuccess(res, group, 'Guruh muvaffaqiyatli yangilandi');
  }

  async delete(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { id } = req.params;
    
    if (!id || Array.isArray(id)) {
      throw new AppError('Guruh ID majburiy', 400);
    }

    await groupService.deleteGroup(id, userId);
    return sendSuccess(res, null, 'Guruh muvaffaqiyatli o\'chirildi');
  }

  async addStudent(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { studentId } = req.body;
    
    if (!id || Array.isArray(id) || !studentId) {
      throw new AppError('Guruh ID va Talaba ID majburiy', 400);
    }

    const result = await groupService.addStudentToGroup(id, studentId, userId);
    return sendSuccess(res, result, 'Talaba guruhga qo\'shildi', 201);
  }

  async removeStudent(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { id, studentId } = req.params;
    
    if (!id || Array.isArray(id) || !studentId || Array.isArray(studentId)) {
      throw new AppError('Guruh ID va Talaba ID majburiy', 400);
    }

    await groupService.removeStudentFromGroup(id, studentId, userId);
    return sendSuccess(res, null, 'Talaba guruhdan olib tashlandi');
  }

  async getStudents(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { id } = req.params;
    
    if (!id || Array.isArray(id)) {
      throw new AppError('Guruh ID majburiy', 400);
    }

    const students = await groupService.getGroupStudents(id, userId);
    return sendSuccess(res, students, 'Guruh talabalari muvaffaqiyatli yuklandi');
  }
}

export const groupController = new GroupController();
