# EduFlow CRM — O'quv Markazlar uchun SaaS CRM

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql)](https://neon.tech/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**EduFlow CRM** — O'zbekistondagi o'quv markazlar uchun professional multi-tenant SaaS tizimi. Talabalar, o'qituvchilar, guruhlar, to'lovlar, davomat va hisobotlarni boshqarish uchun to'liq yechim.

---

## 📋 Xususiyatlar

### Asosiy Funksiyalar
- ✅ **Talabalar boshqaruvi** — To'liq CRUD, to'lov kuzatuvi, guruhlar
- ✅ **O'qituvchilar** — Maosh, tajriba, guruhlar, ish davri
- ✅ **Guruhlar** — Jadval, narx, maksimal talabalar soni
- ✅ **Davomat** — Kunlik belgilash, Telegram ogohlantirishlari
- ✅ **To'lovlar** — Oylik/yillik, muddati o'tganlar, eslatmalar
- ✅ **Analytics & Hisobotlar** — 5 tur hisobot, Excel/PDF eksport
- ✅ **Telegram Bot** — Aqlli bildirishnomalar, to'lov eslatmalari

### Super Admin Panel
- ✅ **Multi-Tenant SaaS** — Har bir markaz izolyatsiyalangan
- ✅ **Obuna boshqaruvi** — FREE / STANDARD / PREMIUM tariflar
- ✅ **Avtomatik bloklash** — Muddati tugagan obunalar
- ✅ **Impersonation** — Markaz admini sifatida kirish
- ✅ **Markazlar CRUD** — Yaratish, tahrirlash, bloklash

### Texnik Xususiyatlar (Step 13)
- ✅ **Enterprise Security** — XSS, CSRF, SQL injection himoyasi
- ✅ **Brute Force Protection** — 10 urinish / 15 daqiqa
- ✅ **Rate Limiting** — IP-ga asoslangan cheklash
- ✅ **Structured Logging** — JSON logs, error tracking
- ✅ **Performance Optimized** — Code splitting, lazy loading
- ✅ **Docker Ready** — Docker Compose, PM2, Nginx
- ✅ **Health Monitoring** — /health va /health/detailed endpoints

### Billing & Subscription (Step 15)
- ✅ **Trial Period** — 10 kun bepul sinov
- ✅ **Premium Subscription** — 200,000 UZS/oy
- ✅ **Manual Payment** — Humo/Visa carta orqali
- ✅ **Payment Requests** — Admin to'lov so'rovi yuboradi
- ✅ **Super Admin Approval** — To'lovni tasdiqlash/rad etish
- ✅ **READ-ONLY Mode** — Muddati tugasa CRUD bloklangan
- ✅ **Subscription Banner** — Muddati tugash ogohlantirishi
- ✅ **Plan Limits** — Student/Teacher/Group limitlari

---

## 🏗️ Arxitektura

```
EduFlow CRM/
├── backend/          → Express + TypeScript + Prisma
│   ├── src/
│   │   ├── controllers/   → API handlers
│   │   ├── services/      → Business logic
│   │   ├── repositories/  → Data access
│   │   ├── middleware/    → Auth, security, logging
│   │   ├── routes/        → API routes
│   │   ├── validators/    → Zod schemas
│   │   └── utils/         → Helpers
│   ├── prisma/schema.prisma
│   └── Dockerfile
│
├── biz-crm/          → React 19 + TypeScript + Vite
│   ├── src/
│   │   ├── pages/         → Route components
│   │   ├── components/    → Reusable UI
│   │   ├── contexts/      → Auth, Theme, Toast
│   │   ├── lib/api/       → API client
│   │   └── utils/         → Helpers
│   ├── nginx.conf
│   └── Dockerfile
│
└── docker-compose.yml
```

**Tech Stack:**
- **Backend:** Node.js 20, Express, TypeScript 5, Prisma ORM, PostgreSQL (Neon)
- **Frontend:** React 19, TypeScript 6, Vite 8, Tailwind CSS, Recharts
- **Auth:** JWT + Refresh Tokens, bcrypt
- **Security:** Helmet, CORS, Rate Limiting, Input Sanitization
- **Cron:** node-cron (to'lov eslatmalari, obuna tekshirish)
- **Notifications:** Telegram Bot API

---

## 🚀 Tez Boshlash

### Talablar
- Node.js 20+
- PostgreSQL (Neon tavsiya etiladi)
- npm yoki yarn

### 1. Loyihani Klonlash
```bash
git clone https://github.com/your-org/eduflow-crm.git
cd eduflow-crm
```

### 2. Backend Sozlash
```bash
cd backend
npm install
cp .env.example .env
# .env faylni to'ldiring (DATABASE_URL, JWT_SECRET, etc.)
npx prisma migrate dev
npx prisma generate
node seed-plans.js
node create-superadmin.js
npm run dev
```

### 3. Frontend Sozlash
```bash
cd ../biz-crm
npm install
cp .env.example .env
# VITE_API_URL ni sozlang (default: http://localhost:5000/api)
npm run dev
```

### 4. Brauzerda Ochish
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health Check: http://localhost:5000/api/health

---

## 📦 Production Deployment

### Docker bilan (tavsiya etiladi)
```bash
# Barcha servicesni ishga tushirish
docker-compose up -d

# Loglarni ko'rish
docker-compose logs -f

# To'xtatish
docker-compose down
```

### Manual Deployment

#### Backend (PM2)
```bash
cd backend
npm run build
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### Frontend (Nginx)
```bash
cd biz-crm
npm run build
# dist/ papkasini Nginx static foldergiga ko'chiring
```

### Vercel + Koyeb + Neon
- **Frontend:** Vercel
- **Backend:** Koyeb
- **Database:** Neon PostgreSQL

To'liq ko'rsatmalar: [deployment-readiness.md](./deployment-readiness.md)

---

## 🔐 Security

### Step 13 da qo'shilgan:
- ✅ **Brute Force Protection** — 10 failed attempts → 30 min block
- ✅ **XSS Prevention** — Input/output sanitization
- ✅ **SQL Injection** — Prisma ORM + parameterized queries
- ✅ **CSRF Protection** — SameSite cookies + origin validation
- ✅ **Rate Limiting** — 300 requests / minute per IP
- ✅ **Security Headers** — Helmet + custom headers
- ✅ **User Agent Validation** — Block known attack tools
- ✅ **Suspicious Request Detection** — Pattern-based blocking

### Environment Variables
```bash
# Generate JWT secrets (64 chars)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Production checklist:
- NODE_ENV=production
- BCRYPT_ROUNDS=12
- Strong JWT secrets
- Correct CORS_ORIGIN
```

---

## 📊 API Documentation

### Health Endpoints
```
GET  /api/health           → Basic health check (public)
GET  /api/health/detailed  → System monitoring (admin only)
```

### Auth Endpoints
```
POST /api/auth/register    → Yangi foydalanuvchi ro'yxatdan o'tkazish
POST /api/auth/login       → Tizimga kirish
POST /api/auth/refresh     → Access token yangilash
POST /api/auth/logout      → Tizimdan chiqish
GET  /api/auth/me          → Joriy foydalanuvchi
```

### Main Resources
```
/api/students      → Talabalar CRUD
/api/teachers      → O'qituvchilar CRUD
/api/groups        → Guruhlar CRUD
/api/attendances   → Davomat
/api/payments      → To'lovlar
/api/reports       → Hisobotlar
/api/dashboard     → Dashboard stats
```

### Super Admin
```
GET    /api/super-admin/stats           → Dashboard
GET    /api/super-admin/centers         → Markazlar ro'yxati
POST   /api/super-admin/centers         → Yangi markaz
PATCH  /api/super-admin/centers/:id     → Markazni tahrirlash
DELETE /api/super-admin/centers/:id     → O'chirish
POST   /api/super-admin/impersonate/:id → Markaz admini sifatida kirish
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm run lint
npm run build
npx prisma validate
```

### Frontend Tests
```bash
cd biz-crm
npm run lint
npm run build
```

### Load Testing
```bash
# Install autocannon
npm install -g autocannon

# Test health endpoint
autocannon -c 100 -d 10 http://localhost:5000/api/health
```

---

## 📝 Scripts

### Backend
```bash
npm run dev              # Development server
npm run build            # Build TypeScript
npm start                # Production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio
```

### Frontend
```bash
npm run dev    # Development server (Vite)
npm run build  # Production build
npm run preview # Preview production build
npm run lint   # ESLint
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open Pull Request

**Code Style:**
- TypeScript strict mode
- ESLint + Prettier
- Conventional Commits

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/your-org/eduflow-crm/issues)
- **Telegram:** @your_support_bot
- **Email:** support@eduflow.uz

---

## 📄 License

MIT License — see [LICENSE](LICENSE) file.

---

## 🎉 Changelog

### v1.0.0 — Step 13 (2026-07-09)
- ✅ Enterprise security middleware
- ✅ Brute force protection
- ✅ Structured logging
- ✅ Performance optimization
- ✅ Docker + PM2 support
- ✅ Health monitoring
- ✅ Production-ready deployment

### Previous Releases
- **Step 12:** Super Admin Panel + Multi-Tenant SaaS
- **Step 11:** Telegram Bot Integration
- **Step 10:** Notifications + Calendar
- **Step 9.1:** Excel/PDF Export System
- **Step 9:** Reports Module
- **Step 8:** Settings + Audit Logs
- **Steps 1-7:** Core CRUD features

---

**Built with ❤️ by Kiro AI Assistant**
