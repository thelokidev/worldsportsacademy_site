/**
 * Fix Invalid Stripe Customer IDs
 * Run with: node --env-file=.env.local --import=tsx scripts/fix-invalid-stripe-customers.ts
 * 
 * This script checks all Stripe customer IDs in the profiles table
 * and clears any that don't exist in the current Stripe account.
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are set
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY is not set!');
  process.exit(1);
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE environment variables are not set!');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

interface Profile {
  id: string;
  full_name: string | null;
  stripe_customer_id: string;
}

const fixInvalidCustomers = async () => {
  console.log('🔍 Checking Stripe customer IDs in profiles...\n');

  // Get all profiles with Stripe customer IDs
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, stripe_customer_id')
    .not('stripe_customer_id', 'is', null);

  if (error) {
    console.error('❌ Failed to fetch profiles:', error.message);
    process.exit(1);
  }

  if (!profiles || profiles.length === 0) {
    console.log('No profiles with Stripe customer IDs found.');
    return;
  }

  console.log(`Found ${profiles.length} profiles with Stripe customer IDs.\n`);

  const invalidCustomers: Profile[] = [];
  const validCustomers: Profile[] = [];

  // Check each customer ID
  for (const profile of profiles as Profile[]) {
    try {
      await stripe.customers.retrieve(profile.stripe_customer_id);
      validCustomers.push(profile);
      console.log(`✅ ${profile.full_name || profile.id}: ${profile.stripe_customer_id}`);
    } catch (err: any) {
      if (err.code === 'resource_missing') {
        invalidCustomers.push(profile);
        console.log(`❌ ${profile.full_name || profile.id}: ${profile.stripe_customer_id} - NOT FOUND`);
      } else {
        console.error(`⚠️ Error checking ${profile.stripe_customer_id}:`, err.message);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Valid customers: ${validCustomers.length}`);
  console.log(`Invalid customers: ${invalidCustomers.length}`);
  console.log('='.repeat(60));

  if (invalidCustomers.length === 0) {
    console.log('\n✅ All customer IDs are valid!');
    return;
  }

  // Clear invalid customer IDs
  console.log('\n🔧 Clearing invalid Stripe customer IDs...\n');

  for (const profile of invalidCustomers) {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ stripe_customer_id: null })
      .eq('id', profile.id);

    if (updateError) {
      console.error(`❌ Failed to clear customer ID for ${profile.id}:`, updateError.message);
    } else {
      console.log(`✅ Cleared customer ID for ${profile.full_name || profile.id}`);
    }
  }

  console.log('\n✅ Done! Invalid customer IDs have been cleared.');
  console.log('Users will get new Stripe customers created when they next checkout.');
};

// Run the fix
fixInvalidCustomers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
