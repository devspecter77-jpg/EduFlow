import type { Request, Response } from 'express';
import { prisma } from '@/config/database';
import * as XLSX from 'xlsx';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

interface ImportValidationError {
  row: number;
  field: string;
  value: unknown;
  message: string;
}

// ─── Telefon normalizatsiya ────────────────────────────────────────────────────
function normalizePhone(raw: unknown): { phone: string; error?: string } {
  if (!raw) return { phone: '', error: 'Telefon raqam bo\'sh' };
  const digits = String(raw).replace(/\D/g, '');
  let normalized = '';
  if (digits.startsWith('998') && digits.length === 12) {
    normalized = '+' + digits;
  } else if (digits.startsWith('0') && digits.length === 10) {
    normalized = '+998' + digits.slice(1);
  } else if (digits.length === 9) {
    normalized = '+998' + digits;
  } else if (digits.length === 13) {
    normalized = '+' + digits.slice(2);
  } else {
    return { phone: '', error: `Telefon raqam noto'g'ri: "${raw}"` };
  }
  if (!/^\+998\d{9}$/.test(normalized)) {
    return { phone: '', error: `Telefon O'zbekiston formatida emas: "${raw}"` };
  }
  return { phone: normalized };
}

// ─── Excel sana parse ─────────────────────────────────────────────────────────
function parseExcelDate(val: unknown): Date | null {
  if (!val && val !== 0) return null;

  // Excel serial number
  if (typeof val === 'number') {
    const msPerDay = 24 * 60 * 60 * 1000;
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + val * msPerDay);
    if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
      return date;
    }
    return null;
  }

  if (typeof val === 'string') {
    const s = val.trim();
    if (!s) return null;

    // ISO: "2026-01-15"
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
      const d = new Date(s);
      return isNaN(d.getTime()) ? null : d;
    }
    // DD.MM.YYYY: "15.01.2026"
    if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(s)) {
      const [day, month, year] = s.split('.');
      const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return isNaN(d.getTime()) ? null : d;
    }
    // DD/MM/YYYY: "15/01/2026"
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
      const [day, month, year] = s.split('/');
      const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return isNaN(d.getTime()) ? null : d;
    }
    // DD-MM-YYYY: "15-01-2026"
    if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(s)) {
      const [day, month, year] = s.split('-');
      const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }

  return null;
}

// ─── Import Controller ────────────────────────────────────────────────────────
export class ImportController {

  // POST /api/students/import
  async importStudents(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    if (!req.file) {
      res.status(400).json({ success: false, message: 'Excel fayl talab qilinadi' });
      return;
    }

    try {
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

      // Guruh nomidan ID topish
      const groups = await db.group.findMany({
        where: { userId, isDeleted: false },
        select: { id: true, name: true },
      });
      const groupByName: Record<string, string> = {};
      groups.forEach((g: { id: string; name: string }) => {
        groupByName[g.name.toLowerCase().trim()] = g.id;
      });

      const errors: ImportValidationError[] = [];
      let imported = 0;
      let skipped = 0;

      // Excel ichidagi telefon raqamlarni kuzatish va takrorlanganlar uchun avtomatik yangi raqam berish
      const phoneCounter: Record<string, boolean> = {};

      for (let i = 0; i < data.length; i++) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const row = data[i] as any;
        const rowNum = i + 2;

        // Support Uzbek, English keys, and old format
        const studentName = row['Ism Familya'] || row['fullName'] || row['Full Name'];
        const studentPhoneRaw = row['Telefon'] || row['phone'] || row['Phone'];

        if (!studentName || !studentPhoneRaw) {
          errors.push({ row: rowNum, field: 'fullName / phone', value: '', message: 'Majburiy maydonlar to\'ldirilmagan' });
          skipped++; continue;
        }

        const phoneResult = normalizePhone(studentPhoneRaw);
        if (phoneResult.error || !phoneResult.phone) {
          errors.push({ row: rowNum, field: 'phone', value: studentPhoneRaw, message: phoneResult.error || 'Telefon noto\'g\'ri' });
          skipped++; continue;
        }
        const phone = phoneResult.phone;

        // Excel ichida takrorlangan telefon raqamni tekshirish
        if (phoneCounter[phone]) {
          errors.push({ row: rowNum, field: 'phone', value: phone, message: 'Bu telefon Excel faylida allaqachon ishlatilgan' });
          skipped++; continue;
        }

        // Tizimda mavjudligini tekshirish
        const existing = await db.student.findFirst({ where: { phone, userId, isDeleted: false } });
        if (existing) {
          errors.push({ row: rowNum, field: 'phone', value: phone, message: 'Bu telefon tizimda allaqachon mavjud' });
          skipped++; continue;
        }

        // Telefon ishlatilganini belgilash
        phoneCounter[phone] = true;

        // Guruh ID - support Uzbek and English column names
        let groupId: string | null = null;
        const groupNameValue = row['Guruh'] || row['groupName'] || row['Group Name'];
        if (groupNameValue) {
          groupId = groupByName[String(groupNameValue).toLowerCase().trim()] || null;
        }

        // Sanalar - support Uzbek and English column names
        const birthDate = parseExcelDate(row["Tug'ilgan sana"] || row['birthDate'] || row['Birth Date']);
        const startDate = parseExcelDate(row['Kelgan sana'] || row['startDate'] || row['Start Date']);
        const nextPaymentDate = parseExcelDate(row["Keyingi to'lov sanasi"] || row['nextPaymentDate'] || row['Next Payment Date']);

        // Jins - o'zbek va ingliz tillarini qo'llab-quvvatlaydi
        const genderRaw = String(row['Jins'] || row['gender'] || row['Gender'] || 'MALE').toUpperCase().trim();
        const gender = (genderRaw === 'FEMALE' || genderRaw === 'AYOL' || genderRaw === 'F') ? 'FEMALE' : 'MALE';

        // To'lov turi - support Uzbek and English
        const paymentTypeRaw = String(row["To'lov turi"] || row['paymentType'] || row['Payment Type'] || 'MONTHLY').toUpperCase().trim();
        const paymentType = (paymentTypeRaw === 'YEARLY' || paymentTypeRaw === 'YILLIK') ? 'YEARLY' : 'MONTHLY';

        // Holat - o'zbek va ingliz tillarini qo'llab-quvvatlaydi
        const statusRaw = String(row['Holati'] || row['status'] || row['Status'] || 'ACTIVE').toUpperCase().trim();
        const studentStatusMap: Record<string, string> = {
          'ACTIVE': 'ACTIVE', 'FAOL': 'ACTIVE',
          'INACTIVE': 'INACTIVE', 'FAOLSIZ': 'INACTIVE',
          'GRADUATED': 'GRADUATED', 'BITIRGAN': 'GRADUATED',
          'EXPELLED': 'EXPELLED', 'CHIQARIB': 'EXPELLED',
        };
        const status = studentStatusMap[statusRaw] || 'ACTIVE';

        // Other fields - support Uzbek and English
        const parentFullName = row['Ota-ona ism familyasi'] || row['parentFullName'] || row['Parent Full Name'];
        const parentPhone = row['Ota-ona telefon'] || row['parentPhone'] || row['Parent Phone'];
        const address = row['Manzil'] || row['address'] || row['Address'];
        const paymentAmount = row["Oylik to'lov"] || row['paymentAmount'] || row['Payment Amount'];
        const notes = row['Izoh'] || row['notes'] || row['Notes'];

        try {
          // Final tekshiruv: Database ga qo'shishdan oldin yana bir marta tekshirish
          const finalCheck = await db.student.findFirst({
            where: { phone, userId, isDeleted: false }
          });
          
          if (finalCheck) {
            errors.push({ row: rowNum, field: 'phone', value: phone, message: 'Bu telefon tizimda allaqachon mavjud (final tekshiruv)' });
            skipped++;
            continue;
          }

          await db.student.create({
            data: {
              userId,
              fullName: String(studentName).trim(),
              phone,
              parentFullName: parentFullName ? String(parentFullName).trim() : null,
              parentPhone: parentPhone ? (normalizePhone(parentPhone).phone || null) : null,
              gender,
              birthDate,
              address: address ? String(address).trim() : null,
              groupId,
              startDate,
              paymentType,
              paymentAmount: paymentAmount ? parseFloat(String(paymentAmount)) : null,
              nextPaymentDate,
              notes: notes ? String(notes).trim() : null,
              status,
            },
          });
          imported++;
        } catch (err: unknown) {
          let message = 'Xatolik yuz berdi';
          if (err instanceof Error) {
            message = err.message;
            // Unique constraint xatosini aniqlash
            if (message.includes('Unique constraint') && message.includes('phone')) {
              message = 'Bu telefon raqam allaqachon ishlatilgan';
            }
          }
          errors.push({ row: rowNum, field: 'Database', value: phone, message });
          skipped++;
        }
      }

      res.json({ success: true, imported, skipped, total: data.length, errors });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Excel o\'qishda xatolik';
      res.status(500).json({ success: false, message });
    }
  }

  // POST /api/teachers/import
  async importTeachers(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    if (!req.file) {
      res.status(400).json({ success: false, message: 'Excel fayl talab qilinadi' });
      return;
    }

    try {
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

      const errors: ImportValidationError[] = [];
      let imported = 0;
      let skipped = 0;

      // Excel ichidagi telefon raqamlarni kuzatish va takrorlanganlar uchun avtomatik yangi raqam berish
      const phoneCounter: Record<string, boolean> = {};

      for (let i = 0; i < data.length; i++) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const row = data[i] as any;
        const rowNum = i + 2;

        // Support Uzbek, English keys, and old format
        const teacherName = row['Ism Familya'] || row['fullName'] || row['Full Name'];
        const teacherPhoneRaw = row['Telefon'] || row['phone'] || row['Phone'];

        if (!teacherName || !teacherPhoneRaw) {
          errors.push({ row: rowNum, field: 'fullName / phone', value: '', message: 'Majburiy maydonlar to\'ldirilmagan' });
          skipped++; continue;
        }

        const phoneResult = normalizePhone(teacherPhoneRaw);
        if (phoneResult.error || !phoneResult.phone) {
          errors.push({ row: rowNum, field: 'phone', value: teacherPhoneRaw, message: phoneResult.error || 'Telefon noto\'g\'ri' });
          skipped++; continue;
        }
        const phone = phoneResult.phone;

        // Excel ichida takrorlangan telefon raqamni tekshirish
        if (phoneCounter[phone]) {
          errors.push({ row: rowNum, field: 'phone', value: phone, message: 'Bu telefon Excel faylida allaqachon ishlatilgan' });
          skipped++; continue;
        }

        // Tizimda mavjudligini tekshirish
        const existing = await db.teacher.findFirst({ where: { phone, userId, isDeleted: false } });
        if (existing) {
          errors.push({ row: rowNum, field: 'phone', value: phone, message: 'Bu telefon tizimda allaqachon mavjud' });
          skipped++; continue;
        }

        // Telefon ishlatilganini belgilash
        phoneCounter[phone] = true;

        // Parse dates - support Uzbek and English column names
        const birthDate = parseExcelDate(row["Tug'ilgan sana"] || row['birthDate'] || row['Birth Date']);
        const hireDate = parseExcelDate(row['Ishga qabul sanasi'] || row['hireDate'] || row['Hire Date']);

        // Parse gender - o'zbek va ingliz tillarini qo'llab-quvvatlaydi
        const genderRaw = String(row['Jins'] || row['gender'] || row['Gender'] || 'MALE').toUpperCase().trim();
        const gender = (genderRaw === 'FEMALE' || genderRaw === 'AYOL' || genderRaw === 'F') ? 'FEMALE' : 'MALE';

        // Parse status - o'zbek va ingliz tillarini qo'llab-quvvatlaydi
        const statusRaw = String(row['Holati'] || row['status'] || row['Status'] || 'ACTIVE').toUpperCase().trim();
        const statusMap: Record<string, string> = {
          'ACTIVE': 'ACTIVE', 'FAOL': 'ACTIVE',
          'INACTIVE': 'INACTIVE', 'FAOLSIZ': 'INACTIVE',
          "ON_LEAVE": 'ON_LEAVE', "TA'TILDA": 'ON_LEAVE', 'TATILDA': 'ON_LEAVE',
        };
        const status = statusMap[statusRaw] || 'ACTIVE';

        // Parse address, education, notes - support Uzbek and English
        const address = row['Manzil'] || row['address'] || row['Address'];
        const education = row["Ta'lim"] || row['education'] || row['Education'];
        const notes = row['Izoh'] || row['notes'] || row['Notes'];

        // Parse experience - support Uzbek and English
        const experienceRaw = row['Tajriba (yil)'] || row['experience'] || row['Experience'];
        const experience = experienceRaw ? parseInt(String(experienceRaw)) : 0;

        // Parse salary - support Uzbek and English
        const salaryRaw = row['Oylik maosh'] || row['salary'] || row['Salary'];
        const salary = salaryRaw ? parseFloat(String(salaryRaw)) : null;

        try {
          // Final tekshiruv: Database ga qo'shishdan oldin yana bir marta tekshirish
          const finalCheck = await db.teacher.findFirst({
            where: { phone, userId, isDeleted: false }
          });
          
          if (finalCheck) {
            errors.push({ row: rowNum, field: 'phone', value: phone, message: 'Bu telefon tizimda allaqachon mavjud (final tekshiruv)' });
            skipped++;
            continue;
          }

          await db.teacher.create({
            data: {
              userId,
              fullName: String(teacherName).trim(),
              phone,
              gender,
              birthDate,
              address: address ? String(address).trim() : null,
              education: education ? String(education).trim() : null,
              experience,
              salary,
              hireDate,
              notes: notes ? String(notes).trim() : null,
              status,
            },
          });
          imported++;
        } catch (err: unknown) {
          let message = 'Xatolik yuz berdi';
          if (err instanceof Error) {
            message = err.message;
            // Unique constraint xatosini aniqlash
            if (message.includes('Unique constraint') && message.includes('phone')) {
              message = 'Bu telefon raqam allaqachon ishlatilgan';
            }
          }
          errors.push({ row: rowNum, field: 'Database', value: phone, message });
          skipped++;
        }
      }

      res.json({ success: true, imported, skipped, total: data.length, errors });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Excel o\'qishda xatolik';
      res.status(500).json({ success: false, message });
    }
  }

  // POST /api/groups/import
  async importGroups(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    if (!req.file) {
      res.status(400).json({ success: false, message: 'Excel fayl talab qilinadi' });
      return;
    }

    try {
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

      const errors: ImportValidationError[] = [];
      let imported = 0;
      let skipped = 0;

      // Excel ichidagi guruh nomlarini kuzatish va takrorlanganlar uchun avtomatik yangi nom berish
      const groupNameCounter: Record<string, boolean> = {};

      for (let i = 0; i < data.length; i++) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const row = data[i] as any;
        const rowNum = i + 2;

        // Support Uzbek, English keys, and old format
        const groupName = row['Guruh nomi'] || row['name'] || row['Name'];
        const groupSubject = row['Fan'] || row['subject'] || row['Subject'];

        if (!groupName || !groupSubject) {
          errors.push({ row: rowNum, field: 'name / subject', value: '', message: 'Majburiy maydonlar to\'ldirilmagan' });
          skipped++; continue;
        }

        const finalGroupName = String(groupName).trim();
        const normalizedGroupName = finalGroupName.toLowerCase();

        // Excel ichida takrorlangan guruh nomini tekshirish
        if (groupNameCounter[normalizedGroupName]) {
          errors.push({ row: rowNum, field: 'name', value: finalGroupName, message: 'Bu guruh nomi Excel faylida allaqachon ishlatilgan' });
          skipped++; continue;
        }

        // Tizimda mavjudligini tekshirish
        const existing = await db.group.findFirst({
          where: {
            userId,
            name: { equals: finalGroupName, mode: 'insensitive' },
            isDeleted: false,
          },
        });
        if (existing) {
          errors.push({ row: rowNum, field: 'name', value: finalGroupName, message: 'Bu guruh nomi tizimda allaqachon mavjud' });
          skipped++; continue;
        }

        // Guruh nomi ishlatilganini belgilash
        groupNameCounter[normalizedGroupName] = true;

        // Parse status - support Uzbek and English
        const statusRaw = String(row['Holati'] || row['status'] || row['Status'] || 'ACTIVE').toUpperCase().trim();
        const statusMap: Record<string, string> = {
          'ACTIVE': 'ACTIVE', 'FAOL': 'ACTIVE',
          'INACTIVE': 'INACTIVE', 'FAOLSIZ': 'INACTIVE',
          'COMPLETED': 'COMPLETED', 'TUGALLANGAN': 'COMPLETED',
          'CANCELLED': 'CANCELLED', 'BEKOR': 'CANCELLED',
        };
        const status = statusMap[statusRaw] || 'ACTIVE';

        // Parse level, maxStudents, room, description - support Uzbek and English
        const level = row['Daraja'] || row['level'] || row['Level'];
        const maxStudents = row['Max talabalar'] || row['maxStudents'] || row['Max Students'];
        const room = row['Xona'] || row['room'] || row['Room'];
        const description = row['Izoh'] || row['description'] || row['Description'];

        try {
          // Final tekshiruv: Database ga qo'shishdan oldin yana bir marta tekshirish
          const finalCheck = await db.group.findFirst({
            where: {
              userId,
              name: { equals: finalGroupName, mode: 'insensitive' },
              isDeleted: false,
            },
          });
          
          if (finalCheck) {
            errors.push({ row: rowNum, field: 'name', value: finalGroupName, message: 'Bu guruh nomi tizimda allaqachon mavjud (final tekshiruv)' });
            skipped++;
            continue;
          }

          await db.group.create({
            data: {
              userId,
              name: finalGroupName,
              subject: String(groupSubject).trim(),
              level: level ? String(level).trim() : 'Beginner',
              maxStudents: maxStudents ? parseInt(String(maxStudents)) : 20,
              room: room ? String(room).trim() : null,
              description: description ? String(description).trim() : null,
              courseFee: 0,
              startDate: new Date(),
              schedule: '[]',
              status,
            },
          });
          imported++;
        } catch (err: unknown) {
          let message = 'Xatolik yuz berdi';
          if (err instanceof Error) {
            message = err.message;
            // Unique constraint xatosini aniqlash
            if (message.includes('Unique constraint') && message.includes('name')) {
              message = 'Bu guruh nomi allaqachon ishlatilgan';
            }
          }
          errors.push({ row: rowNum, field: 'Database', value: finalGroupName, message });
          skipped++;
        }
      }

      res.json({ success: true, imported, skipped, total: data.length, errors });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Excel o\'qishda xatolik';
      res.status(500).json({ success: false, message });
    }
  }

  // GET /api/students/template
  getStudentTemplate(_req: Request, res: Response): void {
    const data = [
      {
        'Ism Familya': 'Ali Valiyev',
        'Telefon': '+998901234567',
        'Ota-ona ism familyasi': 'Vali Valiyev',
        'Ota-ona telefon': '+998901234568',
        'Jins': 'ERKAK',
        "Tug'ilgan sana": '2005-06-15',
        'Manzil': 'Toshkent, Chilonzor',
        'Guruh': 'Matematika A1',
        'Kelgan sana': '2026-01-10',
        "To'lov turi": 'OYLIK',
        "Oylik to'lov": 500000,
        'Izoh': '',
        'Holati': 'FAOL',
      },
      {
        'Ism Familya': 'Malika Rahimova',
        'Telefon': '+998901234569',
        'Ota-ona ism familyasi': '',
        'Ota-ona telefon': '',
        'Jins': 'AYOL',
        "Tug'ilgan sana": '2006-03-20',
        'Manzil': '',
        'Guruh': '',
        'Kelgan sana': '',
        "To'lov turi": 'OYLIK',
        "Oylik to'lov": 450000,
        'Izoh': '',
        'Holati': 'FAOL',
      },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 22 }, { wch: 15 }, { wch: 22 }, { wch: 15 }, { wch: 8 },
      { wch: 14 }, { wch: 20 }, { wch: 18 }, { wch: 13 }, { wch: 12 },
      { wch: 13 }, { wch: 20 }, { wch: 10 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Oquvchilar');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename=oquvchilar_shablon.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  }

  // GET /api/teachers/template
  getTeacherTemplate(_req: Request, res: Response): void {
    const data = [
      {
        'Ism Familya': 'Muhammad Karimov',
        'Telefon': '+998901234567',
        'Jins': 'ERKAK',
        "Tug'ilgan sana": '1990-05-20',
        'Manzil': 'Toshkent, Yunusobod',
        "Ta'lim": 'Oliy',
        'Tajriba (yil)': 5,
        'Oylik maosh': 3000000,
        'Ishga qabul sanasi': '2023-09-01',
        'Holati': 'FAOL',
        'Izoh': '',
      },
      {
        'Ism Familya': 'Nilufar Yusupova',
        'Telefon': '+998901234568',
        'Jins': 'AYOL',
        "Tug'ilgan sana": '1995-03-15',
        'Manzil': '',
        "Ta'lim": 'Oliy',
        'Tajriba (yil)': 3,
        'Oylik maosh': 2500000,
        'Ishga qabul sanasi': '2024-01-15',
        'Holati': 'FAOL',
        'Izoh': '',
      },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 22 }, { wch: 15 }, { wch: 8 }, { wch: 14 }, { wch: 22 },
      { wch: 16 }, { wch: 12 }, { wch: 14 }, { wch: 18 }, { wch: 10 }, { wch: 22 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Oqituvchilar');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename=oqituvchilar_shablon.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  }

  // GET /api/groups/template
  getGroupTemplate(_req: Request, res: Response): void {
    const data = [
      { 
        'Guruh nomi': 'Matematika A1', 
        'Fan': 'Matematika', 
        'Daraja': 'Beginner', 
        'Max talabalar': 20, 
        'Xona': '101-xona', 
        'Izoh': '', 
        'Holati': 'FAOL' 
      },
      { 
        'Guruh nomi': 'Ingliz B2', 
        'Fan': 'Ingliz tili', 
        'Daraja': 'Intermediate', 
        'Max talabalar': 15, 
        'Xona': '205-xona', 
        'Izoh': 'IELTS tayyorgarlik', 
        'Holati': 'FAOL' 
      },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{ wch: 22 }, { wch: 15 }, { wch: 14 }, { wch: 13 }, { wch: 12 }, { wch: 25 }, { wch: 10 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Guruhlar');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename=guruhlar_shablon.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  }
}

export const importController = new ImportController();
