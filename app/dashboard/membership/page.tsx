import { getUserMembership } from '@/server/queries/memberships'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MembershipStatus } from '@/components/features/membership/membership-status'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ManageSubscriptionButton } from '@/components/features/membership/manage-subscription-button'

export default async function MembershipDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin?redirect=/dashboard/membership')
  }

  const membership = await getUserMembership(user.id)

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1C2A24] via-[#2D5B4A] to-[#50C878] pt-24 pb-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.15)_0%,_rgba(255,255,255,0)_60%)] mix-blend-overlay" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">My Membership</h1>
          <p className="text-white/90">
            Manage your subscription and view membership details
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-5xl mx-auto">
          {!membership ? (
            <Card className="border-2 border-gray-200 shadow-lg">
              <CardHeader className="bg-gradient-to-br from-[#50C878]/5 to-transparent">
                <CardTitle className="text-[#2D5B4A] text-2xl">No Active Membership</CardTitle>
                <CardDescription className="text-gray-600">
                  You don't have an active membership. Purchase one to get started.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Button 
                  asChild
                  className="bg-[#50C878] hover:bg-[#50C878]/90 text-white"
                  size="lg"
                >
                  <a href="/memberships">Browse Membership Plans</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <MembershipStatus membership={membership} />
              
              <Card className="border-2 border-gray-200 shadow-lg">
                <CardHeader className="bg-gradient-to-br from-[#50C878]/5 to-transparent">
                  <CardTitle className="text-[#2D5B4A] text-2xl">Membership Details</CardTitle>
                  <CardDescription className="text-gray-600">
                    Manage your subscription and view usage statistics
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-white to-[#50C878]/5 rounded-xl p-6 border border-gray-200">
                      <p className="text-sm font-semibold text-[#2D5B4A] uppercase tracking-wide mb-2">Plan</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(membership.membership_plans as any)?.name || 'Unknown Plan'}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-white to-[#50C878]/5 rounded-xl p-6 border border-gray-200">
                      <p className="text-sm font-semibold text-[#2D5B4A] uppercase tracking-wide mb-2">Monthly Cost</p>
                      <p className="text-2xl font-bold text-[#50C878]">
                        ${(membership.membership_plans as any)?.price || 0}/month
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-white to-[#50C878]/5 rounded-xl p-6 border border-gray-200">
                      <p className="text-sm font-semibold text-[#2D5B4A] uppercase tracking-wide mb-2">Status</p>
                      <p className="text-lg font-bold text-gray-900 capitalize">{membership.status}</p>
                    </div>
                    <div className="bg-gradient-to-br from-white to-[#50C878]/5 rounded-xl p-6 border border-gray-200">
                      <p className="text-sm font-semibold text-[#2D5B4A] uppercase tracking-wide mb-2">Renews On</p>
                      <p className="text-lg font-bold text-gray-900">
                        {new Date(membership.current_period_end).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {membership.cancel_at_period_end && (
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl p-6">
                      <p className="text-sm font-medium text-yellow-800">
                        ⚠️ Your membership will cancel on{' '}
                        {new Date(membership.current_period_end).toLocaleDateString()}.
                        You'll continue to have access until then.
                      </p>
                    </div>
                  )}

                  <div className="pt-6 border-t border-gray-200">
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

