-- Create social_open_play table for recurring social sessions
CREATE TABLE IF NOT EXISTS social_open_play (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id UUID REFERENCES sports(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  day_of_week INTEGER[] NOT NULL, -- [1, 3, 5] for Mon, Wed, Fri (1=Monday, 7=Sunday)
  start_time TIME NOT NULL, -- '19:00:00'
  end_time TIME NOT NULL, -- '21:00:00'
  price NUMERIC NOT NULL DEFAULT 15.00,
  tax_rate NUMERIC NOT NULL DEFAULT 0.13,
  max_participants INTEGER DEFAULT 20,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create social_open_play_bookings table to track individual bookings
CREATE TABLE IF NOT EXISTS social_open_play_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  social_play_id UUID REFERENCES social_open_play(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  payment_intent_id TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  amount_paid NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(social_play_id, user_id, booking_date)
);

-- Enable RLS
ALTER TABLE social_open_play ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_open_play_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for social_open_play
CREATE POLICY "Anyone can view active social open play sessions"
  ON social_open_play FOR SELECT
  USING (is_active = true);

CREATE POLICY "Only admins can modify social open play"
  ON social_open_play FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for social_open_play_bookings
CREATE POLICY "Users can view their own social play bookings"
  ON social_open_play_bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own social play bookings"
  ON social_open_play_bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all social play bookings"
  ON social_open_play_bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert Table Tennis Social Open Play
INSERT INTO social_open_play (
  sport_id,
  name,
  day_of_week,
  start_time,
  end_time,
  price,
  tax_rate,
  max_participants,
  description,
  is_active
)
SELECT 
  s.id,
  'Table Tennis Social Open Play',
  ARRAY[1, 3, 5], -- Monday, Wednesday, Friday
  '19:00:00'::TIME,
  '21:00:00'::TIME,
  15.00,
  0.13,
  20,
  'Join us for social table tennis! Play with random partners in a fun, organized setting. Coach-led sessions every Monday, Wednesday, and Friday from 7-9 PM.',
  true
FROM sports s
WHERE s.name = 'table-tennis';

-- Create index for faster lookups
CREATE INDEX idx_social_play_bookings_date ON social_open_play_bookings(booking_date);
CREATE INDEX idx_social_play_bookings_user ON social_open_play_bookings(user_id);
CREATE INDEX idx_social_play_active ON social_open_play(is_active) WHERE is_active = true;
