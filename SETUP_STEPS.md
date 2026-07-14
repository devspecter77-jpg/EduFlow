# SUPABASE SETUP - Oxirgi Qadamlar 🚀

## ✅ QILINDI:
- Supabase project yaratildi
- Connection string olindi
- Backend .env yangilandi

---

## KERAKLI QADAMLAR:

### 1. **Parolni kiriting** ⚠️ MUHIM!

`c:\Users\Javohir\Desktop\EduFlow_crm\backend\.env` faylini oching va:

**`[YOUR-PASSWORD]`** ni o'rniga **Supabase project parolingizni** qo'ying.

**OLDIN:**
```env
DATABASE_URL="postgresql://postgres.ptsuljfuzcvoipezirbe:[YOUR-PASSWORD]@aws-0-ap-southeast-1..."
```

**KEYIN:**
```env
DATABASE_URL="postgresql://postgres.ptsuljfuzcvoipezirbe:SIZNING_PAROLINGIZ@aws-0-ap-southeast-1..."
```

**⚠️ Agar parolda maxsus belgilar bo'lsa:**
- `!` → `%21`
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `^` → `%5E`
- `&` → `%26`
- `*` → `%2A`

**Masalan:**
- Parol: `MyPass@123!`
- URL'da: `MyPass%40123%21`

---

### 2. **Prisma'ni yangilang**

```bash
cd c:\Users\Javohir\Desktop\EduFlow_crm\backend
npx prisma generate
```

**Ko'rishingiz kerak:**
```
✔ Generated Prisma Client
```

---

### 3. **Migration'larni qo'llang**

```bash
npx prisma migrate deploy
```

**Ko'rishingiz kerak:**
```
✔ Applied 11 migrations in 2.5s
```

Agar xato chiqsa:
```bash
# Eski migration'larni reset qiling
npx prisma migrate reset --skip-seed
# Qaytadan deploy qiling
npx prisma migrate deploy
```

---

### 4. **Plans'ni seed qiling**

```bash
node seed-plans.js
```

**Ko'rishingiz kerak:**
```
🌱 Seeding plans...
✅ Created: Sinov (Trial)
✅ Created: Premium
🎉 Plans seeded successfully!
```

---

### 5. **Backend'ni ishga tushiring**

Backend terminalini to'xtating (`Ctrl+C`), keyin:

```bash
npm run dev
```

**Ko'rishingiz kerak:**
```
✓ Database connected
✓ Server running on port 5000
```

Agar "Can't reach database" ko'rsatsa:
- Parolni to'g'ri kiritganingizni tekshiring
- Maxsus belgilarni URL encode qilganingizni tekshiring

---

### 6. **Frontend'ni test qiling**

1. Browser'da: http://localhost:5173
2. **Logout** qiling (agar login bo'lsangiz)
3. **Yangi foydalanuvchi** yaratib ro'yxatdan o'ting:
   - Markaz nomi: Test Markaz
   - Ism familya: Test User
   - Telefon: +998 91 123 45 67
   - Parol: test123

4. **Login** qiling

5. **Tekshiring:**
   - ✅ Billing sahifasi ochiladi (404 yo'q)
   - ✅ "10 kun qoldi" ko'rinadi
   - ✅ Guruh qo'shish ishlaydi (403 yo'q)
   - ✅ O'quvchi qo'shish ishlaydi

---

## Xatolar va Yechimlar

### "Can't reach database server"
**Yechim:**
- Parolni to'g'ri kiritganingizni tekshiring
- Internet aloqangizni tekshiring
- Supabase project ACTIVE ekanligini tekshiring: https://supabase.com/dashboard

### "Migration failed"
**Yechim:**
```bash
npx prisma migrate reset --skip-seed
npx prisma migrate deploy
node seed-plans.js
```

### "Plans already exist"
**Yechim:**
Bu normal, plans allaqachon yaratilgan. O'tkazing.

### "Port 5000 already in use"
**Yechim:**
```bash
# Windows'da:
netstat -ano | findstr :5000
# Process ID'ni ko'rib, to'xtating:
taskkill /PID <PID> /F
```

---

## Tayyor! ✅

Agar hammasi ishlasa:
- ✅ Backend ishlayapti
- ✅ Supabase database ulandi
- ✅ Frontend ishlayapti
- ✅ Login/Register ishlaydi
- ✅ Guruh/O'quvchi qo'shish ishlaydi

---

## Keyingi Qadamlar

### Supabase Dashboard'dan foydalanish:

1. **SQL Editor**: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
   - SQL query'larni to'g'ridan-to'g'ri yozishingiz mumkin

2. **Table Editor**: https://supabase.com/dashboard/project/YOUR_PROJECT/editor
   - Jadvallarni browser'da ko'rishingiz/tahrirlashingiz mumkin

3. **Database**: https://supabase.com/dashboard/project/YOUR_PROJECT/database/tables
   - Schema, relationships, indexes

---

## Savol-Javoblar

**Q: Parolni qayerdan topaman?**
A: Supabase project yaratayotganda kiritgan parolingiz. Agar unutgan bo'lsangiz, Settings > Database > Reset Database Password

**Q: Migration xatolar chiqyapti**
A: `npx prisma migrate reset --skip-seed` keyin `npx prisma migrate deploy`

**Q: Frontend hali ham 404/403 ko'rsatyapti**
A: Backend to'g'ri ishlaganini tekshiring: http://localhost:5000/api/health

**Q: Deploy qilsam ishlayaptimi?**
A: Ha! Supabase production-ready. Vercel/Railway/Render'da muammosiz ishlaydi.

---

## Yordam Kerakmi?

Terminal'da nimani ko'rayotganingizni yuboring:
1. `npx prisma migrate deploy` natijasi
2. `npm run dev` natijasi
3. Browser console xatolari

🎉 **Muvaffaqiyatlar!**
