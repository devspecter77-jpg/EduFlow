# Mobile Responsive Card Layout - Qo'llanma

## ✅ Tayyor:
1. **Students** - Card layout qo'shildi ✅
2. **StudentCard** component yaratildi ✅  
3. **TeacherCard** component yaratildi ✅

## 📋 Qolgan ishlar:

### 1. Teachers sahifasini yangilash
`biz-crm/src/pages/Teachers/index.tsx` faylida:

**Import qo'shish:**
```typescript
import { TeacherCard } from './TeacherCard';
```

**Jadval o'rniga quyidagi kodni qo'ying:**
```tsx
{/* Teachers Grid/Cards */}
<div className="rounded-xl border bg-card overflow-hidden">
  {loading ? (
    <div className="py-16 text-center text-muted-foreground">
      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3" />
      Yuklanmoqda...
    </div>
  ) : teachers.length === 0 ? (
    <div className="py-16 text-center text-muted-foreground">
      O'qituvchilar topilmadi
    </div>
  ) : (
    <>
      {/* Desktop: Table, Mobile: Cards */}
      <div className="hidden lg:block overflow-x-auto">
        {/* Eski jadval kodini shu yerda qoldiring */}
      </div>

      {/* Mobile: Card Grid */}
      <div className="grid gap-3 p-3 sm:grid-cols-2 lg:hidden">
        {teachers.map((t) => (
          <TeacherCard
            key={t.id}
            teacher={t}
            isSelected={selectedIds.has(t.id)}
            onSelect={() => toggleSelect(t.id)}
            onView={() => setViewTeacher(t)}
            onEdit={() => setEditTeacher(t)}
            onDelete={() => setDeleteTeacher(t)}
          />
        ))}
      </div>
    </>
  )}

  {/* Pagination */}
  {/* ... */}
</div>
```

### 2. Groups Card yaratish
`biz-crm/src/pages/Groups/GroupCard.tsx` yarating:

```typescript
import { Eye, Pencil, Trash2, CheckSquare, Square, Users, Calendar, Clock } from 'lucide-react';
import type { Group } from '@/lib/api/groups';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  COMPLETED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

interface GroupCardProps {
  group: Group;
  studentCount: number;
  teacherName?: string;
  isSelected: boolean;
  onSelect: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function GroupCard({ group, studentCount, teacherName, isSelected, onSelect, onView, onEdit, onDelete }: GroupCardProps) {
  return (
    <div className={`rounded-lg border bg-card p-4 hover:shadow-md transition-all ${isSelected ? 'ring-2 ring-teal-500 bg-teal-50/50 dark:bg-teal-900/10' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <button onClick={onSelect} className="flex-shrink-0">
          {isSelected ? <CheckSquare className="h-5 w-5 text-teal-600" /> : <Square className="h-5 w-5 text-muted-foreground" />}
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
          <h3 className="text-base font-semibold text-foreground">{group.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{group.subject} • {group.level}</p>
        </div>

        {teacherName && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{teacherName}</span>
          </div>
        )}

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span>{studentCount} ta o'quvchi</span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[group.status]}`}>
            {group.status === 'ACTIVE' ? 'Faol' : group.status === 'COMPLETED' ? 'Tugagan' : 'Bekor qilingan'}
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
```

### 3. Payments Card yaratish
`biz-crm/src/pages/Payments/PaymentCard.tsx` yarating:

```typescript
import { Eye, Pencil, Trash2, DollarSign, Calendar, Users } from 'lucide-react';
import type { Payment } from '@/lib/api/payments';

const STATUS_COLORS: Record<string, string> = {
  PAID: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  PARTIAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  OVERDUE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  CANCELLED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

interface PaymentCardProps {
  payment: Payment;
  studentName: string;
  groupName?: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function PaymentCard({ payment, studentName, groupName, onView, onEdit, onDelete }: PaymentCardProps) {
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
          <h3 className="text-base font-semibold text-foreground">{studentName}</h3>
          {groupName && <p className="text-sm text-muted-foreground mt-1">{groupName}</p>}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-foreground">
            {payment.paidAmount.toLocaleString('uz-UZ')} so'm
          </span>
          <span className="text-xs text-muted-foreground">
            / {payment.amount.toLocaleString('uz-UZ')} so'm
          </span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[payment.status]}`}>
            {payment.status === 'PAID' ? 'To\'langan' : payment.status === 'PENDING' ? 'Kutilmoqda' : payment.status === 'PARTIAL' ? 'Qisman' : payment.status === 'OVERDUE' ? 'Muddati o\'tgan' : 'Bekor qilingan'}
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
```

## 🎯 Umumiy Pattern:

Har bir sahifa uchun:
1. Card component yarating
2. Asosiy sahifada import qiling
3. Jadval o'rniga quyidagini qo'ying:

```tsx
{/* Desktop: Table (hidden lg:block) */}
{/* Mobile: Cards (lg:hidden with grid) */}
<div className="grid gap-3 p-3 sm:grid-cols-2 lg:hidden">
  {items.map(item => <CardComponent key={item.id} ... />)}
</div>
```

## 📱 Breakpoints:
- Mobile: default (< 640px)
- Tablet: `sm:` (640px+) - 2 columns
- Desktop: `lg:` (1024px+) - table ko'rsatiladi

## ✅ Foydalar:
- Mobile da card layout (chiroyli va o'qish oson)
- Desktop da table (ko'proq ma'lumot)
- Responsive grid (1 col → 2 col → table)
- Hover effects va shadows
- Action buttons har bir cardda
