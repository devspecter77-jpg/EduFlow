import { z } from 'zod';

const phoneRegex = /^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/;
const normalizePhone = (v: string) => v.replace(/\s/g, '');

export const studentSchema = z.object({
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
    .optional()
    .refine((v) => !v || v === '' || phoneRegex.test(v), {
      message: 'Ota-ona telefon +998 91 405 84 81 formatida bo\'lishi kerak',
    })
    .transform((v) => v && v !== '' ? normalizePhone(v) : undefined),
  birthDate: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE']),
  address: z.string().max(255).optional(),
  groupId: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'GRADUATED', 'EXPELLED']),
  notes: z.string().max(1000).optional(),
  startDate: z.string().optional(),
  paymentType: z.enum(['MONTHLY', 'YEARLY']),
  paymentAmount: z.number().min(0).optional(),
  nextPaymentDate: z.string().optional(),
});

export type StudentFormData = {
  fullName: string;
  phone: string;
  parentFullName?: string;
  parentPhone?: string;
  birthDate?: string;
  gender: 'MALE' | 'FEMALE';
  address?: string;
  groupId?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'EXPELLED';
  notes?: string;
  startDate?: string;
  paymentType: 'MONTHLY' | 'YEARLY';
  paymentAmount?: number;
  nextPaymentDate?: string;
};
