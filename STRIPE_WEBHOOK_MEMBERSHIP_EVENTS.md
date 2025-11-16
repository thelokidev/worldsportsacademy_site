# Add Membership Subscription Events to Stripe Webhook

## Current Status
You have 4 events configured (for drop-in bookings):
- ✅ `charge.refunded`
- ✅ `payment_intent.payment_failed`
- ✅ `payment_intent.succeeded`
- ✅ `refund.updated`

## Missing Events (Required for Memberships)
You need to add these 6 subscription events:

### Required Subscription Events:
1. ✅ `customer.subscription.created` - When a new membership subscription is created
2. ✅ `customer.subscription.updated` - When subscription status changes (upgrade/downgrade)
3. ✅ `customer.subscription.deleted` - When subscription is canceled
4. ✅ `invoice.payment_succeeded` - When subscription payment succeeds
5. ✅ `invoice.payment_failed` - When subscription payment fails
6. ✅ `checkout.session.completed` - When checkout completes (backup trigger)

## How to Add These Events

### Step 1: In Stripe Dashboard
1. Go to: https://dashboard.stripe.com/webhooks
2. Click on your existing webhook: `whimsical-breeze`
3. Click "Edit" or the webhook name

### Step 2: Add Events
1. In the "Events" section, click "All events" tab
2. Use the search bar to find each event:
   - Search: `customer.subscription.created` → Check the box
   - Search: `customer.subscription.updated` → Check the box
   - Search: `customer.subscription.deleted` → Check the box
   - Search: `invoice.payment_succeeded` → Check the box
   - Search: `invoice.payment_failed` → Check the box
   - Search: `checkout.session.completed` → Check the box

3. OR click "Select events" → Search and add each one

### Step 3: Fix Endpoint URL
**IMPORTANT**: Your endpoint URL has a double slash:
- ❌ Current: `https://worldsportsacademy-site.vercel.app//api/stripe/webhooks`
- ✅ Correct: `https://worldsportsacademy-site.vercel.app/api/stripe/webhooks`

Remove the extra `/` before `/api`

### Step 4: Save
Click "Save destination" at the bottom

## Final Event List (10 Total)

**Drop-in Bookings (4 events):**
- ✅ `charge.refunded`
- ✅ `payment_intent.payment_failed`
- ✅ `payment_intent.succeeded`
- ✅ `refund.updated`

**Membership Subscriptions (6 events):**
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`
- ✅ `checkout.session.completed`

## Verify Configuration

After saving:
1. Your webhook should show "10 events" selected
2. Test by making a test membership purchase
3. Check Vercel logs for: `[webhook:subscription.created] START`
4. Verify membership appears in database

## Quick Search Terms

Copy-paste these into the search bar one by one:
```
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.payment_succeeded
invoice.payment_failed
checkout.session.completed
```

