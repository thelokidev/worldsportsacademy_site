#!/usr/bin/env node

/**
 * Stripe Product Creation Script
 * Creates new products and prices for World Sports Academy (Ontario, Canada)
 * 
 * Pricing Structure:
 * - Drop-in: $15 CAD
 * - Initiation Fee: $25 CAD (one-time)
 * - Monthly Membership: $75 CAD/month
 * - Half-Yearly Membership: $400 CAD/6 months
 * - Yearly Membership: $700 CAD/year
 * 
 * Tax: 13% HST (Ontario)
 * 
 * Prerequisites:
 * - Stripe CLI installed and logged in
 * - OR Stripe secret key in environment variable STRIPE_SECRET_KEY
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-11-20.acacia',
});

interface ProductConfig {
    name: string;
    description: string;
    priceAmount: number; // in dollars
    priceCurrency: string;
    recurring?: {
        interval: 'month' | 'year';
        interval_count?: number;
    };
    metadata: Record<string, string>;
}

const PRODUCTS: ProductConfig[] = [
    {
        name: 'Drop-In Session',
        description: 'Single drop-in session for any sport (1-2 hours depending on sport)',
        priceAmount: 15.00,
        priceCurrency: 'cad',
        metadata: {
            type: 'drop_in',
            location: 'ontario_canada',
            tax_behavior: 'exclusive', // Tax calculated separately
        },
    },
    {
        name: 'Initiation Fee',
        description: 'One-time registration fee for new members',
        priceAmount: 25.00,
        priceCurrency: 'cad',
        metadata: {
            type: 'initiation_fee',
            location: 'ontario_canada',
            one_time: 'true',
            tax_behavior: 'exclusive',
        },
    },
    {
        name: 'Monthly Membership',
        description: 'Unlimited access to all sports facilities - Monthly auto-renewal',
        priceAmount: 75.00,
        priceCurrency: 'cad',
        recurring: {
            interval: 'month',
        },
        metadata: {
            type: 'membership_monthly',
            location: 'ontario_canada',
            all_sports: 'true',
            tax_behavior: 'exclusive',
        },
    },
    {
        name: 'Half-Yearly Membership',
        description: 'Unlimited access to all sports facilities - 6 Month auto-renewal (Save $50)',
        priceAmount: 400.00,
        priceCurrency: 'cad',
        recurring: {
            interval: 'month',
            interval_count: 6,
        },
        metadata: {
            type: 'membership_half_yearly',
            location: 'ontario_canada',
            all_sports: 'true',
            savings: '50',
            tax_behavior: 'exclusive',
        },
    },
    {
        name: 'Yearly Membership',
        description: 'Unlimited access to all sports facilities - Annual auto-renewal (Save $200) - Best Value!',
        priceAmount: 700.00,
        priceCurrency: 'cad',
        recurring: {
            interval: 'year',
        },
        metadata: {
            type: 'membership_yearly',
            location: 'ontario_canada',
            all_sports: 'true',
            savings: '200',
            best_value: 'true',
            tax_behavior: 'exclusive',
        },
    },
];

interface CreatedProduct {
    name: string;
    productId: string;
    priceId: string;
    amount: number;
    currency: string;
    recurring?: {
        interval: string;
        interval_count?: number;
    };
}

async function createProducts(): Promise<CreatedProduct[]> {
    const createdProducts: CreatedProduct[] = [];

    console.log('🚀 Creating Stripe products for World Sports Academy (Ontario, Canada)...\n');

    for (const productConfig of PRODUCTS) {
        try {
            console.log(`Creating product: ${productConfig.name}...`);

            // Create product
            const product = await stripe.products.create({
                name: productConfig.name,
                description: productConfig.description,
                metadata: productConfig.metadata,
                tax_code: 'txcd_20030000', // Sports and recreation services (Canada)
            });

            console.log(`✅ Product created: ${product.id}`);

            // Create price
            const priceData: Stripe.PriceCreateParams = {
                product: product.id,
                currency: productConfig.priceCurrency,
                unit_amount: Math.round(productConfig.priceAmount * 100), // Convert to cents
                tax_behavior: 'exclusive', // Tax calculated separately (13% HST)
            };

            if (productConfig.recurring) {
                priceData.recurring = productConfig.recurring;
            }

            const price = await stripe.prices.create(priceData);

            console.log(`✅ Price created: ${price.id} - $${productConfig.priceAmount} ${productConfig.priceCurrency.toUpperCase()}`);
            console.log('');

            createdProducts.push({
                name: productConfig.name,
                productId: product.id,
                priceId: price.id,
                amount: productConfig.priceAmount,
                currency: productConfig.priceCurrency,
                recurring: productConfig.recurring,
            });
        } catch (error) {
            console.error(`❌ Error creating ${productConfig.name}:`, error);
            throw error;
        }
    }

    return createdProducts;
}

async function deactivateOldProducts() {
    console.log('🔍 Finding old sport-specific products to deactivate...\n');

    const oldProductIds = [
        'prod_TR0EUV4UN3agee', // Squash Monthly
        'prod_TR0IPewTnDWYGI', // Table Tennis Monthly
        'prod_TR0Jm3UW2QuvHu', // Squash + Gym Monthly
        'prod_TR0LWsYW3ACwFQ', // Old Drop-In
    ];

    for (const productId of oldProductIds) {
        try {
            const product = await stripe.products.retrieve(productId);

            if (product.active) {
                await stripe.products.update(productId, {
                    active: false,
                });
                console.log(`✅ Deactivated old product: ${product.name} (${productId})`);
            } else {
                console.log(`⏭️  Product already inactive: ${product.name} (${productId})`);
            }
        } catch (error: any) {
            if (error.code === 'resource_missing') {
                console.log(`⏭️  Product not found: ${productId} (may already be deleted)`);
            } else {
                console.warn(`⚠️  Error deactivating product ${productId}:`, error.message);
            }
        }
    }

    console.log('');
}

async function generateSQLUpdate(products: CreatedProduct[]) {
    console.log('\n📝 SQL Update Script for Supabase:\n');
    console.log('-- Run this SQL in Supabase to update the membership_plans with new Stripe IDs\n');

    const monthlyPlan = products.find(p => p.name === 'Monthly Membership');
    const halfYearlyPlan = products.find(p => p.name === 'Half-Yearly Membership');
    const yearlyPlan = products.find(p => p.name === 'Yearly Membership');

    if (monthlyPlan) {
        console.log(`UPDATE public.membership_plans 
SET 
  stripe_price_id = '${monthlyPlan.priceId}',
  stripe_product_id = '${monthlyPlan.productId}',
  updated_at = NOW()
WHERE name = 'Monthly Membership';\n`);
    }

    if (halfYearlyPlan) {
        console.log(`UPDATE public.membership_plans 
SET 
  stripe_price_id = '${halfYearlyPlan.priceId}',
  stripe_product_id = '${halfYearlyPlan.productId}',
  updated_at = NOW()
WHERE name = 'Half-Yearly Membership';\n`);
    }

    if (yearlyPlan) {
        console.log(`UPDATE public.membership_plans 
SET 
  stripe_price_id = '${yearlyPlan.priceId}',
  stripe_product_id = '${yearlyPlan.productId}',
  updated_at = NOW()
WHERE name = 'Yearly Membership';\n`);
    }
}

async function generateTypeScriptConfig(products: CreatedProduct[]) {
    console.log('\n📝 TypeScript Configuration for membership-plans.ts:\n');

    console.log('export const MEMBERSHIP_PRICE_MAP: Record<string, PlanMapping> = {');

    for (const product of products) {
        console.log(`  ${product.priceId}: {`);
        console.log(`    name: '${product.name}',`);
        console.log(`    productId: '${product.productId}',`);
        console.log(`  },`);
    }

    console.log('};\n');
}

async function main() {
    try {
        // Deactivate old products first
        await deactivateOldProducts();

        // Create new products
        const products = await createProducts();

        console.log('✅ All products created successfully!\n');
        console.log('📊 Summary:');
        products.forEach(p => {
            const recurring = p.recurring
                ? ` (${p.recurring.interval_count ? `every ${p.recurring.interval_count} ` : ''}${p.recurring.interval}${p.recurring.interval_count && p.recurring.interval_count > 1 ? 's' : ''})`
                : '';
            console.log(`  - ${p.name}: ${p.priceId}${recurring}`);
        });

        // Generate SQL update script
        await generateSQLUpdate(products);

        // Generate TypeScript config
        await generateTypeScriptConfig(products);

        console.log('\n✅ Done! Next steps:');
        console.log('  1. Run the SQL update script above in Supabase SQL Editor');
        console.log('  2. Update lib/stripe/membership-plans.ts with the new TypeScript config');
        console.log('  3. Configure Stripe Tax for Ontario (13% HST) in Stripe Dashboard');
        console.log('  4. Test the new pricing in your application\n');

    } catch (error) {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    }
}

// Run the script
main();
