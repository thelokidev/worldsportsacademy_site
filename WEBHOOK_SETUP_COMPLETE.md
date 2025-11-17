# Complete Webhook Setup Guide - Fix "No Membership After Payment"

## Problem
Stripe checkout completes successfully but membership doesn't appear in Supabase database. The webhook is not syncing data automatically.

## Root Cause
Missing environment variables prevent the webhook from connecting to Supabase to create membership records.

---

## CRITICAL: Required Environment Variables

You MUST set these 3 variables in Vercel for webhooks to work:

### 1. STRIPE_WEBHOOK_SECRET
- **Where to find**: Stripe Dashboard → Developers → Webhooks → Your endpoint → Signing secret
- **Format**: `whsec_...`
- **Purpose**: Verifies webhook requests are from Stripe

### 2. STRIPE_SECRET_KEY  
- **Where to find**: Stripe Dashboard → Developers → API keys → Secret key
- **Format**: `sk_test_...` or `sk_live_...`
- **Purpose**: Allows webhook to fetch Stripe customer data

### 3. SUPABASE_SERVICE_ROLE_KEY ⚠️ **MOST IMPORTANT**
- **Where to find**: Supabase Dashboard → Project Settings → API → service_role key
- **Format**: Starts with `eyJhbG...` (very long JWT token)
- **Purpose**: Allows webhook to bypass RLS and write to database
- **⚠️ This is the key that's likely missing!**

---

## Step-by-Step Fix (5 minutes)

### STEP 1: Get Supabase Service Role Key

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Project Settings** (gear icon) → **API**
4. Scroll to **Project API keys**
5. Find **service_role** key (NOT the anon key!)
6. Click to reveal and copy it

### STEP 2: Set Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add/Update these variables:

```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (paste your key)
Apply to: Production, Preview, Development
```

```
Name: STRIPE_WEBHOOK_SECRET  
Value: whsec_... (from Stripe webhook endpoint)
Apply to: Production, Preview, Development
```

```
Name: STRIPE_SECRET_KEY
Value: sk_test_... or sk_live_...
Apply to: Production, Preview, Development
```

5. Click **Save** for each

### STEP 3: Redeploy Application

1. Go to **Deployments** tab in Vercel
2. Click the **...** menu on latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete (~2 minutes)

### STEP 4: Verify Configuration

Visit this URL (replace with your domain):
```
https://worldsportsacademy-site.vercel.app/api/webhooks/diagnostic
```

You should see:
```json
{
  "status": "ready",
  "webhook_endpoint": {
    "ready": true
  },
  "missing_vars": []
}
```

If you see `"missing_vars"` with items in it, those environment variables are not set correctly.

### STEP 5: Configure Stripe Webhook Events

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click your endpoint (whimsical-breeze)
3. Click **"..."** → **Update details**
4. Ensure URL is: `https://worldsportsacademy-site.vercel.app/api/stripe/webhooks` (no double slash)
5. Click **Select events** and ensure these are checked:

**Membership Events (Required):**
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`
- ✅ `checkout.session.completed`

**Drop-in Events (Already configured):**
- ✅ `payment_intent.succeeded`
- ✅ `payment_intent.payment_failed`
- ✅ `charge.refunded`
- ✅ `refund.updated`

6. Click **Save**

### STEP 6: Test Webhook

1. In Stripe Dashboard → Webhooks → Your endpoint
2. Click **"Send test webhook"**
3. Select **`customer.subscription.created`**
4. Click **Send**
5. Check response - should see `200 OK`

### STEP 7: Check Vercel Logs

1. Go to Vercel → Your Project → **Logs**
2. Look for recent entries:

**✅ Success looks like:**
```
[webhook:api] Webhook request received
[webhook:api] Event verified { type: 'customer.subscription.created', id: 'evt_...' }
[webhook:subscription.created] START
[webhook:subscription.created] Profile found
[webhook:membership] Plan found
[webhook:membership] SUCCESS
[webhook:api] SUCCESS
```

**❌ Failure looks like:**
```
[webhook:api] ERROR: SUPABASE_SERVICE_ROLE_KEY not configured
```
or
```
[webhook:subscription.created] ERROR: Profile not found
```

---

## Test Real Payment Flow

1. **Test purchase** (use test card: `4242 4242 4242 4242`)
2. **Check Vercel logs** - should see webhook SUCCESS within seconds
3. **Refresh membership page** - should show active membership
4. **Run SQL query** in Supabase to verify:

```sql
SELECT 
  u.email,
  m.status,
  mp.name as plan_name,
  m.current_period_end
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.memberships m ON u.id = m.user_id
LEFT JOIN public.membership_plans mp ON m.plan_id = mp.id
WHERE u.email = 'lokipoki49@gmail.com';
```

Should return:
- **status**: `active`  
- **plan_name**: `Squash + Gym Monthly Membership`
- **current_period_end**: Future date

---

## Fix Existing Broken Memberships

For users who already purchased but don't have memberships in the database:

### Option 1: Automatic Retry (Easiest)

1. Have the user log in
2. Go to `/dashboard/membership/success?session_id=cs_test_...` (get session_id from Stripe)
3. Page will automatically sync from Stripe (up to 8 retries)

### Option 2: Manual SQL Script

Run in Supabase SQL Editor:

```sql
-- Update Stripe IDs in membership plans
\i scripts/update-membership-stripe-ids.sql

-- Sync specific subscription
-- Get subscription ID from Stripe (sub_...)
-- Update the email and IDs in: scripts/fix-and-sync-membership.sql
-- Then run it
```

---

## Monitoring & Debugging

### Check Webhook Logs
- **Vercel Logs**: Real-time view of webhook processing
- **Stripe Dashboard**: See webhook attempts and responses

### Check Database
```sql
-- Quick membership status check
SELECT email, status, plan_name, stripe_subscription_id
FROM scripts/query-subscription-summary.sql;

-- Find problems
SELECT * FROM scripts/query-subscription-issues.sql;
```

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| "SUPABASE_SERVICE_ROLE_KEY not configured" | Missing env var | Set service role key in Vercel |
| "Profile not found" | User profile doesn't exist | Webhook will auto-create from email |
| "Plan not found for price" | Stripe price ID doesn't match DB | Run `update-membership-stripe-ids.sql` |
| "Invalid API key" | Wrong Stripe key or expired | Update STRIPE_SECRET_KEY |
| Webhook times out | Database or Stripe slow | Check logs, retry automatic |

---

## What Happens Now (Automatic Flow)

### On Successful Payment:

1. ✅ Stripe sends `customer.subscription.created` webhook
2. ✅ Vercel receives it at `/api/stripe/webhooks`
3. ✅ Webhook verifies signature using `STRIPE_WEBHOOK_SECRET`
4. ✅ Webhook looks up user profile by Stripe customer ID
5. ✅ If no profile, fetches email from Stripe and creates profile
6. ✅ Webhook looks up membership plan by Stripe price ID
7. ✅ If plan missing Stripe IDs, auto-heals from mapping
8. ✅ Webhook creates/updates membership in Supabase (using service role key)
9. ✅ Dashboard shows active membership immediately

### Fallback (if webhook delayed):

1. ✅ Success page checks for membership (8 retries over 16 seconds)
2. ✅ If not found, fetches subscription directly from Stripe
3. ✅ Manually creates membership using service role client
4. ✅ Redirects to dashboard with active membership

**Result**: User ALWAYS gets their membership, even if webhook temporarily fails!

---

## Security Notes

- **service_role key**: Bypasses RLS. Never expose client-side. Webhooks need it to write to DB.
- **webhook secret**: Prevents fake webhook requests. Rotates when you recreate endpoint.
- **Stripe secret key**: Full API access. Keep in server env vars only.

---

## Verification Checklist

After completing setup, verify:

- [ ] All 3 environment variables set in Vercel
- [ ] Application redeployed after adding variables
- [ ] `/api/webhooks/diagnostic` returns `status: "ready"`
- [ ] Stripe webhook has all 10 events selected
- [ ] Test webhook returns 200 OK
- [ ] Vercel logs show `[webhook:api] SUCCESS`
- [ ] Test purchase creates membership in Supabase
- [ ] Dashboard shows active membership immediately
- [ ] `query-subscription-summary.sql` shows correct status

---

## Still Having Issues?

1. **Check diagnostic endpoint**: `/api/webhooks/diagnostic`
2. **Check Vercel logs**: Look for `[webhook:api]` entries
3. **Check Stripe webhook attempts**: See if requests are reaching your endpoint
4. **Run diagnostic SQL**: `scripts/query-subscription-issues.sql`
5. **Verify Stripe IDs**: Ensure price IDs in Stripe match `membership_plans` table

---

## Summary

The fix requires:
1. ✅ Set `SUPABASE_SERVICE_ROLE_KEY` in Vercel (most critical)
2. ✅ Set `STRIPE_WEBHOOK_SECRET` in Vercel
3. ✅ Set `STRIPE_SECRET_KEY` in Vercel  
4. ✅ Redeploy application
5. ✅ Configure 10 events in Stripe webhook
6. ✅ Test and verify

**After this setup, all future payments will automatically sync to Supabase - no more manual SQL!**

