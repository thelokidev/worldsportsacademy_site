# Fix Vercel Environment Variables

## Issue 1: Invalid Stripe API Key

**Error**: `Invalid API key`

**Solution**:

1. **Get your Stripe API keys**:
   - Go to https://dashboard.stripe.com/test/apikeys (for test mode)
   - Or https://dashboard.stripe.com/apikeys (for live mode)
   - Copy the **Secret key** (starts with `sk_test_` or `sk_live_`)
   - Copy the **Publishable key** (starts with `pk_test_` or `pk_live_`)

2. **Set them in Vercel**:
   - Go to https://vercel.com/dashboard
   - Select your project
   - Go to **Settings** → **Environment Variables**
   - Add/Update these variables:
     - `STRIPE_SECRET_KEY` = `sk_test_...` (your secret key)
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_test_...` (your publishable key)
   - **IMPORTANT**: Make sure to select the correct **Environment** (Production, Preview, Development)
   - Click **Save**

3. **Redeploy your application**:
   - Go to **Deployments** tab
   - Click **⋯** (three dots) on the latest deployment
   - Click **Redeploy**
   - Or push a new commit to trigger automatic deployment

4. **Verify the keys are loaded**:
   - After redeployment, check the function logs
   - The error should be gone if keys are correct


## Issue 2: Auth Code Exchange Error

**Error**: `both auth code and code verifier should be non-empty`

**Solution**:

This is a Supabase OAuth PKCE flow issue. The code verifier might not be stored properly.

**Quick fix**:
1. Clear browser cookies for your domain
2. Try logging in again
3. If the issue persists, check Supabase auth settings

**If issue persists**:
- Check Supabase Dashboard → Authentication → URL Configuration
- Ensure redirect URLs are correctly configured
- Verify OAuth provider settings if using social login

## Verification Checklist

After fixing the environment variables:

- [ ] `STRIPE_SECRET_KEY` is set in Vercel (starts with `sk_test_` or `sk_live_`)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set in Vercel (starts with `pk_test_` or `pk_live_`)
- [ ] Application has been **redeployed** after updating environment variables
- [ ] Stripe keys match the mode you're using (test vs live)
- [ ] Both keys are from the same Stripe account

## Testing After Fix

1. **Test Stripe Payment**:
   - Try making a booking with payment
   - Check Vercel function logs - should see no "Invalid API key" errors
   - Payment form should load correctly

2. **Test Authentication**:
   - Try logging in/out
   - Check browser console for auth errors
   - Verify redirects work correctly

## Still Having Issues?

If you're still seeing errors after fixing environment variables:

1. **Double-check the keys**:
   - Make sure there are no extra spaces
   - Make sure you copied the entire key
   - Verify keys are from the correct Stripe account

2. **Check deployment logs**:
   - Go to Vercel → Deployments → Latest deployment → Functions
   - Look for any errors during build or runtime

3. **Verify environment scope**:
   - Make sure keys are set for the correct environment (Production/Preview/Development)
   - Production deployments need Production environment variables

4. **Test locally first**:
   - Set keys in `.env.local`
   - Test locally with `npm run dev`
   - If it works locally but not in Vercel, it's an environment variable configuration issue

