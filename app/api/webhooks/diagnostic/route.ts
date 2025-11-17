import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * Webhook Diagnostic Endpoint
 * 
 * Check this endpoint to verify webhook configuration:
 * GET /api/webhooks/diagnostic
 */
export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      node_env: process.env.NODE_ENV,
      vercel: process.env.VERCEL === '1',
      vercel_env: process.env.VERCEL_ENV,
    },
    configuration: {
      stripe_webhook_secret: {
        configured: !!process.env.STRIPE_WEBHOOK_SECRET,
        preview: process.env.STRIPE_WEBHOOK_SECRET
          ? `${process.env.STRIPE_WEBHOOK_SECRET.substring(0, 12)}...`
          : 'NOT SET',
      },
      stripe_secret_key: {
        configured: !!process.env.STRIPE_SECRET_KEY,
        preview: process.env.STRIPE_SECRET_KEY
          ? `${process.env.STRIPE_SECRET_KEY.substring(0, 12)}...`
          : 'NOT SET',
      },
      supabase_service_role_key: {
        configured: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        preview: process.env.SUPABASE_SERVICE_ROLE_KEY
          ? `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...`
          : 'NOT SET',
      },
      supabase_url: {
        configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        value: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
      },
    },
    webhook_endpoint: {
      url: process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}/api/stripe/webhooks`
        : 'https://worldsportsacademy-site.vercel.app/api/stripe/webhooks',
      ready: !!(
        process.env.STRIPE_WEBHOOK_SECRET &&
        process.env.STRIPE_SECRET_KEY &&
        process.env.SUPABASE_SERVICE_ROLE_KEY
      ),
    },
    status:
      process.env.STRIPE_WEBHOOK_SECRET &&
      process.env.STRIPE_SECRET_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
        ? 'ready'
        : 'misconfigured',
    missing_vars: [
      !process.env.STRIPE_WEBHOOK_SECRET && 'STRIPE_WEBHOOK_SECRET',
      !process.env.STRIPE_SECRET_KEY && 'STRIPE_SECRET_KEY',
      !process.env.SUPABASE_SERVICE_ROLE_KEY && 'SUPABASE_SERVICE_ROLE_KEY',
    ].filter(Boolean),
  }

  return NextResponse.json(diagnostics, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}

