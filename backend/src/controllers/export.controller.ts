import type { Request, Response } from 'express';
import { prisma } from '@/config/database';
import * as XLSX from 'xlsx';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

function makeWorkbook(data: Record<string, unknown>[], sheetName: string, colWidths: { wch: number }[]) {
  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = colWidths;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}

function sendExcel(res: Response, buffer: Buffer, filename: string) {
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
}

export class ExportController {
  /**
   * GET /api/students/export
   */
  async exportStudents(req: Request, res: Response) {
    const userId = req.user!.userId;
    const ids = req.query.ids as string | undefined;
    try {
      const where = ids
        ? { id: { in: ids.split(',') }, userId }
        : { userId, isDeleted: false };

      const students = await db.student.findMany({ where, orderBy: { createdAt: 'desc' } });

      // Get all groups to resolve group names
      const groups = await db.group.findMany({ where: { userId, isDeleted: false }, select: { id: true, name: true } });
      const groupMap: Record<string, string> = {};
      groups.forEach((g: { id: string; name: string }) => { groupMap[g.id] = g.name; });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = students.map((s: any) => ({
        'Ism Familya':             s.fullName,
        'Telefon':                 s.phone,
        'Ota-ona ism familyasi':   s.parentFullName || '',
        'Ota-ona telefon':         s.parentPhone || '',
        'Guruh':                   s.groupId ? (groupMap[s.groupId] || s.groupId) : '',
        'Jins':                    s.gender === 'MALE' ? 'ERKAK' : 'AYOL',
        'Holati':                  s.status === 'ACTIVE' ? 'FAOL' : s.status === 'INACTIVE' ? 'FAOLSIZ' : s.status === 'GRADUATED' ? 'BITIRGAN' : 'CHIQARIB YUBORILGAN',
        "Tug'ilgan sana":          s.birthDate ? new Date(s.birthDate).toLocaleDateString('uz-UZ') : '',
        'Manzil':                  s.address || '',
        'Kelgan sana':             s.startDate ? new Date(s.startDate).toLocaleDateString('uz-UZ') : '',
        "To'lov turi":             s.paymentType === 'MONTHLY' ? 'OYLIK' : 'YILLIK',
        "Oylik to'lov":            s.paymentAmount || 0,
        "Keyingi to'lov sanasi":   s.nextPaymentDate ? new Date(s.nextPaymentDate).toLocaleDateString('uz-UZ') : '',
        'Izoh':                    s.notes || '',
        "Qo'shilgan sana":         new Date(s.createdAt).toLocaleDateString('uz-UZ'),
      }));

      const buf = makeWorkbook(data, 'Oquvchilar', [
        { wch: 22 }, { wch: 15 }, { wch: 22 }, { wch: 15 }, { wch: 18 },
        { wch: 8 }, { wch: 14 }, { wch: 14 }, { wch: 20 }, { wch: 13 },
        { wch: 12 }, { wch: 13 }, { wch: 18 }, { wch: 25 }, { wch: 13 },
      ]);
      sendExcel(res, buf, `Oquvchilar_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Export xatoligi';
      res.status(500).json({ success: false, message });
    }
  }

  /**
   * GET /api/teachers/export
   */
  async exportTeachers(req: Request, res: Response) {
    const userId = req.user!.userId;
    const ids = req.query.ids as string | undefined;
    try {
      const where = ids
        ? { id: { in: ids.split(',') }, userId }
        : { userId, isDeleted: false };

      const teachers = await db.teacher.findMany({ where, orderBy: { createdAt: 'desc' } });

      // Guruh nomlarini olish
      const groups = await db.group.findMany({
        where: { userId, isDeleted: false },
        select: { id: true, name: true },
      });
      const groupMap: Record<string, string> = {};
      groups.forEach((g: { id: string; name: string }) => { groupMap[g.id] = g.name; });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = teachers.map((t: any) => ({
        'Ism Familya':          t.fullName,
        'Telefon':              t.phone,
        'Jins':                 t.gender === 'MALE' ? 'ERKAK' : 'AYOL',
        "Tug'ilgan sana":       t.birthDate ? new Date(t.birthDate).toLocaleDateString('uz-UZ') : '',
        'Manzil':               t.address || '',
        "Ta'lim":               t.education || '',
        'Tajriba (yil)':        t.experience ?? 0,
        'Oylik maosh':          t.salary ?? 0,
        'Ishga qabul sanasi':   t.hireDate ? new Date(t.hireDate).toLocaleDateString('uz-UZ') : '',
        'Holati':               t.status === 'ACTIVE' ? 'FAOL' : t.status === 'INACTIVE' ? 'FAOLSIZ' : "TA'TILDA",
        'Izoh':                 t.notes || '',
        'Guruhlar':             (t.groupIds || []).map((id: string) => groupMap[id] || id).join(', '),
        "Qo'shilgan sana":      new Date(t.createdAt).toLocaleDateString('uz-UZ'),
      }));

      const buf = makeWorkbook(data, 'Oqituvchilar', [
        { wch: 24 }, { wch: 16 }, { wch: 8 }, { wch: 14 }, { wch: 22 },
        { wch: 16 }, { wch: 12 }, { wch: 14 }, { wch: 18 }, { wch: 10 },
        { wch: 22 }, { wch: 28 }, { wch: 14 },
      ]);
      sendExcel(res, buf, `Oqituvchilar_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Export xatoligi';
      res.status(500).json({ success: false, message });
    }
  }

  /**
   * GET /api/groups/export
   */
  async exportGroups(req: Request, res: Response) {
    const userId = req.user!.userId;
    const ids = req.query.ids as string | undefined;
    try {
      const where = ids
        ? { id: { in: ids.split(',') }, userId }
        : { userId, isDeleted: false };

      const groups = await db.group.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      // Count students per group
      const groupsWithCounts = await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        groups.map(async (g: any) => {
          const studentCount = await db.student.count({
            where: { groupId: g.id, isDeleted: false, status: 'ACTIVE' },
          });
          return { ...g, studentCount };
        })
      );

      // Kunlar nomlari
      const dayNames: Record<string, string> = {
        'monday': 'Dushanba',
        'tuesday': 'Seshanba',
        'wednesday': 'Chorshanba',
        'thursday': 'Payshanba',
        'friday': 'Juma',
        'saturday': 'Shanba',
        'sunday': 'Yakshanba',
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = groupsWithCounts.map((g: any) => {
        // Schedule ni parse qilish
        let scheduleObj: any = {};
        let scheduleText = '';
        
        try {
          if (g.schedule && typeof g.schedule === 'string') {
            scheduleObj = JSON.parse(g.schedule);
          } else if (typeof g.schedule === 'object') {
            scheduleObj = g.schedule;
          }
          
          // Dars kunlari va vaqtlarini formatlash
          // Schedule object formatida: { monday: { enabled: true, startTime: "09:00", endTime: "11:00" }, ... }
          const scheduleParts: string[] = [];
          
          Object.keys(dayNames).forEach((dayKey) => {
            const daySchedule = scheduleObj[dayKey];
            if (daySchedule && daySchedule.enabled === true && daySchedule.startTime && daySchedule.endTime) {
              const dayName = dayNames[dayKey];
              scheduleParts.push(`${dayName} ${daySchedule.startTime}-${daySchedule.endTime}`);
            }
          });
          
          scheduleText = scheduleParts.join('; ');
        } catch (err) {
          console.error('Schedule parse xatosi:', err);
          scheduleText = '';
        }

        return {
          'Guruh nomi':        g.name || '',
          'Fan':               g.subject || '',
          'Daraja':            g.level || '',
          'Max talabalar':     g.maxStudents || 0,
          'Hozirgi talabalar': g.studentCount || 0,
          'Xona':              g.room || '',
          'Dars jadvali':      scheduleText,
          'Holati':            g.status === 'ACTIVE' ? 'FAOL' : g.status === 'INACTIVE' ? 'FAOLSIZ' : g.status === 'COMPLETED' ? 'TUGALLANGAN' : 'BEKOR',
          'Boshlanish sanasi': g.startDate ? new Date(g.startDate).toLocaleDateString('uz-UZ') : '',
          'Kurs narxi':        g.courseFee || 0,
          'Izoh':              g.description || '',
          "Qo'shilgan sana":   g.createdAt ? new Date(g.createdAt).toLocaleDateString('uz-UZ') : '',
        };
      });

      const buf = makeWorkbook(data, 'Guruhlar', [
        { wch: 22 }, // Guruh nomi
        { wch: 18 }, // Fan
        { wch: 12 }, // Daraja
        { wch: 14 }, // Max talabalar
        { wch: 16 }, // Hozirgi talabalar
        { wch: 12 }, // Xona
        { wch: 40 }, // Dars jadvali (keng qilish)
        { wch: 14 }, // Holati
        { wch: 16 }, // Boshlanish sanasi
        { wch: 14 }, // Kurs narxi
        { wch: 30 }, // Izoh
        { wch: 16 }, // Qo'shilgan sana
      ]);
      sendExcel(res, buf, `Guruhlar_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err: unknown) {
      console.error('Export groups xatosi:', err);
      const message = err instanceof Error ? err.message : 'Export xatoligi';
      res.status(500).json({ success: false, message });
    }
  }

  /**
   * GET /api/payments/export
   */
  async exportPayments(req: Request, res: Response) {
    const userId = req.user!.userId;
    try {
      const payments = await db.payment.findMany({
        where: { student: { userId }, isDeleted: false },
        include: {
          student: { select: { fullName: true } },
          group: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = payments.map((p: any) => ({
        'Talaba': p.student.fullName,
        'Guruh': p.group?.name || '',
        'Summa': p.amount,
        'Tolangan': p.paidAmount,
        'Holati': p.status,
        'Usul': p.method,
        'Muddat': new Date(p.dueDate).toLocaleDateString('uz-UZ'),
        'Tolangan sana': p.paidDate ? new Date(p.paidDate).toLocaleDateString('uz-UZ') : '',
      }));

      const buf = makeWorkbook(data, 'Tolovlar', [
        { wch: 22 }, { wch: 18 }, { wch: 13 }, { wch: 13 }, { wch: 13 }, { wch: 12 }, { wch: 12 }, { wch: 14 },
      ]);
      sendExcel(res, buf, `Tolovlar_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Export xatoligi';
      res.status(500).json({ success: false, message });
    }
  }

  /**
   * GET /api/attendances/export
   */
  async exportAttendances(req: Request, res: Response) {
    const userId = req.user!.userId;
    try {
      const attendances = await db.attendance.findMany({
        where: { student: { userId } },
        include: {
          student: { select: { fullName: true, phone: true } },
          group: { select: { name: true } },
        },
        orderBy: { date: 'desc' },
        take: 10000,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = attendances.map((a: any) => ({
        'Talaba': a.student.fullName,
        'Telefon': a.student.phone,
        'Guruh': a.group.name,
        'Sana': new Date(a.date).toLocaleDateString('uz-UZ'),
        'Holati': a.status,
        'Izoh': a.notes || '',
      }));

      const buf = makeWorkbook(data, 'Davomat', [
        { wch: 22 }, { wch: 15 }, { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 30 },
      ]);
      sendExcel(res, buf, `Davomat_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Export xatoligi';
      res.status(500).json({ success: false, message });
    }
  }
}

export const exportController = new ExportController();
