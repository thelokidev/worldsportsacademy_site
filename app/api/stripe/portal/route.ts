import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripeClient } from '@/lib/stripe/client'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    // Get Stripe client
    let stripe
    try {
      stripe = getStripeClient()
    } catch (stripeError) {
      console.error('Stripe configuration error:', stripeError)
      return NextResponse.json(
        { error: 'Payment system is not configured' },
        { status: 500 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's Stripe customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No Stripe customer found. Please purchase a membership first.' },
        { status: 404 }
      )
    }

    // Determine app URL: prefer custom domain, then Vercel URL, then localhost
    let appUrl = process.env.NEXT_PUBLIC_APP_URL
    if (!appUrl && process.env.VERCEL_URL) {
      // Vercel automatically provides VERCEL_URL (e.g., 'your-project.vercel.app')
      appUrl = `https://${process.env.VERCEL_URL}`
    }
    if (!appUrl) {
      appUrl = 'http://localhost:3000'
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${appUrl}/dashboard/membership`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Portal session creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}

