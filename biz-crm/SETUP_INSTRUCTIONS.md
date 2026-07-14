# Biz Educational Center CRM - O'rnatish Ko'rsatmalari

## 1. Dependencylarni O'rnatish

Loyiha ildizidan quyidagi buyruqni bajaring:

```bash
npm install
```

Bu quyidagi paketlarni o'rnatadi:

### Production Dependencies
- `react` - React 19
- `react-dom` - React DOM
- `react-router-dom` - Client-side routing
- `lucide-react` - Icon kutubxonasi
- `class-variance-authority` - CVA utility
- `clsx` - Class name utility
- `tailwind-merge` - Tailwind class merger

### Development Dependencies
- `typescript` - TypeScript 6
- `vite` - Build tool
- `tailwindcss` - CSS framework
- `postcss` - CSS processor
- `autoprefixer` - CSS autoprefixer
- `eslint` - Code linter
- `@types/node` - Node.js type definitions
- `@types/react` - React type definitions
- `@types/react-dom` - React DOM type definitions

## 2. Loyihani Ishga Tushirish

Development serverini ishga tushiring:

```bash
npm run dev
```

Brauzerda quyidagi manzilni oching:
```
http://localhost:5173
```

## 3. Loyiha Strukturasi

```
biz-crm/
├── src/
│   ├── components/          # UI Komponentlar
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── index.ts
│   ├── layouts/             # Layout Komponentlar
│   │   └── MainLayout.tsx
│   ├── pages/              # Sahifa Komponentlar
│   │   ├── Dashboard.tsx
│   │   ├── Students.tsx
│   │   ├── Teachers.tsx
│   │   ├── Groups.tsx
│   │   ├── Attendance.tsx
│   │   ├── Payments.tsx
│   │   ├── Settings.tsx
│   │   ├── NotFound.tsx
│   │   └── index.ts
│   ├── routes/             # Routing
│   │   └── index.tsx
│   ├── hooks/              # Custom Hooks
│   │   └── index.ts
│   ├── services/           # API Services
│   │   └── index.ts
│   ├── utils/              # Utility Functions
│   │   └── cn.ts
│   ├── types/              # TypeScript Types
│   │   └── index.ts
│   ├── assets/             # Statik Fayllar
│   ├── styles/             # CSS Fayllar
│   │   └── globals.css
│   ├── constants/          # Konstantalar
│   │   └── navigation.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## 4. Muhim Xususiyatlar

### TypeScript Strict Mode
Loyihada TypeScript strict rejimi yoqilgan:
- Type safety ta'minlangan
- Null/undefined xavfsizligi
- No implicit any

### Path Aliases
`@` alias bilan import qilish mumkin:
```typescript
import { Sidebar } from "@/components";
import { Dashboard } from "@/pages";
```

### Tailwind CSS
CSS Variables bilan konfiguratsiya qilingan:
- Light/Dark mode qo'llab-quvvatlanadi
- Custom color palette
- shadcn/ui bilan mos

### React Router
Client-side routing sozlangan:
- Nested routes
- Layout system
- 404 page

## 5. Mavjud Sahifalar

1. **Dashboard** (`/`) - Asosiy panel
2. **O'quvchilar** (`/students`) - O'quvchilar ro'yxati
3. **O'qituvchilar** (`/teachers`) - O'qituvchilar ro'yxati
4. **Guruhlar** (`/groups`) - Guruhlar ro'yxati
5. **Davomat** (`/attendance`) - Davomat tizimi
6. **To'lovlar** (`/payments`) - To'lovlar tizimi
7. **Sozlamalar** (`/settings`) - Tizim sozlamalari
8. **404** - Sahifa topilmadi

## 6. Keyingi Qadamlar

Loyiha poydevori tayyor. Endi quyidagilarni qo'shishingiz mumkin:

### Backend Integratsiya
1. API endpoints yaratish (`src/services/`)
2. Axios yoki Fetch API konfiguratsiya
3. Environment variables (.env)

### Authentication
1. Login/Register sahifalari
2. Protected routes
3. Auth context/hook
4. Token management

### CRUD Operatsiyalari
1. Students CRUD
2. Teachers CRUD
3. Groups CRUD
4. Payments CRUD

### State Management (agar kerak bo'lsa)
1. Zustand yoki Redux
2. React Query
3. Context API

### UI Components (shadcn/ui)
Kerakli komponentlarni qo'shish:
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add table
npx shadcn@latest add dialog
npx shadcn@latest add form
```

## 7. Build va Deploy

### Production Build
```bash
npm run build
```

Build natijasi `dist/` papkasiga chiqadi.

### Preview
```bash
npm run preview
```

### Deploy
- Vercel
- Netlify
- GitHub Pages
- AWS S3
- va boshqalar

## 8. Kod Stili va Best Practices

1. **TypeScript** - Barcha fayllar .tsx/.ts formatida
2. **Component Naming** - PascalCase
3. **File Naming** - PascalCase for components
4. **Clean Code** - ESLint qoidalariga rioya qiling
5. **Responsive** - Mobile-first yondashuv

## Muammolar va Yechimlar

### npm install muammosi
Agar `npm install` ishlamasa:
```bash
npm cache clean --force
npm install
```

### Port band bo'lsa
Vite default port 5173 ni ishlatadi. O'zgartirish uchun:
```bash
npm run dev -- --port 3000
```

### TypeScript xatolari
```bash
npm run build
```
Bu buyruq barcha TypeScript xatolarini ko'rsatadi.

---

Loyiha tayyor! Muvaffaqiyatli dasturlash! 🚀
