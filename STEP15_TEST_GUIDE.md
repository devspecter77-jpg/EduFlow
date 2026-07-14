# Step 15 - Billing & Subscription System - Test Guide

## Test Scenarios

### Scenario 1: New Registration → Trial Period

1. **Register new center**
   - POST `/auth/register`
   - Center status should be `ACTIVE`
   - Subscription status should be `TRIAL`
   - Trial period: 10 days

2. **Check subscription**
   - GET `/billing/my-subscription`
   - Verify:
     - `isTrial: true`
     - `daysLeft: 10`
     - `isExpired: false`

3. **Test CRUD operations**
   - All CRUD should work (students, teachers, groups)
   - No READ-ONLY mode

---

### Scenario 2: Trial Expiry → READ-ONLY Mode

**Setup:** Manually set trial end date to yesterday in database:
```sql
UPDATE subscriptions 
SET end_date = NOW() - INTERVAL '1 day', 
    status = 'EXPIRED'
WHERE center_id = '<center_id>';

UPDATE centers 
SET status = 'BLOCKED'
WHERE id = '<center_id>';
```

1. **Check subscription**
   - GET `/billing/my-subscription`
   - Verify:
     - `isExpired: true`
     - `daysLeft: 0`

2. **Test READ operations (should work)**
   - GET `/students` ✅
   - GET `/teachers` ✅
   - GET `/groups` ✅
   - GET `/dashboard/stats` ✅

3. **Test CRUD operations (should fail)**
   - POST `/students` ❌ 403 "Obunangiz tugagan"
   - PATCH `/students/:id` ❌ 403
   - DELETE `/students/:id` ❌ 403
   - POST `/groups` ❌ 403
   - POST `/attendance` ❌ 403

4. **Frontend banner**
   - Red banner should show at top
   - "Obunangiz tugagan. Premium obuna oling."

---

### Scenario 3: Payment Request Flow

1. **Submit payment request (as Admin)**
   - Navigate to `/dashboard/billing`
   - Click "Premium olish"
   - Modal opens
   - Copy card number
   - Add notes (optional)
   - Submit
   - POST `/billing/payment-requests`

2. **Verify pending request**
   - GET `/billing/payment-requests/my`
   - Status should be `PENDING`

3. **Check duplicate prevention**
   - Try submitting another request
   - Should fail: "Sizning kutilayotgan to'lov so'rovingiz allaqachon mavjud"

---

### Scenario 4: Super Admin Approve Payment

1. **Login as Super Admin**
   - Phone: `+998901234567`
   - Password: `superadmin123`

2. **View payment requests**
   - Navigate to `/super-admin/payment-requests`
   - Filter: `PENDING`
   - See all pending requests

3. **Approve payment**
   - Click "Tasdiqlash" button
   - POST `/billing/admin/payment-requests/:id/approve`

4. **Verify results**
   - Payment status: `APPROVED`
   - New subscription created: 30 days
   - Center status: `ACTIVE` (unblocked)
   - Users reactivated: `isActive: true`

5. **Check center can use CRUD again**
   - Login as center admin
   - POST `/students` should work ✅
   - Banner should disappear

---

### Scenario 5: Super Admin Reject Payment

1. **Submit new payment request** (as center admin)

2. **Login as Super Admin**

3. **Reject payment**
   - Navigate to `/super-admin/payment-requests`
   - Click "Rad etish"
   - Enter rejection note
   - POST `/billing/admin/payment-requests/:id/reject`

4. **Verify results**
   - Payment status: `REJECTED`
   - Rejection note visible
   - Center still BLOCKED
   - Banner still visible

---

### Scenario 6: Super Admin Extend Subscription

1. **Login as Super Admin**

2. **Navigate to Subscriptions**
   - Go to `/super-admin/subscriptions`
   - See all subscriptions with stats

3. **Extend subscription**
   - Choose a center
   - Click "+30 kun", "+90 kun", or "+1 yil"
   - POST `/super-admin/subscriptions/extend`

4. **Verify**
   - Subscription end date extended
   - New subscription record created
   - Center unblocked (if was blocked)

---

### Scenario 7: Subscription Expiry Warning (5 days)

**Setup:** Set trial end date to 5 days from now:
```sql
UPDATE subscriptions 
SET end_date = NOW() + INTERVAL '5 days'
WHERE center_id = '<center_id>';
```

1. **Login as center admin**

2. **Check banner**
   - Amber/orange banner should show
   - "Sinov muddati tugashiga 5 kun qoldi!"
   - "Premium" button visible
   - Can dismiss (X button)

---

### Scenario 8: Plan Limits Enforcement

**Setup:** Create center with limits:
- Max students: 10
- Max teachers: 2
- Max groups: 3

1. **Add 10 students** ✅

2. **Try to add 11th student**
   - Should fail: "Tarif limiti: maksimal 10 ta o'quvchi"

3. **Add 2 teachers** ✅

4. **Try to add 3rd teacher**
   - Should fail: "Tarif limiti: maksimal 2 ta o'qituvchi"

5. **Add 3 groups** ✅

6. **Try to add 4th group**
   - Should fail: "Tarif limiti: maksimal 3 ta guruh"

---

## API Endpoints Summary

### Center Admin
- `GET /billing/my-subscription` - Get my subscription info
- `POST /billing/payment-requests` - Submit payment request
- `GET /billing/payment-requests/my` - My payment history

### Super Admin
- `GET /billing/admin/payment-requests` - All payment requests (with filters)
- `POST /billing/admin/payment-requests/:id/approve` - Approve payment
- `POST /billing/admin/payment-requests/:id/reject` - Reject payment
- `GET /billing/admin/subscriptions` - All subscriptions (with filters)
- `POST /super-admin/subscriptions/extend` - Extend subscription manually

---

## Database Setup for Testing

### 1. Create Super Admin
```bash
node backend/create-superadmin.js
```

### 2. Create Test Plans
```sql
-- Trial Plan (auto-created on registration)
INSERT INTO plans (id, type, name, duration_months, price, max_students, max_teachers, max_groups, features, description)
VALUES (
  'trial-plan-id',
  'TRIAL',
  'Sinov',
  0,
  0,
  50,
  5,
  5,
  '["10 kunlik bepul sinov", "Barcha funksiyalar", "Support"]',
  '10 kunlik bepul sinov'
);

-- Premium Plan
INSERT INTO plans (id, type, name, duration_months, price, max_students, max_teachers, max_groups, features, description)
VALUES (
  'premium-plan-id',
  'PREMIUM',
  'Premium',
  1,
  200000,
  200,
  20,
  30,
  '["Cheklanmagan o''quvchilar", "Export/Import", "SMS notifications", "Priority support"]',
  'Premium 30 kunlik obuna'
);
```

### 3. Simulate Trial Expiry
```sql
UPDATE subscriptions 
SET end_date = NOW() - INTERVAL '1 day', status = 'EXPIRED'
WHERE center_id = '<center_id>';

UPDATE centers SET status = 'BLOCKED' WHERE id = '<center_id>';
UPDATE users SET is_active = false WHERE center_id = '<center_id>';
```

---

## Expected Behavior Matrix

| Subscription Status | CRUD Operations | Read Operations | Banner |
|---------------------|-----------------|-----------------|--------|
| TRIAL (10 days)     | ✅ Allowed      | ✅ Allowed      | None   |
| TRIAL (≤5 days)     | ✅ Allowed      | ✅ Allowed      | 🟡 Warning |
| EXPIRED             | ❌ Blocked      | ✅ Allowed      | 🔴 Critical |
| ACTIVE              | ✅ Allowed      | ✅ Allowed      | None   |
| SUSPENDED           | ❌ Blocked      | ✅ Allowed      | 🔴 Critical |

---

## Success Criteria

✅ All scenarios pass
✅ No TypeScript errors
✅ No console errors
✅ Smooth UX (no flickers, fast responses)
✅ Proper error messages in Uzbek
✅ Mobile responsive
✅ Dark mode works
✅ READ-ONLY mode enforced correctly
✅ Payment approval workflow complete
✅ Subscription extensions work
✅ Banner shows/hides correctly

---

## Next Steps After Testing

1. Fix any bugs discovered
2. Add cron job for expiry checks (Step 16)
3. Add Telegram/SMS notifications (Step 17)
4. Prepare for Click/Payme integration (future)

