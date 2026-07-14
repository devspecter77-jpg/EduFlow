import { Eye, Pencil, Trash2, DollarSign, Calendar, Users } from 'lucide-react';
import type { Payment } from '@/lib/api/payments';

const STATUS_COLORS: Record<string, string> = {
  PAID: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  PARTIAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  OVERDUE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  CANCELLED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const STATUS_LABELS: Record<string, string> = {
  PAID: 'To\'langan',
  PENDING: 'Kutilmoqda',
  PARTIAL: 'Qisman',
  OVERDUE: 'Muddati o\'tgan',
  CANCELLED: 'Bekor qilingan',
};

interface PaymentCardProps {
  payment: Payment & { studentName?: string; groupName?: string };
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function PaymentCard({ payment, onView, onEdit, onDelete }: PaymentCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 flex-shrink-0">
          <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        </div>
        
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

      {/* Payment info */}
      <div className="space-y-2">
        <div>
          <h3 className="text-base font-semibold text-foreground">{payment.studentName || 'Noma\'lum'}</h3>
          {payment.groupName && <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {payment.groupName}
          </p>}
        </div>

        <div className="flex items-center justify-between bg-muted/30 rounded-lg p-2">
          <div>
            <p className="text-xs text-muted-foreground">To'langan</p>
            <p className="text-sm font-bold text-green-600 dark:text-green-400">
              {payment.paidAmount.toLocaleString('uz-UZ')} so'm
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Jami</p>
            <p className="text-sm font-semibold text-foreground">
              {payment.amount.toLocaleString('uz-UZ')} so'm
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[payment.status]}`}>
            {STATUS_LABELS[payment.status]}
          </span>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{new Date(payment.dueDate).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
