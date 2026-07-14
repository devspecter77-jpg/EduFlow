# Mobile Card Layout Integration - Amaliy Qo'llanma

## ✅ Tayyor Componentlar:
1. `StudentCard.tsx` ✅
2. `TeacherCard.tsx` ✅
3. `GroupCard.tsx` ✅
4. `PaymentCard.tsx` ✅
5. `Loader3D.tsx` ✅

---

## 📱 TEACHERS Sahifasini Yangilash

### 1. Import qo'shing (tepada):
```typescript
import { TeacherCard } from './TeacherCard';
import { Loader3D } from '@/components/Loader3D';
```

### 2. Jadval qismini topib, almashtiring:

**ESKIsini O'CHIRISH:**
```tsx
{/* Table */}
<div className="rounded-xl border bg-card overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full text-sm min-w-[640px]">
      {/* ... butun jadval kodi ... */}
    </table>
  </div>
  {/* Pagination */}
</div>
```

**YANGIsini QO'SHISH:**
```tsx
{/* Teachers Grid/Cards */}
<div className="rounded-xl border bg-card overflow-hidden">
  {loading ? (
    <div className="py-16 flex flex-col items-center">
      <Loader3D size="lg" />
      <p className="mt-4 text-sm text-muted-foreground">Yuklanmoqda...</p>
    </div>
  ) : teachers.length === 0 ? (
    <div className="py-16 text-center text-muted-foreground">
      O'qituvchilar topilmadi
    </div>
  ) : (
    <>
      {/* Desktop: Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left">
                <button onClick={toggleSelectAll}>
                  {allSelected ? <CheckSquare className="h-4 w-4 text-teal-600" /> : <Square className="h-4 w-4" />}
                </button>
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">#</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ism</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Telefon</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Maosh</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Holat</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Sana</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t, idx) => {
              const rowNum = ((filters.page ?? 1) - 1) * (filters.limit ?? 10) + idx + 1;
              const isSelected = selectedIds.has(t.id);
              return (
                <tr key={t.id} className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${isSelected ? 'bg-teal-50/50 dark:bg-teal-900/10' : ''}`}>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleSelect(t.id)}>
                      {isSelected ? <CheckSquare className="h-4 w-4 text-teal-600" /> : <Square className="h-4 w-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{rowNum}</td>
                  <td className="px-4 py-3 font-medium">{t.fullName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {t.salary ? `${t.salary.toLocaleString('uz-UZ')} so'm` : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[t.status]}`}>
                      {STATUS_LABELS[t.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(t.createdAt).toLocaleDateString('uz-UZ')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewTeacher(t)} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors" title="Ko'rish">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => setEditTeacher(t)} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors" title="Tahrirlash">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteTeacher(t)} className="rounded-md p-1.5 text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors" title="O'chirish">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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

  {/* Pagination - O'ZGARISHSIZ qoldiring */}
</div>
```

---

## 📱 GROUPS Sahifasini Yangilash

### 1. Import qo'shing:
```typescript
import { GroupCard } from './GroupCard';
import { Loader3D } from '@/components/Loader3D';
```

### 2. Jadval o'rniga:
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
        {/* Eski jadval kodi */}
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
</div>
```

---

## 📱 PAYMENTS Sahifasini Yangilash

### 1. Import qo'shing:
```typescript
import { PaymentCard } from './PaymentCard';
import { Loader3D } from '@/components/Loader3D';
```

### 2. Jadval o'rniga:
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
        {/* Eski jadval kodi */}
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

## 📱 DASHBOARD - Loader3D ni qo'shish

Dashboard sahifasida `RefreshCw` icon o'rniga `Loader3D` ishlatish:

```typescript
import { Loader3D } from '@/components/Loader3D';

// Loading holatda:
{loading ? (
  <div className="py-12 flex flex-col items-center">
    <Loader3D />
    <p className="mt-3 text-sm text-muted-foreground">Yuklanmoqda...</p>
  </div>
) : (
  // Content
)}
```

---

## 🎨 REPORTS Sahifalari

Reports qismidagi barcha sahifalar (`AttendanceReport`, `GroupsReport`, `PaymentsReport`, `StudentsReport`, `TeachersReport`) uchun:

### 1. Import qo'shing:
```typescript
import { Loader3D } from '@/components/Loader3D';
```

### 2. Loading holatni yangilang:
```tsx
{loading ? (
  <div className="py-16 flex flex-col items-center">
    <Loader3D size="lg" />
    <p className="mt-4 text-sm text-muted-foreground">Hisobot tayyorlanmoqda...</p>
  </div>
) : (
  // Table yoki Content
)}
```

### 3. Jadvallarni responsive qiling:
```tsx
<div className="overflow-x-auto">
  <table className="w-full text-sm">
    {/* ... */}
  </table>
</div>
```

---

## 🎯 SETTINGS Sahifasi

Settings sahifasida tabs mobile uchun:

```tsx
{/* Tabs */}
<div className="flex overflow-x-auto border-b hide-scrollbar">
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

---

## ✅ Xulosa

Har bir sahifa uchun:
1. Card component import qiling
2. `Loader3D` import qiling  
3. Loading da `<Loader3D />` ishlatib
4. Desktop da jadval (`hidden lg:block`)
5. Mobile da card grid (`lg:hidden`)
6. Responsive breakpoints: 
   - Mobile: 1 column
   - Tablet (`sm:`): 2 columns
   - Desktop (`lg:`): table

---

## 🚀 Qo'shimcha CSS (agar kerak bo'lsa)

`tailwind.config.js` yoki global CSS ga:

```css
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```
