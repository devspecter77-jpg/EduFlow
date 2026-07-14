# DATABASE MUAMMOSINI HAL QILISH 🔧

## Muammo
```
Can't reach database server at ep-orange-voice-aobmi8sn-pooler.c-2.ap-southeast-1.aws.neon.tech:5432
```

**Sabab:** Internet aloqasi yoki Neon server bilan bog'lanish muammosi

---

## YECHIM 1: Internet Aloqasini Tekshiring ✅ (ENG ODDIY)

### 1. Wi-Fi/Internet ulanganligini tekshiring
- Wi-Fi yoqilganmi?
- Browser'da Google ochilayaptimi?

### 2. VPN yoqilganmi?
- Agar VPN yoqilgan bo'lsa, o'chiring
- Neon database ba'zi VPN'lar bilan ishlamaydi

### 3. Firewall tekshiring
- Windows Firewall Neon serverga ruxsat berayaptimi?
- Antivirus PostgreSQL portini bloklayaptimi?

### 4. Neon Dashboard tekshiring
1. Browserda oching: https://console.neon.tech/
2. Login qiling
3. Database'ingiz ACTIVE holatdami?
4. Agar SUSPENDED bo'lsa, "Resume" tugmasini bosing

---

## YECHIM 2: Docker bilan Local PostgreSQL 🐳 (TAVSIYA ETILADI)

### 1. Docker Desktop o'rnating (agar yo'q bo'lsa)
- Yuklab oling: https://www.docker.com/products/docker-desktop/
- O'rnating va ishga tushiring

### 2. docker-compose.yml faylini yangilang

Quyidagi kodni `c:\Users\Javohir\Desktop\EduFlow_crm\docker-compose.yml` fayliga qo'shing:

```yaml
version: '3.9'

services:
  # ─── PostgreSQL Database ──────────────────────────────────────────────────
  postgres:
    image: postgres:16-alpine
    container_name: eduflow-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: eduflow
      POSTGRES_PASSWORD: eduflow2026
      POSTGRES_DB: eduflow_crm
      POSTGRES_INITDB_ARGS: "-E UTF8"
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - eduflow-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U eduflow -d eduflow_crm"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ─── Backend API (o'zgarishsiz) ───────────────────────────────────────────
  backend:
    # ... (oldingi kod saqlanadi)
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres-data:
    driver: local
  backend-logs:
    driver: local

networks:
  eduflow-net:
    driver: bridge
```

### 3. Backend .env faylini yangilang

`c:\Users\Javohir\Desktop\EduFlow_crm\backend\.env` faylida:

```env
# LOCAL POSTGRESQL (Docker)
DATABASE_URL="postgresql://eduflow:eduflow2026@localhost:5432/eduflow_crm?schema=public"
DIRECT_URL="postgresql://eduflow:eduflow2026@localhost:5432/eduflow_crm?schema=public"
```

### 4. PostgreSQL'ni ishga tushiring

```bash
cd c:\Users\Javohir\Desktop\EduFlow_crm
docker-compose up -d postgres
```

### 5. Database'ni migrate qiling

```bash
cd c:\Users\Javohir\Desktop\EduFlow_crm\backend
npx prisma migrate deploy
node seed-plans.js
```

### 6. Backend'ni qayta ishga tushiring

```bash
cd c:\Users\Javohir\Desktop\EduFlow_crm\backend
npm run dev
```

---

## YECHIM 3: Local PostgreSQL o'rnatish (Docker'siz)

### Windows uchun PostgreSQL

1. **PostgreSQL yuklab oling:**
   - https://www.postgresql.org/download/windows/
   - PostgreSQL 16.x versiyasini tanlang

2. **O'rnating:**
   - Parol: `eduflow2026` (yoki o'zingizniki)
   - Port: `5432` (default)
   - Database: `eduflow_crm`

3. **Backend .env yangilang:**
   ```env
   DATABASE_URL="postgresql://postgres:eduflow2026@localhost:5432/eduflow_crm?schema=public"
   DIRECT_URL="postgresql://postgres:eduflow2026@localhost:5432/eduflow_crm?schema=public"
   ```

4. **Migrate va seed:**
   ```bash
   cd c:\Users\Javohir\Desktop\EduFlow_crm\backend
   npx prisma migrate deploy
   node seed-plans.js
   ```

---

## TEZKOR TEST

Database ishlayotganini tekshirish:

```bash
cd c:\Users\Javohir\Desktop\EduFlow_crm\backend
npx prisma db pull
```

Agar xato chiqmasa, database ishlayapti! ✅

---

## QAYSI YECHIMNI TANLASH?

| Yechim | Qachon Ishlatish | Qiyinlik |
|--------|------------------|----------|
| **1. Internet Tiklash** | Internet muammosi bo'lsa | ⭐ Oson |
| **2. Docker PostgreSQL** | Ishonchli va tez | ⭐⭐ O'rta |
| **3. Local PostgreSQL** | Docker yo'q bo'lsa | ⭐⭐⭐ Qiyin |

**Tavsiya:** Docker yordamida local PostgreSQL ishlatish - eng yaxshi variant!

---

## Muammolar va Yechimlar

### "Docker not found"
- Docker Desktop o'rnatilmagan
- https://docker.com dan yuklab oling

### "Port 5432 already in use"
- Kompyuterda PostgreSQL allaqachon o'rnatilgan
- Boshqa portni ishlating: `5433:5432`

### "Permission denied"
- Docker Desktop Administrator sifatida ishga tushiring
- Windows Firewall'ni tekshiring

---

## Yordam Kerakmi?

1. Internet aloqangizni tekshiring
2. Docker Desktop o'rnating
3. PostgreSQL'ni local ishga tushiring
4. Backend'ni qayta ishga tushiring

**Hammasi ishlayotganini bilish uchun:**
```bash
# Backend terminal'da:
npm run dev

# Agar "Server running on port 5000" ko'rsatsa - ISHLAYAPTI! ✅
```
