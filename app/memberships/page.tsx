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
      {/* Compact Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1C2A24] via-[#2D5B4A] to-[#50C878] py-8 flex-shrink-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.15)_0%,_rgba(255,255,255,0)_60%)] mix-blend-overlay" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-4 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#CFEA6C] animate-pulse" />
              <span className="text-xs font-semibold text-white/90 uppercase tracking-wider">
                MEMBERSHIPS
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
              Choose Your{' '}
              <span className="bg-gradient-to-r from-white via-[#CFEA6C] to-[#50C878] bg-clip-text text-transparent">
                Membership Plan
              </span>
            </h1>
            <p className="text-sm text-white/90 max-w-2xl mx-auto">
              Unlock unlimited access to our world-class sports facilities
            </p>
          </div>
        </div>
      </section>

      {/* Membership Plans - Scrollable */}
      <section className="flex-1 overflow-y-auto py-8 px-4 sm:px-6 lg:px-8 bg-gray-900 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto h-full">
          {plans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 dark:text-gray-400">No membership plans available at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 pb-4">
              {plans.map((plan) => (
                <MembershipCard key={plan.id} plan={plan} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Compact Drop-in CTA Section */}
      <section className="py-5 px-4 sm:px-6 lg:px-8 bg-gray-900 dark:bg-gray-900 flex-shrink-0 border-t border-gray-800 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-gradient-to-br from-[#50C878]/20 to-[#2D5B4A]/20 dark:from-[#50C878]/20 dark:to-[#2D5B4A]/20 border border-[#50C878]/30 dark:border-[#50C878]/30 rounded-2xl p-5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#50C878]/10 to-transparent opacity-50" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#50C878]/20 flex-shrink-0">
                  <ArrowRight className="w-6 h-6 text-[#50C878]" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg font-bold text-white dark:text-white mb-0.5">
                    Not ready for a membership?
                  </h2>
                  <p className="text-sm text-gray-300 dark:text-gray-300">
                    Try our drop-in rates for flexible access
                  </p>
                </div>
              </div>
              <Button
                asChild
                className="bg-[#50C878] hover:bg-[#50C878]/90 text-white text-sm font-semibold rounded-lg px-6 py-2.5 h-auto shadow-lg hover:shadow-xl transition-all group flex-shrink-0"
              >
                <Link href="/bookings" className="inline-flex items-center gap-2">
                  View Drop-In Rates
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

