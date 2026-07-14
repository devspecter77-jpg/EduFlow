import { z } from 'zod';

const phoneRegex = /^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/;
const normalizePhone = (v: string) => v.replace(/\s/g, '');

export const teacherSchema = z.object({
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
  birthDate: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE']),
  address: z.string().max(255).optional(),
  groupIds: z.array(z.string()).optional().default([]),
  experience: z.number().int().min(0).max(50),
  education: z.string().max(255).optional(),
  salary: z.number().min(0).optional(),
  hireDate: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE']),
  notes: z.string().max(1000).optional(),
});

export type TeacherFormData = {
  fullName: string;
  phone: string;
  birthDate?: string;
  gender: 'MALE' | 'FEMALE';
  address?: string;
  groupIds?: string[];
  experience: number;
  education?: string;
  salary?: number;
  hireDate?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  notes?: string;
};
