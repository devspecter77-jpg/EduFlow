# Mobile Cards - Qo'llash Qo'llanmasi

## ✅ BAJARILGAN:
1. **Students** - Card layout ✅
2. **Teachers** - Card layout ✅
3. **Loader3D** - Component ✅
4. **Card Components** - Barcha tayyor ✅

---

## 📝 QOLGAN ISHLAR:

### 1. GROUPS Sahifasi

**Fayl:** `biz-crm/src/pages/Groups/index.tsx`

**1.1. Import qo'shing (tepada):**
```typescript
import { GroupCard } from './GroupCard';
import { Loader3D } from '@/components/Loader3D';
```

**1.2. Jadval qismini toping va almashtiring:**

Qidirish: `{/* Table */}` yoki `<div className="rounded-xl border bg-card overflow-hidden">`

O'chirish: Butun jadval divini

Qo'shish:
```tsx
{/* Groups Grid/Cards */}
<div className="rounded-xl border bg-card overflow-hidden">
  {loading ? (
    <div className="py-16 flex flex-col items-center">
      <Loader3D size="lg" />
      <p className="mt-4 text-sm text-muted-foreground">Yuklanmoqda...</p>
    </div>
  ) : groups.length === 0 ? (
    <div className="py-16 text-center text-muted-foreground">
      Guruhlar topilmadi
    </div>
  ) : (
    <>
      {/* Desktop: Table */}
      <div className="hidden lg:block overflow-x-auto">
        {/* ESKİ JADVAL KODINI SHU YERGA KO'CHIRISH */}
      </div>

      {/* Mobile: Card Grid */}
      <div className="grid gap-3 p-3 sm:grid-cols-2 lg:hidden">
        {groups.map((g) => (
          <GroupCard
            key={g.id}
            group={g}
            isSelected={selectedIds.has(g.id)}
            onSelect={() => toggleSelect(g.id)}
            onView={() => setViewGroup(g)}
            onEdit={() => setEditGroup(g)}
            onDelete={() => setDeleteGroup(g)}
          />
        ))}
      </div>
    </>
  )}

  {/* Pagination o'zgarishsiz */}
</div>
```

---

### 2. PAYMENTS Sahifasi

**Fayl:** `biz-crm/src/pages/Payments/index.tsx`

**2.1. Import qo'shing:**
```typescript
import { PaymentCard } from './PaymentCard';
import { Loader3D } from '@/components/Loader3D';
```

**2.2. Jadval o'rniga:**
```tsx
{/* Payments Grid/Cards */}
<div className="rounded-xl border bg-card overflow-hidden">
  {loading ? (
    <div className="py-16 flex flex-col items-center">
      <Loader3D size="lg" />
      <p className="mt-4 text-sm text-muted-foreground">Yuklanmoqda...</p>
    </div>
  ) : payments.length === 0 ? (
    <div className="py-16 text-center text-muted-foreground">
      To'lovlar topilmadi
    </div>
  ) : (
    <>
      {/* Desktop: Table */}
      <div className="hidden lg:block overflow-x-auto">
        {/* ESKİ JADVAL */}
      </div>

      {/* Mobile: Card Grid */}
      <div className="grid gap-3 p-3 sm:grid-cols-2 lg:hidden">
        {payments.map((p) => (
          <PaymentCard
            key={p.id}
            payment={p}
            onView={() => setViewPayment(p)}
            onEdit={() => setEditPayment(p)}
            onDelete={() => setDeletePayment(p)}
          />
        ))}
      </div>
    </>
  )}
</div>
```

---

### 3. PAYMENTSN EW Sahifasi

**Fayl:** `biz-crm/src/pages/PaymentsNew/index.tsx`

Bu sahifa card-based, faqat Loader3D qo'shish kerak:

```typescript
import { Loader3D } from '@/components/Loader3D';

// Loading qismini yangilash:
{loading && (
  <div className="py-16 flex flex-col items-center">
    <Loader3D size="lg" />
    <p className="mt-4 text-sm text-muted-foreground">Yuklanmoqda...</p>
  </div>
)}
```

---

### 4. REPORTS Sahifalari

Barcha report sahifalarida (`AttendanceReport`, `GroupsReport`, `PaymentsReport`, `StudentsReport`, `TeachersReport`):

**Import qo'shing:**
```typescript
import { Loader3D } from '@/components/Loader3D';
```

**Loading qismini yangilang:**
```tsx
{loading ? (
  <div className="py-16 flex flex-col items-center">
    <Loader3D size="lg" />
    <p className="mt-4 text-sm text-muted-foreground">Hisobot tayyorlanmoqda...</p>
  </div>
) : (
  {/* Table */}
)}
```

**Jadvallarni responsive qiling:**
```tsx
<div className="overflow-x-auto">
  <table className="w-full text-sm">
    {/* ... */}
  </table>
</div>
```

---

### 5. ATTENDANCE Sahifasi

**Fayl:** `biz-crm/src/pages/Attendance/index.tsx`

**Import qo'shing:**
```typescript
import { Loader3D } from '@/components/Loader3D';
```

**Loading qismida:**
```tsx
{loadingStudents ? (
  <div className="flex items-center justify-center py-16">
    <Loader3D />
    <span className="ml-3 text-sm text-muted-foreground">Yuklanmoqda...</span>
  </div>
) : (
  {/* O'quvchilar ro'yxati */}
)}
```

**O'quvchilar ro'yxatini responsive qiling:**
Hozirgi kod allaqachon responsive (`flex items-center gap-3`), lekin mobile uchun yaxshiroq qilish:

```tsx
<div className="divide-y">
  {filteredStudents.map((s, idx) => (
    <div key={s.studentId} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
      {/* Tartib va checkbox */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <span className="text-xs text-muted-foreground w-6 text-right">{idx + 1}</span>
        
        {/* O'quvchi */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{s.fullName}</p>
          <p className="text-xs text-muted-foreground">{s.phone}</p>
        </div>
      </div>

      {/* Status buttonlar */}
      <div className="flex items-center gap-1 ml-auto">
        {/* ... buttonlar ... */}
      </div>
    </div>
  ))}
</div>
```

---

### 6. SETTINGS Sahifasi

**Fayl:** `biz-crm/src/pages/Settings/index.tsx`

**Tabs mobile uchun:**
```tsx
<div className="flex overflow-x-auto border-b hide-scrollbar -mx-4 sm:mx-0 px-4 sm:px-0">
  {tabs.map((tab) => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
        activeTab === tab.id
          ? 'border-teal-600 text-teal-600'
          : 'border-transparent text-muted-foreground hover:text-foreground'
      }`}
    >
      <tab.icon className="h-4 w-4" />
      <span className="hidden sm:inline">{tab.label}</span>
    </button>
  ))}
</div>
```

**Forms responsive:**
```tsx
<div className="grid gap-4 sm:grid-cols-2">
  {/* Form fields */}
</div>
```

---

### 7. ANALYTICS Sahifasi

**Fayl:** `biz-crm/src/pages/Analytics/index.tsx`

**Import:**
```typescript
import { Loader3D } from '@/components/Loader3D';
```

**Charts responsive:**
```tsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {/* Chart cards */}
</div>
```

**Loading:**
```tsx
{loading && <Loader3D size="lg" />}
```

---

### 8. CALENDAR Sahifasi

**Fayl:** `biz-crm/src/pages/Calendar/index.tsx`

Mobile uchun calendar view o'zgartirish:

```tsx
<div className="rounded-xl border bg-card overflow-hidden">
  {/* Desktop: Full calendar */}
  <div className="hidden md:block">
    {/* Calendar grid */}
  </div>

  {/* Mobile: List view */}
  <div className="md:hidden">
    <div className="divide-y">
      {events.map((event) => (
        <div key={event.id} className="p-4">
          <h3 className="font-medium">{event.title}</h3>
          <p className="text-sm text-muted-foreground">{event.time}</p>
        </div>
      ))}
    </div>
  </div>
</div>
```

---

## 🎨 Global CSS (agar kerak bo'lsa)

`src/index.css` yoki `globals.css` ga qo'shing:

```css
/* Hide scrollbar */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Smooth scroll */
html {
  scroll-behavior: smooth;
}

/* Mobile menu overlay */
@media (max-width: 1024px) {
  body.menu-open {
    overflow: hidden;
  }
}
```

---

## ✅ Tekshirish Ro'yxati:

- [ ] Groups - Card layout
- [ ] Payments - Card layout
- [ ] PaymentsNew - Loader3D
- [ ] Reports (5 ta sahifa) - Loader3D
- [ ] Attendance - Loader3D va responsive
- [ ] Settings - Tabs responsive
- [ ] Analytics - Loader3D va grid
- [ ] Calendar - Mobile list view
- [ ] Dashboard - Loader3D (hozir RefreshCw o'rniga)

---

## 🚀 Qo'shimcha:

### Buttonlar mobile da:
```tsx
<button className="inline-flex items-center gap-2 ...">
  <Icon className="h-4 w-4" />
  <span className="hidden sm:inline">Text</span>
</button>
```

### Grid layouts:
```tsx
<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
```

### Spacing:
```tsx
<div className="space-y-4 sm:space-y-6">
```

### Text sizes:
```tsx
<h1 className="text-xl sm:text-2xl lg:text-3xl">
```

---

Har bir sahifani yuqoridagi ko'rsatmalarga asosan yangilang. Diagnostics tekshiring va xatolik bo'lmasa, keyingisiga o'ting! 🎉
