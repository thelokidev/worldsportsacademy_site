#!/bin/bash

# Script to verify Stripe environment variables in Vercel
# This script helps debug the "Invalid Stripe API key" error

echo "==================================="
echo "Stripe Environment Variable Checker"
echo "==================================="
echo ""

echo "📋 Instructions:"
echo "1. Go to https://vercel.com/loki98s-projects/worldsportsacademy-site/settings/environment-variables"
echo "2. Check if these variables are set:"
echo ""
echo "   Required Variables:"
echo "   ✓ STRIPE_SECRET_KEY (should start with sk_test_ or sk_live_)"
echo "   ✓ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (should start with pk_test_ or pk_live_)"
echo ""
echo "3. Verify the keys are set for the correct environment:"
echo "   ✓ Production"
echo "   ✓ Preview (optional)"
echo "   ✓ Development (optional)"
echo ""
echo "4. Get your keys from Stripe Dashboard:"
echo "   → Test mode: https://dashboard.stripe.com/test/apikeys"
echo "   → Live mode: https://dashboard.stripe.com/apikeys"
echo ""
echo "5. After updating variables in Vercel:"
echo "   ⚠️  YOU MUST REDEPLOY THE APPLICATION"
echo "   → Go to Deployments tab"
echo "   → Click ⋯ on latest deployment"
echo "   → Click 'Redeploy'"
echo ""
echo "==================================="
echo ""

# Check if running locally
if [ -f ".env.local" ]; then
    echo "🔍 Checking local .env.local file..."
    echo ""
    
    if grep -q "STRIPE_SECRET_KEY" .env.local; then
        key=$(grep "STRIPE_SECRET_KEY" .env.local | cut -d '=' -f 2 | cut -c 1-12)
        echo "✓ STRIPE_SECRET_KEY found: ${key}..."
    else
        echo "✗ STRIPE_SECRET_KEY not found in .env.local"
    fi
    
    if grep -q "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" .env.local; then
        key=$(grep "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" .env.local | cut -d '=' -f 2 | cut -c 1-12)
        echo "✓ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY found: ${key}..."
    else
        echo "✗ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY not found in .env.local"
    fi
    
    echo ""
    echo "Note: Local keys are different from Vercel deployment keys"
else
    echo "ℹ️  No .env.local file found (this is normal if not running locally)"
fi

echo ""
echo "==================================="
echo "Next Steps:"
echo "==================================="
echo "1. Verify keys in Vercel dashboard match Stripe dashboard"
echo "2. Both keys must be from the same mode (test or live)"
echo "3. Redeploy after setting environment variables"
echo "4. Test the payment flow after redeployment"
echo ""

