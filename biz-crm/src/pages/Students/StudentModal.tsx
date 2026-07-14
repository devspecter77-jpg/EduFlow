import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { studentSchema, type StudentFormData } from '@/lib/validations/student';
import { studentsApi, type Student } from '@/lib/api/students';
import { groupsApi } from '@/lib/api/groups';

interface Props {
  student?: Student | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface GroupOption {
  id: string;
  name: string;
  subject: string;
}

const PHONE_FORMAT = (value: string) => {
  let v = value.replace(/[^\d+]/g, '');
  if (!v.startsWith('+998')) v = '+998';
  if (v.length > 4) {
    const d = v.substring(4);
    let f = d.substring(0, 2);
    if (d.length > 2) f += ' ' + d.substring(2, 5);
    if (d.length > 5) f += ' ' + d.substring(5, 7);
    if (d.length > 7) f += ' ' + d.substring(7, 9);
    v = '+998 ' + f;
  }
  return v.substring(0, 17);
};

export function StudentModal({ student, onClose, onSuccess }: Props) {
  const isEdit = !!student;
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);

  const loadGroups = useCallback(async () => {
    setGroupsLoading(true);
    try {
      const res = await groupsApi.getAll({ limit: 100, status: 'ACTIVE' });
      setGroups(res.data.map(g => ({ id: g.id, name: g.name, subject: g.subject })));
    } catch {
      setGroups([]);
    } finally {
      setGroupsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const methods = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      fullName: student?.fullName ?? '',
      phone: student?.phone ?? '+998',
      parentFullName: student?.parentFullName ?? '',
      parentPhone: student?.parentPhone ?? '',
      birthDate: student?.birthDate ? student.birthDate.slice(0, 10) : '',
      gender: student?.gender ?? 'MALE',
      address: student?.address ?? '',
      groupId: student?.groupId ?? '',
      status: student?.status ?? 'ACTIVE',
      notes: student?.notes ?? '',
      startDate: student?.startDate ? student.startDate.slice(0, 10) : '',
      paymentType: student?.paymentType ?? 'MONTHLY',
      paymentAmount: student?.paymentAmount ?? 0,
      nextPaymentDate: student?.nextPaymentDate ? student.nextPaymentDate.slice(0, 10) : '',
    },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = methods;

  const startDate = watch('startDate');
  const paymentType = watch('paymentType');

  // Auto-calculate next payment date
  useEffect(() => {
    if (startDate && paymentType) {
      const d = new Date(startDate);
      if (!isNaN(d.getTime())) {
        if (paymentType === 'MONTHLY') {
          d.setMonth(d.getMonth() + 1);
        } else {
          d.setFullYear(d.getFullYear() + 1);
        }
        setValue('nextPaymentDate', d.toISOString().slice(0, 10));
      }
    }
  }, [startDate, paymentType, setValue]);

  useEffect(() => {
    if (student?.phone && !student.phone.includes(' ')) {
      // format stored phone
      const raw = student.phone;
      if (raw.startsWith('+998') && raw.length === 13) {
        const fmt = `+998 ${raw.slice(4, 6)} ${raw.slice(6, 9)} ${raw.slice(9, 11)} ${raw.slice(11, 13)}`;
        setValue('phone', fmt);
      }
    }
    if (student?.parentPhone && !student.parentPhone.includes(' ')) {
      const raw = student.parentPhone;
      if (raw.startsWith('+998') && raw.length === 13) {
        const fmt = `+998 ${raw.slice(4, 6)} ${raw.slice(6, 9)} ${raw.slice(9, 11)} ${raw.slice(11, 13)}`;
        setValue('parentPhone', fmt);
      }
    }
  }, [student, setValue]);

  const onSubmit = async (data: StudentFormData) => {
    setLoading(true);
    setServerError('');
    try {
      if (isEdit && student) {
        await studentsApi.update(student.id, data);
      } else {
        await studentsApi.create({
          ...data,
          parentFullName: data.parentFullName || undefined,
          parentPhone: data.parentPhone || undefined,
          birthDate: data.birthDate || undefined,
          address: data.address || undefined,
          groupId: data.groupId || undefined,
          notes: data.notes || undefined,
          startDate: data.startDate || undefined,
          paymentAmount: data.paymentAmount || undefined,
          nextPaymentDate: data.nextPaymentDate || undefined,
        });
      }
      onSuccess();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-2xl rounded-2xl bg-card border shadow-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">
            {isEdit ? 'O\'quvchini tahrirlash' : 'Yangi o\'quvchi qo\'shish'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-accent transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto hide-scrollbar px-6 py-4 space-y-4">{serverError && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
              {serverError}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Ism Familya <span className="text-red-500">*</span>
            </label>
            <input
              {...register('fullName')}
              placeholder="Masalan: Ali Valiyev"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Telefon raqam <span className="text-red-500">*</span>
            </label>
            <input
              {...register('phone')}
              type="tel"
              placeholder="+998 91 405 84 81"
              defaultValue="+998 "
              onChange={(e) => setValue('phone', PHONE_FORMAT(e.target.value))}
              onFocus={(e) => { if (!e.target.value || e.target.value === '+998') setValue('phone', '+998 '); }}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
          </div>

          {/* Parent Full Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Ota-ona ism familyasi (ixtiyoriy)</label>
            <input
              {...register('parentFullName')}
              placeholder="Masalan: Vali Valiyev"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {errors.parentFullName && <p className="mt-1 text-xs text-red-500">{errors.parentFullName.message}</p>}
          </div>

          {/* Parent Phone */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Ota-ona telefon (ixtiyoriy)</label>
            <input
              {...register('parentPhone')}
              type="tel"
              placeholder="+998 91 405 84 81"
              onChange={(e) => setValue('parentPhone', PHONE_FORMAT(e.target.value))}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {errors.parentPhone && <p className="mt-1 text-xs text-red-500">{errors.parentPhone.message}</p>}
          </div>

          {/* Gender + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Jinsi</label>
              <select
                {...register('gender')}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="MALE">Erkak</option>
                <option value="FEMALE">Ayol</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Holati</label>
              <select
                {...register('status')}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="ACTIVE">Faol</option>
                <option value="INACTIVE">Faolsiz</option>
                <option value="GRADUATED">Bitirgan</option>
                <option value="EXPELLED">Chiqarib yuborilgan</option>
              </select>
            </div>
          </div>

          {/* Birth Date */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Tug'ilgan sana (ixtiyoriy)</label>
            <input
              {...register('birthDate')}
              type="date"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Manzil (ixtiyoriy)</label>
            <input
              {...register('address')}
              placeholder="Masalan: Toshkent, Chilonzor"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Group */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Guruh (ixtiyoriy)</label>
            {groupsLoading ? (
              <div className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground animate-pulse">
                Guruhlar yuklanmoqda...
              </div>
            ) : groups.length === 0 ? (
              <div className="rounded-lg border border-dashed bg-background px-3 py-2.5 text-sm text-muted-foreground">
                Avval <a href="/dashboard/groups" className="text-teal-600 hover:underline font-medium">Guruhlar bo'limidan</a> guruh yarating.
              </div>
            ) : (
              <select
                {...register('groupId')}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Guruh tanlang</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name} — {g.subject}</option>
                ))}
              </select>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Kelgan sana (ixtiyoriy)</label>
            <input
              {...register('startDate')}
              type="date"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Payment Type */}
          <div>
            <label className="block text-sm font-medium mb-1.5">To'lov turi</label>
            <div className="flex gap-2">
              <label className="flex flex-1 items-center justify-center gap-2 rounded-lg border bg-background px-4 py-2 cursor-pointer hover:bg-accent transition-colors">
                <input
                  {...register('paymentType')}
                  type="radio"
                  value="MONTHLY"
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm font-medium">Oylik</span>
              </label>
              <label className="flex flex-1 items-center justify-center gap-2 rounded-lg border bg-background px-4 py-2 cursor-pointer hover:bg-accent transition-colors">
                <input
                  {...register('paymentType')}
                  type="radio"
                  value="YEARLY"
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm font-medium">Yillik</span>
              </label>
            </div>
          </div>

          {/* Payment Amount */}
          <div>
            <label className="block text-sm font-medium mb-1.5">To'lov miqdori (ixtiyoriy)</label>
            <input
              {...register('paymentAmount', { valueAsNumber: true })}
              type="text"
              placeholder="Masalan: 50 000"
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                const num = parseInt(val || '0');
                setValue('paymentAmount', num);
                e.target.value = num > 0 ? num.toLocaleString('uz-UZ') : '';
              }}
              onBlur={(e) => {
                const num = parseInt(e.target.value.replace(/\D/g, '') || '0');
                e.target.value = num > 0 ? num.toLocaleString('uz-UZ') : '';
              }}
              defaultValue={student?.paymentAmount ? student.paymentAmount.toLocaleString('uz-UZ') : ''}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {errors.paymentAmount && <p className="mt-1 text-xs text-red-500">{errors.paymentAmount.message}</p>}
          </div>

          {/* Next Payment Date (Auto-calculated) */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Keyingi to'lov sanasi</label>
            <input
              {...register('nextPaymentDate')}
              type="date"
              readOnly
              className="w-full rounded-lg border bg-muted px-3 py-2 text-sm cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Kelgan sana va to'lov turiga qarab avtomatik hisoblanadi
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Izoh (ixtiyoriy)</label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Qo'shimcha ma'lumot..."
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 border-t px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60"
            >
              {loading ? 'Saqlanmoqda...' : isEdit ? 'Saqlash' : 'Qo\'shish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
