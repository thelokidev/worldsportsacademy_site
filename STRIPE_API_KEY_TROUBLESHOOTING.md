# Stripe API Key Troubleshooting Guide

## Error: "Invalid API key"

If you're seeing the "Invalid API key" error when clicking "Continue to Payment", follow these steps:

## 🚨 Vercel Deployment Issues

If you're deploying on **Vercel** and seeing this error even after updating keys:

### Critical: Vercel Requires Redeployment

**Environment variables in Vercel are only loaded during build time.** Simply updating them in the dashboard is NOT enough!

1. **Update Environment Variables in Vercel:**
   - Go to your project: https://vercel.com/dashboard
   - Navigate to: **Settings → Environment Variables**
   - Verify/Update:
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (must start with `pk_test_` or `pk_live_`)
     - `STRIPE_SECRET_KEY` (must start with `sk_test_` or `sk_live_`)
     - `STRIPE_WEBHOOK_SECRET` (must start with `whsec_`)

2. **Redeploy Your Application:**
   - **Option A:** Trigger a new deployment
     - Go to **Deployments** tab
     - Click **"Redeploy"** on the latest deployment
     - Or push a new commit to trigger automatic deployment
   - **Option B:** Use Vercel CLI
     ```bash
     vercel --prod
     ```

3. **Verify Environment Variables Are Loaded:**
   - Check the deployment logs for any environment variable warnings
   - The build should complete successfully

### Common Vercel Issues

#### Issue: Keys Updated But Error Persists
**Cause:** Environment variables were updated but deployment wasn't redeployed.

**Solution:** 
- Redeploy the application (see step 2 above)
- Wait for the new deployment to complete
- Clear browser cache and test again

#### Issue: Test vs Live Mode Mismatch
**Cause:** Using test keys in production or vice versa.

**Solution:**
- **Production:** Use `pk_live_` and `sk_live_` keys
- **Preview/Development:** Use `pk_test_` and `sk_test_` keys
- Make sure both keys are from the same mode

#### Issue: Keys Rotated But Not Updated in Vercel
**Cause:** Keys were regenerated in Stripe but Vercel still has old keys.

**Solution:**
1. Get the new keys from Stripe Dashboard
2. Update them in Vercel Environment Variables
3. **Redeploy** (this is critical!)

---

## Local Development Issues

If you're seeing the "Invalid API key" error in local development:

### Step 1: Check Your Environment Variables

1. **Locate your `.env.local` file** in the root directory of your project (same level as `package.json`)

2. **Verify the following variables are set:**
   ```bash
   STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
   ```

### Step 2: Get Your Stripe API Keys

1. **Go to Stripe Dashboard:**
   - Test mode: https://dashboard.stripe.com/test/apikeys
   - Live mode: https://dashboard.stripe.com/apikeys

2. **Copy your keys:**
   - **Publishable key** (starts with `pk_test_` for test mode or `pk_live_` for live mode)
   - **Secret key** (starts with `sk_test_` for test mode or `sk_live_` for live mode)

### Step 3: Update Your `.env.local` File

Make sure your `.env.local` file contains:

```bash
# Stripe Payments
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Important Notes:**
- The publishable key **must** start with `pk_test_` (test mode) or `pk_live_` (live mode)
- The secret key **must** start with `sk_test_` (test mode) or `sk_live_` (live mode)
- Do **NOT** use quotes around the values
- Do **NOT** include any spaces before or after the `=` sign

### Step 4: Restart Your Development Server

After updating your `.env.local` file:

1. **Stop your development server** (Ctrl+C)
2. **Restart it:**
   ```bash
   npm run dev
   ```

**Important:** Environment variables are loaded when the server starts. You must restart the server for changes to take effect.

### Step 5: Verify the Keys Are Loaded

1. Check the browser console for any errors
2. The payment form should now load without the "Invalid API key" error

### Common Issues

#### Issue 1: Keys Not Found
**Error:** "Stripe publishable key is not configured"

**Solution:** 
- Make sure `.env.local` exists in the root directory
- Verify the variable name is exactly `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (case-sensitive)
- Restart your development server

#### Issue 2: Invalid Key Format
**Error:** "Invalid Stripe publishable key format"

**Solution:**
- Verify your key starts with `pk_test_` or `pk_live_`
- Make sure you copied the entire key (they're quite long)
- Check for any extra spaces or characters

#### Issue 3: Test vs Live Mode Mismatch
**Error:** Various Stripe errors

**Solution:**
- Make sure both keys are from the same mode (both test or both live)
- Test mode keys start with `pk_test_` and `sk_test_`
- Live mode keys start with `pk_live_` and `sk_live_`

### Still Having Issues?

1. **Check the browser console** for detailed error messages
2. **Check the server logs** for any Stripe-related errors
3. **Verify your Stripe account** is active and in the correct mode
4. **Try creating new API keys** in the Stripe Dashboard

### Quick Test

To quickly verify your keys are working, you can check the browser console. If the keys are valid, you should see the Stripe Elements form loading. If there's an error, it will be displayed in the payment modal.

