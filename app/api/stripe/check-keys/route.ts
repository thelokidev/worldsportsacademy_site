import { NextRequest, NextResponse } from 'next/server'

/**
 * Debug endpoint to check Stripe key configuration
 * Only available in development mode
 * 
 * Usage: GET /api/stripe/check-keys
 */
export async function GET(req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  const secretKey = process.env.STRIPE_SECRET_KEY

  const checks = {
    publishableKey: {
      exists: !!publishableKey,
      length: publishableKey?.length || 0,
      startsWithPk: publishableKey?.startsWith('pk_') || false,
      isTest: publishableKey?.startsWith('pk_test_') || false,
      isLive: publishableKey?.startsWith('pk_live_') || false,
      preview: publishableKey ? `${publishableKey.substring(0, 12)}...` : 'Not set',
    },
    secretKey: {
      exists: !!secretKey,
      length: secretKey?.length || 0,
      startsWithSk: secretKey?.startsWith('sk_') || false,
      isTest: secretKey?.startsWith('sk_test_') || false,
      isLive: secretKey?.startsWith('sk_live_') || false,
      preview: secretKey ? `${secretKey.substring(0, 12)}...` : 'Not set',
    },
    modeMatch: {
      bothTest: (publishableKey?.startsWith('pk_test_') && secretKey?.startsWith('sk_test_')) || false,
      bothLive: (publishableKey?.startsWith('pk_live_') && secretKey?.startsWith('sk_live_')) || false,
      mismatch: (publishableKey?.startsWith('pk_test_') && secretKey?.startsWith('sk_live_')) ||
                (publishableKey?.startsWith('pk_live_') && secretKey?.startsWith('sk_test_')) || false,
    },
  }

  const issues: string[] = []

  if (!checks.publishableKey.exists) {
    issues.push('❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set')
  } else if (!checks.publishableKey.startsWithPk) {
    issues.push('❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY does not start with "pk_"')
  }

  if (!checks.secretKey.exists) {
    issues.push('❌ STRIPE_SECRET_KEY is not set')
  } else if (!checks.secretKey.startsWithSk) {
    issues.push('❌ STRIPE_SECRET_KEY does not start with "sk_"')
  }

  if (checks.modeMatch.mismatch) {
    issues.push('⚠️ Mode mismatch: Publishable and secret keys are from different modes (test vs live)')
  }

  if (checks.modeMatch.bothTest) {
    issues.push('ℹ️ Using TEST mode keys (pk_test_ and sk_test_)')
  } else if (checks.modeMatch.bothLive) {
    issues.push('ℹ️ Using LIVE mode keys (pk_live_ and sk_live_)')
  }

  return NextResponse.json({
    status: issues.length === 0 ? 'ok' : 'issues',
    checks,
    issues,
    recommendations: [
      'If deploying on Vercel, make sure to redeploy after updating environment variables',
      'Environment variables are loaded at build time, not runtime',
      'Make sure both keys are from the same Stripe mode (test or live)',
    ],
  })
}

