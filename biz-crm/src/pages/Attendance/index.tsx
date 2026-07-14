import { useState, useEffect, useCallback } from 'react';
import {
  Search, RefreshCw, Calendar,
  CheckCircle2, XCircle, Clock, AlertCircle,
  Users, History,
} from 'lucide-react';
import { attendancesApi, type AttendanceStatus } from '@/lib/api/attendances';
import { groupsApi, type Group } from '@/lib/api/groups';
import { studentsApi } from '@/lib/api/students';
import { useToast } from '@/contexts/ToastContext';
import { StudentAttendanceHistory } from './StudentAttendanceHistory';

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; icon: typeof CheckCircle2; color: string; bg: string }[] = [
  { value: 'PRESENT', label: 'Keldi',    icon: CheckCircle2, color: 'text-green-700 dark:text-green-400',  bg: 'bg-green-100 dark:bg-green-900/30' },
  { value: 'ABSENT',  label: 'Kelmadi',  icon: XCircle,      color: 'text-red-600 dark:text-red-400',      bg: 'bg-red-100 dark:bg-red-900/30' },
  { value: 'LATE',    label: 'Kechikdi', icon: Clock,        color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  { value: 'EXCUSED', label: 'Sababli',  icon: AlertCircle,  color: 'text-blue-700 dark:text-blue-400',    bg: 'bg-blue-100 dark:bg-blue-900/30' },
];

interface StudentRow {
  studentId: string;
  fullName: string;
  phone: string;
  attendanceId: string | null;
  status: AttendanceStatus | null;
  notes: string;
  saving: boolean;
}

export function Attendance() {
  const { showToast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // Tarix modal
  const [historyStudent, setHistoryStudent] = useState<{ id: string; fullName: string } | null>(null);

  // Stats
  const stats = {
    present: students.filter(s => s.status === 'PRESENT').length,
    absent:  students.filter(s => s.status === 'ABSENT').length,
    late:    students.filter(s => s.status === 'LATE').length,
    excused: students.filter(s => s.status === 'EXCUSED').length,
    unmarked: students.filter(s => s.status === null).length,
  };

  const loadGroups = useCallback(async () => {
    try {
      const res = await groupsApi.getAll({ limit: 100, status: 'ACTIVE' });
      setGroups(res.data);
      if (res.data.length > 0 && !selectedGroupId) {
        setSelectedGroupId(res.data[0].id);
      }
    } catch { /* ignore */ }
  }, [selectedGroupId]);

  useEffect(() => { loadGroups(); }, []);

  // Barcha aktiv o'quvchilar va ularning davomati
  const loadStudentsWithAttendance = useCallback(async () => {
    if (!selectedGroupId) return;
    setLoadingStudents(true);
    try {
      // Barcha aktiv o'quvchilarni olish
      const studentsRes = await studentsApi.getAll({ 
        limit: 500, 
        status: 'ACTIVE' 
      });
      const allStudents = studentsRes.data;

      // O'sha kunning davomat ma'lumotlarini olish
      const dateISO = new Date(selectedDate).toISOString();
      const attendanceRes = await attendancesApi.getAll({
        groupId: selectedGroupId,
        startDate: dateISO,
        endDate: dateISO,
        limit: 200,
      });
      const attendanceMap: Record<string, any> = {};
      attendanceRes.data.forEach((a: any) => {
        attendanceMap[a.studentId] = a;
      });

      setStudents(allStudents.map((student) => {
        const att = attendanceMap[student.id];
        return {
          studentId: student.id,
          fullName: student.fullName,
          phone: student.phone,
          attendanceId: att?.id || null,
          status: att?.status || null,
          notes: att?.notes || '',
          saving: false,
        };
      }));
    } catch {
      showToast('error', 'Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoadingStudents(false);
    }
  }, [selectedGroupId, selectedDate, showToast]);

  useEffect(() => {
    if (selectedGroupId) loadStudentsWithAttendance();
  }, [selectedGroupId, selectedDate]);

  // Bitta o'quvchi holatini belgilash/yangilash
  const markAttendance = async (studentId: string, status: AttendanceStatus) => {
    const student = students.find(s => s.studentId === studentId);
    if (!student) return;

    setStudents(prev => prev.map(s => s.studentId === studentId ? { ...s, saving: true } : s));

    try {
      const dateISO = new Date(selectedDate).toISOString();

      if (student.attendanceId) {
        // Mavjud yozuvni yangilash
        await attendancesApi.update(student.attendanceId, { status, notes: student.notes || null });
      } else {
        // Yangi yozuv yaratish
        const res = await attendancesApi.create({
          studentId,
          groupId: selectedGroupId,
          date: dateISO,
          status,
          notes: student.notes || null,
        });
        setStudents(prev => prev.map(s =>
          s.studentId === studentId ? { ...s, attendanceId: res.data.id } : s
        ));
      }

      setStudents(prev => prev.map(s =>
        s.studentId === studentId ? { ...s, status, saving: false } : s
      ));
    } catch {
      showToast('error', 'Saqlashda xatolik yuz berdi');
      setStudents(prev => prev.map(s => s.studentId === studentId ? { ...s, saving: false } : s));
    }
  };

  // Barchasini belgilash
  const markAll = async (status: AttendanceStatus) => {
    const dateISO = new Date(selectedDate).toISOString();
    setStudents(prev => prev.map(s => ({ ...s, saving: true })));

    try {
      await attendancesApi.bulkCreate({
        groupId: selectedGroupId,
        date: dateISO,
        attendances: students.map(s => ({ studentId: s.studentId, status, notes: s.notes || null })),
      });
      await loadStudentsWithAttendance();
      showToast('success', `Barcha ${students.length} ta o'quvchi: ${STATUS_OPTIONS.find(o => o.value === status)?.label}`);
    } catch {
      showToast('error', 'Saqlashda xatolik yuz berdi');
      setStudents(prev => prev.map(s => ({ ...s, saving: false })));
    }
  };

  const filteredStudents = students.filter(s =>
    s.fullName.toLowerCase().includes(searchInput.toLowerCase()) ||
    s.phone.includes(searchInput)
  );

  const formatDate = (d: string) => new Date(d).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Davomat</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            O'quvchilarning kunlik davomati
          </p>
        </div>
      </div>

      {/* Guruh tanlash va sana */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1 max-w-xs">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Guruh</label>
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
          <label className="block text-xs font-medium text-muted-foreground mb-1">Sana</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="flex items-end">
          <button onClick={loadStudentsWithAttendance} className="rounded-lg border bg-background p-2 hover:bg-accent transition-colors" title="Yangilash">
            <RefreshCw className={`h-4 w-4 ${loadingStudents ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats */}
      {students.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {([
            { key: 'present', label: 'Keldi',     color: 'text-green-700 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-900/20'  },
            { key: 'absent',  label: 'Kelmadi',   color: 'text-red-600 dark:text-red-400',      bg: 'bg-red-50 dark:bg-red-900/20'    },
            { key: 'late',    label: 'Kechikdi',  color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20'},
            { key: 'excused', label: 'Sababli',   color: 'text-blue-700 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-900/20'  },
            { key: 'unmarked',label: 'Belgilanmagan', color: 'text-muted-foreground', bg: 'bg-muted/50' },
          ] as const).map(({ key, label, color, bg }) => (
            <div key={key} className={`rounded-xl border p-3 ${bg}`}>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{stats[key]}</p>
            </div>
          ))}
        </div>
      )}

      {/* O'quvchilar davomati */}
      {selectedGroupId && (
        <div className="rounded-xl border bg-card overflow-hidden">
          {/* Jadval header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b px-4 py-3 bg-muted/30">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {selectedDate === new Date().toISOString().split('T')[0]
                  ? 'Bugungi davomat'
                  : `${formatDate(selectedDate)} davomati`}
              </span>
              <span className="text-xs text-muted-foreground">({filteredStudents.length} ta o'quvchi)</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Qidirish..."
                  className="rounded-lg border bg-background pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 w-36"
                />
              </div>
              {/* Barchasini belgilash */}
              <span className="text-xs text-muted-foreground hidden sm:block">Barchasini:</span>
              {STATUS_OPTIONS.map(({ value, label, icon: Icon, color }) => (
                <button
                  key={value}
                  onClick={() => markAll(value)}
                  disabled={loadingStudents || students.length === 0}
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium hover:bg-accent transition-colors disabled:opacity-40 ${color}`}
                  title={`Barchasini "${label}" deb belgilash`}
                >
                  <Icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* O'quvchilar ro'yxati */}
          {loadingStudents ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Yuklanmoqda...</span>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="h-10 w-10 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-muted-foreground text-sm">O'quvchilar topilmadi</p>
            </div>
          ) : (
            <>
              {/* Desktop: List */}
              <div className="hidden sm:block divide-y">
                {filteredStudents.map((s, idx) => {
                  const currentOpt = STATUS_OPTIONS.find(o => o.value === s.status);
                  return (
                    <div key={s.studentId} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                      <span className="text-xs text-muted-foreground w-6 text-right flex-shrink-0">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{s.fullName}</p>
                        <p className="text-xs text-muted-foreground">{s.phone}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {s.saving ? (
                          <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                          STATUS_OPTIONS.map(({ value, label, icon: Icon, color, bg }) => (
                            <button
                              key={value}
                              onClick={() => markAttendance(s.studentId, value)}
                              title={label}
                              className={`rounded-lg p-1.5 transition-all border ${
                                s.status === value
                                  ? `${bg} ${color} border-current`
                                  : 'border-transparent hover:bg-muted text-muted-foreground'
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </button>
                          ))
                        )}
                      </div>
                      {currentOpt ? (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${currentOpt.bg} ${currentOpt.color} w-24 justify-center flex-shrink-0`}>
                          <currentOpt.icon className="h-3 w-3" />
                          {currentOpt.label}
                        </span>
                      ) : (
                        <span className="w-24 text-center text-xs text-muted-foreground flex-shrink-0">—</span>
                      )}
                      <button
                        onClick={() => setHistoryStudent({ id: s.studentId, fullName: s.fullName })}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors flex-shrink-0"
                        title="Tarix"
                      >
                        <History className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Mobile: Card Grid */}
              <div className="grid gap-3 p-3 grid-cols-1 xs:grid-cols-2 sm:hidden">
                {filteredStudents.map((s, idx) => {
                  const currentOpt = STATUS_OPTIONS.find(o => o.value === s.status);
                  return (
                    <div
                      key={s.studentId}
                      className={`rounded-xl border p-3 transition-all ${
                        currentOpt
                          ? `${currentOpt.bg} border-current/20`
                          : 'bg-card border-border'
                      }`}
                    >
                      {/* Card header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[10px] text-muted-foreground">#{idx + 1}</span>
                            {currentOpt && (
                              <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${currentOpt.bg} ${currentOpt.color}`}>
                                <currentOpt.icon className="h-2.5 w-2.5" />
                                {currentOpt.label}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-semibold truncate">{s.fullName}</p>
                          <p className="text-xs text-muted-foreground">{s.phone}</p>
                        </div>
                        <button
                          onClick={() => setHistoryStudent({ id: s.studentId, fullName: s.fullName })}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/50 hover:text-foreground transition-colors flex-shrink-0 ml-1"
                          title="Tarix"
                        >
                          <History className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Status tugmalari */}
                      <div className="flex items-center justify-between gap-1">
                        {s.saving ? (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span>Saqlanmoqda...</span>
                          </div>
                        ) : (
                          STATUS_OPTIONS.map(({ value, label, icon: Icon, color, bg }) => (
                            <button
                              key={value}
                              onClick={() => markAttendance(s.studentId, value)}
                              title={label}
                              className={`flex-1 flex flex-col items-center gap-0.5 rounded-lg py-1.5 px-1 transition-all border text-[10px] font-medium ${
                                s.status === value
                                  ? `${bg} ${color} border-current/40 shadow-sm`
                                  : 'border-transparent hover:bg-white/50 text-muted-foreground'
                              }`}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              <span>{label}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Guruh tanlanmagan holat */}
      {!selectedGroupId && (
        <div className="rounded-xl border bg-card py-20 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">Guruh tanlang</p>
          <p className="text-xs text-muted-foreground mt-1">Davomat belgilash uchun guruh tanlang</p>
        </div>
      )}

      {/* O'quvchi tarix modali */}
      {historyStudent && (
        <StudentAttendanceHistory
          studentId={historyStudent.id}
          studentName={historyStudent.fullName}
          onClose={() => setHistoryStudent(null)}
        />
      )}
    </div>
  );
}
