import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RedesignedBooking } from '@/components/features/booking/redesigned-booking'
import { Suspense } from 'react'

export const metadata = {
  title: 'Drop-in Sessions | World Sports Academy',
  description: 'Book drop-in sessions for table tennis and squash. Flexible pay-as-you-go access to our facilities.',
}

/** When true (prod), require auth to view drop-in page. When false/unset (local), page is viewable without login. */
const REQUIRE_AUTH_FOR_DROP_IN_VIEW =
  process.env.REQUIRE_AUTH_FOR_DROP_IN_VIEW === 'true'

export default async function DropInPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string }>
}) {
  if (REQUIRE_AUTH_FOR_DROP_IN_VIEW) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user && !session) {
      const redirectPath =
        (await searchParams).canceled === 'true'
          ? '/drop-in?canceled=true'
          : '/drop-in'
      redirect(`/auth?redirect=${encodeURIComponent(redirectPath)}`)
    }
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
      <RedesignedBooking />
    </Suspense>
  )
}
