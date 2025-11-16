# 🔍 Payment Failure Diagnosis & Fix

## Problem Summary
When "Continue to Payment" is clicked, the payment fails immediately with:
> "Payment failed. Booking has been cancelled."

No payment form is shown - the error appears instantly at the bottom of the page.

---

## Root Cause Analysis

### What's Happening:

```
1. User clicks "Continue to Payment"
   ↓
2. Pending booking is created successfully ✅
   ↓
3. PaymentSheet component renders
   ↓
4. PaymentSheet calls /api/stripe/payment-intent ❌ FAILS HERE
   ↓
5. API returns error: "Invalid API key"
   ↓
6. onError callback is triggered
   ↓
7. Toast message: "Payment failed. Booking has been cancelled."
```

### Technical Details:

**File**: `components/features/payments/payment-sheet.tsx`
- Lines 54-93: `initializeIntent()` function
- Line 59: Makes POST request to `/api/stripe/payment-intent`
- Lines 65-73: If response not OK, calls `onError` callback

**File**: `components/features/booking/redesigned-booking.tsx`
- Lines 378-394: `handlePaymentError()` function
- Line 389: Shows the toast message "Payment failed. Booking has been cancelled."

**File**: `app/api/stripe/payment-intent/route.ts`
- This endpoint tries to initialize Stripe with the secret key
- **Fails because `STRIPE_SECRET_KEY` is not set in Vercel**

---

## Why It Fails Immediately

The payment initialization happens **immediately** when the `PaymentSheet` component mounts:

```tsx
useEffect(() => {
  // This runs as soon as pendingBookingId is set
  initializeIntent()
}, [bookingId])
```

So the flow is:
1. Click "Continue to Payment" → pendingBookingId set
2. PaymentSheet renders → useEffect runs
3. API call fails → onError called
4. Toast shows "Payment failed"

**All of this happens in < 1 second**, which is why it seems instant.

---

## The Fix

### Step 1: Set Stripe Keys in Vercel

You **MUST** add these environment variables to Vercel:

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy both keys:
   - **Secret key** (click "Reveal test key"): starts with `sk_test_`
   - **Publishable key**: starts with `pk_test_`

3. Go to https://vercel.com/loki98s-projects/worldsportsacademy-site/settings/environment-variables

4. Add these variables:
   ```
   STRIPE_SECRET_KEY = sk_test_xxxxxxxxxxxxxxxxxxxx
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_xxxxxxxxxxxxxxxxxxxx
   ```
   
5. Select "Production" environment
6. Click "Save"

### Step 2: Redeploy (CRITICAL!)

**⚠️ Environment variables are only loaded during build time!**

1. Go to https://vercel.com/loki98s-projects/worldsportsacademy-site/deployments
2. Click **⋯** on the latest deployment
3. Click **"Redeploy"**
4. Wait 2-3 minutes

### Step 3: Verify

After redeployment:

1. Visit your site
2. Make a booking selection
3. Click "Continue to Payment"
4. **Expected result**: Payment form should appear (not error)

---

## How to Verify If Keys Are Set

### Option 1: Check Error Message in Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try making a booking
4. Look for errors mentioning "Invalid API key" or "STRIPE_SECRET_KEY"

### Option 2: Check Vercel Function Logs

1. Go to https://vercel.com/loki98s-projects/worldsportsacademy-site
2. Click "Deployments" → Latest deployment
3. Click "Functions" tab
4. Look for `/api/stripe/payment-intent` logs
5. Check for "Invalid API key" errors

### Option 3: Use Debug Endpoint (Development Only)

After setting keys locally in `.env.local`:
```bash
curl http://localhost:3000/api/stripe/check-keys
```

This will show if keys are configured correctly.

---

## What Happens After Fix

### Before Fix:
```
Click "Continue to Payment"
  ↓
API call fails immediately
  ↓
"Payment failed. Booking has been cancelled."
```

### After Fix:
```
Click "Continue to Payment"
  ↓
Pending booking created
  ↓
Payment form appears inline
  ↓
User enters card details
  ↓
Payment is processed
  ↓
Booking confirmed
  ↓
Redirect to bookings page
```

---

## Test Card Details (After Fix)

Once keys are set, test with:
- **Card number**: 4242 4242 4242 4242
- **Expiry**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

---

## Checklist

- [ ] Get Stripe test keys from dashboard
- [ ] Set `STRIPE_SECRET_KEY` in Vercel
- [ ] Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in Vercel
- [ ] Select "Production" environment
- [ ] Save variables
- [ ] **Redeploy the application**
- [ ] Wait for deployment to complete (2-3 minutes)
- [ ] Test booking with payment
- [ ] Verify payment form appears
- [ ] Test with card 4242 4242 4242 4242

---

## Common Mistakes

| Mistake | Result | Solution |
|---------|--------|----------|
| Set keys but didn't redeploy | Still fails | **Must redeploy** after setting vars |
| Mixed test/live keys | Fails with auth error | Use **both test** or **both live** |
| Extra spaces in keys | Invalid key error | Copy entire key, no spaces |
| Set in wrong environment | Fails in production | Set for **Production** environment |
| Typo in variable name | Variable not found | Must be exactly `STRIPE_SECRET_KEY` |

---

## Still Not Working?

If you've done all the above and it still fails:

1. **Double-check the keys**:
   - Go back to Stripe Dashboard
   - Copy them again (fresh)
   - Make sure you clicked "Reveal test key" for secret key

2. **Verify in Vercel**:
   - Settings → Environment Variables
   - Check that both variables exist
   - Check they're set for "Production"
   - No typos in names

3. **Try clearing cache**:
   - In Vercel, redeploy with "Clear Build Cache" option

4. **Check browser console**:
   - Look for any other JavaScript errors
   - Check Network tab for failed requests

5. **Check Vercel function logs**:
   - Look for the specific error message
   - It will tell you exactly what's wrong

---

## Quick Reference

- **Stripe Dashboard**: https://dashboard.stripe.com/test/apikeys
- **Vercel Env Variables**: https://vercel.com/loki98s-projects/worldsportsacademy-site/settings/environment-variables
- **Vercel Deployments**: https://vercel.com/loki98s-projects/worldsportsacademy-site/deployments
- **Your Site**: https://worldsportsacademy-site.vercel.app

---

## After successful fix, you should see:

✅ "Continue to Payment" button works  
✅ Payment form appears inline  
✅ Can enter card details  
✅ Payment processes successfully  
✅ Booking confirmed  
✅ Redirects to bookings page

