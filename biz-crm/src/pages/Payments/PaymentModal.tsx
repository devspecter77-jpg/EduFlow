import { useState, useEffect, useCallback } from 'react';
import { X, Save } from 'lucide-react';
import { paymentsApi, type Payment, type CreatePaymentInput, type PaymentMethod, type PaymentStatus } from '@/lib/api/payments';
import { groupsApi, type Group } from '@/lib/api/groups';

interface Student { id: string; fullName: string; phone: string; }

interface GroupStudentItem {
  student?: { id: string; fullName: string; phone: string };
  studentId?: string;
}

interface PaymentModalProps {
  payment?: Payment;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentModal({ payment, onClose, onSuccess }: PaymentModalProps) {
  const isEdit = !!payment;
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [formData, setFormData] = useState({
    studentId: '',
    groupId: '',
    amount: 0,
    paidAmount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    paidDate: '',
    status: 'PENDING' as PaymentStatus,
    method: 'CASH' as PaymentMethod,
    notes: '',
  });

  const [displayAmount, setDisplayAmount] = useState('');
  const [displayPaidAmount, setDisplayPaidAmount] = useState('');

  // Payment prop o'zgarganda formData ni yangilash
  useEffect(() => {
    if (payment) {
      setFormData({
        studentId: payment.studentId,
        groupId: payment.groupId,
        amount: payment.amount,
        paidAmount: payment.paidAmount,
        dueDate: new Date(payment.dueDate).toISOString().split('T')[0],
        paidDate: payment.paidDate ? new Date(payment.paidDate).toISOString().split('T')[0] : '',
        status: payment.status,
        method: payment.method,
        notes: payment.notes || '',
      });
      setDisplayAmount(payment.amount > 0 ? payment.amount.toLocaleString('uz-UZ') : '');
      setDisplayPaidAmount(payment.paidAmount > 0 ? payment.paidAmount.toLocaleString('uz-UZ') : '');
    } else {
      setFormData({
        studentId: '',
        groupId: '',
        amount: 0,
        paidAmount: 0,
        dueDate: new Date().toISOString().split('T')[0],
        paidDate: '',
        status: 'PENDING',
        method: 'CASH',
        notes: '',
      });
      setDisplayAmount('');
      setDisplayPaidAmount('');
    }
  }, [payment]);

  const loadStudents = useCallback(async (groupId: string) => {
    try {
      const res = await groupsApi.getStudents(groupId);
      const items = res.data as unknown as GroupStudentItem[];
      setStudents(items.map((i) => ({
        id: i.student?.id || i.studentId || '',
        fullName: i.student?.fullName || '',
        phone: i.student?.phone || '',
      })));
    } catch {
      setStudents([]);
    }
  }, []);

  const loadGroups = useCallback(async () => {
    try {
      const res = await groupsApi.getAll({ limit: 100, status: 'ACTIVE' });
      setGroups(res.data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    if (formData.groupId) loadStudents(formData.groupId);
  }, [formData.groupId, loadStudents]);

  const handleAmountChange = (value: string, field: 'amount' | 'paidAmount') => {
    const numericValue = value.replace(/\s/g, '');
    
    if (numericValue === '' || numericValue === '0') {
      if (field === 'amount') {
        setDisplayAmount('');
        setFormData({ ...formData, amount: 0 });
      } else {
        setDisplayPaidAmount('');
        setFormData({ ...formData, paidAmount: 0 });
      }
      return;
    }

    const parsed = parseInt(numericValue, 10);
    if (!isNaN(parsed)) {
      if (field === 'amount') {
        setFormData({ ...formData, amount: parsed });
        setDisplayAmount(parsed.toLocaleString('uz-UZ'));
      } else {
        setFormData({ ...formData, paidAmount: parsed });
        setDisplayPaidAmount(parsed.toLocaleString('uz-UZ'));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: CreatePaymentInput = {
        studentId: formData.studentId,
        groupId: formData.groupId,
        amount: Number(formData.amount),
        paidAmount: Number(formData.paidAmount),
        dueDate: new Date(formData.dueDate).toISOString(),
        paidDate: formData.paidDate ? new Date(formData.paidDate).toISOString() : null,
        status: formData.status as CreatePaymentInput['status'],
        method: formData.method as PaymentMethod,
        notes: formData.notes || null,
      };

      if (isEdit) {
        await paymentsApi.update(payment.id, payload);
      } else {
        await paymentsApi.create(payload);
      }
      onSuccess();
    } catch (err: unknown) {
      const errMsg = (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message;
      alert(errMsg || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl bg-card border shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-xl font-semibold">{isEdit ? 'To\'lovni tahrirlash' : 'Yangi to\'lov'}</h2>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-accent transition-colors"><X className="h-5 w-5" /></button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto hide-scrollbar">
          {/* Guruh */}
          <div>
            <label className="block text-sm font-medium mb-2">Guruh <span className="text-red-500">*</span></label>
            <select
              value={formData.groupId}
              onChange={e => setFormData({ ...formData, groupId: e.target.value, studentId: '' })}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            >
              <option value="">Guruh tanlang</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name} — {g.subject}</option>)}
            </select>
          </div>

          {/* Talaba */}
          <div>
            <label className="block text-sm font-medium mb-2">Talaba <span className="text-red-500">*</span></label>
            <select
              value={formData.studentId}
              onChange={e => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
              disabled={!formData.groupId}
            >
              <option value="">Talaba tanlang</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
            </select>
          </div>

          {/* Miqdorlar */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Umumiy summa <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={displayAmount}
                onChange={e => handleAmountChange(e.target.value, 'amount')}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="500 000" required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">To'langan summa</label>
              <input
                type="text"
                value={displayPaidAmount}
                onChange={e => handleAmountChange(e.target.value, 'paidAmount')}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* Sanalar */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">To'lov muddati <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">To'langan sana</label>
              <input
                type="date"
                value={formData.paidDate}
                onChange={e => setFormData({ ...formData, paidDate: e.target.value })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Holat va usul */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">To'lov usuli</label>
              <select
                value={formData.method}
                onChange={e => setFormData({ ...formData, method: e.target.value as PaymentMethod })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="CASH">Naqd</option>
                <option value="CARD">Karta</option>
                <option value="TRANSFER">O'tkazma</option>
                <option value="OTHER">Boshqa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Holati</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as PaymentStatus })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="PENDING">Kutilmoqda</option>
                <option value="PAID">To'landi</option>
                <option value="PARTIAL">Qisman</option>
                <option value="OVERDUE">Muddati o'tgan</option>
                <option value="CANCELLED">Bekor qilingan</option>
              </select>
            </div>
          </div>

          {/* Izoh */}
          <div>
            <label className="block text-sm font-medium mb-2">Izoh</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Qo'shimcha izoh..."
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t p-6">
          <button type="button" onClick={onClose} disabled={loading} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
            Bekor qilish
          </button>
          <button onClick={handleSubmit} disabled={loading} className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors disabled:opacity-60">
            <Save className="h-4 w-4" />
            {loading ? 'Saqlanmoqda...' : isEdit ? 'Yangilash' : 'Saqlash'}
          </button>
        </div>
      </div>
    </div>
  );
}
