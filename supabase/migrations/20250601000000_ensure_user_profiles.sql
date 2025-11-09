-- Migration: Ensure all users have profiles
-- Creates profiles for any users that don't have one yet
-- This runs after the profiles table is created (20250531113526_create_profiles_table.sql)

DO $$
BEGIN
  -- Only proceed if profiles table exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
  ) THEN
    -- 1. Ensure the handle_new_user function exists and works correctly
    EXECUTE '
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $func$
      BEGIN
        INSERT INTO public.profiles (id, full_name, avatar_url)
        VALUES (
          NEW.id,
          COALESCE(NEW.raw_user_meta_data->>''full_name'', NEW.email),
          NEW.raw_user_meta_data->>''avatar_url''
        )
        ON CONFLICT (id) DO NOTHING;
        RETURN NEW;
      END;
      $func$ LANGUAGE plpgsql SECURITY DEFINER;
    ';

    -- 2. Ensure trigger exists
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

    -- 3. Create profiles for any existing users that don't have one
    INSERT INTO public.profiles (id, full_name)
    SELECT 
      u.id,
      COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1))
    FROM auth.users u
    WHERE NOT EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = u.id
    )
    ON CONFLICT (id) DO NOTHING;

    -- 4. Ensure RLS policies allow users to insert and update their own profiles
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
    
    CREATE POLICY "Users can view own profile" ON public.profiles
      FOR SELECT USING (auth.uid() = id);
    
    CREATE POLICY "Users can update their own profile" ON public.profiles
      FOR UPDATE USING (auth.uid() = id);
    
    CREATE POLICY "Users can insert their own profile" ON public.profiles
      FOR INSERT WITH CHECK (auth.uid() = id);

    -- 5. Grant necessary permissions (if not already granted)
    GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

    -- 6. Ensure stripe_customer_id column exists (added in 20250107000001_update_sports_for_requirements.sql)
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'stripe_customer_id'
    ) THEN
      ALTER TABLE public.profiles ADD COLUMN stripe_customer_id TEXT;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id 
        ON public.profiles(stripe_customer_id) 
        WHERE stripe_customer_id IS NOT NULL;
    END IF;

    -- 7. Refresh PostgREST schema cache to ensure the table is recognized
    NOTIFY pgrst, 'reload schema';
    
    RAISE NOTICE 'Profile migration completed successfully';
  ELSE
    RAISE NOTICE 'Profiles table does not exist yet. Skipping profile migration.';
  END IF;
END $$;
