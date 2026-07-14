import type { Request, Response } from 'express';
import { profileRepository } from '@repositories/profile.repository';
import { auditLogRepository } from '@repositories/auditLog.repository';
import { sendSuccess, sendError } from '@utils/response';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { prisma } from '@config/database';

// Validation schemas
const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().min(9).optional(),
  centerName: z.string().min(2).optional(),
  avatar: z.string().url().optional().nullable(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
  confirmPassword: z.string().min(6),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Yangi parollar mos emas',
  path: ['confirmPassword'],
});

export class ProfileController {
  /**
   * GET /api/profile
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const profile = await profileRepository.findById(userId);

      if (!profile) {
        sendError(res, 'Profil topilmadi', 404);
        return;
      }

      sendSuccess(res, profile, 'Profil yuklandi');
    } catch (error) {
      console.error('Get profile error:', error);
      sendError(res, 'Profilni yuklashda xatolik', 500);
    }
  }

  /**
   * PUT /api/profile
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;

      const validation = updateProfileSchema.safeParse(req.body);
      if (!validation.success) {
        sendError(res, 'Validatsiya xatosi', 400, validation.error.errors);
        return;
      }

      const data = validation.data;

      // Check phone uniqueness
      if (data.phone) {
        const phoneTaken = await profileRepository.isPhoneTaken(data.phone, userId);
        if (phoneTaken) {
          sendError(res, 'Bu telefon raqam allaqachon ishlatilmoqda', 400);
          return;
        }
      }

      const profile = await profileRepository.update(userId, data);

      await auditLogRepository.create({
        userId,
        action: 'UPDATE',
        entity: 'Profile',
        entityId: userId,
        description: 'Profil yangilandi',
        metadata: { updatedFields: Object.keys(data) },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      sendSuccess(res, profile, 'Profil yangilandi');
    } catch (error) {
      console.error('Update profile error:', error);
      sendError(res, 'Profilni yangilashda xatolik', 500);
    }
  }

  /**
   * PUT /api/profile/password
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;

      const validation = changePasswordSchema.safeParse(req.body);
      if (!validation.success) {
        sendError(res, 'Validatsiya xatosi', 400, validation.error.errors);
        return;
      }

      const { currentPassword, newPassword } = validation.data;

      // Fetch user with password
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, password: true },
      });

      if (!user) {
        sendError(res, 'Foydalanuvchi topilmadi', 404);
        return;
      }

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        sendError(res, 'Joriy parol noto\'g\'ri', 400);
        return;
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      await profileRepository.updatePassword(userId, hashed);

      await auditLogRepository.create({
        userId,
        action: 'PASSWORD_CHANGE',
        entity: 'User',
        entityId: userId,
        description: 'Parol o\'zgartirildi',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      sendSuccess(res, null, 'Parol muvaffaqiyatli o\'zgartirildi');
    } catch (error) {
      console.error('Change password error:', error);
      sendError(res, 'Parolni o\'zgartirishda xatolik', 500);
    }
  }
}

export const profileController = new ProfileController();
