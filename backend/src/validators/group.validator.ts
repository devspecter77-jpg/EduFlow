import { z } from 'zod';

export const createGroupSchema = z.object({
  name: z.string().min(1, 'Guruh nomi majburiy').max(100, 'Guruh nomi juda uzun'),
  subject: z.string().min(1, 'Fan majburiy').max(100, 'Fan nomi juda uzun'),
  level: z.string().min(1, 'Daraja majburiy').max(50, 'Daraja juda uzun'),
  teacherId: z.string().cuid('Noto\'g\'ri o\'qituvchi ID').optional().nullable(),
  startDate: z.string().datetime('Noto\'g\'ri sana formati').optional(),
  endDate: z.string().datetime('Noto\'g\'ri sana formati').optional().nullable(),
  schedule: z.string().min(1, 'Jadval majburiy'),
  courseFee: z.number().min(0, 'Kurs narxi manfiy bo\'lishi mumkin emas').optional().default(0),
  maxStudents: z.number().int().min(1, 'Maksimal talabalar soni kamida 1 bo\'lishi kerak').max(100, 'Maksimal talabalar soni 100 dan oshmasligi kerak').default(20),
  room: z.string().max(50, 'Xona nomi juda uzun').optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'COMPLETED', 'CANCELLED']).default('ACTIVE'),
  description: z.string().max(500, 'Izoh juda uzun').optional().nullable(),
});

export const updateGroupSchema = z.object({
  name: z.string().min(1, 'Guruh nomi majburiy').max(100, 'Guruh nomi juda uzun').optional(),
  subject: z.string().min(1, 'Fan majburiy').max(100, 'Fan nomi juda uzun').optional(),
  level: z.string().min(1, 'Daraja majburiy').max(50, 'Daraja juda uzun').optional(),
  teacherId: z.string().cuid('Noto\'g\'ri o\'qituvchi ID').optional(),
  startDate: z.string().datetime('Noto\'g\'ri sana formati').optional(),
  endDate: z.string().datetime('Noto\'g\'ri sana formati').optional().nullable(),
  schedule: z.string().min(1, 'Jadval majburiy').optional(),
  courseFee: z.number().min(0, 'Kurs narxi manfiy bo\'lishi mumkin emas').optional(),
  maxStudents: z.number().int().min(1).max(100).optional(),
  room: z.string().max(50, 'Xona nomi juda uzun').optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
  description: z.string().max(500, 'Izoh juda uzun').optional().nullable(),
});

export const groupFiltersSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(500).default(10), // Increased from 100 to 500
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
  teacherId: z.string().cuid().optional(),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type GroupFilters = z.infer<typeof groupFiltersSchema>;
