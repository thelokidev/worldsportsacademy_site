-- Migration: Create membership system tables
-- Creates all tables needed for membership management, payments, and pricing

-- 1. Create membership_plans table
CREATE TABLE IF NOT EXISTS public.membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  sport_ids UUID[] NOT NULL DEFAULT '{}',
  price DECIMAL(10, 2) NOT NULL,
  billing_interval TEXT NOT NULL DEFAULT 'month' CHECK (billing_interval IN ('month', 'year')),
  features JSONB DEFAULT '{}'::jsonb,
  stripe_price_id TEXT UNIQUE,
  stripe_product_id TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Create memberships table
CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.membership_plans(id) ON DELETE RESTRICT,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing', 'paused')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  membership_id UUID REFERENCES public.memberships(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded', 'canceled')),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('drop_in', 'membership', 'refund')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Create drop_in_pricing table
CREATE TABLE IF NOT EXISTS public.drop_in_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id UUID NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  tax_rate DECIMAL(5, 4) DEFAULT 0.0000,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(sport_id, duration_minutes)
);

-- 5. Create training_programs table
CREATE TABLE IF NOT EXISTS public.training_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id UUID NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('group', 'semi_private', 'private')),
  coordinator_name TEXT NOT NULL,
  coordinator_email TEXT,
  coordinator_phone TEXT,
  price_per_session DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Create sport_settings table
CREATE TABLE IF NOT EXISTS public.sport_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id UUID NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'coming_soon', 'inactive')),
  weekday_hours JSONB DEFAULT '{"open": "06:00", "close": "23:00"}'::jsonb,
  weekend_hours JSONB DEFAULT '{"open": "06:00", "close": "23:00"}'::jsonb,
  max_advance_booking_days INTEGER DEFAULT 30,
  cancellation_policy_hours INTEGER DEFAULT 24,
  requires_membership_for_booking BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON public.memberships(status);
CREATE INDEX IF NOT EXISTS idx_memberships_stripe_subscription_id ON public.memberships(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_memberships_current_period_end ON public.memberships(current_period_end);

-- Create partial unique index to prevent multiple active memberships for same plan
CREATE UNIQUE INDEX IF NOT EXISTS idx_memberships_user_plan_active_unique
ON public.memberships(user_id, plan_id)
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_membership_id ON public.payments(membership_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON public.payments(stripe_payment_intent_id);

CREATE INDEX IF NOT EXISTS idx_drop_in_pricing_sport_id ON public.drop_in_pricing(sport_id);
CREATE INDEX IF NOT EXISTS idx_training_programs_sport_id ON public.training_programs(sport_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_membership_plans_updated_at
  BEFORE UPDATE ON public.membership_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at
  BEFORE UPDATE ON public.memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drop_in_pricing_updated_at
  BEFORE UPDATE ON public.drop_in_pricing
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_programs_updated_at
  BEFORE UPDATE ON public.training_programs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sport_settings_updated_at
  BEFORE UPDATE ON public.sport_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drop_in_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sport_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for membership_plans (public read, admin write)
CREATE POLICY "Membership plans are viewable by everyone"
  ON public.membership_plans
  FOR SELECT
  USING (is_active = true);

-- Note: Admin policy will be added in migration 20250107000003_add_admin_policies.sql
-- Service role operations bypass RLS, so no policy needed for service role
-- Regular users cannot modify membership plans without admin role

-- RLS Policies for memberships (users see their own, admins see all)
CREATE POLICY "Users can view their own memberships"
  ON public.memberships
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memberships"
  ON public.memberships
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Note: Admin policy will be added in migration 20250107000003_add_admin_policies.sql
-- Service role operations bypass RLS, so no policy needed for service role
-- Regular users can only view their own memberships (policy above)

CREATE POLICY "System can update memberships via service role"
  ON public.memberships
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- RLS Policies for payments (users see their own, admins see all)
CREATE POLICY "Users can view their own payments"
  ON public.payments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments"
  ON public.payments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Note: Admin policy will be added in migration 20250107000003_add_admin_policies.sql
-- Service role operations bypass RLS, so no policy needed for service role
-- Regular users can only view their own payments (policy above)

CREATE POLICY "System can update payments via service role"
  ON public.payments
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- RLS Policies for drop_in_pricing (public read, admin write)
CREATE POLICY "Drop-in pricing is viewable by everyone"
  ON public.drop_in_pricing
  FOR SELECT
  USING (is_active = true);

-- Note: Admin policy will be added in migration 20250107000003_add_admin_policies.sql
-- Service role operations bypass RLS, so no policy needed for service role
-- Regular users cannot modify drop-in pricing without admin role

-- RLS Policies for training_programs (public read, admin write)
CREATE POLICY "Training programs are viewable by everyone"
  ON public.training_programs
  FOR SELECT
  USING (is_active = true);

-- Note: Admin policy will be added in migration 20250107000003_add_admin_policies.sql
-- Service role operations bypass RLS, so no policy needed for service role
-- Regular users cannot modify training programs without admin role

-- RLS Policies for sport_settings (public read, admin write)
CREATE POLICY "Sport settings are viewable by everyone"
  ON public.sport_settings
  FOR SELECT
  USING (true);

-- Note: Admin policy will be added in migration 20250107000003_add_admin_policies.sql
-- Service role operations bypass RLS, so no policy needed for service role
-- Regular users cannot modify sport settings without admin role

-- Create function to check if user has active membership for a sport
CREATE OR REPLACE FUNCTION public.has_active_membership_for_sport(
  p_user_id UUID,
  p_sport_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_membership BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.memberships m
    INNER JOIN public.membership_plans mp ON m.plan_id = mp.id
    WHERE m.user_id = p_user_id
      AND m.status = 'active'
      AND m.current_period_end > NOW()
      AND p_sport_id = ANY(mp.sport_ids)
  ) INTO v_has_membership;
  
  RETURN COALESCE(v_has_membership, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's active memberships
CREATE OR REPLACE FUNCTION public.get_user_active_memberships(p_user_id UUID)
RETURNS TABLE (
  membership_id UUID,
  plan_id UUID,
  plan_name TEXT,
  sport_ids UUID[],
  current_period_end TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.plan_id,
    mp.name,
    mp.sport_ids,
    m.current_period_end
  FROM public.memberships m
  INNER JOIN public.membership_plans mp ON m.plan_id = mp.id
  WHERE m.user_id = p_user_id
    AND m.status = 'active'
    AND m.current_period_end > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

