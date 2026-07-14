import { prisma } from '@config/database';

export type SettingsRow = {
  id: string;
  userId: string;
  centerName: string;
  logo: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  workingHours: string | null;
  telegram: string | null;
  instagram: string | null;
  website: string | null;
  description: string | null;
  currency: string;
  timezone: string;
  dateFormat: string;
  language: string;
  theme: string;
  defaultPagination: number;
  defaultCourseFee: number;
  lateDays: number;
  defaultPaymentType: string;
  reminderEnabled: boolean;
  reminderDaysBefore: number;
  createdAt: Date;
  updatedAt: Date;
};

export type SettingsUpsertInput = Partial<Omit<SettingsRow, 'id' | 'createdAt' | 'updatedAt'>> & {
  userId: string;
  centerName: string;
};

export class SettingsRepository {
  /**
   * Get settings by user ID
   */
  async findByUserId(userId: string): Promise<SettingsRow | null> {
    return prisma.settings.findUnique({
      where: { userId },
    }) as unknown as SettingsRow | null;
  }

  /**
   * Upsert settings (create or update)
   */
  async upsert(userId: string, data: SettingsUpsertInput): Promise<SettingsRow> {
    const { userId: _uid, ...rest } = data;

    return prisma.settings.upsert({
      where: { userId },
      create: {
        userId,
        centerName: data.centerName,
        logo: data.logo,
        phone: data.phone,
        email: data.email,
        address: data.address,
        workingHours: data.workingHours,
        telegram: data.telegram,
        instagram: data.instagram,
        website: data.website,
        description: data.description,
        currency: (data.currency as any) ?? 'UZS',
        timezone: data.timezone ?? 'Asia/Tashkent',
        dateFormat: (data.dateFormat as any) ?? 'DD_MM_YYYY',
        language: (data.language as any) ?? 'UZ',
        theme: data.theme ?? 'light',
        defaultPagination: data.defaultPagination ?? 20,
        defaultCourseFee: data.defaultCourseFee ?? 500000,
        lateDays: data.lateDays ?? 5,
        defaultPaymentType: (data.defaultPaymentType as any) ?? 'MONTHLY',
        reminderEnabled: data.reminderEnabled ?? true,
        reminderDaysBefore: data.reminderDaysBefore ?? 3,
      },
      update: { ...rest } as any,
    }) as unknown as SettingsRow;
  }

  /**
   * Delete settings
   */
  async delete(userId: string): Promise<void> {
    await prisma.settings.delete({ where: { userId } });
  }
}

export const settingsRepository = new SettingsRepository();
