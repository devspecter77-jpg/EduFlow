import { z } from 'zod';

export const createAttendanceSchema = z.object({
  studentId: z.string().cuid('Noto\'g\'ri talaba ID'),
  groupId: z.string().cuid('Noto\'g\'ri guruh ID'),
  date: z.string().datetime('Noto\'g\'ri sana formati'),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']).default('PRESENT'),
  notes: z.string().max(500, 'Izoh juda uzun').optional().nullable(),
});

export const updateAttendanceSchema = z.object({
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']).optional(),
  notes: z.string().max(500, 'Izoh juda uzun').optional().nullable(),
});

export const bulkAttendanceSchema = z.object({
  groupId: z.string().cuid('Noto\'g\'ri guruh ID'),
  date: z.string().datetime('Noto\'g\'ri sana formati'),
  attendances: z.array(z.object({
    studentId: z.string().cuid('Noto\'g\'ri talaba ID'),
    status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
    notes: z.string().max(500).optional().nullable(),
  })),
});

export const attendanceFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1).catch(1),
  limit: z.coerce.number().int().min(1).max(500).default(10).catch(10),
  groupId: z.string().optional(),
  studentId: z.string().optional(),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreateAttendanceInput = z.infer<typeof createAttendanceSchema>;
export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>;
export type BulkAttendanceInput = z.infer<typeof bulkAttendanceSchema>;
export type AttendanceFilters = z.infer<typeof attendanceFiltersSchema>;
