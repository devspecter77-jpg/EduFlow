import { Eye, Pencil, Trash2, CheckSquare, Square, Phone, Calendar, DollarSign, Cake } from 'lucide-react';
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

// ─── Birthday countdown ────────────────────────────────────────────────────

interface BdayInfo {
  daysLeft: number; // 0 = bugun
  nextAge: number;
}

function getBdayInfo(birthDateStr: string): BdayInfo {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const bday = new Date(birthDateStr);
  let next = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());

  // If already passed this year → next year
  if (next < today) {
    next = new Date(today.getFullYear() + 1, bday.getMonth(), bday.getDate());
  }

  const daysLeft = Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const nextAge  = next.getFullYear() - bday.getFullYear();

  return { daysLeft, nextAge };
}

// Badge: always shown when birthDate exists
function BirthdayBadge({ info }: { info: BdayInfo }) {
  if (info.daysLeft === 0) {
    return (
      <div className="absolute -top-3 left-0 right-0 flex justify-center z-10">
        <span className="inline-flex items-center gap-1 rounded-full bg-pink-500 px-3 py-0.5 text-[11px] font-bold text-white shadow-md whitespace-nowrap animate-bounce">
          🎂 Bugun tug'ilgan kuni! {info.nextAge} yosh
        </span>
      </div>
    );
  }

  if (info.daysLeft <= 3) {
    return (
      <div className="absolute -top-3 left-0 right-0 flex justify-center z-10">
        <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-3 py-0.5 text-[11px] font-bold text-white shadow-md whitespace-nowrap">
          🎂 {info.daysLeft} kun qoldi!
        </span>
      </div>
    );
  }

  if (info.daysLeft <= 7) {
    return (
      <div className="absolute -top-3 left-0 right-0 flex justify-center z-10">
        <span className="inline-flex items-center gap-1 rounded-full bg-orange-400 px-3 py-0.5 text-[11px] font-bold text-white shadow whitespace-nowrap">
          🎂 {info.daysLeft} kun qoldi
        </span>
      </div>
    );
  }

  if (info.daysLeft <= 30) {
    return (
      <div className="absolute -top-3 left-0 right-0 flex justify-center z-10">
        <span className="inline-flex items-center gap-1 rounded-full bg-violet-400 px-3 py-0.5 text-[11px] font-medium text-white shadow whitespace-nowrap">
          🎂 {info.daysLeft} kun qoldi
        </span>
      </div>
    );
  }

  // > 30 days — subtle badge
  return (
    <div className="absolute -top-3 left-0 right-0 flex justify-center z-10">
      <span className="inline-flex items-center gap-1 rounded-full bg-muted border px-3 py-0.5 text-[11px] text-muted-foreground whitespace-nowrap">
        🎂 {info.daysLeft} kun qoldi
      </span>
    </div>
  );
}

interface TeacherCardProps {
  teacher: Teacher;
  isSelected: boolean;
  onSelect: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function TeacherCard({ teacher, isSelected, onSelect, onView, onEdit, onDelete }: TeacherCardProps) {
  const bdayInfo = teacher.birthDate ? getBdayInfo(teacher.birthDate) : null;

  // Card border color based on birthday urgency
  const urgencyBorder =
    bdayInfo?.daysLeft === 0                        ? 'ring-2 ring-pink-400 bg-pink-50/30 dark:bg-pink-950/10' :
    bdayInfo !== null && bdayInfo.daysLeft <= 3     ? 'ring-2 ring-red-400 bg-red-50/20 dark:bg-red-950/10'   :
    bdayInfo !== null && bdayInfo.daysLeft <= 7     ? 'ring-2 ring-orange-300 bg-orange-50/20 dark:bg-orange-950/10' :
    isSelected                                       ? 'ring-2 ring-teal-500 bg-teal-50/50 dark:bg-teal-900/10' :
    '';

  return (
    <div className={`relative rounded-xl border bg-card p-4 hover:shadow-md transition-all ${urgencyBorder}`}>

      {/* Birthday badge — always shown if birthDate exists */}
      {bdayInfo && <BirthdayBadge info={bdayInfo} />}

      {/* Top padding to make room for badge */}
      <div className={bdayInfo ? 'pt-2' : ''}>

        {/* Header */}
        <div className="flex items-start justify-between mb-3">
        <button onClick={onSelect} className="flex-shrink-0">
          {isSelected ? (
            <CheckSquare className="h-5 w-5 text-teal-600" />
          ) : (
            <Square className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
        
        <div className="flex items-center gap-1">
          <button
            onClick={onView}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title="Ko'rish"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={onEdit}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title="Tahrirlash"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-md p-2 text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors"
            title="O'chirish"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

        {/* Teacher info */}
        <div className="space-y-2">
          <div>
            <h3 className="text-base font-semibold text-foreground">{teacher.fullName}</h3>
            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              <span>{teacher.phone}</span>
            </div>
          </div>

          {teacher.salary && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5" />
              <span>{teacher.salary.toLocaleString('uz-UZ')} so'm</span>
            </div>
          )}

          {/* Birth date row — only if set */}
          {teacher.birthDate && bdayInfo && (
            <div className="flex items-center gap-1 text-sm">
              <Cake className="h-3.5 w-3.5 flex-shrink-0 text-pink-400" />
              <span className="text-muted-foreground">
                {new Date(teacher.birthDate).toLocaleDateString('uz-UZ', {
                  day: 'numeric', month: 'long',
                })}
              </span>
              <span className={`ml-auto text-xs font-medium px-1.5 py-0.5 rounded-full ${
                bdayInfo.daysLeft === 0 ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' :
                bdayInfo.daysLeft <= 3  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                bdayInfo.daysLeft <= 7  ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' :
                bdayInfo.daysLeft <= 30 ? 'bg-violet-100 text-violet-600 dark:bg-violet-900/30' :
                'bg-muted text-muted-foreground'
              }`}>
                {bdayInfo.daysLeft === 0 ? '🎉 Bugun!' : `${bdayInfo.daysLeft} kun`}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[teacher.status]}`}>
              {STATUS_LABELS[teacher.status]}
            </span>
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{new Date(teacher.createdAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
