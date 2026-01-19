-- Add phone_number column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Create index for phone number lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number ON profiles(phone_number);

-- Note: We're not adding a NOT NULL constraint yet to avoid breaking existing records
-- The constraint will be enforced at the application level for new registrations
