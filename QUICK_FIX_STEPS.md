# Backend Muammolarini Tuzatish

## MUHIM: Backend serverni qayta ishga tushirish kerak!

### 1-qadam: Backend terminalini toping va to'xtating
- Backend ishlab turgan terminalda `Ctrl+C` bosing
- Yoki terminalni yoping

### 2-qadam: Backend ni qayta ishga tushiring

```bash
cd c:\Users\Javohir\Desktop\EduFlow_crm\backend
npm run dev
```

### 3-qadam: Plans ni seed qiling (faqat birinchi marta)

**Yangi terminal ochib:**

```bash
cd c:\Users\Javohir\Desktop\EduFlow_crm\backend
node seed-plans.js
```

### 4-qadam: Browserda sahifani yangilang (F5)

---

## Agar baribir xato chiqsa:

### Variant A: Yangi foydalanuvchi yaratish

1. Logout qiling
2. Yangi foydalanuvchi registratsiya qiling
3. Login qiling
4. Hamma funksiyalar ishlashi kerak

### Variant B: Database ni tozalash (faqat test uchun!)

```bash
cd c:\Users\Javohir\Desktop\EduFlow_crm\backend
npx prisma migrate reset
node seed-plans.js
```

**OGOHLANTIRISH**: Bu barcha ma'lumotlarni o'chiradi!
