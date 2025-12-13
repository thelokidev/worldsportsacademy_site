#!/usr/bin/env node

/**
 * Stripe Product Creation Script - Sport-Specific Memberships
 * Creates separate products for Table Tennis and Squash for World Sports Academy (Ontario, Canada)
 * 
 * Pricing Structure (per sport):
 * - Monthly: $75 CAD/month
 * - Half-Yearly: $400 CAD/6 months
 * - Yearly: $700 CAD/year
 * 
 * Tax: 13% HST (Ontario) - calculated separately
 * 
 * Usage:
 * npx tsx scripts/create-stripe-products-sport-specific.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import Stripe from 'stripe';

// Load environment variables from .env.local
function loadEnv() {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                if (key && valueParts.length > 0) {
                    const value = valueParts.join('=').replace(/^["']|["']$/g, '');
                    process.env[key] = value;
                }
            }
        });
    }
}

loadEnv();

if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY environment variable is not set');
    console.error('Please ensure you have a .env.local file with STRIPE_SECRET_KEY defined');
    process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-10-29.clover',
});

interface ProductConfig {
    name: string;
    description: string;
    priceAmount: number;
    priceCurrency: string;
    sport: 'table-tennis' | 'squash';
    recurring?: {
        interval: 'month' | 'year';
        interval_count?: number;
    };
    metadata: Record<string, string>;
}

const PRODUCTS: ProductConfig[] = [
    // ============================================
    // Table Tennis Plans
    // ============================================
    {
        name: 'Table Tennis Monthly',
        description: 'Unlimited access to Table Tennis tables - Monthly auto-renewal',
        priceAmount: 75.00,
        priceCurrency: 'cad',
        sport: 'table-tennis',
        recurring: {
            interval: 'month',
        },
        metadata: {
            type: 'membership_monthly',
            sport: 'table-tennis',
            location: 'ontario_canada',
            tax_behavior: 'exclusive',
        },
    },
    {
        name: 'Table Tennis Half-Yearly',
        description: 'Unlimited access to Table Tennis tables - 6 Month auto-renewal (Save $50)',
        priceAmount: 400.00,
        priceCurrency: 'cad',
        sport: 'table-tennis',
        recurring: {
            interval: 'month',
            interval_count: 6,
        },
        metadata: {
            type: 'membership_half_yearly',
            sport: 'table-tennis',
            location: 'ontario_canada',
            savings: '50',
            tax_behavior: 'exclusive',
        },
    },
    {
        name: 'Table Tennis Yearly',
        description: 'Unlimited access to Table Tennis tables - Annual auto-renewal (Save $200) - Best Value!',
        priceAmount: 700.00,
        priceCurrency: 'cad',
        sport: 'table-tennis',
        recurring: {
            interval: 'year',
        },
        metadata: {
            type: 'membership_yearly',
            sport: 'table-tennis',
            location: 'ontario_canada',
            savings: '200',
            best_value: 'true',
            tax_behavior: 'exclusive',
        },
    },
    // ============================================
    // Squash Plans
    // ============================================
    {
        name: 'Squash Monthly',
        description: 'Unlimited access to Squash courts - Monthly auto-renewal',
        priceAmount: 75.00,
        priceCurrency: 'cad',
        sport: 'squash',
        recurring: {
            interval: 'month',
        },
        metadata: {
            type: 'membership_monthly',
            sport: 'squash',
            location: 'ontario_canada',
            tax_behavior: 'exclusive',
        },
    },
    {
        name: 'Squash Half-Yearly',
        description: 'Unlimited access to Squash courts - 6 Month auto-renewal (Save $50)',
        priceAmount: 400.00,
        priceCurrency: 'cad',
        sport: 'squash',
        recurring: {
            interval: 'month',
            interval_count: 6,
        },
        metadata: {
            type: 'membership_half_yearly',
            sport: 'squash',
            location: 'ontario_canada',
            savings: '50',
            tax_behavior: 'exclusive',
        },
    },
    {
        name: 'Squash Yearly',
        description: 'Unlimited access to Squash courts - Annual auto-renewal (Save $200) - Best Value!',
        priceAmount: 700.00,
        priceCurrency: 'cad',
        sport: 'squash',
        recurring: {
            interval: 'year',
        },
        metadata: {
            type: 'membership_yearly',
            sport: 'squash',
            location: 'ontario_canada',
            savings: '200',
            best_value: 'true',
            tax_behavior: 'exclusive',
        },
    },
];

interface CreatedProduct {
    name: string;
    sport: string;
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

    console.log('🚀 Creating Stripe products for World Sports Academy (Ontario, Canada)...');
    console.log('📋 Creating SPORT-SPECIFIC membership plans\n');

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
                sport: productConfig.sport,
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

async function generateSQLUpdate(products: CreatedProduct[]) {
    console.log('\n📝 SQL Update Script for Supabase:\n');
    console.log('-- Run this SQL in Supabase to update the membership_plans with Stripe IDs\n');

    for (const product of products) {
        console.log(`UPDATE public.membership_plans 
SET 
  stripe_price_id = '${product.priceId}',
  stripe_product_id = '${product.productId}',
  updated_at = NOW()
WHERE name = '${product.name}';\n`);
    }
}

async function generateTypeScriptConfig(products: CreatedProduct[]) {
    console.log('\n📝 TypeScript Configuration for lib/stripe/membership-plans.ts:\n');

    console.log('export const MEMBERSHIP_PRICE_MAP: Record<string, PlanMapping> = {');

    for (const product of products) {
        console.log(`  '${product.priceId}': {`);
        console.log(`    name: '${product.name}',`);
        console.log(`    productId: '${product.productId}',`);
        console.log(`  },`);
    }

    console.log('};\n');
}

async function main() {
    try {
        // Create new sport-specific products
        const products = await createProducts();

        console.log('✅ All products created successfully!\n');
        console.log('📊 Summary:');
        
        console.log('\n🏓 Table Tennis Plans:');
        products.filter(p => p.sport === 'table-tennis').forEach(p => {
            const recurring = p.recurring
                ? ` (${p.recurring.interval_count ? `every ${p.recurring.interval_count} ` : ''}${p.recurring.interval}${p.recurring.interval_count && p.recurring.interval_count > 1 ? 's' : ''})`
                : '';
            console.log(`  - ${p.name}: ${p.priceId}${recurring}`);
        });

        console.log('\n🏸 Squash Plans:');
        products.filter(p => p.sport === 'squash').forEach(p => {
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

