import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { teacherSchema, type TeacherFormData } from '@/lib/validations/teacher';
import { teachersApi, type Teacher } from '@/lib/api/teachers';
import { groupsApi } from '@/lib/api/groups';

interface Props {
  teacher?: Teacher | null;
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

export function TeacherModal({ teacher, onClose, onSuccess }: Props) {
  const isEdit = !!teacher;
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [availableGroups, setAvailableGroups] = useState<GroupOption[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);

  const loadGroups = useCallback(async () => {
    setGroupsLoading(true);
    try {
      const res = await groupsApi.getAll({ limit: 100, status: 'ACTIVE' });
      setAvailableGroups(res.data.map(g => ({ id: g.id, name: g.name, subject: g.subject })));
    } catch {
      setAvailableGroups([]);
    } finally {
      setGroupsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const methods = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      fullName: teacher?.fullName ?? '',
      phone: teacher?.phone ?? '+998',
      birthDate: teacher?.birthDate ? teacher.birthDate.slice(0, 10) : '',
      gender: teacher?.gender ?? 'MALE',
      address: teacher?.address ?? '',
      groupIds: teacher?.groupIds ?? [],
      experience: teacher?.experience ?? 0,
      education: teacher?.education ?? '',
      salary: teacher?.salary ?? 0,
      hireDate: teacher?.hireDate ? teacher.hireDate.slice(0, 10) : '',
      status: teacher?.status ?? 'ACTIVE',
      notes: teacher?.notes ?? '',
    },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = methods;

  const selectedGroups = watch('groupIds');

  useEffect(() => {
    if (teacher?.phone && !teacher.phone.includes(' ')) {
      const raw = teacher.phone;
      if (raw.startsWith('+998') && raw.length === 13) {
        const fmt = `+998 ${raw.slice(4, 6)} ${raw.slice(6, 9)} ${raw.slice(9, 11)} ${raw.slice(11, 13)}`;
        setValue('phone', fmt);
      }
    }
  }, [teacher, setValue]);

  const onSubmit = async (data: TeacherFormData) => {
    setLoading(true);
    setServerError('');
    try {
      if (isEdit && teacher) {
        await teachersApi.update(teacher.id, data);
      } else {
        await teachersApi.create({
          ...data,
          birthDate: data.birthDate || undefined,
          address: data.address || undefined,
          education: data.education || undefined,
          salary: data.salary || undefined,
          hireDate: data.hireDate || undefined,
          notes: data.notes || undefined,
          groupIds: data.groupIds || [],
        });
      }
      onSuccess();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const toggleGroup = (groupId: string) => {
    const current = selectedGroups || [];
    if (current.includes(groupId)) {
      setValue('groupIds', current.filter(id => id !== groupId));
    } else {
      setValue('groupIds', [...current, groupId]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-2xl rounded-2xl bg-card border shadow-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">
            {isEdit ? 'O\'qituvchini tahrirlash' : 'Yangi o\'qituvchi qo\'shish'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-accent transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto hide-scrollbar px-6 py-4 space-y-4">
            {serverError && (
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
                placeholder="Masalan: Alisher Navoiy"
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

            {/* Groups Multi-Select */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Guruhlar</label>
              {groupsLoading ? (
                <div className="rounded-lg border bg-background p-3 text-sm text-muted-foreground animate-pulse">
                  Guruhlar yuklanmoqda...
                </div>
              ) : availableGroups.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-background px-3 py-2.5 text-sm text-muted-foreground">
                  Avval <a href="/dashboard/groups" className="text-teal-600 hover:underline font-medium">Guruhlar bo'limidan</a> guruh yarating.
                </div>
              ) : (
                <div className="rounded-lg border bg-background p-3 space-y-2 max-h-40 overflow-y-auto">
                  {availableGroups.map(group => (
                    <label
                      key={group.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-accent rounded px-2 py-1 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedGroups?.includes(group.id) || false}
                        onChange={() => toggleGroup(group.id)}
                        className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-sm">{group.name}</span>
                      <span className="text-xs text-muted-foreground ml-1">— {group.subject}</span>
                    </label>
                  ))}
                </div>
              )}
              {selectedGroups && selectedGroups.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selectedGroups.map(id => {
                    const group = availableGroups.find(g => g.id === id);
                    return group ? (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 rounded-md bg-teal-100 dark:bg-teal-900/30 px-2 py-1 text-xs font-medium text-teal-700 dark:text-teal-400"
                      >
                        {group.name}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                O'qituvchi bir nechta guruhga biriktirilishi mumkin
              </p>
            </div>

            {/* Experience + Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Tajriba (yillar) <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('experience', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  max="50"
                  placeholder="0"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                {errors.experience && <p className="mt-1 text-xs text-red-500">{errors.experience.message}</p>}
              </div>
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
            </div>

            {/* Education */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Ta'lim (ixtiyoriy)</label>
              <input
                {...register('education')}
                placeholder="Masalan: TDPU, Magistr"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
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
                placeholder="Masalan: Toshkent, Yunusobod"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Salary + Hire Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Oylik maosh (ixtiyoriy)</label>
                <input
                  {...register('salary', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  placeholder="0"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Ishga qabul sanasi (ixtiyoriy)</label>
                <input
                  {...register('hireDate')}
                  type="date"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Holati</label>
              <select
                {...register('status')}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="ACTIVE">Faol</option>
                <option value="INACTIVE">Faolsiz</option>
                <option value="ON_LEAVE">Ta'tilda</option>
              </select>
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
