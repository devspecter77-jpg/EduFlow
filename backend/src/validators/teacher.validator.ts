import { z } from 'zod';

const phoneRegex = /^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/;
const normalizePhone = (v: string) => v.replace(/\s/g, '');

export const createTeacherSchema = z.object({
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
  birthDate: z
    .string()
    .optional()
    .transform((v) => (v ? new Date(v) : undefined)),
  gender: z.enum(['MALE', 'FEMALE']).default('MALE'),
  address: z.string().max(255).optional(),
  groupIds: z
    .array(z.string())
    .default([]),
  experience: z
    .number()
    .int('Tajriba butun son bo\'lishi kerak')
    .min(0, 'Tajriba 0 dan kichik bo\'lmasligi kerak')
    .max(50, 'Tajriba 50 yildan oshmasligi kerak')
    .default(0),
  education: z.string().max(255).optional(),
  salary: z
    .number()
    .min(0, 'Maosh 0 dan kichik bo\'lmasligi kerak')
    .optional(),
  hireDate: z
    .string()
    .optional()
    .transform((v) => (v ? new Date(v) : undefined)),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE']).default('ACTIVE'),
  notes: z.string().max(1000).optional(),
});

export const updateTeacherSchema = createTeacherSchema.partial();

export const teacherQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).catch(1),
  limit: z.coerce.number().int().min(1).max(100).default(10).catch(10),
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE']).optional(),
  groupId: z.string().optional(),
});

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;
export type TeacherQuery = z.infer<typeof teacherQuerySchema>;
