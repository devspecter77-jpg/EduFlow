# Fixes Applied - July 12, 2026

## Issues Identified

### 1. **404 Error: `/api/billing/my-subscription` endpoint**
- **Root Cause**: New users don't have a `centerId` after registration
- **Impact**: Users cannot access billing page after registration

### 2. **403 Forbidden: Groups API**
- **Root Cause**: READ-ONLY mode activated due to missing or expired subscription
- **Impact**: Users cannot create or edit groups

## Solutions Implemented

### ✅ Task 1: Auto-Create Center & Trial Subscription on Registration

**File Changed**: `backend/src/repositories/auth.repository.ts`

**What was done**:
- Updated `createUser()` method to use a transaction that:
  1. Finds the FREE (Trial) plan
  2. Creates a new Center with unique slug
  3. Creates User and links to Center
  4. Creates a 10-day Trial Subscription

**Benefits**:
- New users automatically get:
  - A Center (organization)
  - 10-day FREE trial subscription
  - Immediate access to all features
  - Ability to view billing page

### ✅ Task 2: Updated Plan Seed Data

**File Changed**: `backend/seed-plans.js`

**Changes**:
- Removed `STANDARD` plan
- Updated `FREE` plan:
  - Name: "Sinov (Trial)"
  - Trial days: 10 (was 14)
  - Features updated
- Updated `PREMIUM` plan:
  - Price: 200,000 UZS/month (was 500,000)
  - Limits increased (1000 students, 50 teachers, 100 groups)
  - Features consolidated

## Required Manual Steps

### Step 1: Re-seed Plans (IMPORTANT!)

```bash
cd c:\Users\Javohir\Desktop\EduFlow_crm\backend
node seed-plans.js
```

**Note**: If plans already exist, you need to either:
1. Delete existing plans and subscriptions from database, OR
2. Manually update the plans in the database to match new structure

### Step 2: Restart Backend Server

The backend needs to be restarted to load the new auth repository code:

```bash
cd c:\Users\Javohir\Desktop\EduFlow_crm\backend
npm run dev
```

### Step 3: Test New User Registration

1. Clear your browser data (logout if logged in)
2. Go to registration page
3. Register a new user
4. After registration, you should:
   - Be automatically logged in
   - Have a 10-day trial subscription
   - See billing page without errors
   - Be able to create groups (not READ-ONLY)

### Step 4: Fix Existing Users (if any)

If you have existing users in the database who don't have a Center/Subscription:

**Option A**: Delete and re-register
```sql
-- Run in database
DELETE FROM users WHERE "centerId" IS NULL;
```

**Option B**: Create Center & Subscription manually for each existing user
```sql
-- This is complex, better to use Option A for testing
```

## Verification Checklist

After completing manual steps, verify:

- [ ] Backend starts without errors
- [ ] New user registration creates a Center
- [ ] New user registration creates a Trial subscription
- [ ] Billing page loads without 404 errors
- [ ] Groups can be created (no 403 Forbidden)
- [ ] Trial subscription shows "10 kun qoldi" on billing page
- [ ] After trial expires, READ-ONLY mode activates

## Technical Details

### Database Schema (No changes needed)

The existing schema already supports this flow:
- `User.centerId` → links user to center
- `Center` → organization table
- `Subscription` → links center to plan with dates
- `Plan` → defines limits and pricing

### API Flow

1. User registers → `POST /api/auth/register`
2. `authService.register()` calls `authRepository.createUser()`
3. Transaction creates: Center → User → Subscription
4. JWT includes `centerId` in payload
5. All subsequent requests have `centerId`
6. Billing endpoints work correctly

## Error Messages (Uzbek)

The following user-friendly error messages are shown:

- **No Plan Found**: "Trial plan topilmadi. Iltimos admin bilan bog'laning."
- **No Center**: "Markaz topilmadi"
- **Expired Subscription**: READ-ONLY mode with banner

## Next Steps

1. Complete the manual steps above
2. Test the complete registration → billing flow
3. Verify existing features still work
4. Consider adding a migration script for existing users

## Files Modified

```
backend/src/repositories/auth.repository.ts  (Center & Subscription creation)
backend/seed-plans.js                        (Updated plan structure)
```

## Notes

- Frontend code is correct, no changes needed
- Billing routes are properly registered
- All validation is in place
- The fix is backward compatible (existing working users unaffected)
