import { z } from 'zod';

// Telefon raqam validatsiyasi (Uzbekistan format: +998 91 405 84 81 yoki +998901234567)
const phoneRegex = /^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/;

// Helper function to normalize phone
const normalizePhone = (phone: string) => phone.replace(/\s/g, '');

// Ro'yxatdan o'tish validatsiya sxemasi
export const registerSchema = z
  .object({
    centerName: z
      .string()
      .min(3, "O'quv markaz nomi kamida 3 ta belgidan iborat bo'lishi kerak")
      .max(100, "O'quv markaz nomi 100 ta belgidan oshmasligi kerak")
      .trim(),
    fullName: z
      .string()
      .min(3, 'Ism familya kamida 3 ta belgidan iborat bo\'lishi kerak')
      .max(100, 'Ism familya 100 ta belgidan oshmasligi kerak')
      .trim(),
    phone: z
      .string()
      .trim()
      .refine((val) => phoneRegex.test(val), {
        message: 'Telefon raqam +998 91 405 84 81 formatida bo\'lishi kerak',
      })
      .transform(normalizePhone),
    password: z
      .string()
      .min(8, 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Parollar bir xil emas',
    path: ['confirmPassword'],
  });

// Kirish validatsiya sxemasi
export const loginSchema = z.object({
  phone: z
    .string()
    .trim()
    .refine((val) => phoneRegex.test(val), {
      message: 'Telefon raqam +998 91 405 84 81 formatida bo\'lishi kerak',
    })
    .transform(normalizePhone),
  password: z.string().min(1, 'Parol kiritilishi shart'),
  rememberMe: z.boolean().optional(),
});

// Types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
