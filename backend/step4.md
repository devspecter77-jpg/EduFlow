# Step 4 — Authentication, Landing Page, Production Tayyorlash

**Status:** ✅ YAKUNLANDI — PRODUCTION READY  
**Sana:** 03.07.2026  
**Build natijasi:** Frontend ✅ 0 errors | Backend ✅ 0 errors

---

## 1. Authentication System

### 1.1 Prisma Schema

**Fayl:** `backend/prisma/schema.prisma`

```prisma
enum Role {
  ADMIN
  MANAGER
  TEACHER
}

model User {
  id            String         @id @default(cuid())
  centerName    String         @map("center_name")
  fullName      String         @map("full_name")
  phone         String         @unique
  password      String
  role          Role           @default(MANAGER)
  isActive      Boolean        @default(true) @map("is_active")
  refreshTokens RefreshToken[]
  createdAt     DateTime       @default(now()) @map("created_at")
  updatedAt     DateTime       @updatedAt @map("updated_at")
  @@map("users")
  @@index([phone])
  @@index([role])
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String   @map("user_id")
  expiresAt DateTime @map("expires_at")
  isRevoked Boolean  @default(false) @map("is_revoked")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  @@map("refresh_tokens")
  @@index([userId])
  @@index([token])
  @@index([expiresAt])
}
```

**Migration:** `20260703064825_phone_auth_uzbek`

---

### 1.2 API Endpoints

| Method | Endpoint | Tavsif | Access |
|--------|----------|--------|--------|
| POST | `/api/auth/register` | Ro'yxatdan o'tish | Public |
| POST | `/api/auth/login` | Kirish (telefon + parol) | Public |
| POST | `/api/auth/refresh` | Access token yangilash | Public |
| POST | `/api/auth/logout` | Chiqish | Public |
| POST | `/api/auth/logout-all` | Barcha qurilmadan chiqish | Private |
| GET | `/api/auth/me` | Joriy foydalanuvchi profili | Private |
| GET | `/api/auth/admin-only` | Admin test | Admin |
| GET | `/api/auth/manager-or-admin` | Manager/Admin test | Manager/Admin |

---

### 1.3 JWT Token Tizimi

- **Access Token:** 7 kun, `{ userId, email(=phone), role }`
- **Refresh Token:** 30 kun (rememberMe=true), 7 kun (oddiy)
- **Token Rotation:** Har refresh da yangi juft token
- **Revoke:** Individual (`/logout`) va barcha qurilmalar (`/logout-all`)
- **HTTP-only cookie:** Refresh token cookie da saqlanadi

---

### 1.4 Validatsiya

**Fayl:** `backend/src/validators/auth.validator.ts`  
**Fayl:** `biz-crm/src/lib/validations/auth.ts`

Frontend va Backend **bir xil Zod sxema** ishlatadi.

| Maydon | Qoida |
|--------|-------|
| centerName | 3–100 belgi |
| fullName | 3–100 belgi |
| phone | `/^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/` |
| password | Kamida 8 belgi |
| confirmPassword | password bilan bir xil |

**Telefon transformatsiya:**
- UI: `+998 91 405 84 81` (formatlangan, 2-3-2-2)
- DB: `+998914058481` (bo'shliqsiz, `.replace(/\s/g, '')`)

---

### 1.5 Error Messages (O'zbek tilida)

Barcha xatolar o'zbek tilida:

| Vaziyat | Xabar |
|---------|-------|
| Telefon band | "Bu telefon raqam bilan foydalanuvchi allaqachon ro'yxatdan o'tgan" |
| Telefon topilmadi | "Telefon raqam yoki parol noto'g'ri" |
| Parol xato | "Telefon raqam yoki parol noto'g'ri" |
| Hisob faol emas | "Sizning hisobingiz faolsizlantirilgan" |
| Token noto'g'ri | "Noto'g'ri yoki muddati tugagan token" |
| Ruxsat yo'q | "Bu resursga kirishga ruxsatingiz yo'q" |
| DB unique | "Bu ma'lumot allaqachon mavjud" |
| DB not found | "Ma'lumot topilmadi" |
| Server xato | "Ichki server xatosi" |

---

## 2. Frontend Auth Pages

### 2.1 Login (`/login`)

**Fayl:** `biz-crm/src/pages/Auth/Login.tsx`

- Telefon input (default `+998 `, auto-format 2-3-2-2)
- Parol input (ko'rish/yashirish)
- "Eslab qolish" checkbox (native `<input type="checkbox">`)
- Error xabar bloki
- Orqaga tugma, theme toggle
- "Ro'yxatdan o'tish" link

### 2.2 Register (`/register`)

**Fayl:** `biz-crm/src/pages/Auth/Register.tsx`

- O'quv markaz nomi
- Ism familya
- Telefon (default `+998 `, auto-format 2-3-2-2)
- Parol (kamida 8 belgi)
- Parolni tasdiqlang

**Olib tashlangan:**
- Terms & Conditions checkbox
- "Parolni unutdingizmi?" tugmasi
- Kuchli parol regex talablari

---

## 3. Landing Page (13 Bo'lim)

**Fayl:** `biz-crm/src/pages/Landing/`

| Bo'lim | Komponent |
|--------|-----------|
| Navbar | `Navbar.tsx` |
| Hero | `Hero.tsx` |
| Stats | `Stats.tsx` |
| Features | `Features.tsx` |
| WhyEduFlow | `WhyEduFlow.tsx` |
| DashboardShowcase | `DashboardShowcase.tsx` |
| Pricing | `Pricing.tsx` |
| Testimonials | `Testimonials.tsx` |
| FAQ | `FAQ.tsx` |
| CTA | `CTA.tsx` |
| Contact | `Contact.tsx` |
| Footer | `Footer.tsx` |

### 3.1 Navbar Auth State

**Authenticated:** "Profil" tugmasi → `/dashboard`  
**Guest:** "Kirish" + "Ro'yxatdan o'tish" tugmalari

### 3.2 Contact Ma'lumotlari

| Tur | Qiymat |
|-----|--------|
| Telefon | +998 91 405 84 81 |
| Email | eduflowmarkaz2026@gmail.com |
| Telegram | @RootDev07 |
| Instagram | @eduflow__support |

### 3.3 Iconlar

- Faqat **Lucide React** iconlari
- Emoji yo'q
- Telegram: rasmiy paper plane SVG
- Instagram: rasmiy camera SVG

---

## 4. Theme System

**Fayl:** `biz-crm/src/contexts/ThemeContext.tsx`

```
localStorage['theme'] → 'light' | 'dark'
→ <html> class: dark/light
→ Tailwind dark: prefix ishlaydi
```

**Qamrab olgan sahifalar:**
- Landing Page (Navbar toggle)
- Login va Register
- Dashboard (Header toggle)
- 404 / 500 sahifalari

---

## 5. Logo Integratsiyasi

**Fayl:** `biz-crm/public/photo_2026-06-12_11-17-02.jpg`

| Joy | O'lcham |
|-----|---------|
| Landing Navbar | 32×32px |
| Landing Footer | 32×32px |
| Login | 64×64px |
| Register | 64×64px |
| Dashboard Sidebar | 40×40px |
| Mobile Sidebar | 40×40px |
| 3D Loader Cube (6 yuz) | 80×80px |
| Browser Favicon | — |

---

## 6. 3D Page Loader

**Fayl:** `biz-crm/src/components/common/PageLoader.tsx`  
**CSS:** `biz-crm/src/styles/globals.css`

**Animatsiyalar:**
- 3 ta orbital ring (2.4s / 3.2s / 4.0s)
- Pulsing glow backdrop
- 3D cube — logo barcha 6 yuzda (5s rotation)
- Floating particles (2 ta)
- Progress bar 0→100% (2.2s)
- Brand name fade-in

**Ish vaqti:** 2.2 soniya

---

## 7. Dashboard UI

### 7.1 Header

**Fayl:** `biz-crm/src/components/layout/Header.tsx`  
**Fayl:** `biz-crm/src/components/layout/MobileHeader.tsx`

- O'ng tomonda: Bell + User dropdown
- Dropdown ichida:
  - Avatar + `user.fullName` + `user.phone`
  - "Profil" → `/dashboard/profile`
  - "Chiqish" → logout + `/`

### 7.2 Sidebar

**Fayl:** `biz-crm/src/components/layout/Sidebar.tsx`  
**Fayl:** `biz-crm/src/components/layout/MobileSidebar.tsx`

- Tepa: Logo + `user.centerName` + "CRM"
- Nav links: `/dashboard/*`
- Past:
  - "Bosh sahifa" → `/` (logout qilmasdan)
  - "Chiqish" → logout + `/`

### 7.3 Navigation Links

**Fayl:** `biz-crm/src/constants/navigation.ts`

Barcha linklar `/dashboard/*` formatida:

| Title | Href |
|-------|------|
| Dashboard | `/dashboard` |
| O'quvchilar | `/dashboard/students` |
| O'qituvchilar | `/dashboard/teachers` |
| Guruhlar | `/dashboard/groups` |
| Davomat | `/dashboard/attendance` |
| To'lovlar | `/dashboard/payments` |
| Sozlamalar | `/dashboard/settings` |

---

## 8. Error Pages

### 8.1 404 Not Found

**Fayl:** `biz-crm/src/pages/NotFound.tsx`

- Logo + "404" + "Sahifa topilmadi"
- "Bosh sahifa" + "Orqaga" tugmalari
- Dark/Light mode support
- Route: `*` (wildcard)

### 8.2 500 Error Boundary

**Fayl:** `biz-crm/src/components/common/ErrorBoundary.tsx`

- React Class Component (`getDerivedStateFromError`)
- "Xatolik yuz berdi" + "Yangilash" + "Bosh sahifa"
- `App.tsx` da barcha sahifalarni o'rab turadi

### 8.3 Network Error

**Fayl:** `biz-crm/src/components/common/NetworkError.tsx`

- WifiOff icon + "Internet aloqasi yo'q"
- "Qayta urinish" tugmasi
- `onRetry` prop qabul qiladi

---

## 9. SEO

### 9.1 index.html

**Fayl:** `biz-crm/index.html`

```html
<html lang="uz">
<meta name="description" content="EduFlow CRM - O'quv markazlar uchun...">
<meta name="keywords" content="eduflow, crm, o'quv markaz...">
<meta name="robots" content="index, follow">
<meta property="og:title" content="EduFlow CRM">
<meta property="og:description" content="...">
<meta property="og:image" content="/photo_2026-06-12_11-17-02.jpg">
<meta name="twitter:card" content="summary">
```

### 9.2 robots.txt

**Fayl:** `biz-crm/public/robots.txt`

```
User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /api/
Sitemap: https://eduflow-crm.vercel.app/sitemap.xml
```

### 9.3 sitemap.xml

**Fayl:** `biz-crm/public/sitemap.xml`

| URL | Priority |
|-----|----------|
| `/` | 1.0 |
| `/login` | 0.8 |
| `/register` | 0.8 |

---

## 10. Production Deployment

### 10.1 Stack

| Xizmat | Platform |
|--------|----------|
| Frontend | Vercel |
| Backend | Koyeb |
| Database | Neon PostgreSQL |

### 10.2 CORS

```env
CORS_ORIGIN=https://your-app.vercel.app,http://localhost:5173
```

### 10.3 Neon Prisma

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")    // pooled — queries
  directUrl = env("DIRECT_URL")      // direct — migrations
}
```

### 10.4 Retry Logic

- 5 urinish × 3 soniya
- Neon cold start uchun

### 10.5 Environment Variables

**Backend `.env`:**
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...?pgbouncer=true
DIRECT_URL=postgresql://...
JWT_SECRET=<64-char-hex>
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=<64-char-hex>
JWT_REFRESH_EXPIRES_IN=30d
CORS_ORIGIN=https://your-app.vercel.app
CORS_CREDENTIALS=true
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend `.env`:**
```env
VITE_API_URL=https://your-backend.koyeb.app/api
```

### 10.6 Deploy Buyruqlari

**Vercel:**
- Root: `biz-crm`
- Build: `npm run build`
- Output: `dist`
- Env: `VITE_API_URL`

**Koyeb:**
- Root: `backend`
- Build: `npm install && npm run prisma:generate && npm run build`
- Start: `npm start`
- Barcha env variables qo'shilsin

---

## 11. Kod Sifati

### 11.1 Console Statements Tozalandi

| Fayl | Holat |
|------|-------|
| `backend/src/server.ts` | `console.log` → `process.stdout.write` |
| `backend/src/config/database.ts` | `console.log/error` → `process.stdout/stderr` |
| `backend/src/config/env.ts` | `console.error` → `process.stderr` |
| `backend/src/middleware/errorHandler.ts` | `console.error` olib tashlandi |
| `backend/src/controllers/health.controller.ts` | `console.error` olib tashlandi |
| `biz-crm/src/contexts/AuthContext.tsx` | `console.error` olib tashlandi |
| `biz-crm/src/utils/helpers.ts` | `console.error` olib tashlandi |
| `biz-crm/src/hooks/useLocalStorage.ts` | `console.error` olib tashlandi |
| `biz-crm/src/pages/UIShowcase/index.tsx` | `console.log` olib tashlandi |

### 11.2 Unused Imports Tozalandi

| Fayl | O'chirilgan |
|------|-------------|
| `Login.tsx` | `Checkbox` import |
| `server.ts` | `MESSAGES` import |
| `Footer.tsx` | `MessageCircle` import |

### 11.3 Build Natijalari

```
Frontend (Vite):
  ✓ 2623 modules transformed
  ✓ built in 1.64s
  ✓ 0 TypeScript errors

Backend (tsc):
  ✓ 0 errors
  ✓ 0 warnings
```

---

## 12. Barcha O'zgartirilgan/Yaratilgan Fayllar

### Backend

| Fayl | Holat | Izoh |
|------|-------|------|
| `prisma/schema.prisma` | ✅ | Phone-based auth, centerName |
| `prisma/migrations/20260703064825_*` | ✅ | Production migration |
| `src/validators/auth.validator.ts` | ✅ | O'zbek xatolar, telefon regex |
| `src/services/auth.service.ts` | ✅ | Phone login, o'zbek xatolar |
| `src/repositories/auth.repository.ts` | ✅ | `findUserByPhone` |
| `src/controllers/auth.controller.ts` | ✅ | centerName, phone |
| `src/routes/auth.routes.ts` | ✅ | 8 ta endpoint |
| `src/middleware/auth.middleware.ts` | ✅ | O'zbek xatolar |
| `src/middleware/errorHandler.ts` | ✅ | O'zbek xatolar, no console |
| `src/middleware/notFound.ts` | ✅ | O'zbek xabar |
| `src/utils/jwt.ts` | ✅ | O'zbek xatolar |
| `src/config/env.ts` | ✅ | No console, stderr |
| `src/config/database.ts` | ✅ | No console, stderr |
| `src/config/cors.ts` | ✅ | Multi-origin support |
| `src/controllers/health.controller.ts` | ✅ | No console |
| `src/server.ts` | ✅ | process.stdout, no MESSAGES |
| `.env.example` | ✅ | To'liq hujjatlar |

### Frontend

| Fayl | Holat | Izoh |
|------|-------|------|
| `src/pages/Auth/Login.tsx` | ✅ | Phone, O'zbek, native checkbox |
| `src/pages/Auth/Register.tsx` | ✅ | 5 maydon, no terms |
| `src/pages/NotFound.tsx` | ✅ | Yangi — 404 sahifa |
| `src/components/common/ErrorBoundary.tsx` | ✅ | Yangi — 500 sahifa |
| `src/components/common/NetworkError.tsx` | ✅ | Yangi — internet xato |
| `src/components/common/PageLoader.tsx` | ✅ | 3D cube loader |
| `src/components/common/Logo.tsx` | ✅ | Reusable logo |
| `src/components/common/index.ts` | ✅ | 4 ta export |
| `src/components/layout/Header.tsx` | ✅ | User dropdown |
| `src/components/layout/Sidebar.tsx` | ✅ | centerName, home+logout |
| `src/components/layout/MobileHeader.tsx` | ✅ | User dropdown |
| `src/components/layout/MobileSidebar.tsx` | ✅ | centerName, home+logout |
| `src/pages/Landing/Navbar.tsx` | ✅ | Auth state, Profil button |
| `src/pages/Landing/Contact.tsx` | ✅ | Haqiqiy ma'lumotlar, Telegram SVG |
| `src/pages/Landing/Footer.tsx` | ✅ | Haqiqiy linklar, Telegram SVG |
| `src/contexts/AuthContext.tsx` | ✅ | No console, clean |
| `src/lib/api/auth.ts` | ✅ | User: phone, centerName |
| `src/lib/api/client.ts` | ✅ | Token refresh interceptor |
| `src/lib/validations/auth.ts` | ✅ | Phone, O'zbek, no terms |
| `src/constants/navigation.ts` | ✅ | /dashboard/* routes |
| `src/constants/routes.ts` | ✅ | Barcha routelar |
| `src/App.tsx` | ✅ | ErrorBoundary wrap |
| `src/routes/index.tsx` | ✅ | Barcha routelar |
| `src/styles/globals.css` | ✅ | 3D animatsiyalar |
| `src/utils/helpers.ts` | ✅ | No console |
| `src/hooks/useLocalStorage.ts` | ✅ | No console |
| `src/pages/UIShowcase/index.tsx` | ✅ | No console.log |
| `index.html` | ✅ | lang="uz", SEO meta |
| `public/robots.txt` | ✅ | Yangi |
| `public/sitemap.xml` | ✅ | Yangi |
| `vite.config.ts` | ✅ | optimizeDeps |

### Root

| Fayl | Holat | Izoh |
|------|-------|------|
| `deployment-readiness.md` | ✅ | To'liq deploy qo'llanmasi |
| `package.json` | ✅ | workspaces olib tashlandi |

---

## 13. Test Senariylari

### Ro'yxatdan O'tish
```
URL: /register
1. O'quv markaz nomi: "Test Academy"
2. Ism familya: "Ali Valiyev"
3. Telefon: +998 91 405 84 81
4. Parol: 12345678
5. Parolni tasdiqlang: 12345678
→ Dashboard ga yo'naltiriladi ✅
```

### Kirish
```
URL: /login
1. Telefon: +998 91 405 84 81
2. Parol: 12345678
→ Dashboard ga yo'naltiriladi ✅
```

### Bosh Sahifaga Qaytish (Logout qilmasdan)
```
Sidebar → "Bosh sahifa"
→ Landing page ochiladi ✅
→ Session saqlanib qoladi ✅
→ Navbar da "Profil" ko'rinadi ✅
```

### Logout
```
Sidebar → "Chiqish"  YOKI  Header dropdown → "Chiqish"
→ Token tozalanadi ✅
→ Landing page ga yo'naltiriladi ✅
→ Navbar da "Kirish" + "Ro'yxatdan o'tish" ko'rinadi ✅
```

### Token Refresh
```
Access token muddati tugaganda
→ Avtomatik refresh ✅
→ Foydalanuvchi logout bo'lmaydi ✅
```

### 404 Sahifa
```
Mavjud bo'lmagan URL kiriting
→ 404 sahifa ko'rinadi ✅
→ "Bosh sahifa" + "Orqaga" tugmalari ✅
```

---

## 14. Eslatmalar

1. **Telefon:** `+998 XX XXX XX XX` formatda kiriting (avtomatik format)
2. **Parol:** Kamida 8 belgi (murakkab talablar yo'q)
3. **JWT Secrets:** `node -e "require('crypto').randomBytes(64).toString('hex')"`
4. **Migration:** `npx prisma migrate deploy` (production)
5. **CORS:** Vercel domenini `CORS_ORIGIN` ga qo'shing
6. **Neon:** `DIRECT_URL` migrations uchun kerak

---

**Step 4 to'liq yakunlandi va production tayyor!**  
**Keyingi:** Step 5 — Dashboard CRUD Operations
