import type { Request, Response } from 'express';
import { settingsRepository } from '@repositories/settings.repository';
import { auditLogRepository } from '@repositories/auditLog.repository';
import { sendSuccess, sendError } from '@utils/response';
import { z } from 'zod';
import { prisma } from '@config/database';

// Validation schema
const updateSettingsSchema = z.object({
  centerName: z.string().min(2).optional(),
  logo: z.string().url().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  address: z.string().optional().nullable(),
  workingHours: z.string().optional().nullable(),
  telegram: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  website: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  currency: z.enum(['UZS', 'USD']).optional(),
  timezone: z.string().optional(),
  dateFormat: z.enum(['DD_MM_YYYY', 'MM_DD_YYYY', 'YYYY_MM_DD']).optional(),
  language: z.enum(['UZ', 'RU', 'EN']).optional(),
  theme: z.string().optional(),
  defaultPagination: z.number().int().min(5).max(100).optional(),
  defaultCourseFee: z.number().min(0).optional(),
  lateDays: z.number().int().min(0).max(30).optional(),
  defaultPaymentType: z.enum(['MONTHLY', 'YEARLY']).optional(),
  reminderEnabled: z.boolean().optional(),
  reminderDaysBefore: z.number().int().min(0).max(30).optional(),
});

async function getCenterName(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { centerName: true },
  });
  return user?.centerName || 'O\'quv Markazi';
}

export class SettingsController {
  /**
   * GET /api/settings
   */
  async getSettings(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      let settings = await settingsRepository.findByUserId(userId);

      if (!settings) {
        const centerName = await getCenterName(userId);
        settings = await settingsRepository.upsert(userId, {
          userId,
          centerName,
        });
      }

      sendSuccess(res, settings, 'Sozlamalar yuklandi');
    } catch (error) {
      console.error('Get settings error:', error);
      sendError(res, 'Sozlamalarni yuklashda xatolik', 500);
    }
  }

  /**
   * PUT /api/settings
   */
  async updateSettings(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;

      const validation = updateSettingsSchema.safeParse(req.body);
      if (!validation.success) {
        sendError(res, 'Validatsiya xatosi', 400, validation.error.errors);
        return;
      }

      // Ensure we have a centerName for upsert
      let centerName = validation.data.centerName;
      if (!centerName) {
        centerName = await getCenterName(userId);
      }

      const settings = await settingsRepository.upsert(userId, {
        userId,
        centerName,
        ...validation.data,
      });

      // Keep User.centerName and the actual Center record in sync — both are
      // separate denormalized copies of the name that the SuperAdmin panel
      // reads directly, and would otherwise silently go stale here.
      if (validation.data.centerName !== undefined) {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { centerId: true } });
        const tasks: Promise<unknown>[] = [
          prisma.user.update({ where: { id: userId }, data: { centerName: validation.data.centerName } }),
        ];
        if (user?.centerId) {
          tasks.push(prisma.center.update({ where: { id: user.centerId }, data: { name: validation.data.centerName } }));
        }
        await Promise.all(tasks);
      }

      await auditLogRepository.create({
        userId,
        action: 'UPDATE',
        entity: 'Settings',
        entityId: settings.id,
        description: 'Sozlamalar yangilandi',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      sendSuccess(res, settings, 'Sozlamalar yangilandi');
    } catch (error) {
      console.error('Update settings error:', error);
      sendError(res, 'Sozlamalarni yangilashda xatolik', 500);
    }
  }

  /**
   * POST /api/settings/reset
   */
  async resetSettings(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const centerName = await getCenterName(userId);

      const settings = await settingsRepository.upsert(userId, {
        userId,
        centerName,
        currency: 'UZS',
        timezone: 'Asia/Tashkent',
        dateFormat: 'DD_MM_YYYY',
        language: 'UZ',
        theme: 'light',
        defaultPagination: 20,
        defaultCourseFee: 500000,
        lateDays: 5,
        defaultPaymentType: 'MONTHLY',
        reminderEnabled: true,
        reminderDaysBefore: 3,
      });

      await auditLogRepository.create({
        userId,
        action: 'UPDATE',
        entity: 'Settings',
        entityId: settings.id,
        description: 'Sozlamalar standart holatga qaytarildi',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      sendSuccess(res, settings, 'Sozlamalar standart holatga qaytarildi');
    } catch (error) {
      console.error('Reset settings error:', error);
      sendError(res, 'Sozlamalarni qaytarishda xatolik', 500);
    }
  }
}

export const settingsController = new SettingsController();
