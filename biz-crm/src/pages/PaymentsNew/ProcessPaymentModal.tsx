import { useState, useEffect } from 'react';
import { X, Save, DollarSign, CreditCard, User, AlertCircle } from 'lucide-react';
import { paymentsNewApi, type StudentWithPaymentInfo } from '@/lib/api/payments-new';

interface ProcessPaymentModalProps {
  open: boolean;
  student: StudentWithPaymentInfo;
  onClose: () => void;
  onSuccess: () => void;
}

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Naqd pul', icon: DollarSign },
  { value: 'CARD', label: 'Bank kartasi', icon: CreditCard },
  { value: 'TRANSFER', label: "Bank o'tkazmasi", icon: CreditCard },
] as const;

export function ProcessPaymentModal({ open, student, onClose, onSuccess }: ProcessPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    paidAmount: 0,
    method: 'CASH' as 'CASH' | 'CARD' | 'TRANSFER',
    notes: '',
  });
  const [displayAmount, setDisplayAmount] = useState('');

  // Student prop o'zgarganda formData ni yangilash
  useEffect(() => {
    if (open) {
      const initialAmount = student.remainingAmount || student.paymentAmount || 0;
      setFormData({
        paidAmount: initialAmount,
        method: 'CASH',
        notes: '',
      });
      setDisplayAmount(initialAmount > 0 ? initialAmount.toLocaleString('uz-UZ') : '');
    }
  }, [open, student]);

  if (!open) return null;

  const groupId = student.groups[0]?.groupId || student.groupId || '';
  const groupName = student.groups[0]?.group?.name || 'Guruhsiz';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!groupId) {
      alert('Talaba guruhi topilmadi');
      return;
    }

    if (formData.paidAmount <= 0) {
      alert('To\'lov summasi 0 dan katta bo\'lishi kerak');
      return;
    }

    setLoading(true);
    try {
      const now = new Date().toISOString();
      
      await paymentsNewApi.processPayment({
        studentId: student.id,
        groupId,
        amount: student.paymentAmount || formData.paidAmount,
        paidAmount: formData.paidAmount,
        dueDate: student.nextPaymentDate || now,
        paidDate: now,
        status: formData.paidAmount >= (student.remainingAmount || 0) ? 'PAID' : 'PARTIAL',
        method: formData.method,
        notes: formData.notes || undefined,
      });

      onSuccess();
    } catch (error: unknown) {
      const errMsg = (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message;
      alert(errMsg || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('uz-UZ') + ' so\'m';
  };

  const handleAmountChange = (value: string) => {
    // Faqat raqamlarni qoldirish (barcha raqam bo'lmagan belgilarni olib tashlash)
    const numericValue = value.replace(/[^\d]/g, '');
    
    if (numericValue === '') {
      setDisplayAmount('');
      setFormData({ ...formData, paidAmount: 0 });
      return;
    }

    const parsed = parseInt(numericValue, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setFormData({ ...formData, paidAmount: parsed });
      setDisplayAmount(parsed.toLocaleString('uz-UZ'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl bg-card border shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6">
          <div>
            <h2 className="text-xl font-semibold">To'lov qilish</h2>
            <p className="text-sm text-muted-foreground mt-1">Talaba to'lov ma'lumotlari</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-accent transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[65vh] overflow-y-auto hide-scrollbar">
          {/* Student Info */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-teal-600" />
              <h3 className="font-semibold">Talaba ma'lumotlari</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Ism Familya</p>
                <p className="font-medium">{student.fullName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Telefon</p>
                <p className="font-medium">{student.phone}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Guruh</p>
                <p className="font-medium">{groupName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Holati</p>
                <p className="font-medium">{student.paymentStatus === 'OVERDUE' ? 'Qarzdor' : student.paymentStatus === 'PENDING' ? 'Kutilmoqda' : 'Qisman'}</p>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-teal-600" />
              <h3 className="font-semibold">To'lov ma'lumotlari</h3>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Oylik to'lov:</span>
                <span className="font-semibold">{formatCurrency(student.paymentAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Oldin to'langan:</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(student.paidAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="text-muted-foreground font-medium">Qolgan qarz:</span>
                <span className="font-bold text-lg text-red-600 dark:text-red-400">
                  {formatCurrency(student.remainingAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Amount */}
          <div>
            <label className="block text-sm font-medium mb-2">
              To'lov summasi <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={displayAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0"
                required
                className="w-full rounded-lg border bg-background pl-10 pr-20 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                so'm
              </span>
            </div>
            {formData.paidAmount > student.remainingAmount && (
              <div className="flex items-center gap-2 mt-2 text-sm text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-4 w-4" />
                <span>Kiritilgan summa qarzdan ko'p</span>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium mb-3">
              To'lov usuli <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, method: method.value })}
                    className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
                      formData.method === method.value
                        ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <Icon className={`h-6 w-6 ${formData.method === method.value ? 'text-teal-600' : 'text-muted-foreground'}`} />
                    <span className="text-sm font-medium">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">Izoh</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Qo'shimcha ma'lumot..."
              rows={3}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 sticky bottom-0 bg-card pt-4 pb-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border bg-background px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
              disabled={loading}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading || formData.paidAmount <= 0}
              className="flex-1 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Yuklanmoqda...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  To'lovni tasdiqlash
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
