import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getServiceSupabaseClient } from '@/lib/supabase/service'
import { getStripeClient } from '@/lib/stripe/client'
import { redirect } from 'next/navigation'
import { getUserMembership } from '@/server/queries/memberships'
import { ensurePlanForPriceId } from '@/lib/stripe/membership-plans'
import { getOptionalStripeDate, getPeriodBounds } from '@/lib/stripe/subscription-period'

async function verifyCheckoutSession(sessionId: string) {
  try {
    const stripe = getStripeClient()
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (session.payment_status === 'paid' && session.mode === 'subscription') {
      return { success: true, session }
    }
    
    return { success: false, session: null }
  } catch (error) {
    console.error('Error verifying checkout session:', error)
    return { success: false, session: null }
  }
}

async function checkMembershipCreated(userId: string, maxRetries = 8, delayMs = 2000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const membership = await getUserMembership(userId)
      if (membership) {
        return { found: true, membership }
      }
      
      // Wait before retrying (except on last attempt)
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    } catch (error) {
      console.error(`Error checking membership (attempt ${attempt + 1}):`, error)
    }
  }
  
  return { found: false, membership: null }
}

async function syncMembershipFromSubscription(userId: string, subscriptionId: string) {
  try {
    const stripe = getStripeClient()
    const supabaseAdmin = getServiceSupabaseClient()
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['items.data.price'],
    })

    const price = subscription.items.data[0]?.price
    const priceId = price?.id

    if (!priceId) {
      return { success: false }
    }

    const plan = await ensurePlanForPriceId(supabaseAdmin, priceId)

    if (!plan) {
      console.error('Sync membership failed: plan not found for price', priceId)
      return { success: false }
    }

    await supabaseAdmin
      .from('profiles')
      .update({ stripe_customer_id: subscription.customer as string })
      .eq('id', userId)

    const period = getPeriodBounds(subscription)

    const payload = {
      user_id: userId,
      plan_id: plan.id,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      status:
        subscription.status === 'trialing' || subscription.status === 'active'
          ? 'active'
          : subscription.status,
      current_period_start: period.start,
      current_period_end: period.end,
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      trial_start: getOptionalStripeDate(subscription.trial_start),
      trial_end: getOptionalStripeDate(subscription.trial_end),
    }

    const { error } = await supabaseAdmin
      .from('memberships')
      .upsert(payload, { onConflict: 'stripe_subscription_id' })

    if (error) {
      console.error('Failed to upsert membership from subscription:', error)
      return { success: false }
    }

    return { success: true }
  } catch (error) {
    console.error('Sync membership from subscription failed:', error)
    return { success: false }
  }
}

async function MembershipSuccessContent({ sessionId }: { sessionId: string }) {
  // First, refresh the user session explicitly
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  // If user is not authenticated, redirect to auth with redirect param
  if (!user || authError) {
    redirect(`/auth?redirect=/dashboard/membership/success?session_id=${sessionId}`)
  }

  // Verify the checkout session
  const { success: sessionVerified, session } = await verifyCheckoutSession(sessionId)
  
  if (!sessionVerified || !session) {
    return (
      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-6 w-6 text-yellow-500" />
            <CardTitle>Verifying Payment</CardTitle>
          </div>
          <CardDescription>
            We're verifying your payment. This may take a moment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-300">
            If you've completed payment, your membership will be activated shortly.
            You can check your membership dashboard for updates.
          </p>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/dashboard/membership">View Membership</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/memberships">Browse Plans</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Check if membership was created (with retry logic for webhook delay)
  const { found: membershipFound, membership } = await checkMembershipCreated(user.id)

  if (membershipFound && membership) {
    // Success! Redirect to membership dashboard
    redirect('/dashboard/membership?success=true')
  }

  if (!membershipFound && session.subscription && typeof session.subscription === 'string') {
    const syncResult = await syncMembershipFromSubscription(user.id, session.subscription)
    if (syncResult.success) {
      const syncedMembership = await getUserMembership(user.id)
      if (syncedMembership) {
        redirect('/dashboard/membership?success=true')
      }
    }
  }

  // Membership not found yet, but session is verified
  // This might be a webhook delay - show a message and allow manual check
  return (
    <Card className="border-[#50C878]/50 bg-[#50C878]/5">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="h-6 w-6 text-[#50C878]" />
          <CardTitle>Payment Successful!</CardTitle>
        </div>
        <CardDescription>
          Your payment has been processed successfully.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-300">
          Your membership is being activated. This usually happens instantly, but may take a few moments.
          You can check your membership status below.
        </p>
        <div className="flex gap-4">
          <Button asChild className="bg-gradient-to-r from-[#50C878] to-[#3DA860] hover:from-[#3DA860] hover:to-[#50C878]">
            <Link href="/dashboard/membership">View Membership</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/memberships">Browse Plans</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function MembershipSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; success?: string }>
}) {
  const params = await searchParams
  const sessionId = params.session_id
  
  // If success param is present but no session_id, user might have come from redirect
  // Try to get user and redirect to dashboard
  if (params.success && !sessionId) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      redirect('/dashboard/membership?success=true')
    }
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <Card className="max-w-2xl w-full border-gray-800 bg-black/50">
          <CardHeader>
            <CardTitle className="text-white">Invalid Session</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-300 mb-4">
              No session ID provided. If you've completed payment, please check your membership dashboard.
            </p>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/dashboard/membership">View Membership</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/memberships">Browse Plans</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full">
        <Suspense
          fallback={
            <Card className="border-gray-800 bg-black/50">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-[#50C878]" />
                  <p className="text-sm text-gray-300">Processing your membership...</p>
                </div>
              </CardContent>
            </Card>
          }
        >
          <MembershipSuccessContent sessionId={sessionId} />
        </Suspense>
      </div>
    </div>
  )
}


