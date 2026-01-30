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

      {/* FREE REGISTRATION PROMOTION BANNER */}
      <section className="px-4 sm:px-6 lg:px-8 -mt-6 mb-6 relative z-20">
        <div className="max-w-7xl mx-auto">
          {/* Check if promotion is active (before Jan 1, 2026) */}
          {new Date() < new Date('2026-01-01T00:00:00-05:00') && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#50C878] via-[#3DA860] to-[#2D5B4A] p-[2px] shadow-2xl">
              {/* Inner Content */}
              <div className="relative bg-black/95 backdrop-blur-xl rounded-2xl p-6 md:p-8">
                {/* Animated Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#50C878]/10 via-transparent to-[#3DA860]/10 animate-pulse" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#50C878]/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#3DA860]/20 rounded-full blur-3xl" />

                {/* Content */}
                <div className="relative z-10 text-center">
                  {/* Emoji Badge */}
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#50C878] to-[#3DA860] shadow-lg mb-4">
                    <span className="text-3xl">🎉</span>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    FREE Registration Promotion
                  </h2>
                  <p className="text-lg md:text-xl text-white/90 mb-1">
                    Join before <span className="font-bold text-[#CFEA6C]">January 1, 2026</span> and save{' '}
                    <span className="font-bold text-[#50C878]">$25 CAD</span> on your initiation fee!
                  </p>
                  <p className="text-sm text-white/70">
                    Limited time offer • Applies to all new memberships
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Membership Plans Section — light, modern grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 -mt-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {plans.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.06]">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-4">
                <span className="text-2xl" aria-hidden>📋</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Plans Available</h3>
              <p className="text-white/60 text-sm max-w-sm mx-auto">
                We're updating our membership options. Check back soon or contact us.
              </p>
            </div>
          ) : (
            <div className="space-y-14">
              {/* Table Tennis Plans */}
              {plans.some(p => p.sports?.some((s: any) => s.name === 'table-tennis')) && (
                <div className="space-y-5">
                  <header className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl" aria-hidden>🏓</span>
                    <div>
                      <h2 className="text-xl font-semibold text-white tracking-tight">Table Tennis</h2>
                      <p className="text-xs text-white/50">Unlimited access to professional tables</p>
                    </div>
                  </header>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {plans
                      .filter(plan => plan.sports?.some((s: any) => s.name === 'table-tennis'))
                      .map((plan, index) => {
                        const membershipPlan = activeMembership?.membership_plans as { id: string } | undefined
                        const isCurrentPlan = activeMembership && membershipPlan?.id === plan.id
                        return (
                          <div
                            key={plan.id}
                            className="animate-in fade-in slide-in-from-bottom-3 duration-500"
                            style={{ animationDelay: `${index * 80}ms` }}
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
                </div>
              )}

              {/* Squash Plans */}
              {plans.some(p => p.sports?.some((s: any) => s.name === 'squash')) && (
                <div className="space-y-5">
                  <header className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl" aria-hidden>🎾</span>
                    <div>
                      <h2 className="text-xl font-semibold text-white tracking-tight">Squash</h2>
                      <p className="text-xs text-white/50">Unlimited access to squash courts</p>
                    </div>
                  </header>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {plans
                      .filter(plan => plan.sports?.some((s: any) => s.name === 'squash'))
                      .map((plan, index) => {
                        const membershipPlan = activeMembership?.membership_plans as { id: string } | undefined
                        const isCurrentPlan = activeMembership && membershipPlan?.id === plan.id
                        return (
                          <div
                            key={plan.id}
                            className="animate-in fade-in slide-in-from-bottom-3 duration-500"
                            style={{ animationDelay: `${index * 80}ms` }}
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
                </div>
              )}

              {/* Drop-in CTA — compact, modern */}
              <div className="relative group mt-6">
                <div className="relative rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.08] p-6 md:p-6 overflow-hidden transition-all duration-300 hover:ring-white/15 hover:bg-white/[0.06]">
                  <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 text-center sm:text-left">
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#50C878]/20 text-[#50C878] shrink-0">
                        <ArrowRight className="w-5 h-5" aria-hidden />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-white">
                          Not ready for a membership?
                        </h2>
                        <p className="text-sm text-white/55">
                          Try drop-in rates for flexible access.
                        </p>
                      </div>
                    </div>
                    <Button
                      asChild
                      className="w-full sm:w-auto h-10 text-sm font-semibold bg-white text-black hover:bg-white/95 rounded-xl px-6 shrink-0"
                    >
                      <Link href="/bookings" className="inline-flex items-center gap-2">
                        View Drop-In Rates
                        <ArrowRight className="w-4 h-4" aria-hidden />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

