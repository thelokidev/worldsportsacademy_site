import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RedesignedBooking } from '@/components/features/booking/redesigned-booking'

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const canceled = params.canceled === 'true'
  
  // Try to get user - if returning from external redirect (like Stripe),
  // the session might need a moment to refresh, so try getting session first
  const { data: { session } } = await supabase.auth.getSession()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Only redirect if truly no user (not just session refresh delay)
  // When returning from Stripe, cookies should be present even if session needs refresh
  if (!user && !session) {
    // Properly encode the redirect URL with query parameters
    const redirectPath = canceled 
      ? '/bookings?canceled=true'
      : '/bookings'
    const encodedRedirect = encodeURIComponent(redirectPath)
    redirect(`/auth?redirect=${encodedRedirect}`)
  }

  return <RedesignedBooking />
}
