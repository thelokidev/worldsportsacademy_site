import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RedesignedBooking } from '@/components/features/booking/redesigned-booking'

export default async function BookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth?redirect=/bookings')
  }

  return <RedesignedBooking />
}
