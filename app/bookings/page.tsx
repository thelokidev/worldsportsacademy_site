import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RedesignedBooking } from '@/components/features/booking/redesigned-booking'

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const params = await searchParams
  const canceled = params.canceled === 'true'
  
  if (!user) {
    // Properly encode the redirect URL with query parameters
    const redirectPath = canceled 
      ? '/bookings?canceled=true'
      : '/bookings'
    const encodedRedirect = encodeURIComponent(redirectPath)
    redirect(`/auth?redirect=${encodedRedirect}`)
  }

  return <RedesignedBooking />
}
