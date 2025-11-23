# Waiver System Testing Guide

## Overview
The waiver signature persistence system has been completely refactored to use server-side gates and a dedicated waiver page. This ensures users only sign the waiver once and are never prompted again on subsequent logins.

## Changes Made

### 1. New Dedicated Waiver Page (`/waiver`)
- Server-side authenticated page that requires login
- Shows waiver form only to users who haven't signed
- Saves signature directly to database
- Redirects to intended destination after signing

### 2. Server-Side Waiver Gates
- **Dashboard Layout**: Checks waiver status before allowing dashboard access
- **Auth Callback**: Checks waiver status after successful authentication
- Both redirect to `/waiver` if not signed

### 3. Database Improvements
- Added RLS policies for waiver fields (users can read/update their own)
- Added index on `waiver_signed_at` for performance
- Enhanced validation and error handling

### 4. Simplified Auth Flow
- Removed waiver modal from login page
- Server-side gates handle all waiver requirements
- Cleaner separation of concerns

## Testing Instructions

### Prerequisites
1. Apply the updated database migration:
   ```bash
   # Navigate to Supabase dashboard SQL editor
   # Run the migration file: supabase/migrations/20251122125146_add_waiver_fields_to_profiles.sql
   ```

2. Ensure you have test accounts ready:
   - One account that has never signed the waiver
   - One account that has already signed the waiver (if available)

### Test Case 1: New User Flow
**Objective**: Verify new users are prompted to sign waiver and can access dashboard after signing

**Steps**:
1. Clear browser cache and cookies (or use incognito mode)
2. Navigate to `/auth`
3. Sign in with Google OAuth or Magic Link using a NEW email address
4. **Expected**: After authentication, you should be redirected to `/waiver`
5. **Expected**: Waiver page should display with the full waiver text
6. Scroll to the bottom of the waiver text
7. **Expected**: Checkbox should become enabled after scrolling
8. Fill in your full name and address
9. Check the agreement checkbox
10. Click "Sign & Accept Waiver"
11. **Expected**: You should be redirected to `/dashboard`
12. **Expected**: Dashboard should load successfully

**Verification**:
- Check Supabase database `profiles` table for your user
- Verify `waiver_signed_at` has a timestamp
- Verify `waiver_signature_name` contains your name
- Verify `waiver_signature_address` contains your address

### Test Case 2: Returning User Flow (Critical Test)
**Objective**: Verify users who already signed the waiver are NOT prompted again

**Steps**:
1. Using the same account from Test Case 1, sign out
2. Close the browser completely
3. Open a new browser session
4. Navigate to `/auth`
5. Sign in with the SAME account (Google or Magic Link)
6. **Expected**: You should be redirected DIRECTLY to `/dashboard`
7. **Expected**: You should NOT see the waiver page at all

**Verification**:
- You should reach the dashboard immediately
- No waiver page should appear
- Check browser console for any errors (should be none)

### Test Case 3: Direct Dashboard Access
**Objective**: Verify dashboard gate works for direct navigation

**Steps**:
1. While logged in with an account that has NOT signed the waiver:
2. Navigate directly to `/dashboard` in the browser address bar
3. **Expected**: You should be redirected to `/waiver?redirect=/dashboard`
4. Sign the waiver
5. **Expected**: You should be redirected back to `/dashboard`

### Test Case 4: Existing User Without Waiver
**Objective**: Verify existing users are prompted to sign waiver

**Steps**:
1. Use an existing account that was created BEFORE the waiver system
2. Sign in via `/auth`
3. **Expected**: You should be redirected to `/waiver`
4. Sign the waiver
5. **Expected**: You should reach the dashboard
6. Sign out and sign in again
7. **Expected**: You should go directly to dashboard (no waiver prompt)

### Test Case 5: Multiple Login Methods
**Objective**: Verify waiver status persists across different login methods

**Steps**:
1. Create a new account using Google OAuth
2. Sign the waiver
3. Sign out
4. Request a magic link for the SAME email address
5. Sign in via magic link
6. **Expected**: You should go directly to dashboard (no waiver prompt)

### Test Case 6: Validation Tests
**Objective**: Verify form validation works correctly

**Steps**:
1. Navigate to `/waiver` (while logged in, unsigned waiver)
2. Try to click "Sign & Accept Waiver" without scrolling
3. **Expected**: Button should be disabled
4. Scroll to bottom
5. Try to submit without filling name
6. **Expected**: Button should be disabled
7. Fill name, try to submit without address
8. **Expected**: Button should be disabled
9. Fill address, try to submit without checking agreement
10. **Expected**: Button should be disabled
11. Check agreement box
12. **Expected**: Button should become enabled and green
13. Click to sign
14. **Expected**: Success and redirect to dashboard

## Database Verification Queries

### Check Waiver Status for a User
```sql
SELECT 
  id,
  email,
  waiver_signed_at,
  waiver_signature_name,
  waiver_signature_address
FROM auth.users
JOIN public.profiles ON auth.users.id = profiles.id
WHERE email = 'your-test-email@example.com';
```

### Check All Users with Signed Waivers
```sql
SELECT 
  COUNT(*) as total_signed,
  MIN(waiver_signed_at) as first_signature,
  MAX(waiver_signed_at) as latest_signature
FROM public.profiles
WHERE waiver_signed_at IS NOT NULL;
```

### Reset Waiver for Testing (Development Only)
```sql
-- WARNING: Only use in development/testing
UPDATE public.profiles
SET 
  waiver_signed_at = NULL,
  waiver_signature_name = NULL,
  waiver_signature_address = NULL
WHERE id = 'user-id-here';
```

## Expected Behavior Summary

| Scenario | Expected Behavior |
|----------|-------------------|
| New user signs in | Redirected to `/waiver`, must sign before accessing dashboard |
| Returning user (signed waiver) | Goes directly to dashboard, no waiver prompt |
| Direct `/dashboard` access (unsigned) | Redirected to `/waiver?redirect=/dashboard` |
| Direct `/dashboard` access (signed) | Dashboard loads normally |
| Auth callback (unsigned) | Redirected to `/waiver` with original redirect preserved |
| Auth callback (signed) | Redirected to original destination |

## Common Issues and Solutions

### Issue: Waiver appears every time
**Cause**: Database not saving waiver signature
**Solution**: 
1. Check RLS policies are applied
2. Verify user has a profile record
3. Check browser console for errors
4. Verify migration ran successfully

### Issue: Can't access dashboard at all
**Cause**: Waiver gate blocking access
**Solution**:
1. Navigate to `/waiver` directly
2. Sign the waiver
3. If still blocked, check database for waiver_signed_at value

### Issue: Validation not working
**Cause**: JavaScript not loading or errors
**Solution**:
1. Check browser console for errors
2. Clear cache and reload
3. Verify all dependencies are installed

## Success Criteria

✅ New users are prompted to sign waiver exactly once
✅ Returning users NEVER see waiver again after signing
✅ Waiver data persists in database correctly
✅ All validation rules work as expected
✅ No console errors during normal flow
✅ Redirects work correctly after signing
✅ RLS policies allow users to read/update their own waiver

## Rollback Plan

If issues occur, you can temporarily disable the waiver gate:

1. Comment out waiver check in `app/(dashboard)/layout.tsx`:
```typescript
// const { signed } = await checkWaiverStatus(user.id)
// if (!signed) {
//   redirect('/waiver?redirect=/dashboard')
// }
```

2. Comment out waiver check in `app/auth/callback/route.ts`:
```typescript
// const { signed } = await checkWaiverStatus(data.user.id)
// if (!signed) {
//   return NextResponse.redirect(...)
// }
```

3. Redeploy the application

## Next Steps After Testing

1. Monitor production logs for any waiver-related errors
2. Check database regularly to ensure signatures are being saved
3. Consider adding analytics to track waiver completion rates
4. Consider adding admin dashboard to view waiver signatures

