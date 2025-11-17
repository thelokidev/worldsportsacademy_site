# Webhook Testing Guide - Verify Automatic Sync

## ✅ Configuration Status

Your diagnostic shows:
- ✅ All environment variables configured
- ✅ Webhook endpoint ready
- ✅ Status: "ready"

## ⚠️ Important: Webhook URL Check

Your diagnostic shows the webhook URL as:
```
https://worldsportsacademy-site-96ubc0cnj-loki98s-projects.vercel.app/api/stripe/webhooks
```

This is a **preview deployment URL**. Make sure your Stripe webhook is configured to use the **production URL**:

```
https://worldsportsacademy-site.vercel.app/api/stripe/webhooks
```

### Fix Webhook URL in Stripe:

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click your endpoint (whimsical-breeze)
3. Click **"..."** → **Update details**
4. Change endpoint URL to: `https://worldsportsacademy-site.vercel.app/api/stripe/webhooks`
5. Click **Save**

---

## Test Webhook Flow

### STEP 1: Send Test Webhook

1. In Stripe Dashboard → Webhooks → Your endpoint
2. Click **"Send test webhook"**
3. Select event: **`customer.subscription.created`**
4. Click **Send test webhook**
5. Should see: **200 OK** response

### STEP 2: Check Vercel Logs

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → Your Project
2. Click **Logs** tab
3. Filter by: `[webhook`
4. Look for recent entries:

**✅ Success should show:**
```
[webhook:api] Webhook request received
[webhook:api] Event verified { type: 'customer.subscription.created', id: 'evt_...' }
[webhook:subscription.created] START
[webhook:subscription.created] Looking up profile
[webhook:subscription.created] Profile found
[webhook:membership] Looking up plan
[webhook:membership] Plan found
[webhook:membership] Upserting membership
[webhook:membership] SUCCESS
[webhook:api] SUCCESS
```

**❌ If you see errors:**
- `ERROR: Profile not found` → Webhook will try email fallback
- `ERROR: Plan not found` → Run `scripts/update-membership-stripe-ids.sql`
- `ERROR: Failed to upsert` → Check database constraints

### STEP 3: Test Real Purchase

1. **Use test card**: `4242 4242 4242 4242`
2. **Complete purchase** on `/memberships` page
3. **Check Vercel logs immediately** - should see webhook within 5 seconds
4. **Refresh membership dashboard** - should show active membership

### STEP 4: Verify in Database

Run in Supabase SQL Editor:

```sql
-- Check latest membership created
SELECT 
  u.email,
  m.status,
  mp.name as plan_name,
  m.stripe_subscription_id,
  m.current_period_end,
  m.created_at
FROM auth.users u
INNER JOIN public.memberships m ON u.id = m.user_id
INNER JOIN public.membership_plans mp ON m.plan_id = mp.id
ORDER BY m.created_at DESC
LIMIT 5;
```

Should show:
- **status**: `active`
- **plan_name**: The plan you purchased
- **stripe_subscription_id**: Starts with `sub_`
- **current_period_end**: Future date

---

## Fix Existing Broken Membership

For `lokipoki49@gmail.com` with subscription `sub_1SUGARDrcV6C4UxV6sSdFq9z`:

### Option 1: Automatic (Easiest)

1. User logs in as `lokipoki49@gmail.com`
2. Visit: `/dashboard/membership/success?session_id=cs_test_...`
   - Get session_id from Stripe checkout session
3. Page will auto-sync membership from Stripe

### Option 2: Manual SQL (If needed)

Run in Supabase SQL Editor:

```sql
-- Get user ID
SELECT id, email FROM auth.users WHERE email = 'lokipoki49@gmail.com';

-- Get plan ID for Squash + Gym
SELECT id, name, stripe_price_id 
FROM public.membership_plans 
WHERE stripe_price_id = 'price_1SU8J6DrcV6C4UxVLHTPsSTb';

-- Then update membership (replace UUIDs with actual values)
UPDATE public.memberships
SET 
  status = 'active',
  current_period_start = '2025-11-17 00:19:00+00'::timestamptz,
  current_period_end = '2025-12-17 00:19:00+00'::timestamptz,
  cancel_at_period_end = false,
  canceled_at = NULL,
  updated_at = NOW()
WHERE stripe_subscription_id = 'sub_1SUGARDrcV6C4UxV6sSdFq9z';
```

---

## Monitor Webhook Health

### Check Webhook Attempts in Stripe

1. Go to Stripe Dashboard → Webhooks → Your endpoint
2. Click **"..."** → **View events**
3. See all webhook attempts:
   - ✅ Green = Success (200)
   - ❌ Red = Failed (4xx/5xx)
   - ⏳ Yellow = Pending

### Check Recent Webhooks

Look for:
- `customer.subscription.created` - Should be 200 OK
- `customer.subscription.updated` - Should be 200 OK
- `invoice.payment_succeeded` - Should be 200 OK

If any show errors, click to see response details.

---

## Troubleshooting

### Webhook Not Receiving Events

**Check:**
1. Stripe webhook URL matches production URL exactly
2. All 10 events are selected in Stripe
3. Webhook secret in Stripe matches `STRIPE_WEBHOOK_SECRET` in Vercel

**Fix:**
- Update webhook URL in Stripe to production URL
- Re-copy webhook secret if you recreated endpoint
- Redeploy Vercel after updating env vars

### Webhook Receiving But Failing

**Check Vercel logs for:**
- `[webhook:api] ERROR` - Configuration issue
- `[webhook:subscription.created] ERROR` - Processing issue
- `[webhook:membership] ERROR` - Database issue

**Common fixes:**
- Profile not found → Webhook auto-creates from email (should work)
- Plan not found → Run `scripts/update-membership-stripe-ids.sql`
- Database error → Check service role key is correct

### Membership Created But Wrong Status

**Check:**
- Subscription status in Stripe (should be "active")
- Membership status in Supabase (should be "active")

**Fix:**
- Webhook should auto-update on `subscription.updated` event
- Or manually update: `UPDATE memberships SET status = 'active' WHERE stripe_subscription_id = 'sub_...'`

---

## Success Indicators

✅ **Everything working when:**
1. Test webhook returns 200 OK
2. Vercel logs show `[webhook:api] SUCCESS`
3. Test purchase creates membership in Supabase
4. Dashboard shows active membership immediately
5. SQL query shows `status = 'active'`

---

## Next Steps

1. ✅ Verify webhook URL in Stripe (use production URL)
2. ✅ Send test webhook from Stripe
3. ✅ Check Vercel logs for success
4. ✅ Test real purchase
5. ✅ Verify membership appears in database
6. ✅ Fix existing broken membership (if needed)

**Once all steps pass, automatic sync is working!** 🎉

