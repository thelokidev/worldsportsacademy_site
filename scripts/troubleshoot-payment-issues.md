# Payment Troubleshooting Checklist

Since the database is correctly configured with Stripe IDs, let's check other potential issues:

## ✅ Database Status
- **CONFIRMED**: `drop_in_pricing` table has correct Stripe IDs
- `stripe_price_id`: `price_1SU8KqDrcV6C4UxVCCuNwOaE` ✅
- `stripe_product_id`: `prod_TR0LWsYW3ACwFQ` ✅

## Next Steps to Debug Payment Issues

### 1. Check Stripe API Keys in Vercel

**Action**: Verify Stripe keys are set in Vercel environment variables

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Verify these are set:
   - `STRIPE_SECRET_KEY` (must start with `sk_test_` or `sk_live_`)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (must start with `pk_test_` or `pk_live_`)
   - `STRIPE_WEBHOOK_SECRET` (optional, for webhooks)

5. **IMPORTANT**: After updating environment variables, **redeploy** your application
   - Go to **Deployments** tab
   - Click **Redeploy** on the latest deployment
   - Or push a new commit to trigger automatic deployment

### 2. Check Browser Console Errors

When attempting payment:

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try to make a booking with payment
4. Look for any red error messages
5. Common errors to look for:
   - `Failed to initialize payment`
   - `Invalid Stripe API key`
   - `Payment form is not ready yet`
   - `Failed to load payment form`
   - Network errors (404, 500, etc.)

### 3. Check Network Tab

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Filter by **Fetch/XHR**
4. Try to make a booking with payment
5. Look for these API calls:
   - `POST /api/stripe/payment-intent` - Should return 200 with `clientSecret`
   - If it returns 500 or 400, check the error response

### 4. Check Vercel Function Logs

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Deployments** tab
4. Click on the latest deployment
5. Click on **Functions** tab
6. Look for `/api/stripe/payment-intent` function logs
7. Check for any errors when payment is attempted

### 5. Test Payment Intent Creation

You can test the payment intent API directly:

**Option A: Using browser console**
```javascript
fetch('/api/stripe/payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ bookingId: 'YOUR_BOOKING_ID' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

**Option B: Using curl**
```bash
curl -X POST https://your-app.vercel.app/api/stripe/payment-intent \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_AUTH_COOKIE" \
  -d '{"bookingId":"YOUR_BOOKING_ID"}'
```

### 6. Verify Stripe Account Status

1. Go to https://dashboard.stripe.com
2. Check if your account is active
3. Verify you're using the correct mode (Test vs Live)
4. Check **Developers** → **API keys** to ensure keys match what's in Vercel

### 7. Common Error Messages and Solutions

| Error Message | Likely Cause | Solution |
|--------------|--------------|----------|
| `Payment form is not ready yet` | Stripe.js not loaded | Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| `Failed to initialize payment` | API error | Check Vercel function logs |
| `Invalid Stripe API key` | Wrong key format | Verify keys start with `pk_test_`/`pk_live_` |
| `Booking is not pending payment` | Booking already processed | Create new booking |
| `Drop-in pricing not configured` | Database query failed | Check Supabase connection |
| `Stripe did not return a client secret` | Stripe API issue | Check Stripe dashboard |

### 8. Verify Payment Flow Steps

The payment flow should work like this:

1. ✅ User selects sport, court, date, time
2. ✅ User clicks "Continue to Payment"
3. ✅ Booking is created with status `pending` via `/api/booking/create-pending`
4. ✅ Payment form appears inline
5. ✅ PaymentSheet component calls `/api/stripe/payment-intent`
6. ✅ API creates Stripe Payment Intent
7. ✅ Client secret is returned to frontend
8. ✅ Stripe Payment Element loads
9. ✅ User enters payment details
10. ✅ Payment is processed
11. ✅ Booking status changes to `confirmed`

**Check which step is failing:**

- If step 5 fails → API error (check Vercel logs)
- If step 7 fails → Stripe API error (check Stripe keys)
- If step 8 fails → Frontend error (check browser console)
- If step 10 fails → Payment method error (check card details)

## Quick Test Checklist

- [ ] Stripe API keys are set in Vercel
- [ ] Application has been redeployed after setting keys
- [ ] Browser console shows no errors
- [ ] Network tab shows successful `/api/stripe/payment-intent` call
- [ ] Vercel function logs show no errors
- [ ] Stripe dashboard shows payment intents being created
- [ ] Payment form loads and shows Stripe Elements

## Still Having Issues?

If you've checked all of the above and payment still doesn't work:

1. **Share the specific error message** you see (browser console or Vercel logs)
2. **Check the response from `/api/stripe/payment-intent`** in Network tab
3. **Check Vercel function logs** for the exact error
4. **Verify Stripe keys** are correct and from the right mode (test vs live)

The error messages we added to the code should now provide more specific information about what's failing.

