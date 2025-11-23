# Quick Migration Guide

## IMPORTANT: Apply Database Migration First

Before testing the waiver system, you MUST apply the updated database migration to add RLS policies and the index.

## Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/20251122125146_add_waiver_fields_to_profiles.sql`
5. Paste into the SQL editor
6. Click **Run** or press `Ctrl+Enter`
7. Verify success message appears

## Option 2: Via Supabase CLI

```bash
# Make sure you're in the project root directory
cd /path/to/worldsportsacademy_site

# Link to your Supabase project (if not already linked)
supabase link --project-ref your-project-ref

# Push the migration
supabase db push
```

## Option 3: Manual SQL Execution

If you've already run the migration before, you can run just the new parts:

```sql
-- 1. Add index on waiver_signed_at for performance
CREATE INDEX IF NOT EXISTS idx_profiles_waiver_signed_at 
ON public.profiles(waiver_signed_at) 
WHERE waiver_signed_at IS NOT NULL;

-- 2. Add RLS policy for reading waiver status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can read own waiver status'
  ) THEN
    CREATE POLICY "Users can read own waiver status"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);
  END IF;
END $$;

-- 3. Add RLS policy for updating waiver
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can update own waiver'
  ) THEN
    CREATE POLICY "Users can update own waiver"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 4. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
```

## Verification

After running the migration, verify it was successful:

```sql
-- Check if index exists
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'profiles' 
AND indexname = 'idx_profiles_waiver_signed_at';

-- Check if RLS policies exist
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles' 
AND policyname LIKE '%waiver%';

-- Check if columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name LIKE 'waiver%';
```

Expected results:
- ✅ Index `idx_profiles_waiver_signed_at` exists
- ✅ Policy "Users can read own waiver status" exists
- ✅ Policy "Users can update own waiver" exists
- ✅ Columns: `waiver_signed_at`, `waiver_signature_name`, `waiver_signature_address` exist

## Troubleshooting

### Error: "relation does not exist"
**Solution**: The profiles table doesn't exist. Run the profiles table creation migration first.

### Error: "policy already exists"
**Solution**: This is fine! The migration uses `IF NOT EXISTS` checks, so it's safe to run multiple times.

### Error: "permission denied"
**Solution**: Make sure you're running as a database admin/owner. In Supabase dashboard, you should have the correct permissions by default.

## Next Steps

After successfully applying the migration:

1. Deploy your code changes
2. Follow the testing guide in `WAIVER_TESTING_GUIDE.md`
3. Test with a new user account
4. Test with an existing user account
5. Verify waiver signatures are being saved in the database

## Rollback (If Needed)

If you need to rollback the changes:

```sql
-- Remove policies
DROP POLICY IF EXISTS "Users can read own waiver status" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own waiver" ON public.profiles;

-- Remove index
DROP INDEX IF EXISTS idx_profiles_waiver_signed_at;

-- Optionally remove columns (WARNING: This deletes data!)
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS waiver_signed_at;
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS waiver_signature_name;
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS waiver_signature_address;
```

## Support

If you encounter issues:
1. Check the Supabase logs in the dashboard
2. Review the error message carefully
3. Verify your database connection
4. Check that RLS is enabled on the profiles table

