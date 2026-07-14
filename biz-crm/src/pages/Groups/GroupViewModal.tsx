import { X, Pencil, Users, Calendar, DollarSign, User, MapPin, FileText } from 'lucide-react';
import type { Group } from '@/lib/api/groups';

interface GroupViewModalProps {
  group: Group;
  onClose: () => void;
  onEdit: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Faol',
  INACTIVE: 'Faolsiz',
  COMPLETED: 'Tugallangan',
  CANCELLED: 'Bekor qilingan',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  INACTIVE: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  COMPLETED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  CANCELLED: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

export function GroupViewModal({ group, onClose, onEdit }: GroupViewModalProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="w-full max-w-3xl rounded-2xl bg-card border shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-2xl font-bold">
              {group.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{group.name}</h2>
              <p className="text-sm text-muted-foreground">{group.subject} • {group.level}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="rounded-lg p-2 hover:bg-accent transition-colors"
              title="Tahrirlash"
            >
              <Pencil className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 hover:bg-accent transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto hide-scrollbar">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Holati</span>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[group.status]}`}>
              {STATUS_LABELS[group.status]}
            </span>
          </div>

          {/* O'qituvchi */}
          {group.teacher ? (
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">O'qituvchi</p>
                <p className="font-medium">{group.teacher.fullName}</p>
                <p className="text-sm text-muted-foreground">{group.teacher.phone}</p>
                {group.teacher.experience !== undefined && (
                  <p className="text-xs text-muted-foreground mt-1">Tajriba: {group.teacher.experience} yil</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">O'qituvchi</p>
                <p className="text-sm text-muted-foreground italic">Biriktirilmagan</p>
              </div>
            </div>
          )}

          {/* Talabalar */}
          <div className="flex items-start gap-3 rounded-lg border p-4">
            <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Talabalar</p>
              <p className="font-medium text-2xl">
                {group._count.students} / {group.maxStudents}
              </p>
              <div className="mt-2 w-full bg-muted rounded-full h-2">
                <div
                  className="bg-teal-600 h-2 rounded-full transition-all"
                  style={{ width: `${(group._count.students / group.maxStudents) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {group.maxStudents - group._count.students} ta joy qolgan
              </p>
            </div>
          </div>

          {/* Grid - 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Boshlanish sanasi */}
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Boshlanish</p>
                <p className="font-medium">{formatDate(group.startDate)}</p>
              </div>
            </div>

            {/* Tugash sanasi */}
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Tugash</p>
                <p className="font-medium">
                  {group.endDate ? formatDate(group.endDate) : 'Belgilanmagan'}
                </p>
              </div>
            </div>

            {/* Kurs narxi */}
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Kurs narxi</p>
                <p className="font-medium">{formatCurrency(group.courseFee)} so'm</p>
              </div>
            </div>

            {/* Xona */}
            {group.room && (
              <div className="flex items-start gap-3 rounded-lg border p-4">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Xona/Sinf</p>
                  <p className="font-medium">{group.room}</p>
                </div>
              </div>
            )}
          </div>

          {/* Jadval */}
          <div className="flex items-start gap-3 rounded-lg border p-4">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">Dars jadvali</p>
              <div className="space-y-2">
                {(() => {
                  try {
                    const scheduleData = JSON.parse(group.schedule);
                    const dayLabels: Record<string, string> = {
                      monday: 'Dushanba',
                      tuesday: 'Seshanba',
                      wednesday: 'Chorshanba',
                      thursday: 'Payshanba',
                      friday: 'Juma',
                      saturday: 'Shanba',
                      sunday: 'Yakshanba',
                    };
                    
                    return (Object.entries(scheduleData) as Array<[string, { enabled: boolean; startTime: string; endTime: string }]>)
                      .filter(([, day]) => day.enabled)
                      .map(([dayId, day]) => (
                        <div key={dayId} className="flex items-center justify-between bg-muted/30 rounded px-3 py-2">
                          <span className="font-medium">{dayLabels[dayId]}</span>
                          <span className="text-sm text-muted-foreground">
                            {day.startTime} — {day.endTime}
                          </span>
                        </div>
                      ));
                  } catch {
                    return <p className="text-sm">{group.schedule}</p>;
                  }
                })()}
              </div>
            </div>
          </div>

          {/* Izoh */}
          {group.description && (
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">Izoh</p>
                <p className="text-sm whitespace-pre-line">{group.description}</p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="border-t pt-4 text-xs text-muted-foreground space-y-1">
            <p>Yaratilgan: {formatDate(group.createdAt)}</p>
            <p>Yangilangan: {formatDate(group.updatedAt)}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t p-6">
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}
