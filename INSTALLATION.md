# EduFlow CRM — Installation Guide

Complete step-by-step installation guide for development and production environments.

---

## 📋 Prerequisites

### Required Software
- **Node.js** 20.x or higher ([Download](https://nodejs.org/))
- **npm** 10.x or higher (comes with Node.js)
- **PostgreSQL** 14+ or Neon account ([neon.tech](https://neon.tech))
- **Git** ([Download](https://git-scm.com/))

### Optional (for production)
- **Docker** & Docker Compose ([Download](https://docs.docker.com/get-docker/))
- **PM2** (`npm install -g pm2`)
- **Nginx** (for frontend static hosting)

---

## 🚀 Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/eduflow-crm.git
cd eduflow-crm
```

### 2. Backend Setup

#### 2.1 Install Dependencies
```bash
cd backend
npm install
```

#### 2.2 Configure Environment
```bash
cp .env.example .env
```

Edit `.env` file:
```env
NODE_ENV=development
PORT=5000
API_PREFIX=/api

# Neon PostgreSQL (get from neon.tech dashboard)
DATABASE_URL=postgresql://user:password@host-pooler/dbname?sslmode=require
DIRECT_URL=postgresql://user:password@host/dbname?sslmode=require

# Generate secrets (run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your-64-character-hex-string-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-another-64-character-hex-string-here
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=http://localhost:5173
CORS_CREDENTIALS=true

# Security
BCRYPT_ROUNDS=10

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=300
```

#### 2.3 Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed plans (FREE, STANDARD, PREMIUM)
node seed-plans.js

# Create Super Admin user
node create-superadmin.js
# Phone: +998900000000
# Password: SuperAdmin2026
```

#### 2.4 Start Backend
```bash
npm run dev
```

Backend runs on: **http://localhost:5000**

---

### 3. Frontend Setup

#### 3.1 Install Dependencies
```bash
cd ../biz-crm
npm install
```

#### 3.2 Configure Environment
```bash
cp .env.example .env
```

Edit `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

#### 3.3 Start Frontend
```bash
npm run dev
```

Frontend runs on: **http://localhost:5173**

---

### 4. Verify Installation

#### Backend Health Check
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "uptime": "5m 30s",
  "database": {
    "status": "connected",
    "latencyMs": 12
  }
}
```

#### Frontend
Open browser: http://localhost:5173

You should see the EduFlow CRM landing page.

---

## 🐳 Docker Installation

### 1. Build and Run All Services
```bash
# From project root
docker-compose up -d
```

This will start:
- Backend API on port **5000**
- Frontend on port **80**

### 2. View Logs
```bash
docker-compose logs -f
```

### 3. Stop Services
```bash
docker-compose down
```

### 4. Rebuild After Code Changes
```bash
docker-compose up -d --build
```

---

## 📦 Production Deployment

### Option 1: Docker (Recommended)

#### 1.1 Production Environment Variables
Create `.env.production` in `backend/`:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=your-neon-pooled-url
DIRECT_URL=your-neon-direct-url
JWT_SECRET=your-production-jwt-secret-64-chars
JWT_REFRESH_SECRET=your-production-refresh-secret-64-chars
CORS_ORIGIN=https://your-domain.com
BCRYPT_ROUNDS=12
```

#### 1.2 Deploy with Docker Compose
```bash
docker-compose -f docker-compose.yml up -d
```

---

### Option 2: Manual Deployment

#### 2.1 Backend (PM2)

**Build:**
```bash
cd backend
npm ci --only=production
npm run build
```

**Run migrations:**
```bash
npx prisma migrate deploy
```

**Start with PM2:**
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

**Monitor:**
```bash
pm2 status
pm2 logs eduflow-backend
pm2 monit
```

#### 2.2 Frontend (Nginx)

**Build:**
```bash
cd biz-crm
npm ci
npm run build
```

**Nginx Configuration** (`/etc/nginx/sites-available/eduflow`):
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/eduflow/dist;
    index index.html;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Enable and restart:**
```bash
sudo ln -s /etc/nginx/sites-available/eduflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### Option 3: Vercel + Koyeb + Neon

#### 3.1 Database (Neon)
1. Create account: [neon.tech](https://neon.tech)
2. Create project
3. Copy **Pooled** and **Direct** connection strings

#### 3.2 Backend (Koyeb)
1. Connect GitHub repo
2. Set root directory: `backend`
3. Build command: `npm install && npx prisma generate && npm run build`
4. Run command: `npm start`
5. Add environment variables (see `.env.example`)
6. Deploy

#### 3.3 Frontend (Vercel)
1. Import GitHub repo
2. Set root directory: `biz-crm`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.koyeb.app/api
   ```
6. Deploy

---

## 🔧 Troubleshooting

### Backend won't start
**Error:** `DATABASE_URL is required`
- **Solution:** Check `.env` file, ensure `DATABASE_URL` is set

**Error:** `ECONNREFUSED`
- **Solution:** Check PostgreSQL is running or Neon connection string is correct

**Error:** `P1001: Can't reach database server`
- **Solution:** Verify firewall allows outbound connections to Neon

### Frontend can't connect to backend
**Error:** Network Error or CORS
- **Solution:** 
  1. Check backend is running on port 5000
  2. Verify `VITE_API_URL` in frontend `.env`
  3. Check backend `CORS_ORIGIN` matches frontend URL

### Prisma errors
**Error:** `Schema file not found`
- **Solution:** Run `npx prisma generate` first

**Error:** `Migration failed`
- **Solution:** Check database connection, ensure `DIRECT_URL` is set (not pooled)

### Docker issues
**Error:** `port already in use`
- **Solution:** 
  ```bash
  # Stop conflicting service
  sudo lsof -i :5000  # find process
  sudo kill -9 <PID>
  
  # Or change port in docker-compose.yml
  ```

---

## ✅ Post-Installation Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads in browser
- [ ] Health check returns `"status": "healthy"`
- [ ] Can login with Super Admin credentials
- [ ] Database migrations applied
- [ ] Plans seeded (FREE, STANDARD, PREMIUM)
- [ ] Logs directory exists and writable
- [ ] Environment variables secured (not committed to git)
- [ ] JWT secrets are strong (64 chars)
- [ ] CORS_ORIGIN matches your domain

---

## 🚀 Next Steps

After installation:
1. Login as Super Admin: `+998900000000` / `SuperAdmin2026`
2. Create first center via Super Admin panel
3. Configure Telegram Bot (optional)
4. Set up monitoring (PM2, Docker logs)
5. Configure backups

---

## 📞 Need Help?

- **Documentation:** [README.md](./README.md)
- **Issues:** GitHub Issues
- **Support:** support@eduflow.uz

---

**Installation Guide v1.0.0 — Step 13**
