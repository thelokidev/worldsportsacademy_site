-- Migration: Stripe payment enhancements (bookings, payments, auditing)

BEGIN;

-- ------------------------------------------------------------------
-- Bookings table additions (only if table exists)
-- ------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'bookings'
  ) THEN
    ALTER TABLE public.bookings
      ADD COLUMN IF NOT EXISTS expected_payment_amount NUMERIC(10, 2),
      ADD COLUMN IF NOT EXISTS payment_currency TEXT NOT NULL DEFAULT 'usd',
      ADD COLUMN IF NOT EXISTS payment_intent_id TEXT,
      ADD COLUMN IF NOT EXISTS refund_status TEXT NOT NULL DEFAULT 'none',
      ADD COLUMN IF NOT EXISTS payment_error_code TEXT,
      ADD COLUMN IF NOT EXISTS payment_error_message TEXT,
      ADD COLUMN IF NOT EXISTS needs_manual_review BOOLEAN NOT NULL DEFAULT false;

    -- Constrain refund_status values
    ALTER TABLE public.bookings
      DROP CONSTRAINT IF EXISTS bookings_refund_status_check;
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_refund_status_check
        CHECK (refund_status IN ('none', 'pending', 'processing', 'succeeded', 'failed', 'partial'));
  END IF;
END $$;

-- ------------------------------------------------------------------
-- Payments table additions (only if table exists)
-- ------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'payments'
  ) THEN
    -- Ensure payments.status supports new states
    ALTER TABLE public.payments
      DROP CONSTRAINT IF EXISTS payments_status_check;
    ALTER TABLE public.payments
      ADD CONSTRAINT payments_status_check
        CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded', 'canceled', 'partial', 'partially_refunded'));

    ALTER TABLE public.payments
      ADD COLUMN IF NOT EXISTS expected_amount NUMERIC(10, 2),
      ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS failure_code TEXT,
      ADD COLUMN IF NOT EXISTS failure_message TEXT,
      ADD COLUMN IF NOT EXISTS refunded_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS receipt_url TEXT;
  END IF;
END $$;

-- ------------------------------------------------------------------
-- payment_events table
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  payment_intent_id TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'received',
  requires_retry BOOLEAN NOT NULL DEFAULT false,
  retry_count INTEGER NOT NULL DEFAULT 0,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_events_booking_id ON public.payment_events(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_intent ON public.payment_events(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_status ON public.payment_events(status);

-- ------------------------------------------------------------------
-- payment_refunds table
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  stripe_refund_id TEXT UNIQUE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'canceled')),
  reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_refunds_payment_id ON public.payment_refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_refunds_status ON public.payment_refunds(status);

-- ------------------------------------------------------------------
-- booking_payment_audit table
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.booking_payment_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  previous_status TEXT,
  next_status TEXT,
  actor TEXT,
  reason TEXT,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_payment_audit_booking_id ON public.booking_payment_audit(booking_id);

-- ------------------------------------------------------------------
-- Helper functions
-- ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_finalize_booking_payment(
  p_booking_id UUID,
  p_payment_intent_id TEXT,
  p_amount NUMERIC,
  p_currency TEXT,
  p_payment_type TEXT DEFAULT 'drop_in',
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE (booking_id UUID, payment_id UUID) AS $$
DECLARE
  v_payment_id UUID;
BEGIN
  IF p_booking_id IS NULL THEN
    RAISE EXCEPTION 'Booking id is required';
  END IF;

  INSERT INTO public.payments (
    user_id,
    booking_id,
    stripe_payment_intent_id,
    amount,
    expected_amount,
    currency,
    status,
    payment_type,
    metadata,
    processed_at
  )
  SELECT
    b.user_id,
    b.id,
    p_payment_intent_id,
    p_amount,
    b.expected_payment_amount,
    COALESCE(p_currency, b.payment_currency, 'usd'),
    CASE
      WHEN p_amount IS DISTINCT FROM b.expected_payment_amount THEN 'partial'
      ELSE 'succeeded'
    END,
    p_payment_type,
    p_metadata,
    NOW()
  FROM public.bookings b
  WHERE b.id = p_booking_id
  ON CONFLICT (stripe_payment_intent_id) DO UPDATE SET
    amount = EXCLUDED.amount,
    status = EXCLUDED.status,
    processed_at = NOW(),
    metadata = EXCLUDED.metadata
  RETURNING id INTO v_payment_id;

  UPDATE public.bookings
    SET status = 'confirmed',
        payment_status = 'paid',
        payment_id = v_payment_id,
        payment_intent_id = p_payment_intent_id,
        payment_error_code = NULL,
        payment_error_message = NULL,
        needs_manual_review = needs_manual_review OR (expected_payment_amount IS DISTINCT FROM p_amount)
  WHERE id = p_booking_id;

  INSERT INTO public.booking_payment_audit (
    booking_id,
    previous_status,
    next_status,
    actor,
    reason,
    context
  )
  VALUES (
    p_booking_id,
    'pending',
    'confirmed',
    'system',
    'payment_succeeded',
    jsonb_build_object(
      'payment_intent_id', p_payment_intent_id,
      'received_amount', p_amount
    )
  );

  RETURN QUERY SELECT p_booking_id, v_payment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.fn_mark_booking_payment_failed(
  p_booking_id UUID,
  p_error_code TEXT,
  p_error_message TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.bookings
    SET status = 'cancelled',
        payment_status = 'failed',
        payment_error_code = p_error_code,
        payment_error_message = p_error_message
  WHERE id = p_booking_id;

  INSERT INTO public.booking_payment_audit (
    booking_id,
    previous_status,
    next_status,
    actor,
    reason,
    context
  )
  VALUES (
    p_booking_id,
    'pending',
    'cancelled',
    'system',
    'payment_failed',
    jsonb_build_object(
      'error_code', p_error_code,
      'error_message', p_error_message
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.fn_create_refund_record(
  p_payment_id UUID,
  p_booking_id UUID,
  p_stripe_refund_id TEXT,
  p_amount NUMERIC,
  p_status TEXT,
  p_reason TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_refund_id UUID;
  v_is_full_refund BOOLEAN := false;
BEGIN
  IF p_payment_id IS NULL OR p_stripe_refund_id IS NULL THEN
    RAISE EXCEPTION 'Refund requires payment and Stripe refund id';
  END IF;

  INSERT INTO public.payment_refunds (
    payment_id,
    booking_id,
    stripe_refund_id,
    amount,
    status,
    reason,
    metadata
  )
  VALUES (
    p_payment_id,
    p_booking_id,
    p_stripe_refund_id,
    p_amount,
    p_status,
    p_reason,
    p_metadata
  )
  ON CONFLICT (stripe_refund_id) DO UPDATE SET
    amount = EXCLUDED.amount,
    status = EXCLUDED.status,
    reason = EXCLUDED.reason,
    metadata = EXCLUDED.metadata,
    updated_at = NOW()
  RETURNING id INTO v_refund_id;

  UPDATE public.payments
    SET refunded_amount = refunded_amount + p_amount,
        status = CASE
          WHEN refunded_amount + p_amount >= amount THEN 'refunded'
          ELSE 'partially_refunded'
        END
  WHERE id = p_payment_id
  RETURNING (refunded_amount >= amount) INTO v_is_full_refund;

  IF p_booking_id IS NOT NULL THEN
    UPDATE public.bookings
      SET refund_status = CASE
        WHEN p_status = 'succeeded' AND v_is_full_refund THEN 'succeeded'
        WHEN p_status = 'failed' THEN 'failed'
        WHEN p_status = 'pending' THEN 'pending'
        ELSE 'processing'
      END
    WHERE id = p_booking_id;
  END IF;

  RETURN v_refund_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.fn_record_payment_event(
  p_stripe_event_id TEXT,
  p_type TEXT,
  p_booking_id UUID,
  p_payment_intent_id TEXT,
  p_payload JSONB,
  p_status TEXT,
  p_requires_retry BOOLEAN DEFAULT false,
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO public.payment_events (
    stripe_event_id,
    type,
    booking_id,
    payment_intent_id,
    payload,
    status,
    requires_retry,
    processed_at,
    error_message
  )
  VALUES (
    p_stripe_event_id,
    p_type,
    p_booking_id,
    p_payment_intent_id,
    p_payload,
    p_status,
    p_requires_retry,
    CASE WHEN p_status = 'processed' THEN NOW() ELSE NULL END,
    p_error_message
  )
  ON CONFLICT (stripe_event_id) DO UPDATE SET
    status = EXCLUDED.status,
    requires_retry = EXCLUDED.requires_retry,
    retry_count = payment_events.retry_count + CASE WHEN EXCLUDED.requires_retry THEN 1 ELSE 0 END,
    processed_at = EXCLUDED.processed_at,
    error_message = EXCLUDED.error_message,
    payload = EXCLUDED.payload
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------
-- Updated_at trigger for payment_refunds
-- ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_payment_refunds_updated_at ON public.payment_refunds;
CREATE TRIGGER trg_payment_refunds_updated_at
  BEFORE UPDATE ON public.payment_refunds
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_touch_updated_at();

COMMIT;

