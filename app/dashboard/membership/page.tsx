import { getUserMembership } from '@/server/queries/memberships'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MembershipStatus } from '@/components/features/membership/membership-status'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ManageSubscriptionButton } from '@/components/features/membership/manage-subscription-button'
import { Calendar, CreditCard, CheckCircle2, Clock, ArrowRight, Crown, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

export default async function MembershipDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  
  // Try to get user with retry logic for session refresh after external redirects
  let user = null
  let authError = null
  
  try {
    const authResult = await supabase.auth.getUser()
    user = authResult.data.user
    authError = authResult.error
  } catch (error) {
    console.error('Error getting user:', error)
  }

  // If no user and we have a success param, wait briefly and retry (for Stripe redirect scenarios)
  if (!user && params.success) {
    await new Promise(resolve => setTimeout(resolve, 500))
    try {
      const retryResult = await supabase.auth.getUser()
      user = retryResult.data.user
      authError = retryResult.error
    } catch (error) {
      console.error('Error retrying user fetch:', error)
    }
  }

  if (!user) {
    redirect('/auth?redirect=/dashboard/membership')
  }

  const membership = await getUserMembership(user.id)

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1C2A24] via-[#2D5B4A] to-[#50C878] pt-32 pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.15)_0%,_rgba(255,255,255,0)_60%)] mix-blend-overlay" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">My Membership</h1>
              <p className="text-white/90 text-lg">
                Manage your subscription and view membership details
              </p>
            </div>
            {membership && (
              <div className="hidden md:flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20">
                <Crown className="w-6 h-6 text-yellow-400" />
                <div>
                  <p className="text-xs text-white/80 uppercase tracking-wider">Status</p>
                  <p className="text-lg font-bold text-white capitalize">{membership.status}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-5xl mx-auto">
          {params.success && (
            <div className="mb-6 relative overflow-hidden rounded-xl border border-[#50C878]/50 bg-[#50C878]/10 backdrop-blur-sm p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#50C878]/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-[#50C878]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#50C878] mb-1">Membership Activated!</p>
                  <p className="text-sm text-gray-300">
                    Your membership has been successfully activated. Welcome to World Sports Academy!
                  </p>
                </div>
              </div>
            </div>
          )}
          {!membership ? (
            <Card className="relative overflow-hidden border border-gray-800 bg-black/50 backdrop-blur-xl shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#50C878]/5 via-transparent to-[#2D5B4A]/5 pointer-events-none" />
              <CardContent className="relative py-20 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#50C878]/10 mb-6">
                  <Crown className="w-10 h-10 text-[#50C878]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">No Active Membership</h3>
                <p className="text-gray-400 mb-8 text-lg max-w-md mx-auto">
                  Unlock unlimited access to our world-class facilities and training programs
                </p>
                <Button 
                  asChild
                  className="bg-gradient-to-r from-[#50C878] to-[#3DA860] hover:from-[#3DA860] hover:to-[#50C878] text-white font-semibold rounded-xl px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  <Link href="/memberships" className="flex items-center gap-2">
                    Browse Membership Plans
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              <MembershipStatus membership={membership} />
              
              <Card className="relative overflow-hidden border border-gray-800 bg-black/50 backdrop-blur-xl shadow-2xl group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#50C878]/5 via-transparent to-[#2D5B4A]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <CardHeader className="relative pb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#50C878] to-[#3DA860] flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle className="text-2xl md:text-3xl font-bold text-white">Membership Details</CardTitle>
                  </div>
                  <CardDescription className="text-gray-400 text-base">
                    Manage your subscription and view usage statistics
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="group/item p-6 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-[#50C878]/50 transition-all hover:bg-gray-900/70">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#50C878] to-[#3DA860] flex items-center justify-center flex-shrink-0">
                          <Crown className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Plan</p>
                          <p className="text-xl font-bold text-white">
                            {(membership.membership_plans as any)?.name || 'Unknown Plan'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="group/item p-6 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-[#50C878]/50 transition-all hover:bg-gray-900/70">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#50C878] to-[#3DA860] flex items-center justify-center flex-shrink-0">
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Monthly Cost</p>
                          <p className="text-2xl font-bold text-[#50C878]">
                            ${(membership.membership_plans as any)?.price || 0}
                            <span className="text-base text-gray-400 font-normal">/month</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="group/item p-6 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-[#50C878]/50 transition-all hover:bg-gray-900/70">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#50C878] to-[#3DA860] flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                          <p className="text-lg font-bold text-white capitalize">{membership.status}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="group/item p-6 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-[#50C878]/50 transition-all hover:bg-gray-900/70">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#50C878] to-[#3DA860] flex items-center justify-center flex-shrink-0">
                          <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Renews On</p>
                          <p className="text-lg font-bold text-white">
                            {format(new Date(membership.current_period_end), 'MMMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {membership.cancel_at_period_end && (
                    <div className="relative overflow-hidden rounded-xl border border-yellow-500/30 bg-yellow-500/10 backdrop-blur-sm p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-yellow-400 mb-1">Membership Cancelling</p>
                          <p className="text-sm text-yellow-300/90">
                            Your membership will cancel on{' '}
                            <span className="font-semibold">
                              {format(new Date(membership.current_period_end), 'MMMM d, yyyy')}
                            </span>.
                            You'll continue to have access until then.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-6 border-t border-gray-800">
                    <ManageSubscriptionButton />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

