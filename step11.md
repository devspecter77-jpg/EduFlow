# Step 11: Smart Notification System

## ✅ Status: COMPLETED & PRODUCTION READY

---

## 📋 Umumiy Ko'rinish

EduFlow CRM uchun professional Smart Notification System — Telegram Bot integratsiyasi, avtomatik to'lov eslatmalari, davomat xabarlari, guruhga ommaviy xabar yuborish, `/start` command handler va to'liq notification tarix.

**Bot:** [@EduFlow_nazorat_bot](https://t.me/EduFlow_nazorat_bot)

---

## ✅ Bajarilgan Ishlar

### 1. Telegram Bot Integratsiyasi

- ✅ `@EduFlow_nazorat_bot` ulandi va ishlayapti
- ✅ Token `.env` ga saqlandi (`TELEGRAM_BOT_TOKEN`)
- ✅ DB dagi Settings ga token yozildi (setup-telegram.ts script)
- ✅ Bot validatsiyasi — `getMe()` API call
- ✅ **Polling mode** — `/start` va `/id` commandlar ishlaydi
- ✅ HTML parse mode (`<b>`, `<i>`, `<code>`)
- ✅ Server start bilan bot ham avtomatik ishga tushadi
- ✅ Graceful shutdown — server to'xtaganda bot ham to'xtaydi

---

### 2. Bot Commands

| Command | Javob |
|---|---|
| `/start` | Salom xabari + Chat ID |
| `/id` | Faqat Chat ID |

**`/start` javob namunasi:**
```
👋 Salom, Javohir!

✅ EduFlow CRM bot ga xush kelibsiz.

📋 Sizning Chat ID: 123456789

Bu ID ni o'quvchi profiliga kiriting — 
bildirishnomalar shu raqamga keladi.
```

---

### 3. O'quvchiga Telegram ID Biriktirish

- ✅ Student Modal ga `Telegram ID` maydoni qo'shildi
- ✅ Validation schema yangilandi (`telegramId` optional field)
- ✅ DB ga `telegram_id` ustun qo'shildi
- ✅ O'quvchi yoki ota-onaning Chat ID si saqlanadi
- ✅ Maydonda izoh: "O'quvchi yoki ota-onaning Telegram chat ID si"

**Chat ID olish tartibi:**
1. O'quvchi/ota-ona Telegramda `@EduFlow_nazorat_bot` topadi
2. `/start` yuboradi
3. Bot Chat ID ni qaytaradi
4. Shu raqam o'quvchi profiliga kiritiladi

---

### 4. Avtomatik To'lov Eslatmalari (Cron)

**Vaqt:** Har kuni soat **09:00** (Asia/Tashkent)

**Kimga:** `telegramId` bor, `status: ACTIVE` o'quvchilar, `nextPaymentDate` yaqin

**Xabar formati:**
```
📅 To'lov eslatmasi

👤 Hurmatli Ali Valiyev,
💰 To'lov miqdori: 500,000 so'm
📆 To'lov sanasi: 10.07.2026
⏰ Qolgan kunlar: 3 kun

Iltimos, vaqtida to'lov qiling! 🙏
```

**Sozlanishi:** `reminderDaysBefore` (1/2/3/5/7 kun), `paymentReminderEnabled` ON/OFF

---

### 5. Muddati O'tgan To'lov Bildirishi (Cron)

**Vaqt:** Har kuni soat **10:00** (Asia/Tashkent)

**Kimga:** `paymentStatus: OVERDUE`, `telegramId` bor o'quvchilar

**Xabar formati:**
```
⚠️ To'lov muddati o'tdi!

👤 Ali Valiyev,
💸 Qarz miqdori: 500,000 so'm

Iltimos, imkon qadar tezroq to'lovni amalga oshiring.
📞 Batafsil ma'lumot uchun markaz bilan bog'laning.
```

---

### 6. Davomat Xabarlari (Real-time)

**Qachon:** Davomat belgilanayotganda, `status: ABSENT` bo'lsa — **darhol**

**Kimga:** O'quvchining `telegramId` si bor bo'lsa

**Xabar formati:**
```
📋 Davomat xabari

👤 Ali Valiyev bugun darsga kelmadi.
📚 Guruh: Matematika 1-guruh
📅 Sana: 08.07.2026

Sababi bo'lsa, markaz bilan bog'laning.
```

**Sozlanishi:** `attendanceAlertEnabled` ON/OFF

---

### 7. Ommaviy Xabar Yuborish (UI)

| Rejim | Tavsif |
|---|---|
| Barcha o'quvchilar | Barcha faol, telegramId bor o'quvchilarga |
| Guruh bo'yicha | Tanlangan guruh o'quvchilariga |
| Test xabar | Berilgan Chat ID ga test yuborish |

---

### 8. Notification History

- ✅ Barcha yuborilgan xabarlar `notification_logs` da saqlanadi
- ✅ Status: **SENT** / **FAILED** / **PENDING**
- ✅ Filter: status bo'yicha
- ✅ Pagination (20 ta/sahifa)
- ✅ Qabul qiluvchi nomi, Chat ID, sarlavha, xabar
- ✅ Xato xabari (agar bo'lsa)

---

### 9. Notification Sozlamalari (UI)

**Telegram sozlamalari:**
- Telegram ON/OFF toggle
- Bot Token kiritish + "Tekshir" tugmasi
- Admin Chat ID

**Eslatma sozlamalari:**
- To'lov eslatmalari ON/OFF
- Davomat xabarlari ON/OFF
- Necha kun oldin eslatish (1/2/3/5/7)

---

## 🗄️ Backend

### Yangi Fayllar
```
backend/src/
├── services/
│   ├── telegram.service.ts             ✅ Bot instance, send, validate, log
│   ├── cron.service.ts                 ✅ Payment reminders, overdue, attendance alert
│   └── bot.service.ts                  ✅ Polling, /start, /id commands
├── controllers/
│   └── smartNotification.controller.ts ✅ 8 ta endpoint
├── routes/
│   └── smartNotification.routes.ts     ✅ Routes + authenticate
└── scripts/
    └── setup-telegram.ts               ✅ Token setup script
```

### Yangilangan Fayllar
```
backend/src/
├── controllers/
│   └── attendance.controller.ts        ✅ ABSENT → Telegram hook
├── routes/index.ts                     ✅ /smart-notifications
├── server.ts                           ✅ startCronJobs() + startBotPolling()
├── prisma/schema.prisma                ✅ telegramId, Settings fields, NotificationLog
└── .env                                ✅ TELEGRAM_BOT_TOKEN
```

### Migration
```
✅ 20260108000000_step11_notifications — Applied to DB
  - students.telegram_id
  - settings.telegram_enabled/token/admin_chat_id
  - settings.payment_reminder_enabled / attendance_alert_enabled
  - notification_logs jadvali
```

### API Endpoints
```
GET    /api/smart-notifications/history      — Notification logs
GET    /api/smart-notifications/stats        — Statistika
GET    /api/smart-notifications/settings     — Telegram settings
PATCH  /api/smart-notifications/settings     — Settings yangilash
POST   /api/smart-notifications/validate-bot — Bot token tekshirish
POST   /api/smart-notifications/send-test    — Test xabar
POST   /api/smart-notifications/send-group   — Guruhga xabar
POST   /api/smart-notifications/send-all     — Barchaga xabar
```

### Cron Jobs
```
09:00 Asia/Tashkent — To'lov eslatmalari
10:00 Asia/Tashkent — Muddati o'tgan to'lov
Real-time           — ABSENT → darhol Telegram
```

### O'rnatilgan Kutubxonalar
```json
"node-telegram-bot-api": "^0.66.0"
"node-cron": "^3.0.3"
"@types/node-telegram-bot-api": "^0.64.8"
"@types/node-cron": "^3.0.11"
```

---

## 💻 Frontend

### Yangi Fayllar
```
biz-crm/src/
├── pages/SmartNotifications/
│   └── index.tsx                       ✅ 3 tab: Yuborish, Tarix, Sozlamalar
└── lib/api/
    └── smart-notifications.ts          ✅ API client
```

### Yangilangan Fayllar
```
biz-crm/src/
├── routes/index.tsx                    ✅ /notifications route
├── constants/navigation.ts             ✅ Bildirishnomalar nav item (Bell icon)
├── pages/Students/StudentModal.tsx     ✅ Telegram ID maydoni
└── lib/validations/student.ts          ✅ telegramId field
```

### UI — 3 Tab

**Yuborish:**
- Rejim tanlash: Barchaga / Guruhga / Test
- HTML xabar yozish
- Natija: sent/failed/total

**Tarix:**
- Status filtri
- Jadval: qabul qiluvchi, sarlavha, status, vaqt
- ✅ Yuborildi / ❌ Xatolik / ⏳ Kutilmoqda

**Sozlamalar:**
- Toggle: Telegram ON/OFF
- Bot Token + tekshirish
- Admin Chat ID
- Toggle: To'lov eslatma ON/OFF
- Toggle: Davomat xabari ON/OFF
- Necha kun oldin dropdown

---

## 🔧 Ishlatish Qo'llanmasi

### Bot bilan ishlash
```
1. Telegram → @EduFlow_nazorat_bot → /start
2. Bot Chat ID ni beradi
3. CRM → O'quvchi tahrirlash → Telegram ID ga kiriting
4. Saqlash
```

### Bildirishnomalar sahifasi
```
CRM → Sidebar → Bildirishnomalar
- Yuborish tab: xabar yuborish
- Tarix tab: log ko'rish
- Sozlamalar tab: konfiguratsiya
```

---

## 🚀 Build Holati

### Frontend
```
✅ TypeScript:   0 errors
✅ Vite Build:   SUCCESS
✅ 3412+ modules
```

### Backend
```
✅ TypeScript:   0 errors (diagnostics)
✅ Migration:    Applied
✅ Prisma:       Generated
✅ Bot:          @EduFlow_nazorat_bot — polling active
✅ Token:        Saved in .env + DB Settings
✅ Cron:         09:00 + 10:00 scheduled
```

---

## 📋 Funksionallik Ro'yxati

| # | Funksiya | Holat |
|---|---|---|
| 1 | Telegram Bot `@EduFlow_nazorat_bot` | ✅ |
| 2 | Bot polling ishga tushadi | ✅ |
| 3 | `/start` → Chat ID qaytaradi | ✅ |
| 4 | `/id` → Chat ID qaytaradi | ✅ |
| 5 | Bot token validatsiya | ✅ |
| 6 | Test xabar yuborish | ✅ |
| 7 | O'quvchiga Telegram ID biriktirish | ✅ |
| 8 | To'lov eslatmasi (cron 09:00) | ✅ |
| 9 | Muddati o'tgan to'lov (cron 10:00) | ✅ |
| 10 | Davomat ABSENT → real-time Telegram | ✅ |
| 11 | Guruhga ommaviy xabar | ✅ |
| 12 | Barcha o'quvchilarga xabar | ✅ |
| 13 | Notification tarixi (logs) | ✅ |
| 14 | Status filtri SENT/FAILED/PENDING | ✅ |
| 15 | Notification statistikasi | ✅ |
| 16 | Telegram ON/OFF sozlamasi | ✅ |
| 17 | Eslatma kunlarini sozlash | ✅ |
| 18 | To'lov eslatma ON/OFF | ✅ |
| 19 | Davomat alert ON/OFF | ✅ |
| 20 | DB migration applied | ✅ |
| 21 | Token .env va DB ga saqlandi | ✅ |
| 22 | Server start → bot auto-start | ✅ |
| 23 | Server stop → bot auto-stop | ✅ |

---

**Step 11 Status: ✅ COMPLETED — Production Ready**

**Bot:** @EduFlow_nazorat_bot — aktiv va xabar yuboradi
