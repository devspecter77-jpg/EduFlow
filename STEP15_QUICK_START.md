# Step 15 - Quick Start Guide ⚡

## 5-Minute Setup

### 1. Database Migration (30 seconds)
```bash
cd backend
npx prisma generate
npx prisma db push
```

### 2. Seed Plans (10 seconds)
```bash
node seed-billing-plans.js
```

**Output:**
```
🌱 Seeding billing plans...
✅ Trial Plan: <id>
✅ Premium Plan: <id>
✅ Seeding completed!
```

### 3. Start Backend (5 seconds)
```bash
npm run dev
```

### 4. Start Frontend (5 seconds)
```bash
cd ../biz-crm
npm run dev
```

### 5. Test It! (3 minutes)

#### Register New Center
1. Open http://localhost:5173
2. Click "Ro'yxatdan o'tish"
3. Fill form:
   - Center name: Test Markaz
   - Admin name: Test Admin
   - Phone: +998901111111
   - Password: test123
4. Submit → Auto login

#### Check Billing
1. Navigate to `/dashboard/billing`
2. See:
   - ✅ Status: "Sinov davri"
   - ✅ Days left: 10 kun
   - ✅ Plan limits

#### Submit Payment Request
1. Click "Premium olish"
2. Modal opens
3. Copy card number (any)
4. Click "To'lov so'rovini yuborish"
5. Success! ✅

#### Super Admin Approve
1. Logout
2. Landing page → Double-click logo
3. Enter password: `rootdev10`
4. Navigate to "To'lov So'rovlari"
5. Click "Tasdiqlash"
6. Done! Center gets 30 days Premium ✅

---

## What You Get

### Trial Plan (Auto-created)
- 10 days free
- 50 students max
- 5 teachers max
- 5 groups max

### Premium Plan (200,000 UZS/month)
- 30 days
- 200 students max
- 20 teachers max
- 30 groups max

---

## Test Scenarios

### ✅ Scenario 1: Happy Path
New registration → 10-day trial → Submit payment → Approve → 30-day premium

### ✅ Scenario 2: Expiry
Trial ends → Banner shows → CRUD blocked → Only read allowed

### ✅ Scenario 3: Rejection
Submit payment → Reject with note → Center stays blocked

### ✅ Scenario 4: Extension
Super Admin → Subscriptions → Click "+30 kun" → Extended

---

## Troubleshooting

### "Plans not found"
```bash
node backend/seed-billing-plans.js
```

### "Can't submit payment"
Check if there's already a PENDING request. Only 1 allowed.

### "CRUD still works after expiry"
Manually expire subscription:
```sql
UPDATE subscriptions SET end_date = NOW() - INTERVAL '1 day' WHERE center_id = '...';
UPDATE centers SET status = 'BLOCKED' WHERE id = '...';
```

### "Banner not showing"
Clear browser cache and refresh.

---

## Production Updates

Before going live:

### Update Card Numbers
File: `biz-crm/src/pages/Billing/index.tsx`

```typescript
const PAYMENT_CARDS = [
  {
    type: 'Humo',
    number: 'YOUR_REAL_CARD',  // ← CHANGE
    owner: 'YOUR_NAME',         // ← CHANGE
  },
  {
    type: 'Visa',
    number: 'YOUR_REAL_CARD',  // ← CHANGE
    owner: 'YOUR_NAME',         // ← CHANGE
  },
];
```

### Update Contact Links
```typescript
// Telegram
href="https://t.me/YOUR_USERNAME"  // ← CHANGE

// WhatsApp
href="https://wa.me/998XXXXXXXXX"  // ← CHANGE

// Phone
href="tel:+998XXXXXXXXX"           // ← CHANGE
```

---

## Next Steps

1. ✅ Test all scenarios
2. ✅ Update production info
3. ✅ Deploy
4. 🔄 Step 16: Automation (cron jobs)
5. 🔄 Step 17: Notifications
6. 🔄 Step 18: Payment gateway integration

---

**Done! Step 15 is complete and ready to use! 🚀**

