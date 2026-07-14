import { X, Pencil, Phone, User, MapPin, Calendar, FileText, GraduationCap, DollarSign, Users } from 'lucide-react';
import type { Teacher } from '@/lib/api/teachers';

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Faol',
  INACTIVE: 'Faolsiz',
  ON_LEAVE: "Ta'tilda",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  INACTIVE: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  ON_LEAVE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

interface Props {
  teacher: Teacher;
  groupMap: Record<string, string>;
  onClose: () => void;
  onEdit: () => void;
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 rounded-md bg-teal-50 dark:bg-teal-900/20 p-1.5">
        <Icon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export function TeacherViewModal({ teacher, groupMap, onClose, onEdit }: Props) {
  const formatPhone = (p: string) => {
    if (p.startsWith('+998') && p.length === 13) {
      return `+998 ${p.slice(4, 6)} ${p.slice(6, 9)} ${p.slice(9, 11)} ${p.slice(11, 13)}`;
    }
    return p;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-card border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">O'qituvchi ma'lumotlari</h2>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-accent transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30 text-2xl font-bold text-teal-600 dark:text-teal-400">
              {teacher.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{teacher.fullName}</h3>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mt-1 ${STATUS_COLORS[teacher.status]}`}>
                {STATUS_LABELS[teacher.status]}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-2">
            {teacher.groupIds && teacher.groupIds.length > 0 && (
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-md bg-teal-50 dark:bg-teal-900/20 p-1.5">
                  <Users className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Guruhlar</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {teacher.groupIds.map(id => (
                      <span
                        key={id}
                        className="inline-flex items-center rounded-md bg-teal-100 dark:bg-teal-900/30 px-2 py-0.5 text-xs font-medium text-teal-700 dark:text-teal-400"
                      >
                        {groupMap[id] || id}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <InfoRow icon={GraduationCap} label="Tajriba" value={`${teacher.experience} yil`} />
            <InfoRow icon={Phone} label="Telefon" value={formatPhone(teacher.phone)} />
            <InfoRow icon={User} label="Jinsi" value={teacher.gender === 'MALE' ? 'Erkak' : 'Ayol'} />
            {teacher.education && (
              <InfoRow icon={GraduationCap} label="Ta'lim" value={teacher.education} />
            )}
            {teacher.birthDate && (
              <InfoRow icon={Calendar} label="Tug'ilgan sana" value={new Date(teacher.birthDate).toLocaleDateString('uz-UZ')} />
            )}
            {teacher.address && (
              <InfoRow icon={MapPin} label="Manzil" value={teacher.address} />
            )}
            {teacher.salary && (
              <InfoRow icon={DollarSign} label="Oylik maosh" value={`${teacher.salary.toLocaleString('uz-UZ')} so'm`} />
            )}
            {teacher.hireDate && (
              <InfoRow icon={Calendar} label="Ishga qabul sanasi" value={new Date(teacher.hireDate).toLocaleDateString('uz-UZ')} />
            )}
            {teacher.notes && (
              <InfoRow icon={FileText} label="Izoh" value={teacher.notes} />
            )}
            <InfoRow
              icon={Calendar}
              label="Qo'shilgan sana"
              value={new Date(teacher.createdAt).toLocaleDateString('uz-UZ')}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
            Yopish
          </button>
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-sm font-medium transition-colors"
          >
            <Pencil className="h-4 w-4" />
            Tahrirlash
          </button>
        </div>
      </div>
    </div>
  );
}

