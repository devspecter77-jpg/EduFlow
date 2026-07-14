import { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle2, XCircle, Clock, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { attendancesApi, type Attendance, type AttendanceStatus } from '@/lib/api/attendances';

interface Props {
  studentId: string;
  studentName: string;
  onClose: () => void;
}

const STATUS_MAP: Record<AttendanceStatus, { label: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
  PRESENT: { label: 'Keldi',    icon: CheckCircle2, color: 'text-green-700 dark:text-green-400',  bg: 'bg-green-100 dark:bg-green-900/30' },
  ABSENT:  { label: 'Kelmadi',  icon: XCircle,      color: 'text-red-600 dark:text-red-400',      bg: 'bg-red-100 dark:bg-red-900/30'   },
  LATE:    { label: 'Kechikdi', icon: Clock,        color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  EXCUSED: { label: 'Sababli',  icon: AlertCircle,  color: 'text-blue-700 dark:text-blue-400',    bg: 'bg-blue-100 dark:bg-blue-900/30'  },
};

export function StudentAttendanceHistory({ studentId, studentName, onClose }: Props) {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 15;

  // Stats
  const stats = {
    present: records.filter(r => r.status === 'PRESENT').length,
    absent:  records.filter(r => r.status === 'ABSENT').length,
    late:    records.filter(r => r.status === 'LATE').length,
    excused: records.filter(r => r.status === 'EXCUSED').length,
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await attendancesApi.getAll({ studentId, page, limit: LIMIT });
      setRecords(res.data);
      setTotal(res.pagination?.total || 0);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [studentId, page]);

  useEffect(() => { load(); }, [load]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('uz-UZ', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-card border shadow-2xl flex flex-col" style={{ maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <History className="h-5 w-5 text-teal-600" />
            <div>
              <h2 className="font-semibold text-base">{studentName}</h2>
              <p className="text-xs text-muted-foreground">Davomat tarixi — jami {total} ta yozuv</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-accent transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 px-6 py-3 border-b flex-shrink-0">
          {([
            { key: 'present', label: 'Keldi',    color: 'text-green-700 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-900/20'  },
            { key: 'absent',  label: 'Kelmadi',  color: 'text-red-600 dark:text-red-400',      bg: 'bg-red-50 dark:bg-red-900/20'    },
            { key: 'late',    label: 'Kechikdi', color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20'},
            { key: 'excused', label: 'Sababli',  color: 'text-blue-700 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-900/20'  },
          ] as const).map(({ key, label, color, bg }) => (
            <div key={key} className={`rounded-lg p-2 text-center ${bg}`}>
              <p className={`text-lg font-bold ${color}`}>{stats[key]}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Records */}
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Yuklanmoqda...</span>
            </div>
          ) : records.length === 0 ? (
            <div className="py-16 text-center">
              <History className="h-10 w-10 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Davomat tarixi topilmadi</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3">
              {records.map(r => {
                const s = STATUS_MAP[r.status];
                const Icon = s.icon;
                const dateObj = new Date(r.date);
                const dayName = dateObj.toLocaleDateString('uz-UZ', { weekday: 'short' });
                const dayNum  = dateObj.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' });
                const year    = dateObj.getFullYear();
                return (
                  <div key={r.id} className={`rounded-xl border p-3 flex flex-col gap-2 ${s.bg}`}>
                    {/* Sana */}
                    <div>
                      <p className="text-[11px] text-muted-foreground capitalize">{dayName}</p>
                      <p className="text-sm font-bold text-foreground leading-tight">{dayNum}</p>
                      <p className="text-[10px] text-muted-foreground">{year}</p>
                    </div>

                    {/* Status badge */}
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold w-fit ${s.bg} ${s.color} border border-current/20`}>
                      <Icon className="h-3 w-3" />
                      {s.label}
                    </span>

                    {/* Guruh va izoh */}
                    {r.group?.name && (
                      <p className="text-[10px] text-muted-foreground truncate">{r.group.name}</p>
                    )}
                    {r.notes && (
                      <p className="text-[10px] text-muted-foreground italic truncate">"{r.notes}"</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-6 py-3 flex-shrink-0">
            <p className="text-xs text-muted-foreground">
              {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} / {total}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => p - 1)} disabled={page <= 1}
                className="rounded-md border p-1.5 hover:bg-accent disabled:opacity-40 transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2 text-sm font-medium">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}
                className="rounded-md border p-1.5 hover:bg-accent disabled:opacity-40 transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
