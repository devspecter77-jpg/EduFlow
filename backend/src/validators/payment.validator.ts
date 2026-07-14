import { z } from 'zod';

export const createPaymentSchema = z.object({
  studentId: z.string().cuid('Noto\'g\'ri talaba ID'),
  groupId: z.string().cuid('Noto\'g\'ri guruh ID'),
  amount: z.number().min(0, 'Miqdor manfiy bo\'lishi mumkin emas'),
  paidAmount: z.number().min(0, 'To\'langan miqdor manfiy bo\'lishi mumkin emas').default(0),
  dueDate: z.string().datetime('Noto\'g\'ri sana formati'),
  paidDate: z.string().datetime('Noto\'g\'ri sana formati').optional().nullable(),
  status: z.enum(['PENDING', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED']).default('PENDING'),
  method: z.enum(['CASH', 'CARD', 'TRANSFER', 'OTHER']).default('CASH'),
  notes: z.string().max(500, 'Izoh juda uzun').optional().nullable(),
});

export const updatePaymentSchema = z.object({
  amount: z.number().min(0).optional(),
  paidAmount: z.number().min(0).optional(),
  dueDate: z.string().datetime().optional(),
  paidDate: z.string().datetime().optional().nullable(),
  status: z.enum(['PENDING', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED']).optional(),
  method: z.enum(['CASH', 'CARD', 'TRANSFER', 'OTHER']).optional(),
  notes: z.string().max(500).optional().nullable(),
});

export const paymentFiltersSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  studentId: z.string().cuid().optional(),
  groupId: z.string().cuid().optional(),
  status: z.enum(['PENDING', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED']).optional(),
  method: z.enum(['CASH', 'CARD', 'TRANSFER', 'OTHER']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
export type PaymentFilters = z.infer<typeof paymentFiltersSchema>;
