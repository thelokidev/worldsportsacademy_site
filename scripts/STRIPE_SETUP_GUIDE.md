# Stripe Product Creation Guide

This guide walks you through creating the new Stripe products for World Sports Academy's updated pricing system.

## Prerequisites

1. **Stripe CLI** installed and authenticated
   ```bash
   stripe login
   ```

2. **OR** Set your Stripe secret key as an environment variable:
   ```powershell
   $env:STRIPE_SECRET_KEY="sk_test_..."
   ```

## New Pricing Structure (Ontario, Canada)

- **Drop-in**: $15 CAD
- **Initiation Fee**: $25 CAD (one-time)
- **Monthly Membership**: $75 CAD/month
- **Half-Yearly Membership**: $400 CAD/6 months (Save $50)
- **Yearly Membership**: $700 CAD/year (Save $200)
- **Tax**: 13% HST (Ontario)

## Steps to Execute

### Step 1: Run the Stripe Product Creation Script

```bash
# Make sure you're in the project directory
cd o:\Hari\worldsportsacademy_site

# Run the script
npx tsx scripts/create-stripe-products.ts
```

The script will:
1. Deactivate old sport-specific products
2. Create 5 new products with prices in CAD
3. Generate SQL update statements
4. Generate TypeScript configuration

### Step 2: Run the Generated SQL

The script will output SQL commands like:

```sql
UPDATE public.membership_plans 
SET 
  stripe_price_id = 'price_xxxxxxxxxxxxx',
  stripe_product_id = 'prod_xxxxxxxxxxxxx',
  updated_at = NOW()
WHERE name = 'Monthly Membership';

-- (similar for Half-Yearly and Yearly)
```

**Run these in Supabase SQL Editor:**
1. Go to https://supabase.com/dashboard/project/xvdqlbgecwwynaemudhp/sql/new
2. Paste the SQL commands
3. Click "Run"

### Step 3: Update membership-plans.ts

The script will also output TypeScript configuration:

Update `lib/stripe/membership-plans.ts` with the new price IDs.

### Step 4: Configure Stripe Tax (Optional but Recommended)

In Stripe Dashboard:
1. Go to **Settings** → **Tax**
2. Enable **Stripe Tax**
3. Add your business address in Ontario, Canada
4. Stripe will automatically calculate 13% HST

Alternatively, you can calculate tax manually in your checkout code.

### Step 5: Test the Integration

1. Create a test checkout session with the new products
2. Verify prices are in CAD
3. Verify tax calculation (13% HST)
4. Test the initiation fee logic for new vs. returning users

## Manual Product Creation (Alternative)

If you prefer to create products manually in Stripe Dashboard:

### Drop-In Session
- **Name**: Drop-In Session
- **Price**: $15.00 CAD (one-time)
- **Tax Code**: Sports and recreation services

### Initiation Fee
- **Name**: Initiation Fee
- **Price**: $25.00 CAD (one-time)
- **Tax Code**: Sports and recreation services

### Monthly Membership
- **Name**: Monthly Membership
- **Price**: $75.00 CAD
- **Billing**: Recurring every month
- **Tax Code**: Sports and recreation services

### Half-Yearly Membership
- **Name**: Half-Yearly Membership
- **Price**: $400.00 CAD
- **Billing**: Recurring every 6 months
- **Tax Code**: Sports and recreation services

### Yearly Membership
- **Name**: Yearly Membership
- **Price**: $700.00 CAD
- **Billing**: Recurring every year
- **Tax Code**: Sports and recreation services

After creating each product manually, update the `membership_plans` table with the Stripe Product ID and Price ID.

## Troubleshooting

### Error: "No such API key"
- Make sure `STRIPE_SECRET_KEY` is set correctly
- Use your **secret key** (starts with `sk_test_` or `sk_live_`), not publishable key

### Error: "Module not found: stripe"
- Install Stripe SDK: `npm install stripe`

### Products not appearing in Stripe Dashboard
- Check you're looking at the correct mode (test vs. live)
- Refresh the page

## Next Steps

After completing this setup:
1. Update frontend UI to display new membership options
2. Update checkout flow to handle CAD pricing and HST
3. Test end-to-end purchase flow
4. Configure webhook handlers for the new products
