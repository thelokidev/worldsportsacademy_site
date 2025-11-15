import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripeClient } from '@/lib/stripe/client'

export const runtime = 'nodejs'

// Helper function to check if profiles table exists
async function checkProfilesTableExists(supabase: Awaited<ReturnType<typeof createClient>>): Promise<boolean> {
  try {
    // Try a simple query to see if table exists
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    
    // If error is about table not found, return false
    if (error && (error.code === 'PGRST205' || error.message.includes('does not exist'))) {
      return false
    }
    
    return true
  } catch {
    return false
  }
}

// Helper function to get or create profile
async function getOrCreateProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  email: string | undefined,
  fullName: string | undefined
) {
  const profilesTableExists = await checkProfilesTableExists(supabase)
  
  if (!profilesTableExists) {
    console.warn('Profiles table does not exist. Please run the migration: 20250531113526_create_profiles_table.sql')
    return null
  }

  // Try to get existing profile
  let { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('stripe_customer_id, full_name')
    .eq('id', userId)
    .maybeSingle()

  // If profile doesn't exist, try to create it
  if (!profile && !profileError) {
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: fullName || email?.split('@')[0] || null,
      })
      .select('stripe_customer_id, full_name')
      .single()

    if (createError) {
      // If insert fails (e.g., RLS policy), try to get it again (might have been created by trigger)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('stripe_customer_id, full_name')
        .eq('id', userId)
        .maybeSingle()
      
      profile = existingProfile || null
    } else {
      profile = newProfile
    }
  }

  return profile
}

export async function POST(req: NextRequest) {
  try {
    // Validate Stripe configuration first
    let stripe
    try {
      stripe = getStripeClient()
    } catch (stripeError) {
      const errorMessage = stripeError instanceof Error ? stripeError.message : 'Unknown Stripe error'
      console.error('Stripe configuration error:', errorMessage)
      return NextResponse.json(
        { 
          error: 'Payment system is not configured. Please contact support.',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
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

    const body = await req.json()
    const { planId, bookingId, paymentType } = body

    if (!paymentType || !['membership', 'drop_in'].includes(paymentType)) {
      return NextResponse.json(
        { error: 'Invalid payment type' },
        { status: 400 }
      )
    }

    // Get or create profile
    const profile = await getOrCreateProfile(
      supabase,
      user.id,
      user.email || undefined,
      user.user_metadata?.full_name || undefined
    )

    // Get Stripe customer ID from profile, or create new one
    let customerId = profile?.stripe_customer_id

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      try {
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          name: profile?.full_name || user.user_metadata?.full_name || undefined,
          metadata: {
            supabase_user_id: user.id,
          },
        })

        customerId = customer.id

        // Update profile with Stripe customer ID (if profile exists)
        if (profile) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ stripe_customer_id: customerId })
            .eq('id', user.id)

          if (updateError) {
            console.error('Failed to update profile with Stripe customer ID:', updateError)
            // Continue anyway - we have the customer ID and can proceed with checkout
          }
        } else if (await checkProfilesTableExists(supabase)) {
          // If profile doesn't exist but table exists, try to create it with the Stripe customer ID
          const { error: createWithStripeError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || null,
              stripe_customer_id: customerId,
            })

          if (createWithStripeError) {
            console.error('Failed to create profile with Stripe customer ID:', createWithStripeError)
            // Continue anyway - checkout can proceed without profile update
          }
        }
      } catch (stripeError) {
        console.error('Failed to create Stripe customer:', stripeError)
        
        // Extract detailed error information
        let errorMessage = 'Failed to initialize payment. Please check your Stripe configuration.'
        let errorDetails: string | undefined
        
        if (stripeError instanceof Error) {
          errorDetails = stripeError.message
          
          // Provide more specific error messages
          if (stripeError.message.includes('Invalid API Key')) {
            errorMessage = 'Invalid Stripe API key. Please check your STRIPE_SECRET_KEY in .env.local'
            errorDetails = 'The Stripe secret key is invalid or not properly configured. Make sure it starts with "sk_test_" (test mode) or "sk_live_" (live mode).'
          } else if (stripeError.message.includes('No such API key')) {
            errorMessage = 'Stripe API key not found. Please check your STRIPE_SECRET_KEY in .env.local'
            errorDetails = 'The Stripe secret key is missing or incorrect. Please verify your environment variables.'
          } else if (stripeError.message.includes('Authentication')) {
            errorMessage = 'Stripe authentication failed. Please verify your API keys.'
            errorDetails = stripeError.message
          }
        }
        
        return NextResponse.json(
          { 
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
          },
          { status: 500 }
        )
      }
    }

    if (!customerId) {
      return NextResponse.json(
        { error: 'Failed to create customer account' },
        { status: 500 }
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

    if (paymentType === 'membership') {
      if (!planId) {
        return NextResponse.json(
          { error: 'Plan ID is required for membership checkout' },
          { status: 400 }
        )
      }

      // Get membership plan
      const { data: plan } = await supabase
        .from('membership_plans')
        .select('id, name, price, stripe_price_id')
        .eq('id', planId)
        .single()

      if (!plan) {
        return NextResponse.json(
          { error: 'Membership plan not found' },
          { status: 404 }
        )
      }

      if (!plan.stripe_price_id) {
        return NextResponse.json(
          { error: 'Stripe price ID not configured for this plan' },
          { status: 500 }
        )
      }

      // Create checkout session for subscription
      let session
      try {
        session = await stripe.checkout.sessions.create({
          customer: customerId,
          mode: 'subscription',
          line_items: [
            {
              price: plan.stripe_price_id,
              quantity: 1,
            },
          ],
          success_url: `${appUrl}/dashboard/membership?success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${appUrl}/memberships?canceled=true`,
          metadata: {
            user_id: user.id,
            plan_id: plan.id,
            payment_type: 'membership',
          },
          subscription_data: {
            metadata: {
              user_id: user.id,
              plan_id: plan.id,
            },
          },
        })
      } catch (sessionError) {
        console.error('Failed to create Stripe checkout session:', sessionError)
        
        let errorMessage = 'Failed to create checkout session'
        let errorDetails: string | undefined
        
        if (sessionError instanceof Error) {
          errorDetails = sessionError.message
          
          if (sessionError.message.includes('No such price')) {
            errorMessage = `Stripe price ID "${plan.stripe_price_id}" not found. Please check your membership plan configuration.`
            errorDetails = 'The Stripe price ID in the database does not exist in your Stripe account. Please verify the price ID in the membership_plans table matches your Stripe products.'
          } else if (sessionError.message.includes('Invalid API Key')) {
            errorMessage = 'Invalid Stripe API key. Please check your STRIPE_SECRET_KEY in .env.local'
            errorDetails = 'The Stripe secret key is invalid or not properly configured.'
          }
        }
        
        return NextResponse.json(
          {
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
          },
          { status: 500 }
        )
      }

      if (!session?.url) {
        return NextResponse.json(
          { error: 'Failed to create checkout session URL' },
          { status: 500 }
        )
      }

      return NextResponse.json({ sessionId: session.id, url: session.url })
    } else if (paymentType === 'drop_in') {
      if (!bookingId) {
        return NextResponse.json(
          { error: 'Booking ID is required for drop-in checkout' },
          { status: 400 }
        )
      }

      // Get booking details
      const { data: booking } = await supabase
        .from('bookings')
        .select(`
          id,
          sport_id,
          selected_duration,
          sports: sport_id (
            id,
            name
          )
        `)
        .eq('id', bookingId)
        .single()

      if (!booking) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        )
      }

      // Get drop-in pricing
      const duration = booking.selected_duration || 60
      const { data: pricing } = await supabase
        .from('drop_in_pricing')
        .select('price, tax_rate')
        .eq('sport_id', booking.sport_id)
        .eq('duration_minutes', duration)
        .single()

      if (!pricing) {
        return NextResponse.json(
          { error: 'Pricing not found for this sport and duration' },
          { status: 404 }
        )
      }

      const subtotal = Number(pricing.price)
      const tax = subtotal * Number(pricing.tax_rate)
      const total = subtotal + tax

      // Create checkout session for one-time payment
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${(booking.sports as any)?.name || 'Sport'} Drop-In`,
                description: `${duration} minute session`,
              },
              unit_amount: Math.round(total * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        success_url: `${appUrl}/bookings/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/bookings?canceled=true`,
        metadata: {
          user_id: user.id,
          booking_id: bookingId,
          payment_type: 'drop_in',
          sport_id: booking.sport_id,
        },
      })

      return NextResponse.json({ sessionId: session.id, url: session.url })
    }

    return NextResponse.json(
      { error: 'Invalid payment type' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Checkout creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

