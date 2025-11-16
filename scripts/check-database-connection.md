# How to Check Database Connectivity and drop_in_pricing Table

## Method 1: Using Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Check Queries**
   - Copy and paste the queries from `scripts/check-drop-in-pricing.sql`
   - Run each query one by one
   - Review the results

## Method 2: Using Supabase CLI

If you have Supabase CLI installed locally:

```bash
# Connect to your remote project (you'll need the project reference)
supabase db connect --project-ref YOUR_PROJECT_REF

# Then run the SQL file
psql -f scripts/check-drop-in-pricing.sql
```

## Method 3: Using MCP Supabase Tools (Programmatic)

I can help you check directly using Supabase MCP tools. I'll need your project ID.

To find your project ID:
1. Go to Supabase Dashboard
2. Select your project
3. Go to Settings → General
4. Copy the "Reference ID" (this is your project ID, usually looks like `abcdefghijklmnop`)

Once you provide the project ID, I can:
- Check the table structure
- Query the drop_in_pricing records
- Verify Stripe IDs are set correctly
- Check if the migration was applied

## What to Look For

### ✅ Good Results:
- `stripe_price_id` column exists in the table
- `stripe_product_id` column exists in the table
- All active records have `stripe_price_id = 'price_1SU8KqDrcV6C4UxVCCuNwOaE'`
- All active records have `stripe_product_id = 'prod_TR0LWsYW3ACwFQ'`

### ❌ Problem Indicators:
- Columns `stripe_price_id` or `stripe_product_id` don't exist → Migration not applied
- Records show `NULL` for Stripe IDs → Migration not applied or records weren't updated
- Different Stripe IDs than expected → Migration needs to be re-run
- No records in `drop_in_pricing` → Need to seed the table

## If Migration Wasn't Applied

If you find that the migration hasn't been applied:

1. **Via Supabase Dashboard:**
   - Go to Database → Migrations
   - Check if `20250117000000_update_stripe_product_ids.sql` is listed
   - If not, click "Run migration" and paste the SQL from the migration file

2. **Via Supabase CLI:**
   ```bash
   supabase db push
   ```

3. **Manual Application:**
   - Copy the SQL from `supabase/migrations/20250117000000_update_stripe_product_ids.sql`
   - Paste it into Supabase SQL Editor
   - Run it

## Next Steps After Verification

Once you've verified the database:
1. Test the payment flow again
2. Check browser console for errors
3. Check Vercel deployment logs for API errors
4. Check Stripe dashboard for payment intents being created

