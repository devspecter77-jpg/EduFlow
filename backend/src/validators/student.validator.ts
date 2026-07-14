import { z } from 'zod';

const phoneRegex = /^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/;
const normalizePhone = (v: string) => v.replace(/\s/g, '');

export const createStudentSchema = z.object({
  fullName: z
    .string()
    .min(3, 'Ism familya kamida 3 ta belgidan iborat bo\'lishi kerak')
    .max(100, 'Ism familya 100 ta belgidan oshmasligi kerak')
    .trim(),
  phone: z
    .string()
    .trim()
    .refine((v) => phoneRegex.test(v), {
      message: 'Telefon raqam +998 91 405 84 81 formatida bo\'lishi kerak',
    })
    .transform(normalizePhone),
  parentFullName: z
    .string()
    .max(100, 'Ota-ona ism familyasi 100 ta belgidan oshmasligi kerak')
    .trim()
    .optional(),
  parentPhone: z
    .string()
    .trim()
    .refine((v) => v === '' || phoneRegex.test(v), {
      message: 'Ota-ona telefon +998 91 405 84 81 formatida bo\'lishi kerak',
    })
    .transform(normalizePhone)
    .optional()
    .or(z.literal('')),
  birthDate: z
    .string()
    .optional()
    .transform((v) => (v ? new Date(v) : undefined)),
  gender: z.enum(['MALE', 'FEMALE']).default('MALE'),
  address: z.string().max(255).optional(),
  groupId: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'GRADUATED', 'EXPELLED']).default('ACTIVE'),
  notes: z.string().max(1000).optional(),

  // To'lov maydonlari
  startDate: z
    .string()
    .optional()
    .transform((v) => (v ? new Date(v) : undefined)),
  paymentType: z.enum(['MONTHLY', 'YEARLY']).default('MONTHLY'),
  paymentAmount: z
    .number()
    .min(0, 'To\'lov miqdori 0 dan katta bo\'lishi kerak')
    .optional(),
  nextPaymentDate: z
    .string()
    .optional()
    .transform((v) => (v ? new Date(v) : undefined)),
});

export const updateStudentSchema = createStudentSchema.partial();

export const studentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).catch(1),
  limit: z.coerce.number().int().min(1).max(100).default(10).catch(10),
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'GRADUATED', 'EXPELLED']).optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type StudentQuery = z.infer<typeof studentQuerySchema>;
