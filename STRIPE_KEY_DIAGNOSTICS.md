# 🔍 Stripe Key Diagnostics & Fix Guide

## Issues Fixed

### 1. ✅ Key Trimming
- **Problem**: Keys with leading/trailing whitespace cause "Invalid API key" errors
- **Fix**: All keys are now automatically trimmed before use
- **Location**: `lib/stripe/client.ts` - `validateStripeKey()` function

### 2. ✅ Better Error Messages
- **Problem**: Generic "Invalid API key" error with no diagnostics
- **Fix**: Error messages now show:
  - Key preview (first 12 characters)
  - Key length
  - Whether key is truncated
  - Whether key format is invalid
- **Location**: `lib/stripe/payments.ts` - `createBookingPaymentIntent()`

### 3. ✅ Diagnostic Logging
- **Problem**: No visibility into key initialization
- **Fix**: Logs key preview when initializing Stripe client (Vercel only)
- **Location**: `lib/stripe/client.ts` - `getStripeClient()`

### 4. ✅ Test Endpoint
- **Problem**: No way to verify if key actually works
- **Fix**: Created `/api/stripe/test-key` endpoint that makes a real API call
- **Location**: `app/api/stripe/test-key/route.ts`

### 5. ✅ Enhanced Check-Keys Endpoint
- **Problem**: Couldn't detect whitespace issues
- **Fix**: Now detects and reports whitespace in keys
- **Location**: `app/api/stripe/check-keys/route.ts`

---

## How to Diagnose the Issue

### Step 1: Check Key Configuration

Visit: `https://worldsportsacademy-site.vercel.app/api/stripe/check-keys`

This will show:
- ✅ If keys are set
- ✅ Key format (starts with sk_/pk_)
- ✅ Key length
- ✅ If there's whitespace
- ✅ If keys match (both test or both live)

### Step 2: Test if Key Actually Works

Visit: `https://worldsportsacademy-site.vercel.app/api/stripe/test-key`

This will:
- ✅ Make a real Stripe API call
- ✅ Show if the key is valid
- ✅ Show account ID if working
- ❌ Show detailed error if invalid

### Step 3: Check Vercel Logs

1. Go to https://vercel.com/loki98s-projects/worldsportsacademy-site
2. Click "Deployments" → Latest deployment
3. Click "Functions" tab
4. Look for `/api/stripe/payment-intent` logs
5. Check for:
   - `[Stripe] Initializing client with key: sk_test_...` (should appear)
   - Error messages with key preview

---

## Common Issues & Solutions

### Issue 1: Key Has Whitespace

**Symptoms**:
- Error: "Invalid API key"
- Key appears correct in Vercel dashboard

**Solution**:
- ✅ **FIXED**: Keys are now automatically trimmed
- If still failing, manually check Vercel:
  1. Go to Environment Variables
  2. Edit `STRIPE_SECRET_KEY`
  3. Remove any spaces before/after the key
  4. Save and redeploy

### Issue 2: Key is Truncated

**Symptoms**:
- Error: "Key appears to be truncated (too short: X chars)"
- Key length < 50 characters

**Solution**:
- Stripe keys should be ~100+ characters
- Check Vercel dashboard - key might be cut off
- Copy the **entire** key from Stripe Dashboard
- Paste into Vercel (no line breaks)

### Issue 3: Wrong Key Format

**Symptoms**:
- Error: "Key format is invalid (does not start with 'sk_')"
- Key preview doesn't start with `sk_test_` or `sk_live_`

**Solution**:
- Verify you copied the **Secret key** (not publishable key)
- Secret keys start with `sk_test_` or `sk_live_`
- Publishable keys start with `pk_test_` or `pk_live_`
- Make sure you're using the correct key type

### Issue 4: Key from Wrong Account

**Symptoms**:
- Error: "Invalid API key"
- Key format is correct
- Key length is correct

**Solution**:
- Verify key is from the correct Stripe account
- Check Stripe Dashboard → API keys
- Make sure you're using keys from the account that has your products
- Account ID should match: `acct_1SGcg9DrcV6C4UxV`

### Issue 5: Keys Not Redeployed

**Symptoms**:
- Keys updated in Vercel but still failing
- Error persists after updating

**Solution**:
- ⚠️ **CRITICAL**: Environment variables are loaded at **build time**
- After updating keys in Vercel, you **MUST** redeploy:
  1. Go to Deployments tab
  2. Click **⋯** on latest deployment
  3. Click **"Redeploy"**
  4. Wait 2-3 minutes

---

## Testing After Fix

### Test 1: Check Key Configuration
```bash
curl https://worldsportsacademy-site.vercel.app/api/stripe/check-keys
```

**Expected**: Should show keys are set and formatted correctly

### Test 2: Test Key Works
```bash
curl https://worldsportsacademy-site.vercel.app/api/stripe/test-key
```

**Expected**: Should return `"status": "success"` with account ID

### Test 3: Try Payment Flow
1. Visit booking page
2. Select sport, court, date, time
3. Click "Continue to Payment"
4. **Expected**: Payment form should appear (not error)

---

## What the New Error Messages Show

### Before:
```
Invalid API key
```

### After:
```
Stripe API key is invalid. Key preview: sk_test_51SG..., Length: 107 chars. 
Please verify your STRIPE_SECRET_KEY matches the key from your Stripe Dashboard. 
Test keys start with 'sk_test_', live keys start with 'sk_live_'. 
Please check your Vercel environment variables and redeploy after updating.
```

This tells you:
- ✅ Key is loaded (preview shown)
- ✅ Key length (107 chars = good, <50 = truncated)
- ✅ Key format (starts with sk_test_ = correct)
- ✅ What to do next

---

## Quick Checklist

- [ ] Keys are set in Vercel environment variables
- [ ] Keys have no leading/trailing spaces
- [ ] Secret key starts with `sk_test_` or `sk_live_`
- [ ] Publishable key starts with `pk_test_` or `pk_live_`
- [ ] Both keys are from same mode (test or live)
- [ ] Keys are from correct Stripe account
- [ ] Application has been **redeployed** after setting keys
- [ ] `/api/stripe/test-key` returns success
- [ ] Payment form loads when clicking "Continue to Payment"

---

## Next Steps

1. **Wait** for new deployment to complete (2-3 minutes)
2. **Test** `/api/stripe/test-key` endpoint
3. **Check** error messages - they should now be more detailed
4. **Verify** keys are trimmed and formatted correctly
5. **Try** payment flow again

The fixes are deployed. The new error messages will tell you exactly what's wrong! 🔍

