import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SinglePageBooking } from '@/components/features/booking/single-page-booking'

export default async function BookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/signin?redirect=/bookings')
  }

  return <SinglePageBooking />
}
