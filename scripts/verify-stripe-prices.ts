/**
 * Verify Stripe Price IDs
 * Run with: npx tsx --env-file=.env.local scripts/verify-stripe-prices.ts
 * 
 * This script checks if all the Stripe price IDs in your database
 * actually exist in your Stripe account.
 */

import Stripe from 'stripe';

// Ensure STRIPE_SECRET_KEY is set
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY is not set!');
  console.error('');
  console.error('Run with: npx tsx --env-file=.env.local scripts/verify-stripe-prices.ts');
  process.exit(1);
}

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

// Price IDs that should exist in Stripe (from your database)
const PRICE_IDS_TO_VERIFY = {
  // Membership Plans
  'Table Tennis Monthly': 'price_1SrPp0DwbguMPSQs4ux7Q4Sw',
  'Table Tennis Half-Yearly': 'price_1SrPp1DwbguMPSQsIYDiXQcX',
  'Table Tennis Yearly': 'price_1SrPp1DwbguMPSQsGxCSTUBF',
  'Squash Monthly': 'price_1SrPp2DwbguMPSQsfmgBrJqP',
  'Squash Half-Yearly': 'price_1SrPp3DwbguMPSQs7zVoskc6',
  'Squash Yearly': 'price_1SrPp3DwbguMPSQs2X8NMw2F',
  
  // Drop-in Session
  'Drop-In Session': 'price_1SvJvaDwbguMPSQshdIDI7S5',
  
  // Initiation Fee
  'Initiation Fee': 'price_1SvJxmDwbguMPSQsDdgst4ib',
};

const verifyPrices = async () => {
  console.log('🔍 Verifying Stripe Price IDs...\n');
  console.log('Using Stripe account:', process.env.STRIPE_SECRET_KEY?.slice(0, 12) + '...\n');
  
  let allValid = true;
  const results: { name: string; priceId: string; status: string; error?: string }[] = [];

  for (const [name, priceId] of Object.entries(PRICE_IDS_TO_VERIFY)) {
    try {
      const price = await stripe.prices.retrieve(priceId);
      results.push({
        name,
        priceId,
        status: price.active ? '✅ Active' : '⚠️ Inactive',
      });
      console.log(`✅ ${name}: ${priceId} - ${price.active ? 'Active' : 'INACTIVE'}`);
    } catch (error: any) {
      allValid = false;
      const errorMessage = error.message || 'Unknown error';
      results.push({
        name,
        priceId,
        status: '❌ Not Found',
        error: errorMessage,
      });
      console.log(`❌ ${name}: ${priceId} - NOT FOUND`);
      console.log(`   Error: ${errorMessage}\n`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(allValid ? '✅ All prices are valid!' : '❌ Some prices are missing or invalid');
  console.log('='.repeat(60));

  if (!allValid) {
    console.log('\n⚠️  ACTION REQUIRED:');
    console.log('The following prices need to be created in Stripe or updated in your database:\n');
    
    for (const result of results) {
      if (result.status.includes('❌')) {
        console.log(`  - ${result.name}: ${result.priceId}`);
      }
    }
    
    console.log('\nTo fix this:');
    console.log('1. Go to https://dashboard.stripe.com/products');
    console.log('2. Create the missing products and prices');
    console.log('3. Update the database with the correct price IDs');
    console.log('   OR run the migration to update the IDs\n');
  }

  return allValid;
};

// Run verification
verifyPrices()
  .then((valid) => {
    process.exit(valid ? 0 : 1);
  })
  .catch((error) => {
    console.error('Error running verification:', error);
    process.exit(1);
  });
