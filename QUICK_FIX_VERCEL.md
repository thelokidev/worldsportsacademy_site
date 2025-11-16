# Quick Fix for Vercel Deployment Issues

## 🚨 Critical: Fix These Issues Now

### Issue 1: Invalid Stripe API Key ❌

**Error**: `Invalid API key` in payment intent creation

**Fix Steps**:

1. **Get Stripe Keys**:
   - Go to https://dashboard.stripe.com/test/apikeys
   - Copy **Secret key** (starts with `sk_test_...`)
   - Copy **Publishable key** (starts with `pk_test_...`)

2. **Set in Vercel**:
   - Go to https://vercel.com/dashboard → Your Project → Settings → Environment Variables
   - Add/Update:
     ```
     STRIPE_SECRET_KEY = sk_test_xxxxxxxxxxxxx
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_xxxxxxxxxxxxx
     ```
   - **Select Environment**: Production, Preview, Development (or all)
   - Click **Save**

3. **Redeploy**:
   - Go to Deployments tab
   - Click **⋯** → **Redeploy** on latest deployment
   - **OR** push a new commit

### Issue 2: NODE_ENV Warning ⚠️

**Warning**: `NODE_ENV was incorrectly set to "development"`

**Fix**:
- Go to Vercel → Settings → Environment Variables
- **DELETE** any `NODE_ENV` variable if it exists
- Vercel sets this automatically - don't override it!

### Issue 3: Auth Code Exchange Error 🔐

**Error**: `both auth code and code verifier should be non-empty`

**Fix**:
- This is usually a one-time issue
- Clear browser cookies and try again
- If persists, check Supabase auth redirect URLs

## ✅ Verification

After fixing:

1. **Check Vercel Logs**:
   - Deployments → Latest → Functions → `/api/stripe/payment-intent`
   - Should see no "Invalid API key" errors

2. **Test Payment**:
   - Try booking with payment
   - Payment form should load
   - No errors in browser console

3. **Check Environment**:
   - Verify keys are set for correct environment (Production/Preview)
   - Keys should match your Stripe account mode (test vs live)

## 📝 Important Notes

- **Environment variables are loaded at BUILD TIME** - you MUST redeploy after updating
- **Test vs Live keys**: Make sure both keys are from the same mode
- **No spaces**: Don't add spaces around the `=` sign in environment variables
- **Full keys**: Copy the entire key, not just part of it

## 🔍 Still Not Working?

1. **Double-check keys** in Stripe Dashboard match Vercel
2. **Check deployment logs** for build errors
3. **Verify environment scope** (Production vs Preview)
4. **Test locally first** with `.env.local` to confirm keys work

