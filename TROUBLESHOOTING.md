# Troubleshooting Guide

## Common Errors and Solutions

### 1. "Failed to initialize payment. Please check your Stripe configuration."

This error occurs when the system cannot create a Stripe customer. Common causes:

#### Solution A: Check Stripe API Keys
1. Verify your `.env.local` file exists and contains:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

2. Make sure the keys are:
   - Complete (not truncated)
   - Correct (copy from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys))
   - In test mode (for development) - keys should start with `sk_test_` and `pk_test_`

3. Restart your Next.js dev server after updating `.env.local`:
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart
   npm run dev
   ```

#### Solution B: Verify Stripe Account
1. Log in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Make sure you're in **Test mode** (toggle in the top right)
3. Verify your API keys are active
4. Check if there are any account restrictions

#### Solution C: Check Server Logs
1. Look at your terminal/console where Next.js is running
2. Look for error messages starting with "Stripe configuration error:" or "Failed to create Stripe customer:"
3. The detailed error message will tell you exactly what's wrong

### 2. "Stripe price ID not configured for this plan"

This means the membership plan in your database doesn't have a `stripe_price_id` set.

#### Solution:
1. Create a Stripe Product and Price:
   - Go to [Stripe Dashboard > Products](https://dashboard.stripe.com/test/products)
   - Click "Add product"
   - Set up your membership plan (e.g., "Squash Monthly Membership", $70/month recurring)
   - Copy the Price ID (starts with `price_`)

2. Update the database:
   ```sql
   UPDATE public.membership_plans
   SET stripe_price_id = 'price_xxxxx'  -- Replace with your actual Stripe price ID
   WHERE name = 'Squash Monthly Membership';
   ```

3. Repeat for all membership plans

### 3. "Profile not found"

This error means the user doesn't have a profile in the database.

#### Solution:
1. Run the profile migration:
   ```sql
   -- Run this in Supabase SQL Editor
   -- Migration: 20250531113526_create_profiles_table.sql
   -- Then: 20250601000000_ensure_user_profiles.sql
   ```

2. Or manually create a profile for the user:
   ```sql
   INSERT INTO public.profiles (id, full_name)
   VALUES ('user-id-here', 'User Name')
   ON CONFLICT (id) DO NOTHING;
   ```

### 4. "Invalid API Key provided"

This means your Stripe secret key is incorrect or malformed.

#### Solution:
1. Go to [Stripe Dashboard > API Keys](https://dashboard.stripe.com/test/apikeys)
2. Copy the **Secret key** (starts with `sk_test_`)
3. Make sure there are no extra spaces or characters
4. Update `.env.local`:
   ```env
   STRIPE_SECRET_KEY=sk_test_your_key_here
   ```
5. Restart your dev server

### 5. Checkout page shows but payment fails

#### Check:
1. **Stripe Price ID**: Make sure the price ID exists in Stripe
2. **Stripe Mode**: Ensure you're using test mode keys in development
3. **Webhook Configuration**: Webhooks should be set up for production, but not required for basic checkout testing

### 6. Environment Variables Not Loading

#### Solution:
1. Make sure `.env.local` is in the **root directory** of your project (same level as `package.json`)
2. Restart your dev server after changing environment variables
3. Never commit `.env.local` to git (it should be in `.gitignore`)

### 7. Debugging Tips

1. **Check Browser Console**: Open browser DevTools (F12) and check the Console tab for errors
2. **Check Server Logs**: Look at your terminal where `npm run dev` is running
3. **Check Network Tab**: In browser DevTools, go to Network tab and check the API request/response
4. **Test Stripe Keys**: You can test if your Stripe key works by making a test API call

### Quick Checklist

- [ ] `.env.local` file exists in project root
- [ ] `STRIPE_SECRET_KEY` is set and starts with `sk_test_` (or `sk_live_` for production)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set and starts with `pk_test_` (or `pk_live_` for production)
- [ ] Dev server has been restarted after adding/updating environment variables
- [ ] Stripe account is in Test mode (for development)
- [ ] Membership plans have `stripe_price_id` set in the database
- [ ] Profiles table exists and user has a profile
- [ ] Check browser console and server logs for detailed error messages

### Getting Help

If you're still stuck:
1. Check the detailed error message in the browser console or server logs
2. Verify your Stripe account is active and in the correct mode
3. Make sure all environment variables are set correctly
4. Check the `STRIPE_SETUP.md` file for setup instructions



