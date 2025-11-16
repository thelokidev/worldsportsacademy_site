# 🚨 URGENT: Fix Stripe API Key Error

## Problem
Your website shows: **"Invalid Stripe API key. Please check your STRIPE_SECRET_KEY in .env/local"**

This error appears because the Stripe secret key is either:
1. Not set in Vercel environment variables
2. Set incorrectly (wrong format or typo)
3. Environment variables were updated but app wasn't redeployed

## ✅ Your Stripe Account Status
- **Account ID**: `acct_1SGcg9DrcV6C4UxV`
- **Status**: Active and working
- **Product IDs verified**: All 4 products configured correctly
- **Database**: Correctly configured with Stripe IDs

**The issue is ONLY with Vercel environment variables**

---

## 🔧 EXACT STEPS TO FIX (Follow in order)

### Step 1: Get Your Stripe Keys

1. Open https://dashboard.stripe.com/test/apikeys in a new tab
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`) - Click "Reveal test key" to see it
3. **Copy BOTH keys** (you'll need them in Step 2)

### Step 2: Set Keys in Vercel

1. Go to https://vercel.com/loki98s-projects/worldsportsacademy-site/settings/environment-variables
2. Look for existing variables named:
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

3. **If they exist**: Click the ⋯ menu → Edit → Paste the new value → Save
4. **If they don't exist**: Click "Add" button:
   
   **Variable 1:**
   ```
   Name: STRIPE_SECRET_KEY
   Value: [Paste your sk_test_... key here]
   Environment: Production (check this box)
   ```
   Click Save
   
   **Variable 2:**
   ```
   Name: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   Value: [Paste your pk_test_... key here]
   Environment: Production (check this box)
   ```
   Click Save

### Step 3: Redeploy (CRITICAL!)

**⚠️ Environment variables are only loaded during build time. You MUST redeploy!**

1. Go to https://vercel.com/loki98s-projects/worldsportsacademy-site/deployments
2. Find the latest deployment (top of list)
3. Click the **⋯** (three dots) on the right
4. Click **"Redeploy"**
5. Wait 2-3 minutes for deployment to complete

### Step 4: Verify Fix

1. Once deployment shows "Ready", visit your site: https://worldsportsacademy-site.vercel.app/memberships
2. Click "Get Started" on any membership
3. The error message should be gone
4. Payment form should load correctly

---

## 🔍 Quick Verification Checklist

Before redeploying, verify:

- [ ] `STRIPE_SECRET_KEY` starts with `sk_test_` (or `sk_live_` for live mode)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` starts with `pk_test_` (or `pk_live_`)
- [ ] Both keys are from the same mode (both test OR both live, not mixed)
- [ ] No extra spaces before or after the keys
- [ ] Environment is set to "Production"
- [ ] You clicked "Save" after entering each variable

---

## ❓ Common Mistakes

| Mistake | Solution |
|---------|----------|
| "I set the variables but still see the error" | Did you redeploy? Variables don't update without redeploying |
| "Which keys do I use?" | Use **Test mode** keys (sk_test_ and pk_test_) until ready for production |
| "I see pk_live_ and sk_test_" | Keys must match! Both test OR both live, never mixed |
| "Where's the secret key?" | In Stripe Dashboard, click "Reveal test key" button |
| "NODE_ENV is set to development" | Remove NODE_ENV from Vercel (let Vercel set it automatically) |

---

## 📞 Still Not Working?

If the error persists after following all steps:

1. **Double-check the keys**:
   - Copy them again from Stripe Dashboard
   - Make sure you copied the entire key (they're long!)
   - Check for any trailing spaces

2. **Verify in Vercel**:
   - Go to Settings → Environment Variables
   - Click "Edit" on each variable
   - Verify the value matches exactly what you copied

3. **Check deployment logs**:
   - Go to Deployments → Latest deployment → Functions
   - Look for `/api/stripe/payment-intent` logs
   - Should show no "Invalid API key" errors

4. **Test the key directly**:
   - Go to https://dashboard.stripe.com/test/apikeys
   - Try creating a test payment to verify the key works

---

## 🎯 What Fixed This Should Look Like

After successful deployment, you should see:
- ✅ No error messages on the membership page
- ✅ "Get Started" button opens Stripe checkout
- ✅ Payment form loads correctly
- ✅ You can enter test card details (use `4242 4242 4242 4242`)

---

## 📝 Test Card for Verification

Once fixed, test with these card details:
- **Card number**: 4242 4242 4242 4242
- **Expiry**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

---

## Direct Links

- **Stripe Test Keys**: https://dashboard.stripe.com/test/apikeys
- **Vercel Env Variables**: https://vercel.com/loki98s-projects/worldsportsacademy-site/settings/environment-variables
- **Vercel Deployments**: https://vercel.com/loki98s-projects/worldsportsacademy-site/deployments
- **Your Live Site**: https://worldsportsacademy-site.vercel.app

