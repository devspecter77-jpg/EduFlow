import { Eye, Pencil, Trash2, CheckSquare, Square, Users, Calendar, GraduationCap } from 'lucide-react';
import type { Group } from '@/lib/api/groups';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  COMPLETED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  INACTIVE: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Faol',
  INACTIVE: 'Faolsiz',
  COMPLETED: 'Tugallangan',
  CANCELLED: 'Bekor qilingan',
};

interface GroupCardProps {
  group: Group;
  isSelected: boolean;
  onSelect: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function GroupCard({ group, isSelected, onSelect, onView, onEdit, onDelete }: GroupCardProps) {
  const studentCount = (group as any)._count?.students ?? (group as any).studentCount ?? 0;
  const teacherName = (group as any).teacher?.fullName;

  return (
    <div className={`rounded-lg border bg-card p-4 hover:shadow-md transition-all ${isSelected ? 'ring-2 ring-teal-500 bg-teal-50/50 dark:bg-teal-900/10' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <button onClick={onSelect} className="flex-shrink-0">
          {isSelected
            ? <CheckSquare className="h-5 w-5 text-teal-600" />
            : <Square className="h-5 w-5 text-muted-foreground" />}
        </button>

        <div className="flex items-center gap-1">
          <button onClick={onView} className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors" title="Ko'rish">
            <Eye className="h-4 w-4" />
          </button>
          <button onClick={onEdit} className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors" title="Tahrirlash">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={onDelete} className="rounded-md p-2 text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors" title="O'chirish">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Group info */}
      <div className="space-y-2">
        <div>
          <h3 className="text-base font-semibold text-foreground leading-tight">{group.name}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{group.subject} • {group.level}</p>
        </div>

        {teacherName && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <GraduationCap className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{teacherName}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{studentCount}/{group.maxStudents} ta o'quvchi</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[group.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {STATUS_LABELS[group.status] ?? group.status}
          </span>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{new Date(group.createdAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
