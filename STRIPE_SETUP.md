# Stripe Setup Guide

## Issues Fixed

1. **Invalid Stripe API Key Error**: Improved error handling and validation for Stripe keys
2. **Profile Table Not Found**: Added graceful handling for missing profiles table

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## Getting Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Publishable key** (starts with `pk_test_`) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Copy your **Secret key** (starts with `sk_test_`) → `STRIPE_SECRET_KEY`
4. Make sure you're in **Test mode** for development

## Setting Up Stripe Webhooks

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click "Add endpoint"
3. Set endpoint URL to: `https://your-domain.com/api/stripe/webhooks`
   - For local testing, use a tool like [ngrok](https://ngrok.com/) to expose your local server
4. Select events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`) → `STRIPE_WEBHOOK_SECRET`

## Running Migrations

Make sure to run all database migrations, especially:
- `20250531113526_create_profiles_table.sql` - Creates the profiles table
- `20250601000000_ensure_user_profiles.sql` - Ensures all users have profiles

## Testing

1. Restart your Next.js dev server after adding environment variables
2. Try purchasing a membership - you should see better error messages if something is misconfigured
3. Check the browser console and server logs for any configuration errors

## Common Issues

### "Invalid API Key provided"
- Check that your `STRIPE_SECRET_KEY` is correct and starts with `sk_test_` (test mode) or `sk_live_` (live mode)
- Make sure the key is not truncated or has extra spaces
- Restart your dev server after updating `.env.local`

### "Profile not found"
- Run the migration `20250531113526_create_profiles_table.sql` first
- Then run `20250601000000_ensure_user_profiles.sql`
- The system will now automatically create profiles if they don't exist

### "Payment system is not configured"
- This means Stripe keys are missing or invalid
- Check your `.env.local` file has all required Stripe variables
- Verify the keys are correct in the Stripe Dashboard




