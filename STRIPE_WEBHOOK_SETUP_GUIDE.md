# Stripe Webhook Configuration Guide

## Overview
This guide provides exact instructions for configuring Stripe webhooks to integrate with the World Sports Academy payment system. All webhook events must be configured to point to your application's webhook endpoint.

## Webhook Endpoint URL

**Production/Live Mode:**
```
https://yourdomain.com/api/stripe/webhooks
```

**Development/Test Mode:**
```
https://your-app.vercel.app/api/stripe/webhooks
```
OR
```
http://localhost:3000/api/stripe/webhooks (for local testing with Stripe CLI)
```

## Complete List of Required Events

### **CRITICAL: Payment Processing Events (Required for Booking Payments)**

These events are essential for the new in-app PaymentSheet booking flow:

1. **`payment_intent.succeeded`**
   - **Purpose**: Confirms successful payment for drop-in bookings
   - **Action**: Finalizes booking payment, updates booking status to "confirmed"
   - **Required**: ✅ YES - Critical for booking confirmations

2. **`payment_intent.payment_failed`**
   - **Purpose**: Handles failed payment attempts
   - **Action**: Marks booking as cancelled, records error details, triggers alerts
   - **Required**: ✅ YES - Critical for payment failure handling

### **CRITICAL: Refund Processing Events (Required for Cancellations)**

These events are essential for automatic refund processing:

3. **`charge.refunded`**
   - **Purpose**: Tracks when a charge is refunded
   - **Action**: Creates refund records, updates booking refund status
   - **Required**: ✅ YES - Critical for refund tracking

4. **`refund.updated`**
   - **Purpose**: Updates refund status changes (pending → succeeded/failed)
   - **Action**: Syncs refund status with database, updates booking refund_status
   - **Required**: ✅ YES - Critical for refund status updates

### **Optional: Membership Subscription Events (For Future Use)**

These events support membership subscriptions but are not required for drop-in bookings:

5. **`customer.subscription.created`**
   - **Purpose**: Creates membership when subscription starts
   - **Required**: ⚠️ Optional - Only needed if using membership subscriptions

6. **`customer.subscription.updated`**
   - **Purpose**: Updates membership when subscription changes
   - **Required**: ⚠️ Optional - Only needed if using membership subscriptions

7. **`customer.subscription.deleted`**
   - **Purpose**: Cancels membership when subscription ends
   - **Required**: ⚠️ Optional - Only needed if using membership subscriptions

8. **`invoice.payment_succeeded`**
   - **Purpose**: Records successful subscription payments
   - **Required**: ⚠️ Optional - Only needed if using membership subscriptions

9. **`invoice.payment_failed`**
   - **Purpose**: Handles failed subscription payments
   - **Required**: ⚠️ Optional - Only needed if using membership subscriptions

10. **`checkout.session.completed`**
    - **Purpose**: Handles completion of Stripe Checkout sessions (legacy flow)
    - **Note**: Not needed for new PaymentSheet flow, but kept for backward compatibility
    - **Required**: ⚠️ Optional - Only if using Stripe Checkout redirects

## Step-by-Step Configuration Instructions

### **For Comet Agent / Automation Tool:**

```
TASK: Configure Stripe Webhooks

PREREQUISITES:
1. Stripe account must be set up (test mode or live mode)
2. Application must be deployed with webhook endpoint accessible
3. Environment variable STRIPE_WEBHOOK_SECRET must be configured in application

STEP 1: Navigate to Stripe Webhooks Dashboard
- Go to: https://dashboard.stripe.com/webhooks (test mode) or https://dashboard.stripe.com/webhooks?mode=live (live mode)
- Click "Add endpoint" button

STEP 2: Enter Webhook Endpoint URL
- URL: [INSERT YOUR APP URL]/api/stripe/webhooks
  Examples:
  - Production: https://worldsportsacademy.com/api/stripe/webhooks
  - Vercel: https://your-app.vercel.app/api/stripe/webhooks
  - Local: http://localhost:3000/api/stripe/webhooks (requires Stripe CLI forwarding)

STEP 3: Select Events to Listen To

MANDATORY EVENTS (Select all 4):
☑ payment_intent.succeeded
☑ payment_intent.payment_failed
☑ charge.refunded
☑ refund.updated

OPTIONAL EVENTS (Select if using membership subscriptions):
☐ customer.subscription.created
☐ customer.subscription.updated
☐ customer.subscription.deleted
☐ invoice.payment_succeeded
☐ invoice.payment_failed
☐ checkout.session.completed

OR use "Select events" dropdown and choose:
- "Select events" → Search and add each event individually
- OR use filter: "All events" → Uncheck everything → Then check the required ones above

STEP 4: Save Endpoint
- Click "Add endpoint" or "Save" button
- Stripe will generate a "Signing secret" (starts with whsec_)

STEP 5: Copy Webhook Signing Secret
- Copy the "Signing secret" value
- Format: whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
- Add to application environment variables as: STRIPE_WEBHOOK_SECRET

STEP 6: Test Webhook (IMPORTANT)
- Use Stripe CLI: stripe listen --forward-to localhost:3000/api/stripe/webhooks (for local)
- OR use Stripe Dashboard: Click "Send test webhook" → Select "payment_intent.succeeded"
- Verify application receives and processes the event successfully
```

## Minimum Required Events Summary

**For Drop-in Booking Payments (Minimum):**
```
payment_intent.succeeded
payment_intent.payment_failed
charge.refunded
refund.updated
```

**For Full System (Including Memberships):**
```
payment_intent.succeeded
payment_intent.payment_failed
charge.refunded
refund.updated
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.payment_succeeded
invoice.payment_failed
checkout.session.completed
```

## Testing Instructions

### **Test Mode Setup:**

1. **Enable Test Mode in Stripe Dashboard**
   - Toggle "Test mode" switch ON (top right of dashboard)
   - Use test API keys: `sk_test_...` and `pk_test_...`

2. **Create Test Webhook Endpoint**
   - Endpoint URL: `https://your-app-url/api/stripe/webhooks`
   - Events: Select the 4 mandatory events listed above
   - Copy the test webhook signing secret (starts with `whsec_`)

3. **Test Payment Flow:**

   **Success Scenario:**
   - Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - Complete booking payment in application
   - Verify: Booking status changes to "confirmed" in database
   - Verify: Webhook event `payment_intent.succeeded` is received

   **Failure Scenario:**
   - Use Stripe test card: `4000 0000 0000 0002` (declined card)
   - Attempt booking payment
   - Verify: Booking status changes to "cancelled" with error details
   - Verify: Webhook event `payment_intent.payment_failed` is received

   **Refund Scenario:**
   - Create a paid booking
   - Cancel the booking in application
   - Verify: Refund is initiated in Stripe
   - Verify: Webhook event `charge.refunded` is received
   - Verify: Booking refund_status updates to "pending"
   - Wait for webhook `refund.updated` when refund completes
   - Verify: Booking refund_status updates to "succeeded"

### **Using Stripe CLI for Local Testing:**

```bash
# Install Stripe CLI (if not installed)
# Windows: choco install stripe
# Mac: brew install stripe/stripe-cli/stripe
# Linux: See https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local development server
stripe listen --forward-to localhost:3000/api/stripe/webhooks

# This will output a webhook signing secret starting with whsec_
# Add this to your .env.local as STRIPE_WEBHOOK_SECRET

# In another terminal, trigger test events
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
stripe trigger charge.refunded
```

## Verification Checklist

After configuring webhooks, verify the following:

- [ ] Webhook endpoint is accessible (returns 200 OK for POST requests)
- [ ] Webhook signing secret is set in environment variable `STRIPE_WEBHOOK_SECRET`
- [ ] All 4 mandatory events are selected in Stripe dashboard
- [ ] Test payment succeeds and booking is confirmed
- [ ] Test payment failure is handled correctly
- [ ] Test refund is processed and status updates correctly
- [ ] Webhook events appear in Stripe Dashboard → Webhooks → [Your Endpoint] → Events
- [ ] Application logs show successful webhook processing (no 500 errors)

## Troubleshooting

### **Common Issues:**

1. **"Webhook signature verification failed"**
   - **Cause**: Webhook secret mismatch
   - **Fix**: Ensure `STRIPE_WEBHOOK_SECRET` in app matches the secret from Stripe dashboard
   - **Note**: Test mode and live mode have different secrets

2. **"No signature found" (400 error)**
   - **Cause**: Webhook not being sent by Stripe or localhost not using Stripe CLI
   - **Fix**: Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhooks`

3. **Webhooks not received**
   - **Cause**: Endpoint URL is incorrect or not publicly accessible
   - **Fix**: 
     - Verify URL is accessible via HTTPS (required for production)
     - Check firewall/network settings
     - Use ngrok or similar for local testing: `ngrok http 3000`

4. **Booking not confirming after payment**
   - **Cause**: `payment_intent.succeeded` event not configured
   - **Fix**: Add `payment_intent.succeeded` event to webhook endpoint

5. **Refund status not updating**
   - **Cause**: `charge.refunded` or `refund.updated` events not configured
   - **Fix**: Add both events to webhook endpoint

## Environment Variables Required

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_... for production)
STRIPE_WEBHOOK_SECRET=whsec_... (from Stripe webhook endpoint configuration)

# Note: Test mode and live mode require separate webhook endpoints and secrets
```

## Security Notes

1. **Always use HTTPS** for webhook endpoints in production
2. **Never share** your webhook signing secret publicly
3. **Verify signatures** are being checked (code already implements this)
4. **Use different endpoints** for test mode and live mode
5. **Monitor webhook failures** in Stripe Dashboard → Webhooks → [Your Endpoint] → Failed events

## Quick Reference: Event → Action Mapping

| Event | When It Fires | What Happens |
|-------|---------------|--------------|
| `payment_intent.succeeded` | Payment completes successfully | Booking confirmed, payment recorded, status updated to "confirmed" |
| `payment_intent.payment_failed` | Payment fails (declined, insufficient funds, etc.) | Booking cancelled, error recorded, alerts sent |
| `charge.refunded` | Refund is created | Refund record created in database |
| `refund.updated` | Refund status changes | Booking refund_status updated (pending → succeeded/failed) |

## Support

For issues with webhook configuration:
1. Check Stripe Dashboard → Webhooks → [Your Endpoint] → Events for delivery status
2. Check application logs for webhook processing errors
3. Verify environment variables are set correctly
4. Test with Stripe CLI first before using production webhooks

