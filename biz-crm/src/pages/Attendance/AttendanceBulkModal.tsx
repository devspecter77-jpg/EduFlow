import { useState, useEffect, useCallback } from 'react';
import { X, Save, CheckCircle2, XCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { attendancesApi, type AttendanceStatus } from '@/lib/api/attendances';
import { groupsApi, type Group } from '@/lib/api/groups';

interface StudentRow {
  studentId: string;
  fullName: string;
  phone: string;
  status: AttendanceStatus;
  notes: string;
}

interface GroupStudentItem {
  student?: { id: string; fullName: string; phone: string };
  studentId?: string;
}

interface AttendanceBulkModalProps {
  groups: Group[];
  onClose: () => void;
  onSuccess: () => void;
}

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; icon: typeof CheckCircle2; color: string }[] = [
  { value: 'PRESENT', label: 'Keldi', icon: CheckCircle2, color: 'text-green-600' },
  { value: 'ABSENT', label: 'Kelmadi', icon: XCircle, color: 'text-red-600' },
  { value: 'LATE', label: 'Kechikdi', icon: Clock, color: 'text-yellow-600' },
  { value: 'EXCUSED', label: 'Sababli', icon: AlertCircle, color: 'text-blue-600' },
];

export function AttendanceBulkModal({ groups, onClose, onSuccess }: AttendanceBulkModalProps) {
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadStudents = useCallback(async () => {
    if (!selectedGroupId) return;
    setLoadingStudents(true);
    try {
      const res = await groupsApi.getStudents(selectedGroupId);
      const data = res.data as unknown as GroupStudentItem[];
      setStudents(
        data.map((item) => ({
          studentId: item.student?.id || item.studentId || '',
          fullName: item.student?.fullName || '',
          phone: item.student?.phone || '',
          status: 'PRESENT' as AttendanceStatus,
          notes: '',
        }))
      );
    } catch {
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }, [selectedGroupId]);

  useEffect(() => {
    if (!selectedGroupId) {
      setStudents([]);
      return;
    }
    loadStudents();
  }, [selectedGroupId, loadStudents]);

  const updateStudent = (studentId: string, field: keyof Pick<StudentRow, 'status' | 'notes'>, value: string) => {
    setStudents(prev =>
      prev.map(s => s.studentId === studentId ? { ...s, [field]: value } : s)
    );
  };

  const setAllStatus = (status: AttendanceStatus) => {
    setStudents(prev => prev.map(s => ({ ...s, status })));
  };

  const handleSave = async () => {
    if (!selectedGroupId || !date || students.length === 0) return;
    setSaving(true);
    try {
      await attendancesApi.bulkCreate({
        groupId: selectedGroupId,
        date: new Date(date).toISOString(),
        attendances: students.map(s => ({
          studentId: s.studentId,
          status: s.status,
          notes: s.notes || null,
        })),
      });
      onSuccess();
    } catch (error: unknown) {
      const errMsg = (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message;
      alert(errMsg || 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="w-full max-w-3xl rounded-2xl bg-card border shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-xl font-semibold">Davomat belgilash</h2>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-accent transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Guruh va sana */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Guruh <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedGroupId}
                onChange={e => setSelectedGroupId(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Guruh tanlang</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name} — {g.subject}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Sana <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Students list */}
          {selectedGroupId && (
            <div>
              {loadingStudents ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Talabalar yuklanmoqda...</span>
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Bu guruhda faol talabalar topilmadi
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Bulk set buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">Barchasini:</span>
                    {STATUS_OPTIONS.map(({ value, label, icon: Icon, color }) => (
                      <button
                        key={value}
                        onClick={() => setAllStatus(value)}
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium hover:bg-accent transition-colors ${color}`}
                      >
                        <Icon className="h-3 w-3" />
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Students table */}
                  <div className="rounded-lg border overflow-hidden max-h-80 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-muted-foreground">#</th>
                          <th className="px-4 py-2 text-left font-medium text-muted-foreground">Talaba</th>
                          <th className="px-4 py-2 text-left font-medium text-muted-foreground">Holati</th>
                          <th className="px-4 py-2 text-left font-medium text-muted-foreground">Izoh</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((s, idx) => {
                          const statusOpt = STATUS_OPTIONS.find(o => o.value === s.status)!;
                          return (
                            <tr key={s.studentId} className="border-t hover:bg-muted/20">
                              <td className="px-4 py-2 text-muted-foreground">{idx + 1}</td>
                              <td className="px-4 py-2 font-medium">{s.fullName}</td>
                              <td className="px-4 py-2">
                                <select
                                  value={s.status}
                                  onChange={e => updateStudent(s.studentId, 'status', e.target.value)}
                                  className={`rounded border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 ${statusOpt.color}`}
                                >
                                  {STATUS_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="text"
                                  value={s.notes}
                                  onChange={e => updateStudent(s.studentId, 'notes', e.target.value)}
                                  placeholder="Ixtiyoriy..."
                                  className="w-full rounded border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Jami {students.length} ta talaba
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t p-6">
          <button onClick={onClose} disabled={saving} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
            Bekor qilish
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !selectedGroupId || students.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </div>
    </div>
  );
}
