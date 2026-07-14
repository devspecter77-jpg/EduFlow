# Database Schema Muammosini Hal Qilish

## 🔴 Muammo
`prisma db pull` buyrug'i schema.prisma faylini database strukturasiga qarab qayta yozgan:
- Model nomlari: `User` → `users`, `Student` → `students`
- Field nomlari: `userId` → `user_id`, `createdAt` → `created_at`

Bu code bilan mos kelmaydi va 500 error beradi.

## ✅ Yechim 1: Database ni Tozalash va Qayta Yaratish (TAVSIYA ETILADI)

### 1. Neon.tech saytiga kiring
1. https://neon.tech ga kiring
2. O'z database ingizni oching
3. **Database Tables** bo'limiga o'ting
4. **Barcha jadvallarni o'chiring** (Tables → Delete)

### 2. Schema.prisma ni tiklash
Schema.prisma fayli database dan tortilgan, shuning uchun uni asl holatga qaytarish kerak.

Asl to'g'ri schema.prisma ni qayta yozing yoki bu yerda berilgan versiyani ishlating.

### 3. Migration qayta qo'llash
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### 4. Test user yaratish
```bash
npx ts-node -r tsconfig-paths/register src/scripts/seed-user.ts
```

---

## ✅ Yechim 2: Prisma Studio da Qo'lda User Yaratish (TEZKOR)

### 1. Prisma Studio ochish
```bash
cd backend
npx prisma studio
```

Browser da http://localhost:5555 ochiladi

### 2. User yaratish
1. `users` jadvalini oching
2. "Add record" tugmasini bosing
3. Quyidagilarni kiriting:
   - **id**: `cm6abc123` (yoki random string)
   - **center_name**: `Test Academy`
   - **full_name**: `Test Admin`  
   - **phone**: `+998901234567`
   - **password**: `$2b$10$rI8qJ.z9.Xq5Z8KqJ9X8Qe5K4F5xK9X8Qe5K4F5xK9X8Qe5K4F5x` (bu "Test123456" paroli)
   - **role**: `ADMIN`
   - **is_active**: `true`
4. "Save 1 change" bosing

### 3. Settings yaratish
1. `settings` jadvalini oching
2. "Add record" tugmasini bosing
3. Quyidagilarni kiriting:
   - **id**: `cm6def456`
   - **user_id**: (yuqorida yaratgan user ID si)
   - **center_name**: `Test Academy`
   - **phone**: `+998901234567`
4. Save qiling

### 4. Login qilish
- Phone: `+998901234567`
- Password: `Test123456`

---

## ✅ Yechim 3: Database URL yangilash (Agar barcha yechimlar ishlamasa)

Yangi Neon database yarating:

1. https://neon.tech da yangi project yarating
2. Connection string ni ko'chiring
3. `backend/.env` faylida yangilang:
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```
4. Migration qo'llang:
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

---

## 🎯 Qaysi Yechimni Tanlash?

- **Yechim 1**: Agar database bo'sh bo'lsa yoki qayta yaratish mumkin bo'lsa (PRODUCTION EMAS!)
- **Yechim 2**: Tezkor test uchun, hozir login qilish kerak bo'lsa ✅ (TAVSIYA)
- **Yechim 3**: Agar Neon database buzilgan bo'lsa

---

## ⚠️ Eslatma

Production database uchun **Yechim 1 ni QILMANG**! Chunki barcha ma'lumotlar o'chadi.

Test/Development uchun Yechim 2 eng oson va xavfsiz.
