import { useState } from 'react';
import { X, Save, Clock } from 'lucide-react';
import { groupsApi, type Group, type CreateGroupInput } from '@/lib/api/groups';

interface GroupModalProps {
  group?: Group;
  onClose: () => void;
  onSuccess: () => void;
}

interface DaySchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

interface ScheduleData {
  [key: string]: DaySchedule;
}

const WEEKDAYS = [
  { id: 'monday', label: 'Dushanba' },
  { id: 'tuesday', label: 'Seshanba' },
  { id: 'wednesday', label: 'Chorshanba' },
  { id: 'thursday', label: 'Payshanba' },
  { id: 'friday', label: 'Juma' },
  { id: 'saturday', label: 'Shanba' },
  { id: 'sunday', label: 'Yakshanba' },
];

export function GroupModal({ group, onClose, onSuccess }: GroupModalProps) {
  const isEdit = !!group;
  const [loading, setLoading] = useState(false);
  
  // Parse schedule from JSON string
  const parseSchedule = (scheduleJson: string): ScheduleData => {
    const defaultDay: DaySchedule = { enabled: false, startTime: '09:00', endTime: '11:00' };
    const defaultSchedule: ScheduleData = {
      monday:    { ...defaultDay },
      tuesday:   { ...defaultDay },
      wednesday: { ...defaultDay },
      thursday:  { ...defaultDay },
      friday:    { ...defaultDay },
      saturday:  { ...defaultDay },
      sunday:    { ...defaultDay },
    };

    try {
      const parsed = JSON.parse(scheduleJson);
      if (!parsed || typeof parsed !== 'object') return defaultSchedule;

      // Merge parsed data with defaults - har bir kun uchun default qiymatlari bilan to'ldirish
      const result: ScheduleData = { ...defaultSchedule };
      for (const dayKey of Object.keys(defaultSchedule)) {
        if (parsed[dayKey] && typeof parsed[dayKey] === 'object') {
          result[dayKey] = {
            enabled:   typeof parsed[dayKey].enabled === 'boolean' ? parsed[dayKey].enabled : false,
            startTime: parsed[dayKey].startTime || '09:00',
            endTime:   parsed[dayKey].endTime   || '11:00',
          };
        }
      }
      return result;
    } catch {
      return defaultSchedule;
    }
  };

  const [formData, setFormData] = useState({
    name: group?.name || '',
    subject: group?.subject || '',
    level: group?.level || '',
    maxStudents: group?.maxStudents || 20,
    room: group?.room || '',
    status: group?.status || 'ACTIVE',
    description: group?.description || '',
  });

  const [schedule, setSchedule] = useState<ScheduleData>(
    group?.schedule ? parseSchedule(group.schedule) : {
      monday: { enabled: false, startTime: '09:00', endTime: '11:00' },
      tuesday: { enabled: false, startTime: '09:00', endTime: '11:00' },
      wednesday: { enabled: false, startTime: '09:00', endTime: '11:00' },
      thursday: { enabled: false, startTime: '09:00', endTime: '11:00' },
      friday: { enabled: false, startTime: '09:00', endTime: '11:00' },
      saturday: { enabled: false, startTime: '09:00', endTime: '11:00' },
      sunday: { enabled: false, startTime: '09:00', endTime: '11:00' },
    }
  );

  const toggleDay = (dayId: string) => {
    setSchedule((prev) => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        enabled: !prev[dayId].enabled,
      },
    }));
  };

  const updateDayTime = (dayId: string, field: 'startTime' | 'endTime', value: string) => {
    setSchedule((prev) => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate: at least one day must be selected
    const hasEnabledDay = Object.values(schedule).some(day => day.enabled);
    if (!hasEnabledDay) {
      alert('Kamida bitta hafta kuni tanlanishi kerak');
      return;
    }

    // Validate times
    for (const [dayId, day] of Object.entries(schedule)) {
      if (day.enabled) {
        if (!day.startTime || !day.endTime) {
          alert('Tanlangan barcha kunlar uchun vaqt kiritilishi kerak');
          return;
        }
        // Convert HH:MM to total minutes for proper numeric comparison
        const toMinutes = (t: string) => {
          const [h, m] = t.split(':').map(Number);
          return h * 60 + m;
        };
        const startMin = toMinutes(day.startTime);
        const endMin = toMinutes(day.endTime);
        const dayLabel = WEEKDAYS.find(w => w.id === dayId)?.label || dayId;
        if (endMin <= startMin) {
          alert(`${dayLabel}: Tugash vaqti (${day.endTime}) boshlanish vaqtidan (${day.startTime}) katta bo'lishi kerak`);
          return;
        }
      }
    }

    setLoading(true);

    try {
      // Calculate auto dates based on first enabled day
      const today = new Date();
      const dayOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      let startDate = new Date();
      
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);
        const dayName = dayOrder[checkDate.getDay()];
        if (schedule[dayName]?.enabled) {
          startDate = checkDate;
          break;
        }
      }

      // Auto calculate end date (3 months later)
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 3);

      const payload: CreateGroupInput = {
        name: formData.name,
        subject: formData.subject,
        level: formData.level,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        schedule: JSON.stringify(schedule),
        courseFee: 0,
        maxStudents: Number(formData.maxStudents),
        room: formData.room || null,
        status: formData.status as Group['status'],
        description: formData.description || null,
      };

      if (isEdit) {
        await groupsApi.update(group.id, payload);
      } else {
        await groupsApi.create(payload);
      }

      onSuccess();
    } catch (error: unknown) {
      console.error('Failed to save group:', error);
      const errMsg = (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message;
      alert(errMsg || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="w-full max-w-3xl rounded-2xl bg-card border shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-xl font-semibold">
            {isEdit ? 'Guruhni tahrirlash' : 'Yangi guruh qo\'shish'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-accent transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto hide-scrollbar">
          {/* Guruh nomi */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Guruh nomi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Frontend 01"
              required
            />
          </div>

          {/* Fan va Daraja */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Fan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Frontend Development"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Daraja <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Boshlang'ich"
                required
              />
            </div>
          </div>

          {/* Dars jadvali */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Dars jadvali <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3 rounded-lg border p-4 bg-muted/20">
              {WEEKDAYS.map((day) => (
                <div key={day.id} className="space-y-2">
                  {/* Checkbox for day */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={day.id}
                      checked={schedule[day.id].enabled}
                      onChange={() => toggleDay(day.id)}
                      className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <label htmlFor={day.id} className="text-sm font-medium cursor-pointer">
                      {day.label}
                    </label>
                  </div>

                  {/* Time inputs (only if day is enabled) */}
                  {schedule[day.id].enabled && (() => {
                    const toMin = (t: string) => {
                      const match = t.match(/^(\d{1,2}):(\d{2})$/);
                      if (!match) return -1;
                      return parseInt(match[1]) * 60 + parseInt(match[2]);
                    };
                    const startMin = toMin(schedule[day.id].startTime);
                    const endMin = toMin(schedule[day.id].endTime);
                    const isInvalid = startMin >= 0 && endMin >= 0 && endMin <= startMin;
                    return (
                      <div className="ml-6 space-y-1">
                        <div className={`flex items-center gap-3 bg-background rounded-lg p-3 border ${isInvalid ? 'border-red-500' : ''}`}>
                          <Clock className={`h-4 w-4 ${isInvalid ? 'text-red-500' : 'text-muted-foreground'}`} />
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={schedule[day.id].startTime}
                              onChange={(e) => updateDayTime(day.id, 'startTime', e.target.value)}
                              placeholder="09:00"
                              maxLength={5}
                              className="flex-1 rounded border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-center"
                            />
                            <span className="text-sm text-muted-foreground">—</span>
                            <input
                              type="text"
                              value={schedule[day.id].endTime}
                              onChange={(e) => updateDayTime(day.id, 'endTime', e.target.value)}
                              placeholder="11:00"
                              maxLength={5}
                              className={`flex-1 rounded border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 text-center ${isInvalid ? 'border-red-500 focus:ring-red-400' : 'focus:ring-teal-500'}`}
                            />
                          </div>
                        </div>
                        {isInvalid && (
                          <p className="text-xs text-red-500 ml-1">
                            ⚠ Tugash vaqti boshlanish vaqtidan katta bo'lishi kerak
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Dars oladigan kunlarni belgilang va har bir kun uchun vaqtni kiriting
            </p>
          </div>

          {/* Max talabalar */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Maksimal talabalar <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.maxStudents}
              onChange={(e) => setFormData({ ...formData, maxStudents: Number(e.target.value) })}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="20"
              min="1"
              max="100"
              required
            />
          </div>

          {/* Xona va Holat */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Xona/Sinf (ixtiyoriy)
              </label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="A-101"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Holati <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'CANCELLED' })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="ACTIVE">Faol</option>
                <option value="INACTIVE">Faolsiz</option>
                <option value="COMPLETED">Tugallangan</option>
                <option value="CANCELLED">Bekor qilingan</option>
              </select>
            </div>
          </div>

          {/* Izoh */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Izoh
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Guruh haqida qo'shimcha ma'lumot..."
              rows={3}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t p-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
            disabled={loading}
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saqlanmoqda...' : isEdit ? 'Yangilash' : 'Saqlash'}
          </button>
        </div>
      </div>
    </div>
  );
}
