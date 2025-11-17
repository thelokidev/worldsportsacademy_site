# Membership Webhook Debugging Guide

## Issue
Memberships are not being created/updated in the database after successful Stripe payment.

## Root Causes

### 1. Missing STRIPE_WEBHOOK_SECRET
**Symptom**: Webhooks return 500 error "Webhook secret not configured"
**Fix**: Add `STRIPE_WEBHOOK_SECRET` to Vercel environment variables

### 2. Webhook Not Configured in Stripe Dashboard
**Symptom**: No webhook calls are being made to your endpoint
**Fix**: Configure webhook endpoint in Stripe Dashboard

### 3. Invalid or Missing SUPABASE_SERVICE_ROLE_KEY
**Symptom**: Vercel logs show `profileError: "Invalid API key"` or Supabase admin calls fail
**Fix**: Add `SUPABASE_SERVICE_ROLE_KEY` (from Supabase Settings → API) to Vercel env vars and redeploy. This key is REQUIRED for webhook inserts and auth admin lookups.

### 4. Profile Missing stripe_customer_id
**Symptom**: Webhook fails to find user by Stripe customer ID
**Fix**: The webhook now has fallback logic to find user by email and update profile

## Step-by-Step Fix

### STEP 1: Configure Stripe Webhook (CRITICAL)

1. Go to Stripe Dashboard: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter endpoint URL: `https://worldsportsacademy-site.vercel.app/api/stripe/webhooks`
4. Select these events (REQUIRED for memberships):
   - `customer.subscription.created` ✅
   - `customer.subscription.updated` ✅
   - `customer.subscription.deleted` ✅
   - `invoice.payment_succeeded` ✅
   - `invoice.payment_failed` ✅
   - `checkout.session.completed` ✅
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)

### STEP 2: Add Webhook Secret to Vercel

```bash
# In Vercel Dashboard (https://vercel.com/dashboard)
1. Go to your project → Settings → Environment Variables
2. Add new variable:
   - Name: STRIPE_WEBHOOK_SECRET
   - Value: whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx (from Step 1)
   - Apply to: Production, Preview, Development
3. Click "Save"
4. Redeploy the application
```

### STEP 3: Verify Webhook Configuration

Test the webhook endpoint:

```bash
# Using Stripe CLI
stripe listen --forward-to https://worldsportsacademy-site.vercel.app/api/stripe/webhooks

# Or in Stripe Dashboard
# Go to Webhooks → Click your endpoint → "Send test webhook"
# Select: customer.subscription.created
```

### STEP 4: Check Vercel Logs

After a test purchase:

1. Go to Vercel Dashboard → Your Project → Logs
2. Look for these log entries:
   ```
   [webhook:subscription.created] START
   [webhook:subscription.created] Looking up profile
   [webhook:subscription.created] Profile found
   [webhook:membership] Looking up plan
   [webhook:membership] Plan found
   [webhook:membership] Upserting membership
   [webhook:membership] SUCCESS
   ```

3. If you see errors, check for:
   - `ERROR: Profile not found` → Run the sync script below
   - `ERROR: Plan not found` → Verify Stripe Price IDs match database
   - `ERROR: Failed to upsert` → Check database constraints

### STEP 5: Manual Sync (If Webhook Failed)

If webhooks were not configured and you have existing purchases that didn't create memberships:

1. Run the sync script in Supabase SQL Editor:
   ```sql
   -- See scripts/fix-and-sync-membership.sql
   ```

2. Or check the success page fallback (automatic):
   - The `/dashboard/membership/success` page will attempt to sync
   - It retries 8 times with 2-second delay
   - Then falls back to direct Stripe subscription fetch

## Troubleshooting

### Error: "User not found for customer cus_xxx"

**Cause**: Profile doesn't have `stripe_customer_id` set

**Solution 1** (Automatic - new code has this):
- Webhook now fetches Stripe customer email
- Finds user in auth.users by email
- Updates profile with stripe_customer_id
- Creates membership

**Solution 2** (Manual):
```sql
-- Update profile with Stripe customer ID
UPDATE public.profiles
SET stripe_customer_id = 'cus_xxx'
WHERE id = 'user-uuid-here';
```

### Error: "Membership plan not found for price price_xxx"

**Cause**: Stripe Price ID doesn't match any membership plan

**Check database**:
```sql
SELECT id, name, stripe_price_id 
FROM public.membership_plans 
WHERE stripe_price_id IS NOT NULL;
```

**Verify in Stripe**:
- Check that the price ID in Stripe matches the database
- Run migration if needed: `supabase/migrations/20250117000000_update_stripe_product_ids.sql`
- Or run `scripts/update-membership-stripe-ids.sql` in Supabase SQL Editor to force-update the latest IDs provided by the client.

### Webhook Returns 500 Error

**Check**:
1. STRIPE_WEBHOOK_SECRET is set in Vercel
2. STRIPE_SECRET_KEY is set in Vercel
3. NEXT_PUBLIC_SUPABASE_URL is set
4. NEXT_PUBLIC_SUPABASE_ANON_KEY is set
5. SUPABASE_SERVICE_ROLE_KEY is set (required for webhooks)

**Redeploy** after adding any missing variables

### Membership Shows After Payment But Not in Database

This indicates:
1. Success page sync worked (fallback)
2. But webhook failed

**Fix**: Complete STEP 1 and STEP 2 above to fix webhooks

### Multiple Memberships Created

**Cause**: Constraint issue or webhook called multiple times

**Check**:
```sql
SELECT * FROM public.memberships 
WHERE user_id = 'user-uuid-here'
ORDER BY created_at DESC;
```

**Fix** (if needed):
```sql
-- Keep only the latest active membership
DELETE FROM public.memberships
WHERE id NOT IN (
  SELECT id FROM public.memberships
  WHERE user_id = 'user-uuid-here'
  ORDER BY created_at DESC
  LIMIT 1
);
```

## Verification Checklist

After implementing fixes:

- [ ] Webhook endpoint configured in Stripe
- [ ] STRIPE_WEBHOOK_SECRET added to Vercel
- [ ] Application redeployed
- [ ] Test webhook sent successfully
- [ ] Vercel logs show webhook received
- [ ] Test purchase creates membership in database
- [ ] Membership appears on dashboard immediately
- [ ] No errors in Vercel logs

## Enhanced Logging

The webhook handlers now include comprehensive logging:

- `[webhook:subscription.created] START` - Webhook received
- `[webhook:subscription.created] Looking up profile` - Finding user
- `[webhook:subscription.created] Profile found` - User found
- `[webhook:subscription.created] Trying email fallback` - Fallback activated
- `[webhook:membership] Looking up plan` - Finding membership plan
- `[webhook:membership] Plan found` - Plan matched
- `[webhook:membership] Upserting membership` - Creating/updating record
- `[webhook:membership] SUCCESS` - Membership created

Check Vercel logs for these markers to diagnose issues.

## Success Page Fallback

If webhooks fail, the success page has a fallback mechanism:

1. Retries checking for membership 8 times (2s delay each)
2. After retries, fetches subscription directly from Stripe
3. Manually creates membership record using service client
4. Redirects to dashboard if successful

This ensures memberships are created even if webhooks are delayed or fail.

## Testing

### Test Successful Flow

1. Go to `/memberships`
2. Select a plan and click "Get Started"
3. Use Stripe test card: `4242 4242 4242 4242`
4. Complete payment
5. Should redirect to success page, then to dashboard
6. Check Vercel logs for webhook entries
7. Verify membership appears in Supabase

### Test Webhook Directly

```bash
# Install Stripe CLI
stripe login

# Forward webhooks to local
stripe listen --forward-to http://localhost:3000/api/stripe/webhooks

# In another terminal, trigger events
stripe trigger customer.subscription.created
```

## Common Mistakes

1. **Forgetting to redeploy after adding env vars** → Always redeploy!
2. **Using wrong webhook URL** → Must be `/api/stripe/webhooks`
3. **Not selecting subscription events** → Must include all 6 subscription events
4. **Webhook secret from wrong environment** → Use test secret for test mode
5. **Service role key not set** → Webhooks bypass RLS, need service role

## Contact Support

If issues persist after following this guide:

1. Check Vercel logs: `vercel logs [deployment-url]`
2. Check Stripe webhook attempts in Dashboard
3. Verify Supabase service role permissions
4. Run diagnostic queries in Supabase SQL Editor

