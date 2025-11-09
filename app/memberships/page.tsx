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
    <div className="min-h-screen bg-white pt-16 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1C2A24] via-[#2D5B4A] to-[#50C878] py-12 md:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.15)_0%,_rgba(255,255,255,0)_60%)] mix-blend-overlay" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-sm font-semibold text-white/90 uppercase tracking-wider">
                MEMBERSHIPS
              </span>
              <div className="h-0.5 w-12 bg-[#CFEA6C]" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Choose Your Membership
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              Unlock unlimited access to our world-class sports facilities. 
              All memberships include monthly auto-renewal for your convenience.
            </p>
          </div>
        </div>
      </section>

      {/* Membership Plans */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto relative z-10">
          {plans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No membership plans available at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <MembershipCard key={plan.id} plan={plan} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Drop-in CTA Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-[#50C878]/10 to-[#2D5B4A]/10 border border-[#50C878]/20 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-[#2D5B4A] mb-4">
              Not ready for a membership?
            </h2>
            <p className="text-gray-600 mb-6 text-lg max-w-2xl mx-auto">
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

