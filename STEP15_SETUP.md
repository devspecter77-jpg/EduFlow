# Step 15 - Setup Instructions

## Prerequisites

- PostgreSQL database running
- Node.js 18+ installed
- Backend `.env` configured with `DATABASE_URL` and `DIRECT_URL`

---

## 1. Database Migration

```bash
cd backend
npx prisma generate
npx prisma db push
```

**Expected output:**
```
✔ Generated Prisma Client
✔ Your database is now in sync with your Prisma schema
```

---

## 2. Seed Billing Plans

```bash
node backend/seed-billing-plans.js
```

**Expected output:**
```
🌱 Seeding billing plans...
✅ Trial Plan: <plan-id>
✅ Premium Plan: <plan-id>
✅ Seeding completed successfully!
```

This creates:
- **Trial Plan:** 10 days free, 50 students, 5 teachers, 5 groups
- **Premium Plan:** 200,000 UZS/month, 200 students, 20 teachers, 30 groups

---

## 3. Create Super Admin (if not exists)

```bash
node backend/create-superadmin.js
```

**Expected output:**
```
✅ Super Admin created successfully!
Phone: +998900000000
Password: SuperAdmin2026
```

---

## 4. Start Backend

```bash
cd backend
npm run dev
```

**Expected:** Backend running on `http://localhost:3001`

---

## 5. Start Frontend

```bash
cd biz-crm
npm run dev
```

**Expected:** Frontend running on `http://localhost:5173`

---

## 6. Test Workflow

### Test 1: New Registration → Trial

1. Open `http://localhost:5173`
2. Click "Ro'yxatdan o'tish"
3. Fill form and submit
4. Login with credentials
5. Navigate to `/dashboard/billing`
6. Verify:
   - ✅ Status: "Sinov davri"
   - ✅ Days left: 10 kun
   - ✅ No banner (trial active)

### Test 2: Submit Payment Request

1. In `/dashboard/billing`, click "Premium olish"
2. Modal opens with card numbers
3. Copy Humo/Visa card number
4. (Optional) Add notes
5. Click "To'lov so'rovini yuborish"
6. Verify:
   - ✅ Success toast
   - ✅ Payment request in history (status: Kutilmoqda)
   - ✅ Can't submit duplicate request

### Test 3: Super Admin Approve Payment

1. Logout, then access Super Admin:
   - Double-click logo on landing page
   - Enter password: `rootdev10`
   - OR login with: `+998900000000` / `SuperAdmin2026`
2. Navigate to `/super-admin/payment-requests`
3. See pending payment request
4. Click "Tasdiqlash"
5. Verify:
   - ✅ Status changed to "Tasdiqlandi"
   - ✅ Center unblocked
   - ✅ 30-day subscription created

### Test 4: Simulate Expiry (Manual DB Update)

```sql
-- Set subscription to expired
UPDATE subscriptions 
SET end_date = NOW() - INTERVAL '1 day', 
    status = 'EXPIRED'
WHERE center_id = '<your-center-id>';

-- Block center
UPDATE centers 
SET status = 'BLOCKED'
WHERE id = '<your-center-id>';
```

Then:
1. Refresh frontend
2. Verify:
   - ✅ Red banner appears: "Obunangiz tugagan"
   - ✅ Can view data (GET requests work)
   - ✅ Can't add student (POST blocked with 403)
   - ✅ Can't edit/delete (PATCH/DELETE blocked)

### Test 5: Super Admin Extend Subscription

1. Login as Super Admin
2. Navigate to `/super-admin/subscriptions`
3. Find the expired center
4. Click "+30 kun" button
5. Verify:
   - ✅ Subscription extended
   - ✅ Center unblocked
   - ✅ Banner disappears
   - ✅ CRUD operations work again

---

## 7. Update Payment Info (Production)

Before production deployment, update:

### `biz-crm/src/pages/Billing/index.tsx`

```typescript
const PAYMENT_CARDS = [
  {
    type: 'Humo',
    number: '9860 1701 2076 5544',  // ← UPDATE with real card
    owner: 'TOSHMATOV JAVOHIR',      // ← UPDATE
  },
  {
    type: 'Visa',
    number: '4111 1111 1111 1111',  // ← UPDATE with real card
    owner: 'TOSHMATOV JAVOHIR',      // ← UPDATE
  },
];
```

### Contact Links

```typescript
// Telegram
href="https://t.me/eduflow_admin"  // ← UPDATE

// WhatsApp
href="https://wa.me/998901234567"  // ← UPDATE

// Phone
href="tel:+998901234567"           // ← UPDATE
+998 90 123 45 67                  // ← UPDATE (display text)
```

---

## 8. Production Deployment

### Backend
```bash
cd backend
npm run build
npm start
# OR with PM2:
pm2 start ecosystem.config.js
```

### Frontend
```bash
cd biz-crm
npm run build
# Serve dist/ with nginx or similar
```

---

## 9. Cron Job for Expiry Checks (Future - Step 16)

Create cron job to run daily:

```bash
0 0 * * * cd /path/to/backend && node scripts/check-expiry.js
```

Script should:
1. Find subscriptions where `end_date < NOW()`
2. Update status to `EXPIRED`
3. Block center: `status = 'BLOCKED'`
4. Deactivate users: `is_active = false`
5. Send notification (email/telegram)

---

## 10. Troubleshooting

### Issue: "Payment request failed"
**Solution:** Check backend logs, verify database connection

### Issue: "Can't submit payment request"
**Solution:** Check if there's already a PENDING request. Only 1 pending allowed.

### Issue: "Subscription not extending"
**Solution:** 
1. Verify Premium plan exists: `SELECT * FROM plans WHERE type = 'PREMIUM';`
2. Check backend logs
3. Verify Super Admin permissions

### Issue: "Banner not showing"
**Solution:**
1. Check subscription status in DB
2. Verify `end_date < NOW()`
3. Clear browser cache

### Issue: "CRUD still works after expiry"
**Solution:**
1. Check `checkSubscription` middleware is applied to routes
2. Verify center status is `BLOCKED`
3. Check frontend is calling correct API

---

## 11. Verify Installation

Run this checklist:

### Backend
- [ ] `npx prisma generate` - success
- [ ] `npx prisma db push` - success
- [ ] `node seed-billing-plans.js` - 2 plans created
- [ ] `node create-superadmin.js` - Super Admin created
- [ ] `npm run build` - 0 TypeScript errors
- [ ] `npm run dev` - backend running on :3001

### Frontend
- [ ] `npm run build` - success
- [ ] `npm run dev` - frontend running on :5173
- [ ] No console errors
- [ ] Pages load correctly

### Features
- [ ] New registration creates 10-day trial
- [ ] `/dashboard/billing` shows subscription info
- [ ] Can submit payment request
- [ ] Can't submit duplicate request
- [ ] Super Admin can approve/reject
- [ ] Approve creates 30-day subscription
- [ ] Expired subscription shows red banner
- [ ] READ-ONLY mode blocks CRUD
- [ ] Extend subscription works
- [ ] Mobile responsive
- [ ] Dark mode works

---

## 12. Environment Variables

### Backend `.env`
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
JWT_SECRET="your-secret"
REFRESH_SECRET="your-refresh-secret"
PORT=3001
NODE_ENV=development
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:3001
```

---

## Success Criteria

✅ All migrations applied  
✅ Plans seeded (Trial + Premium)  
✅ Super Admin created  
✅ Backend builds without errors  
✅ Frontend builds without errors  
✅ All test scenarios pass  
✅ No console errors  
✅ Mobile responsive  
✅ Dark mode works  

---

**Status:** Ready for testing and production deployment! 🚀

