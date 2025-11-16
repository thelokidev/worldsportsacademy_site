import { getAllMembershipPlans } from '@/server/actions/memberships'
import { MembershipCard } from '@/components/features/membership/membership-card'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getUserMembership } from '@/server/queries/memberships'

export default async function MembershipsPage() {
  const { plans } = await getAllMembershipPlans()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch active membership if user is logged in
  let activeMembership = null
  if (user) {
    activeMembership = await getUserMembership(user.id)
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Modern Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1C2A24] via-[#2D5B4A] to-[#50C878] opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(80,200,120,0.2)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(45,91,74,0.3)_0%,_transparent_50%)]" />
        
        {/* Floating Orbs */}
        <div className="absolute top-16 left-10 w-48 h-48 bg-[#50C878]/15 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-8 right-20 w-64 h-64 bg-[#2D5B4A]/15 rounded-full blur-2xl animate-pulse delay-1000" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight tracking-tight">
              Choose Your{' '}
              <span className="bg-gradient-to-r from-white via-[#CFEA6C] to-[#50C878] bg-clip-text text-transparent">
                Membership Plan
              </span>
            </h1>
            <p className="text-sm md:text-base text-white/90 max-w-2xl mx-auto leading-relaxed">
              Unlock unlimited access to our world-class sports facilities and training programs
            </p>
          </div>
        </div>
      </section>

      {/* Membership Plans Section */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 -mt-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {plans.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-black mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <p className="text-gray-400 text-lg">No membership plans available at this time.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 mb-6">
                {plans.map((plan, index) => {
                  const membershipPlan = activeMembership?.membership_plans as { id: string } | undefined
                  const isCurrentPlan = activeMembership && membershipPlan?.id === plan.id
                  return (
                    <div
                      key={plan.id}
                      className="animate-in fade-in slide-in-from-bottom-4"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <MembershipCard 
                        plan={plan} 
                        currentMembership={isCurrentPlan ? activeMembership : null}
                        hasActiveMembership={!!activeMembership}
                      />
                    </div>
                  )
                })}
              </div>

              {/* Compact Drop-in CTA Section */}
              <div className="relative group">
                {/* Glassmorphism Card */}
                <div className="relative bg-black/80 backdrop-blur-xl border border-gray-800/50 rounded-xl p-4 md:p-5 overflow-hidden shadow-lg">
                  {/* Animated Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#50C878]/1 via-[#2D5B4A]/1 to-[#50C878]/1 opacity-5 group-hover:opacity-8 transition-opacity duration-500" />
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[#50C878]/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#2D5B4A]/5 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
                  
                  <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="relative">
                        <div className="absolute inset-0 bg-[#50C878]/20 rounded-lg blur-lg" />
                        <div className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#50C878] to-[#2D5B4A] shadow-md">
                          <ArrowRight className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="text-left">
                        <h2 className="text-base md:text-lg font-bold text-white mb-0.5">
                          Not ready for a membership?
                        </h2>
                        <p className="text-xs md:text-sm text-gray-300">
                          Try our drop-in rates for flexible access
                        </p>
                      </div>
                    </div>
                    <Button
                      asChild
                      className="bg-gradient-to-r from-[#50C878] to-[#3DA860] hover:from-[#3DA860] hover:to-[#50C878] text-white text-sm font-semibold rounded-lg px-5 py-2.5 h-auto shadow-md hover:shadow-lg transition-all duration-300 group/btn flex-shrink-0 border-0"
                    >
                      <Link href="/bookings" className="inline-flex items-center gap-2">
                        View Drop-In Rates
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

