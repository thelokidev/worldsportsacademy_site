import { NextRequest, NextResponse } from 'next/server'
import { getStripeClient } from '@/lib/stripe/client'

/**
 * Test endpoint to verify Stripe key is working
 * Makes a minimal API call to validate the key
 * 
 * Usage: GET /api/stripe/test-key
 */
export async function GET(req: NextRequest) {
  try {
    const stripe = getStripeClient()
    
    // Make a minimal API call to test the key
    // This will fail if the key is invalid
    const account = await stripe.accounts.retrieve()
    
    return NextResponse.json({
      status: 'success',
      message: 'Stripe API key is valid and working',
      accountId: account.id,
      keyPreview: process.env.STRIPE_SECRET_KEY?.trim().substring(0, 12) + '...',
      keyLength: process.env.STRIPE_SECRET_KEY?.trim().length || 0,
      environment: process.env.VERCEL === '1' ? 'Vercel' : 'Local',
    })
  } catch (error) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    const keyPreview = secretKey ? `${secretKey.trim().substring(0, 12)}...` : 'not set'
    const keyLength = secretKey ? secretKey.trim().length : 0
    
    let diagnosticInfo = `Key preview: ${keyPreview}, Length: ${keyLength} chars`
    if (!secretKey) {
      diagnosticInfo = 'Key is not set in environment variables'
    } else if (!secretKey.trim().startsWith('sk_')) {
      diagnosticInfo = `Key format is invalid (does not start with 'sk_')`
    } else if (keyLength < 20) {
      diagnosticInfo = `Key appears to be truncated (too short: ${keyLength} chars)`
    }
    
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      diagnostic: diagnosticInfo,
      errorType: error && typeof error === 'object' && 'type' in error ? (error as any).type : 'unknown',
      recommendations: [
        'Verify the key in Vercel environment variables matches your Stripe Dashboard',
        'Make sure there are no extra spaces before or after the key',
        'Ensure the key is from the correct Stripe account',
        'If you updated the key, redeploy the application',
        'Test keys start with sk_test_, live keys start with sk_live_',
      ],
    }, { status: 500 })
  }
}

