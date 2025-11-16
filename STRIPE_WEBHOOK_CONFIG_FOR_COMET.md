# Stripe Webhook Configuration for Comet Agent

## Task: Configure Stripe Webhook Endpoint

### Prerequisites
1. Stripe account (test mode or live mode)
2. Application webhook endpoint URL: `[YOUR_APP_URL]/api/stripe/webhooks`
3. Environment variable `STRIPE_WEBHOOK_SECRET` must be configured in application

### Exact Steps for Comet Agent

#### Step 1: Navigate to Stripe Webhooks
- URL: `https://dashboard.stripe.com/webhooks` (test mode)
- URL (live): `https://dashboard.stripe.com/webhooks?mode=live` (live mode)
- Action: Click "Add endpoint" button

#### Step 2: Configure Endpoint
- **Endpoint URL**: `[YOUR_APP_URL]/api/stripe/webhooks`
  - Replace `[YOUR_APP_URL]` with actual deployment URL
  - Examples:
    - `https://worldsportsacademy.com/api/stripe/webhooks`
    - `https://your-app.vercel.app/api/stripe/webhooks`
    - `http://localhost:3000/api/stripe/webhooks` (local with Stripe CLI)

#### Step 3: Select Events (MANDATORY - Select ALL 4)

**CRITICAL: These 4 events are REQUIRED for booking payments to work:**

1. `payment_intent.succeeded`
   - Purpose: Confirms successful payment for drop-in bookings
   - Required: ✅ YES

2. `payment_intent.payment_failed`
   - Purpose: Handles failed payment attempts
   - Required: ✅ YES

3. `charge.refunded`
   - Purpose: Tracks refund creation
   - Required: ✅ YES

4. `refund.updated`
   - Purpose: Updates refund status changes
   - Required: ✅ YES

**How to Select:**
- In Stripe Dashboard: Click "Select events"
- Search for each event name above
- Check the box next to each event
- OR: Click "Select events" → Type event name → Click to select

#### Step 4: Save Endpoint
- Click "Add endpoint" or "Save"
- Stripe will display a "Signing secret" (starts with `whsec_`)

#### Step 5: Copy Webhook Secret
- **Field Name**: "Signing secret" or "Webhook signing secret"
- **Format**: `whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Action**: Copy this value
- **Add to App**: Set environment variable `STRIPE_WEBHOOK_SECRET=whsec_...`

### Complete Event List (JSON Format for Automation)

```json
{
  "endpoint_url": "[YOUR_APP_URL]/api/stripe/webhooks",
  "events": {
    "mandatory": [
      "payment_intent.succeeded",
      "payment_intent.payment_failed",
      "charge.refunded",
      "refund.updated"
    ],
    "optional_membership": [
      "customer.subscription.created",
      "customer.subscription.updated",
      "customer.subscription.deleted",
      "invoice.payment_succeeded",
      "invoice.payment_failed",
      "checkout.session.completed"
    ]
  },
  "description": "World Sports Academy Payment Webhooks"
}
```

### API Configuration (If using Stripe API directly)

```bash
# Create webhook endpoint via Stripe API
curl https://api.stripe.com/v1/webhook_endpoints \
  -u sk_test_YOUR_SECRET_KEY: \
  -d url="[YOUR_APP_URL]/api/stripe/webhooks" \
  -d "enabled_events[]=payment_intent.succeeded" \
  -d "enabled_events[]=payment_intent.payment_failed" \
  -d "enabled_events[]=charge.refunded" \
  -d "enabled_events[]=refund.updated"
```

### Verification Steps

After configuration, verify:

1. **Endpoint is accessible:**
   - Test URL: `[YOUR_APP_URL]/api/stripe/webhooks`
   - Should return 400 (expected - missing signature) not 404

2. **Webhook secret is set:**
   - Check environment variable: `STRIPE_WEBHOOK_SECRET=whsec_...`
   - Test mode and live mode use different secrets

3. **Events are selected:**
   - Go to Stripe Dashboard → Webhooks → [Your Endpoint]
   - Verify all 4 mandatory events are listed under "Events"

4. **Test webhook delivery:**
   - In Stripe Dashboard: Click "Send test webhook"
   - Select event: `payment_intent.succeeded`
   - Click "Send test webhook"
   - Verify: Status shows "Succeeded" (green checkmark)
   - Verify: Application logs show webhook received

### Testing Checklist

Use these Stripe test cards to verify:

**Success Test:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- Expected: Booking confirms, `payment_intent.succeeded` webhook received

**Failure Test:**
- Card: `4000 0000 0000 0002` (declined card)
- Expected: Booking cancelled, `payment_intent.payment_failed` webhook received

**Refund Test:**
- Complete successful payment
- Cancel booking in application
- Expected: `charge.refunded` webhook received, then `refund.updated` when complete

### Local Development Setup

For local testing, use Stripe CLI:

```bash
# Install Stripe CLI
# Mac: brew install stripe/stripe-cli/stripe
# Windows: choco install stripe
# Linux: See https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhooks

# Output will show webhook secret like: whsec_...
# Add to .env.local as: STRIPE_WEBHOOK_SECRET=whsec_...

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
stripe trigger charge.refunded
```

### Troubleshooting Quick Reference

| Error | Cause | Fix |
|-------|-------|-----|
| "Webhook signature verification failed" | Secret mismatch | Verify `STRIPE_WEBHOOK_SECRET` matches dashboard secret |
| "No signature found" | Local testing without CLI | Use `stripe listen --forward-to localhost:3000/api/stripe/webhooks` |
| 404 Not Found | Wrong URL | Verify endpoint URL is correct |
| 500 Server Error | App error | Check application logs for webhook handler errors |
| Booking not confirming | Missing event | Add `payment_intent.succeeded` event |

### Summary: What to Tell Comet Agent

**Required Actions:**
1. Create webhook endpoint in Stripe Dashboard
2. Set endpoint URL to: `[APP_URL]/api/stripe/webhooks`
3. Select exactly these 4 events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `refund.updated`
4. Copy webhook signing secret (starts with `whsec_`)
5. Add secret to application environment as `STRIPE_WEBHOOK_SECRET`
6. Test webhook delivery from Stripe Dashboard
7. Verify booking payment flow works end-to-end

**Important Notes:**
- Test mode and live mode require separate webhook endpoints
- Webhook URL must be publicly accessible (HTTPS for production)
- Never share webhook secrets publicly
- Test with Stripe test cards before going live

