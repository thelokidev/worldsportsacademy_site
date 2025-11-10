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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              {plans.map((plan, index) => (
                <div
                  key={plan.id}
                  className="animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <MembershipCard plan={plan} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modern Drop-in CTA Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="relative group">
            {/* Glassmorphism Card */}
            <div className="relative bg-black/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-8 md:p-10 overflow-hidden shadow-2xl">
              {/* Animated Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#50C878]/3 via-[#2D5B4A]/3 to-[#50C878]/3 opacity-15 group-hover:opacity-25 transition-opacity duration-500" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#50C878]/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#2D5B4A]/5 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5 flex-1">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#50C878]/20 rounded-2xl blur-xl" />
                    <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#50C878] to-[#2D5B4A] shadow-lg">
                      <ArrowRight className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-1.5">
                      Not ready for a membership?
                    </h2>
                    <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                      Try our drop-in rates for flexible access to all facilities
                    </p>
                  </div>
                </div>
                <Button
                  asChild
                  className="bg-gradient-to-r from-[#50C878] to-[#3DA860] hover:from-[#3DA860] hover:to-[#50C878] text-white text-base font-semibold rounded-xl px-8 py-6 h-auto shadow-xl hover:shadow-2xl transition-all duration-300 group/btn flex-shrink-0 border-0"
                >
                  <Link href="/bookings" className="inline-flex items-center gap-2.5">
                    View Drop-In Rates
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

