# Biz Educational Center CRM - Loyiha Strukturasi

## 📁 Umumiy Struktura

```
biz-crm/
│
├── 📂 .vscode/                      # VSCode konfiguratsiya
│   ├── settings.json                # Editor sozlamalari
│   └── extensions.json              # Tavsiya etiladigan extensionlar
│
├── 📂 public/                       # Statik fayllar
│
├── 📂 src/                          # Asosiy dastur kodi
│   │
│   ├── 📂 assets/                   # Rasmlar, fontlar, va boshqa resurslar
│   │
│   ├── 📂 components/               # Qayta ishlatiladigan UI komponentlar
│   │   ├── Sidebar.tsx              # Navigatsiya sidebar
│   │   ├── Header.tsx               # Header komponenti
│   │   └── index.ts                 # Export file
│   │
│   ├── 📂 layouts/                  # Layout komponentlar
│   │   └── MainLayout.tsx           # Asosiy layout (Sidebar + Header + Content)
│   │
│   ├── 📂 pages/                    # Sahifa komponentlar (Route komponentlar)
│   │   ├── Dashboard.tsx            # Asosiy dashboard
│   │   ├── Students.tsx             # O'quvchilar sahifasi
│   │   ├── Teachers.tsx             # O'qituvchilar sahifasi
│   │   ├── Groups.tsx               # Guruhlar sahifasi
│   │   ├── Attendance.tsx           # Davomat sahifasi
│   │   ├── Payments.tsx             # To'lovlar sahifasi
│   │   ├── Settings.tsx             # Sozlamalar sahifasi
│   │   ├── NotFound.tsx             # 404 sahifa
│   │   └── index.ts                 # Export file
│   │
│   ├── 📂 routes/                   # Routing konfiguratsiya
│   │   └── index.tsx                # React Router setup
│   │
│   ├── 📂 hooks/                    # Custom React hooks
│   │   └── index.ts                 # Hook exports
│   │
│   ├── 📂 services/                 # API va external services
│   │   └── index.ts                 # Service exports
│   │
│   ├── 📂 utils/                    # Utility funksiyalar
│   │   └── cn.ts                    # Class name utility (clsx + tailwind-merge)
│   │
│   ├── 📂 types/                    # TypeScript type definitions
│   │   └── index.ts                 # Global types
│   │
│   ├── 📂 constants/                # Konstantalar va static ma'lumotlar
│   │   └── navigation.ts            # Navigation items
│   │
│   ├── 📂 styles/                   # Global CSS fayllar
│   │   └── globals.css              # Tailwind va global styles
│   │
│   ├── App.tsx                      # Root App komponenti
│   └── main.tsx                     # Entry point
│
├── .env.example                     # Environment variables misoli
├── .gitignore                       # Git ignore fayllar
├── eslint.config.js                 # ESLint konfiguratsiya
├── index.html                       # HTML template
├── package.json                     # NPM dependencies
├── postcss.config.js                # PostCSS konfiguratsiya
├── tailwind.config.js               # Tailwind CSS konfiguratsiya
├── tsconfig.json                    # TypeScript konfiguratsiya
├── tsconfig.app.json                # TypeScript app konfiguratsiya
├── tsconfig.node.json               # TypeScript node konfiguratsiya
├── vite.config.ts                   # Vite konfiguratsiya
├── README.md                        # Loyiha haqida
├── SETUP_INSTRUCTIONS.md            # O'rnatish ko'rsatmalari
└── PROJECT_STRUCTURE.md             # Bu fayl
```

## 📋 Papkalar Va'zifalari

### `/src/components`
Qayta ishlatiladigan UI komponentlar. Har qanday sahifada ishlatilishi mumkin bo'lgan komponentlar.

**Misol:**
- Button, Input, Card komponentlar
- Modal, Dropdown komponentlar
- Sidebar, Header kabi layout elementlari

### `/src/layouts`
Layout komponentlar. Bir nechta sahifalarda umumiy bo'lgan strukturalar.

**Misol:**
- MainLayout (Sidebar + Header + Content area)
- AuthLayout (Login/Register sahifalari uchun)
- DashboardLayout

### `/src/pages`
To'liq sahifalar. Har bir fayl bitta route bilan bog'langan.

**Naming Convention:** PascalCase (Dashboard.tsx, Students.tsx)

### `/src/routes`
React Router konfiguratsiya. Barcha route'lar va ularning elementlari.

### `/src/hooks`
Custom React hooks. Komponentlarda qayta ishlatiladigan logika.

**Naming Convention:** useSomething (useAuth, useFetch, useLocalStorage)

### `/src/services`
API chaqiruvlar va external services. Backend bilan bog'lanish.

**Misol:**
- api.ts - Axios instance
- studentService.ts - Student CRUD operatsiyalari
- authService.ts - Authentication APIs

### `/src/utils`
Yordamchi funksiyalar. Umumiy utility funksiyalar.

**Misol:**
- formatters.ts - Date, currency formatters
- validators.ts - Input validation
- cn.ts - ClassName utility

### `/src/types`
TypeScript type definitions va interfaces.

**Misol:**
- models.ts - Data models (Student, Teacher, Group)
- api.ts - API request/response types
- index.ts - Global types

### `/src/constants`
Konstantalar, enum'lar, va static ma'lumotlar.

**Misol:**
- navigation.ts - Menu items
- config.ts - App configuration
- enums.ts - Status, Role enums

### `/src/styles`
Global CSS fayllar. Tailwind configuration va custom styles.

### `/src/assets`
Statik fayllar: rasmlar, fontlar, iconlar, va boshqalar.

## 🎯 Import Yo'llari

Path alias `@` sozlangan:

```typescript
// ❌ Noto'g'ri
import { Sidebar } from "../../components/Sidebar";

// ✅ To'g'ri
import { Sidebar } from "@/components";
```

## 🏗️ Arxitektura Tamoyillari

### 1. Clean Architecture
- Har bir papkaning o'ziga xos mas'uliyati bor
- Komponentlar qayta ishlatilishi mumkin
- Logika va UI ajratilgan

### 2. Type Safety
- TypeScript strict mode
- Barcha funksiyalar va komponentlar type-safe
- Interface va type'lar `/src/types` da

### 3. Scalability
- Yangi xususiyatlar qo'shish oson
- Kod o'qish va maintain qilish oson
- Test yozish uchun qulay struktura

### 4. Best Practices
- Single Responsibility Principle
- DRY (Don't Repeat Yourself)
- Naming conventions
- Code organization

## 🚀 Keyingi Qadamlar

Loyiha strukturasi tayyor. Endi quyidagilarni qo'shishingiz mumkin:

1. **Authentication** - Login/Register pages va logic
2. **API Integration** - Backend bilan bog'lanish
3. **State Management** - Zustand yoki Redux (agar kerak bo'lsa)
4. **Form Handling** - React Hook Form + Zod validation
5. **Data Tables** - TanStack Table yoki boshqa table library
6. **UI Components** - shadcn/ui komponentlarni qo'shish
7. **Error Handling** - Error boundaries va toast notifications
8. **Testing** - Vitest + React Testing Library
9. **Documentation** - Storybook (optional)
10. **CI/CD** - GitHub Actions yoki GitLab CI

---

Loyiha professional darajada tuzilgan va kengaytirishga tayyor! 🎉
