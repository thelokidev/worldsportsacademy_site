import { getAllMembershipPlans } from '@/server/actions/memberships'
import { MembershipCard } from '@/components/features/membership/membership-card'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default async function MembershipsPage() {
  const { plans } = await getAllMembershipPlans()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If user is already logged in and has active membership, redirect to dashboard
  if (user) {
    const { data: activeMembership } = await supabase
      .from('memberships')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gt('current_period_end', new Date().toISOString())
      .limit(1)
      .single()

    if (activeMembership) {
      redirect('/dashboard/membership')
    }
  }

  return (
    <div className="h-screen bg-gray-900 dark:bg-gray-900 overflow-hidden flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1C2A24] via-[#2D5B4A] to-[#50C878] py-8 flex-shrink-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.15)_0%,_rgba(255,255,255,0)_60%)] mix-blend-overlay" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-sm font-semibold text-white/90 uppercase tracking-wider">
                MEMBERSHIPS
              </span>
              <div className="h-0.5 w-12 bg-[#CFEA6C]" />
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
              Choose Your Membership
            </h1>
            <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto">
              Unlock unlimited access to our world-class sports facilities. 
              All memberships include monthly auto-renewal for your convenience.
            </p>
          </div>
        </div>
      </section>

      {/* Membership Plans */}
      <section className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 lg:px-8 bg-gray-900 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          {plans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 dark:text-gray-400">No membership plans available at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <MembershipCard key={plan.id} plan={plan} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Drop-in CTA Section */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 bg-gray-900 dark:bg-gray-900 flex-shrink-0 border-t border-gray-800 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-[#50C878]/20 to-[#2D5B4A]/20 dark:from-[#50C878]/20 dark:to-[#2D5B4A]/20 border border-[#50C878]/30 dark:border-[#50C878]/30 rounded-2xl p-6 md:p-8 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-white dark:text-white mb-3">
              Not ready for a membership?
            </h2>
            <p className="text-gray-300 dark:text-gray-300 mb-4 text-base max-w-2xl mx-auto">
              Try our drop-in rates for flexible access to our facilities. Perfect for trying out our services before committing to a membership.
            </p>
            <Button
              asChild
              className="bg-[#50C878] hover:bg-[#50C878]/90 text-white text-base font-normal rounded-md px-8 py-3 h-auto shadow-sm"
              size="lg"
            >
              <Link href="/bookings" className="inline-flex items-center gap-2">
                View Drop-In Rates
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

