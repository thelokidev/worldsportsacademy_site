# Next Steps After Successful Migration

## ✅ Completed
- Database schema created
- Membership system tables initialized
- Sports and courts configured
- Initial data seeded

## 🔧 Required Setup Steps

### 1. Configure Stripe Products and Prices

You need to create Stripe products and prices for each membership plan, then update the database with the Stripe IDs.

**Option A: Create via Stripe Dashboard**
1. Go to Stripe Dashboard → Products
2. Create products for:
   - "Squash Monthly Membership" - $70/month recurring
   - "Table Tennis Monthly Membership" - $100/month recurring
   - "Squash + Gym Monthly Membership" - $85/month recurring
3. Copy the Price IDs (they look like `price_xxxxx`)
4. Update the database:

```sql
-- Update membership plans with Stripe price IDs
UPDATE public.membership_plans
SET stripe_price_id = 'price_xxxxx'  -- Replace with actual Stripe price ID
WHERE name = 'Squash Monthly Membership';

UPDATE public.membership_plans
SET stripe_price_id = 'price_xxxxx'  -- Replace with actual Stripe price ID
WHERE name = 'Table Tennis Monthly Membership';

UPDATE public.membership_plans
SET stripe_price_id = 'price_xxxxx'  -- Replace with actual Stripe price ID
WHERE name = 'Squash + Gym Monthly Membership';
```

**Option B: Create via Stripe API (Automated)**
You can create a script to automatically create Stripe products and update the database.

### 2. Configure Environment Variables

Create or update `.env.local` with:

```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase (should already exist)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Set Up Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhooks`
3. Select events to listen to:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy the webhook secret to `.env.local` as `STRIPE_WEBHOOK_SECRET`

**For Local Development:**
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhooks
# This will give you a webhook secret to use locally
```

### 4. Configure Tax Rates

Update tax rates in the database for drop-in pricing:

```sql
-- Update tax rates (e.g., 8% = 0.08)
UPDATE public.drop_in_pricing
SET tax_rate = 0.08  -- Adjust based on your tax rate
WHERE sport_id IN (
  SELECT id FROM public.sports WHERE name IN ('squash', 'table-tennis')
);
```

### 5. Set Up Admin Users

Create admin users by updating their role in the profiles table:

```sql
-- Make a user an admin (replace email with actual user email)
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@example.com'
);
```

Or set role during user creation:
```sql
-- After user signs up, update their profile
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'user-uuid-here';
```

### 6. Verify Database Setup

Check that everything is set up correctly:

```sql
-- Check membership plans
SELECT id, name, price, stripe_price_id, is_active FROM public.membership_plans;

-- Check sports
SELECT id, name, display_name, status FROM public.sports;

-- Check courts
SELECT c.id, c.name, s.display_name as sport
FROM public.courts c
JOIN public.sports s ON c.sport_id = s.id
WHERE c.is_active = true
ORDER BY s.name, c.name;

-- Check drop-in pricing
SELECT s.display_name, dip.price, dip.duration_minutes, dip.tax_rate
FROM public.drop_in_pricing dip
JOIN public.sports s ON dip.sport_id = s.id
WHERE dip.is_active = true;

-- Check sport settings
SELECT s.display_name, ss.status, ss.weekday_hours, ss.weekend_hours
FROM public.sport_settings ss
JOIN public.sports s ON ss.sport_id = s.id;
```

### 7. Test the System

1. **Test Membership Purchase:**
   - Go to `/memberships`
   - Click "Get Started" on a plan
   - Complete Stripe checkout (use test card: 4242 4242 4242 4242)
   - Verify membership appears in `/dashboard/membership`

2. **Test Booking:**
   - As a member: Book a slot (should be free)
   - As non-member: Book a slot (should require payment)
   - Verify booking appears in `/dashboard/bookings`

3. **Test Admin Dashboard:**
   - Login as admin user
   - Go to `/admin/dashboard`
   - Verify you can see bookings, memberships, and revenue

4. **Test Webhooks:**
   - Use Stripe CLI to forward webhooks locally
   - Make a test purchase
   - Verify webhook events are processed correctly

### 8. Update Coordinator Information

Update training program coordinator contact details:

```sql
-- Update coordinator information
UPDATE public.training_programs
SET 
  coordinator_email = 'abhinay@worldsportsacademy.com',  -- Update with actual email
  coordinator_phone = '+1-xxx-xxx-xxxx'  -- Update with actual phone
WHERE coordinator_name = 'Abhinay Vaddi';
```

### 9. Configure Operating Hours (if different)

If your operating hours are different from the defaults (6 AM - 11 PM), update them:

```sql
-- Update Table Tennis hours (example: 7 AM - 10 PM on weekdays)
UPDATE public.sport_settings
SET weekday_hours = '{"open": "07:00", "close": "22:00"}'::jsonb
WHERE sport_id IN (SELECT id FROM public.sports WHERE name = 'table-tennis');

-- Update Squash hours (example: different weekend hours)
UPDATE public.sport_settings
SET weekend_hours = '{"open": "08:00", "close": "20:00"}'::jsonb
WHERE sport_id IN (SELECT id FROM public.sports WHERE name = 'squash');
```

### 10. Production Deployment Checklist

Before going to production:

- [ ] Update Stripe to live mode (update API keys)
- [ ] Set `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Configure production webhook endpoint in Stripe
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure email service for notifications
- [ ] Set up database backups
- [ ] Test all payment flows in production mode
- [ ] Verify RLS policies are working correctly
- [ ] Set up logging and monitoring
- [ ] Configure SSL certificates
- [ ] Test mobile responsiveness
- [ ] Performance testing

## 🐛 Troubleshooting

### Stripe Webhook Not Working
- Verify webhook secret is correct
- Check webhook endpoint is accessible
- Verify event types are selected in Stripe dashboard
- Check server logs for errors

### Memberships Not Showing
- Verify Stripe price IDs are set in database
- Check user has active subscription in Stripe
- Verify webhooks are processing correctly
- Check RLS policies allow user to see their membership

### Booking Not Working
- Verify courts exist and are active
- Check sport settings are configured
- Verify court schedules are set up
- Check booking conflicts in database

### Admin Dashboard Not Accessible
- Verify user has `role = 'admin'` in profiles table
- Check RLS policies for admin access
- Verify admin layout is checking role correctly

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## 🎉 You're Ready!

Once you've completed these steps, your sports booking and membership system should be fully operational!

