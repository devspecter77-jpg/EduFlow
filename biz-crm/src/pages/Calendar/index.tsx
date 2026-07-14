import { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, RefreshCw,
  Calendar as CalendarIcon, X, Trash2, Pencil, Clock,
} from 'lucide-react';
import { calendarApi, type CalendarEvent, type EventType } from '@/lib/api/calendar';
import { useToast } from '@/contexts/ToastContext';

// ── Types ──────────────────────────────────────────────────────────────────
type ViewMode = 'month' | 'week' | 'day';

// ── Constants ──────────────────────────────────────────────────────────────
const DAYS_UZ = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];
const MONTHS_UZ = [
  'Yanvar','Fevral','Mart','Aprel','May','Iyun',
  'Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr',
];

const EVENT_COLORS: Record<EventType, string> = {
  CLASS:       'bg-blue-500',
  PAYMENT_DUE: 'bg-red-500',
  REMINDER:    'bg-yellow-500',
  MEETING:     'bg-purple-500',
  EXAM:        'bg-orange-500',
  HOLIDAY:     'bg-green-500',
  OTHER:       'bg-gray-500',
};
const EVENT_LABELS: Record<EventType, string> = {
  CLASS: 'Dars', PAYMENT_DUE: "To'lov", REMINDER: 'Eslatma',
  MEETING: 'Uchrashuv', EXAM: 'Imtihon', HOLIDAY: 'Bayram', OTHER: 'Boshqa',
};

// ── Helpers ────────────────────────────────────────────────────────────────
function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function daysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}
// Monday-based day index (0=Mon … 6=Sun)
function dayIndex(date: Date) {
  return (date.getDay() + 6) % 7;
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}
function fmt(date: Date) {
  return date.toISOString().split('T')[0];
}

// ── Event Modal ───────────────────────────────────────────────────────────
interface EventModalProps {
  event?: CalendarEvent | null;
  defaultDate?: Date;
  onClose: () => void;
  onSave: () => void;
}

function EventModal({ event, defaultDate, onClose, onSave }: EventModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: (event?.type ?? 'OTHER') as EventType,
    title: event?.title ?? '',
    description: event?.description ?? '',
    startDate: event?.startDate
      ? new Date(event.startDate).toISOString().slice(0, 16)
      : `${fmt(defaultDate ?? new Date())}T09:00`,
    endDate: event?.endDate
      ? new Date(event.endDate).toISOString().slice(0, 16)
      : `${fmt(defaultDate ?? new Date())}T10:00`,
    allDay: event?.allDay ?? false,
    location: event?.location ?? '',
    color: event?.color ?? '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { showToast('error', 'Sarlavha kiriting'); return; }
    setLoading(true);
    try {
      const payload = {
        ...form,
        startDate: new Date(form.startDate),
        endDate: new Date(form.endDate),
      };
      if (event) {
        await calendarApi.update(event.id, payload);
        showToast('success', 'Voqea yangilandi');
      } else {
        await calendarApi.create(payload);
        showToast('success', 'Voqea qo\'shildi');
      }
      onSave();
    } catch {
      showToast('error', 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold">{event ? 'Voqeani tahrirlash' : 'Yangi voqea'}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-accent transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium">Sarlavha *</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Voqea nomi..."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Turi</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as EventType }))}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {(Object.keys(EVENT_LABELS) as EventType[]).map(t => (
                  <option key={t} value={t}>{EVENT_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Joylashuv</label>
              <input
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Xona / manzil..."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Boshlanish</label>
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Tugash</label>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium">Tavsif</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                placeholder="Qo'shimcha ma'lumot..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-accent transition-colors">
              Bekor
            </button>
            <button type="submit" disabled={loading}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50 transition-colors">
              {loading ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Event Detail Popup ─────────────────────────────────────────────────────
function EventDetailPopup({
  event, onClose, onEdit, onDelete,
}: { event: CalendarEvent; onClose: () => void; onEdit: () => void; onDelete: () => void; }) {
  return (
    <div className="z-40 w-full max-w-[calc(100vw-2rem)] sm:max-w-xs rounded-xl border bg-card shadow-xl p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className={`inline-block h-3 w-3 rounded-full ${EVENT_COLORS[event.type]}`} />
          <span className="font-medium text-sm">{event.title}</span>
        </div>
        <button onClick={onClose} className="rounded p-0.5 hover:bg-accent transition-colors shrink-0">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
        <div className="flex items-center gap-1.5">
          <CalendarIcon className="h-3.5 w-3.5" />
          {new Date(event.startDate).toLocaleDateString('uz-UZ')}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {new Date(event.startDate).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
          {' – '}
          {new Date(event.endDate).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
        </div>
        {event.location && <p>📍 {event.location}</p>}
        {event.description && <p className="mt-1">{event.description}</p>}
      </div>
      <div className="flex gap-2">
        <button onClick={onEdit}
          className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs hover:bg-accent transition-colors">
          <Pencil className="h-3.5 w-3.5" /> Tahrirlash
        </button>
        <button onClick={onDelete}
          className="flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <Trash2 className="h-3.5 w-3.5" /> O'chirish
        </button>
      </div>
    </div>
  );
}

// ── Main Calendar Component ───────────────────────────────────────────────
export function Calendar() {
  const { showToast } = useToast();
  const [view, setView] = useState<ViewMode>('month');
  const [current, setCurrent] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModal, setCreateModal] = useState<{ open: boolean; date?: Date }>({ open: false });
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);
  const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null);

  // Compute visible date range
  const rangeStart = view === 'month'
    ? new Date(current.getFullYear(), current.getMonth(), 1)
    : view === 'week'
      ? (() => { const d = new Date(current); d.setDate(d.getDate() - dayIndex(d)); return d; })()
      : new Date(current.getFullYear(), current.getMonth(), current.getDate());

  const rangeEnd = view === 'month'
    ? new Date(current.getFullYear(), current.getMonth() + 1, 0)
    : view === 'week'
      ? (() => { const d = new Date(rangeStart); d.setDate(d.getDate() + 6); return d; })()
      : new Date(current.getFullYear(), current.getMonth(), current.getDate(), 23, 59, 59);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await calendarApi.getAll({ startDate: rangeStart, endDate: rangeEnd });
      setEvents(data);
    } catch {
      showToast('error', 'Voqealarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  }, [rangeStart.toDateString(), rangeEnd.toDateString()]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    try {
      await calendarApi.delete(id);
      showToast('success', 'Voqea o\'chirildi');
      setDetailEvent(null);
      load();
    } catch {
      showToast('error', 'Xatolik yuz berdi');
    }
  };

  const navigate = (dir: -1 | 1) => {
    setCurrent(prev => {
      const d = new Date(prev);
      if (view === 'month') d.setMonth(d.getMonth() + dir);
      else if (view === 'week') d.setDate(d.getDate() + dir * 7);
      else d.setDate(d.getDate() + dir);
      return d;
    });
  };

  const today = new Date();

  const title = view === 'month'
    ? `${MONTHS_UZ[current.getMonth()]} ${current.getFullYear()}`
    : view === 'week'
      ? `${fmt(rangeStart)} – ${fmt(rangeEnd)}`
      : `${current.getDate()} ${MONTHS_UZ[current.getMonth()]} ${current.getFullYear()}`;

  const eventsOnDay = (date: Date) =>
    events.filter(e => isSameDay(new Date(e.startDate), date));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Kalendar</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Darslar, to'lovlar va eslatmalar</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* View toggle */}
          <div className="inline-flex rounded-lg border bg-background">
            {(['month', 'week', 'day'] as ViewMode[]).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors first:rounded-l-lg last:rounded-r-lg ${view === v ? 'bg-teal-600 text-white' : 'hover:bg-accent'}`}>
                {v === 'month' ? 'Oy' : v === 'week' ? 'Hafta' : 'Kun'}
              </button>
            ))}
          </div>
          <button onClick={() => setCurrent(new Date())}
            className="rounded-lg border bg-background px-3 py-1.5 text-sm hover:bg-accent transition-colors">
            Bugun
          </button>
          <button onClick={load} className="rounded-lg border bg-background p-2 hover:bg-accent transition-colors">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setCreateModal({ open: true })}
            className="flex items-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors">
            <Plus className="h-4 w-4" /> Voqea
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="rounded-lg border p-2 hover:bg-accent transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h2 className="flex-1 text-center font-semibold text-lg">{title}</h2>
        <button onClick={() => navigate(1)} className="rounded-lg border p-2 hover:bg-accent transition-colors">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b bg-muted/50">
          {DAYS_UZ.map(d => (
            <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
          ))}
        </div>

        {/* Month View */}
        {view === 'month' && (() => {
          const firstDay = startOfMonth(current);
          const totalDays = daysInMonth(current);
          const startOffset = dayIndex(firstDay); // blank cells before day 1
          const cells: (Date | null)[] = [
            ...Array(startOffset).fill(null),
            ...Array.from({ length: totalDays }, (_, i) => new Date(current.getFullYear(), current.getMonth(), i + 1)),
          ];
          // pad to full weeks
          while (cells.length % 7 !== 0) cells.push(null);

          return (
            <div className="grid grid-cols-7">
              {cells.map((date, i) => {
                const dayEvents = date ? eventsOnDay(date) : [];
                const isToday = date ? isSameDay(date, today) : false;
                const isCurrentMonth = date !== null;
                return (
                  <div key={i}
                    onClick={() => date && setCreateModal({ open: true, date })}
                    className={`min-h-[60px] sm:min-h-[90px] border-b border-r p-1 sm:p-1.5 cursor-pointer hover:bg-accent/30 transition-colors relative ${!isCurrentMonth ? 'bg-muted/20' : ''}`}>
                    {date && (
                      <>
                        <span className={`inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1 ${isToday ? 'bg-teal-600 text-white' : 'text-foreground'}`}>
                          {date.getDate()}
                        </span>
                        <div className="space-y-0.5">
                          {dayEvents.slice(0, 3).map(ev => (
                            <div key={ev.id}
                              onClick={e => { e.stopPropagation(); setDetailEvent(ev); }}
                              className={`truncate rounded px-1 py-0.5 text-[9px] sm:text-xs text-white cursor-pointer hover:opacity-80 ${EVENT_COLORS[ev.type]}`}>
                              {ev.title}
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-[9px] sm:text-xs text-muted-foreground">+{dayEvents.length - 3} ta</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* Week View */}
        {view === 'week' && (() => {
          const weekDays = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(rangeStart);
            d.setDate(d.getDate() + i);
            return d;
          });
          return (
            <div className="grid grid-cols-7">
              {weekDays.map((date, i) => {
                const dayEvents = eventsOnDay(date);
                const isToday = isSameDay(date, today);
                return (
                  <div key={i}
                    onClick={() => setCreateModal({ open: true, date })}
                    className="min-h-[120px] sm:min-h-[200px] border-r p-1 sm:p-2 cursor-pointer hover:bg-accent/30 transition-colors">
                    <div className={`mb-1 sm:mb-2 inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-xs sm:text-sm font-medium ${isToday ? 'bg-teal-600 text-white' : ''}`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.map(ev => (
                        <div key={ev.id}
                          onClick={e => { e.stopPropagation(); setDetailEvent(ev); }}
                          className={`rounded px-1 sm:px-1.5 py-0.5 sm:py-1 text-[10px] sm:text-xs text-white cursor-pointer hover:opacity-80 ${EVENT_COLORS[ev.type]}`}>
                          <div className="font-medium truncate">{ev.title}</div>
                          <div className="opacity-80 hidden sm:block">
                            {new Date(ev.startDate).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* Day View */}
        {view === 'day' && (() => {
          const dayEvents = eventsOnDay(current);
          return (
            <div className="p-4 min-h-[400px]">
              <div className="flex items-center gap-2 mb-4">
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${isSameDay(current, today) ? 'bg-teal-600 text-white' : 'bg-muted'}`}>
                  {current.getDate()}
                </span>
                <span className="font-medium">{MONTHS_UZ[current.getMonth()]} {current.getFullYear()}</span>
              </div>
              {dayEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mb-3 opacity-30" />
                  <p>Bu kunda voqealar yo'q</p>
                  <button onClick={() => setCreateModal({ open: true, date: current })}
                    className="mt-3 flex items-center gap-1 text-sm text-teal-600 hover:underline">
                    <Plus className="h-4 w-4" /> Voqea qo'shish
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {dayEvents.map(ev => (
                    <div key={ev.id}
                      onClick={() => setDetailEvent(ev)}
                      className={`flex items-start gap-3 rounded-xl p-3 cursor-pointer hover:opacity-90 transition-opacity ${EVENT_COLORS[ev.type]} text-white`}>
                      <div className="flex-1">
                        <p className="font-medium">{ev.title}</p>
                        {ev.description && <p className="text-sm opacity-80 mt-0.5">{ev.description}</p>}
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(ev.startDate).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                          {' – '}
                          {new Date(ev.endDate).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                          {ev.location && ` · ${ev.location}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Event Detail Popup */}
      {detailEvent && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setDetailEvent(null)}>
          <div className="relative" onClick={e => e.stopPropagation()}>
            <EventDetailPopup
              event={detailEvent}
              onClose={() => setDetailEvent(null)}
              onEdit={() => { setEditEvent(detailEvent); setDetailEvent(null); }}
              onDelete={() => handleDelete(detailEvent.id)}
            />
          </div>
        </div>
      )}

      {/* Create Modal */}
      {createModal.open && (
        <EventModal
          defaultDate={createModal.date}
          onClose={() => setCreateModal({ open: false })}
          onSave={() => { setCreateModal({ open: false }); load(); }}
        />
      )}

      {/* Edit Modal */}
      {editEvent && (
        <EventModal
          event={editEvent}
          onClose={() => setEditEvent(null)}
          onSave={() => { setEditEvent(null); load(); }}
        />
      )}
    </div>
  );
}
