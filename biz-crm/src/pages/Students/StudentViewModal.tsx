import { X, Pencil, Phone, User, MapPin, Calendar, FileText, DollarSign, CreditCard } from 'lucide-react';
import type { Student } from '@/lib/api/students';

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  MONTHLY: 'Oylik',
  YEARLY: 'Yillik',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Faol', INACTIVE: 'Faolsiz', GRADUATED: 'Bitirgan', EXPELLED: "Chiqarib yuborilgan",
};
const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  INACTIVE: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  GRADUATED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  EXPELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

interface Props {
  student: Student;
  groupMap: Record<string, string>;
  onClose: () => void;
  onEdit: () => void;
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 rounded-md bg-teal-50 dark:bg-teal-900/20 p-1.5">
        <Icon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export function StudentViewModal({ student, groupMap, onClose, onEdit }: Props) {
  const formatPhone = (p: string) => {
    if (p.startsWith('+998') && p.length === 13) {
      return `+998 ${p.slice(4, 6)} ${p.slice(6, 9)} ${p.slice(9, 11)} ${p.slice(11, 13)}`;
    }
    return p;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-card border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 flex-shrink-0">
          <h2 className="text-lg font-semibold">O'quvchi ma'lumotlari</h2>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-accent transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30 text-2xl font-bold text-teal-600 dark:text-teal-400">
              {student.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{student.fullName}</h3>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mt-1 ${STATUS_COLORS[student.status]}`}>
                {STATUS_LABELS[student.status]}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 pt-2">
            <InfoRow icon={Phone} label="Telefon" value={formatPhone(student.phone)} />
            {student.parentFullName && (
              <InfoRow icon={User} label="Ota-ona" value={student.parentFullName} />
            )}
            {student.parentPhone && (
              <InfoRow icon={Phone} label="Ota-ona telefon" value={formatPhone(student.parentPhone)} />
            )}
            <InfoRow icon={User} label="Jinsi" value={student.gender === 'MALE' ? 'Erkak' : 'Ayol'} />
            {student.birthDate && (
              <InfoRow icon={Calendar} label="Tug'ilgan sana" value={new Date(student.birthDate).toLocaleDateString('uz-UZ')} />
            )}
            {student.address && (
              <InfoRow icon={MapPin} label="Manzil" value={student.address} />
            )}
            {student.groupId && (
              <InfoRow icon={User} label="Guruh" value={groupMap[student.groupId] || student.groupId} />
            )}
            {student.startDate && (
              <InfoRow icon={Calendar} label="Kelgan sana" value={new Date(student.startDate).toLocaleDateString('uz-UZ')} />
            )}
            <InfoRow icon={CreditCard} label="To'lov turi" value={PAYMENT_TYPE_LABELS[student.paymentType]} />
            {student.paymentAmount && (
              <InfoRow icon={DollarSign} label="To'lov miqdori" value={`${student.paymentAmount.toLocaleString('uz-UZ')} so'm`} />
            )}
            {student.nextPaymentDate && (
              <InfoRow icon={Calendar} label="Keyingi to'lov" value={new Date(student.nextPaymentDate).toLocaleDateString('uz-UZ')} />
            )}
            {student.notes && (
              <InfoRow icon={FileText} label="Izoh" value={student.notes} />
            )}
            <InfoRow
              icon={Calendar}
              label="Qo'shilgan sana"
              value={new Date(student.createdAt).toLocaleDateString('uz-UZ')}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t px-6 py-4 flex-shrink-0">
          <button onClick={onClose} className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
            Yopish
          </button>
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-sm font-medium transition-colors"
          >
            <Pencil className="h-4 w-4" />
            Tahrirlash
          </button>
        </div>
      </div>
    </div>
  );
}
