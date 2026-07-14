# EduFlow CRM — Backend API

Production-ready backend API for Educational Center Management (EduFlow CRM).  
Built with Node.js 20, Express, TypeScript 5.7, Prisma ORM, PostgreSQL (Neon).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 |
| Framework | Express 4 |
| Language | TypeScript 5.7 (strict) |
| ORM | Prisma 5 |
| Database | PostgreSQL (Neon) |
| Validation | Zod |
| Auth | JWT (access + refresh tokens) |
| Security | Helmet, CORS, bcrypt, rate limiting, brute-force protection |
| Process Manager | PM2 (cluster mode) |
| Containerization | Docker |

---

## Quick Start (Development)

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET etc.

# 3. Generate Prisma client
npx prisma generate

# 4. Run migrations
npx prisma migrate dev

# 5. Seed plans (required)
node seed-plans.js

# 6. Create super admin
node create-superadmin.js

# 7. Start dev server
npm run dev
```

---

## Production Deployment

### Option A — PM2 (Recommended)

```bash
# Build TypeScript
npm run build

# Run migrations
npx prisma migrate deploy

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Option B — Docker

```bash
# Build image
docker build -t eduflow-backend .

# Run with env file
docker run -d --env-file .env -p 5000:5000 eduflow-backend
```

### Option C — Docker Compose (Full Stack)

```bash
# From project root
docker-compose up -d
```

---

## Environment Variables

Copy `.env.example` → `.env` and fill in:

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | `development` / `production` | ✅ |
| `PORT` | Server port (default: 5000) | ✅ |
| `DATABASE_URL` | Neon pooled connection string | ✅ |
| `DIRECT_URL` | Neon direct connection (migrations) | ✅ |
| `JWT_SECRET` | Access token secret (min 64 chars) | ✅ |
| `JWT_REFRESH_SECRET` | Refresh token secret (min 64 chars) | ✅ |
| `JWT_EXPIRES_IN` | Access token TTL (e.g. `7d`) | ✅ |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL (e.g. `30d`) | ✅ |
| `CORS_ORIGIN` | Allowed frontend origin(s) | ✅ |
| `BCRYPT_ROUNDS` | bcrypt rounds (10=dev, 12=prod) | ✅ |
| `TELEGRAM_BOT_TOKEN` | Telegram bot for notifications | ⚪ |

Generate strong secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## API Endpoints

### Authentication
```
POST   /api/auth/register       Register new center
POST   /api/auth/login          Login
POST   /api/auth/refresh        Refresh access token
POST   /api/auth/logout         Logout
GET    /api/auth/me             Current user profile
```

### Students
```
GET    /api/students            List with pagination & filters
GET    /api/students/:id        Get by ID
POST   /api/students            Create (checks plan limits)
PATCH  /api/students/:id        Update
DELETE /api/students/:id        Soft delete
GET    /api/students/stats      Statistics
```

### Teachers
```
GET    /api/teachers            List with pagination & filters
GET    /api/teachers/:id        Get by ID
POST   /api/teachers            Create (checks plan limits)
PATCH  /api/teachers/:id        Update
DELETE /api/teachers/:id        Soft delete
```

### Groups
```
GET    /api/groups              List
GET    /api/groups/:id          Get by ID
POST   /api/groups              Create (checks plan limits)
PATCH  /api/groups/:id          Update
DELETE /api/groups/:id          Delete
POST   /api/groups/:id/students Add student
DELETE /api/groups/:id/students/:studentId Remove student
```

### Payments
```
GET    /api/payments/students-with-payment-info
GET    /api/payments/stats
POST   /api/payments/process
GET    /api/payments
GET    /api/payments/:id
POST   /api/payments
PATCH  /api/payments/:id
DELETE /api/payments/:id
GET    /api/payments/overdue
```

### Attendance
```
GET    /api/attendances
POST   /api/attendances         Single record
POST   /api/attendances/bulk    Bulk for a group
PATCH  /api/attendances/:id
DELETE /api/attendances/:id
GET    /api/attendances/group/:groupId/date
GET    /api/attendances/stats/group/:groupId
GET    /api/attendances/stats/student/:studentId
```

### Import / Export
```
POST   /api/import/students     Import from Excel
POST   /api/import/teachers     Import from Excel
POST   /api/import/groups       Import from Excel
GET    /api/import/students/template
GET    /api/import/teachers/template
GET    /api/import/groups/template

GET    /api/export/students     Export to Excel
GET    /api/export/teachers     Export to Excel
GET    /api/export/groups       Export to Excel
GET    /api/export/payments     Export to Excel
GET    /api/export/attendances  Export to Excel
```

### Reports
```
GET    /api/reports/...         Various financial/attendance reports
```

### Notifications
```
GET    /api/notifications
GET    /api/notifications/unread-count
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all
DELETE /api/notifications/:id
DELETE /api/notifications/read/all
```

### Settings
```
GET    /api/settings
PUT    /api/settings
POST   /api/settings/reset
```

### Super Admin
```
GET    /api/super-admin/stats
GET    /api/super-admin/users
GET    /api/super-admin/centers
POST   /api/super-admin/centers
PATCH  /api/super-admin/centers/:id
DELETE /api/super-admin/centers/:id
PATCH  /api/super-admin/centers/:id/block
PATCH  /api/super-admin/centers/:id/unblock
GET    /api/super-admin/plans
PATCH  /api/super-admin/plans/:id
POST   /api/super-admin/subscriptions/extend
POST   /api/super-admin/impersonate/:centerId
```

### Health
```
GET    /api/health              Basic health (public, rate limited)
GET    /api/health/detailed     Detailed status (admin only)
```

---

## Architecture

```
src/
├── config/          # env, database, cors
├── controllers/     # HTTP request handlers
├── middleware/      # auth, errorHandler, rateLimiter, security
├── repositories/    # Prisma data access layer
├── routes/          # Express routers
├── services/        # Business logic
├── utils/           # jwt, password, response, pagination
├── validators/      # Zod schemas
├── types/           # TypeScript interfaces
├── app.ts           # Express app setup
└── server.ts        # Entry point
```

---

## Security Features

- JWT access + refresh token rotation
- HTTP-only cookie for refresh token
- Brute force protection (10 attempts → 30 min block)
- Rate limiting (300 req/min general, 10 req/15min auth)
- Helmet security headers
- CORS whitelist
- XSS input sanitization
- SQL injection prevention (Prisma parameterized queries)
- Multi-tenant data isolation (userId filtering)
- Subscription plan limit enforcement

---

## Scripts

```bash
npm run dev              # Development with hot reload
npm run build            # Build TypeScript → dist/
npm start                # Run production build
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix ESLint errors
npx prisma generate      # Regenerate Prisma client
npx prisma migrate dev   # Create & apply migration (dev)
npx prisma migrate deploy # Apply migrations (production)
npx prisma studio        # Prisma GUI
node seed-plans.js       # Seed subscription plans
node create-superadmin.js # Create super admin account
```

---

## Production Checklist

- [ ] `NODE_ENV=production` set
- [ ] Strong JWT secrets (64 char hex)
- [ ] `BCRYPT_ROUNDS=12`
- [ ] Correct `CORS_ORIGIN` (Vercel URL)
- [ ] Neon pooled URL for `DATABASE_URL`
- [ ] Neon direct URL for `DIRECT_URL`
- [ ] `npx prisma migrate deploy` run
- [ ] `node seed-plans.js` run
- [ ] `node create-superadmin.js` run
- [ ] PM2 or Docker configured
- [ ] SSL certificate configured (nginx/Caddy)
- [ ] Health endpoint responding: `GET /api/health`

---

## License

ISC
