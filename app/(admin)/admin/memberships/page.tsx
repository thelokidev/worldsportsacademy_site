import { createClient } from '@/lib/supabase/server'
import { getServiceSupabaseClientSafe } from '@/lib/supabase/service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

/**
 * Fetch user emails from auth.users for memberships display
 */
async function fetchUserEmails(userIds: string[]): Promise<Map<string, string>> {
  const emailMap = new Map<string, string>()
  
  if (userIds.length === 0) return emailMap
  
  try {
    const serviceSupabase = getServiceSupabaseClientSafe()
    if (!serviceSupabase) {
      return emailMap
    }

    const { data: authUsersData, error } = await serviceSupabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    })

    if (error) {
      console.error('Failed to fetch auth users:', error)
      return emailMap
    }

    authUsersData?.users?.forEach((user) => {
      if (user.email && userIds.includes(user.id)) {
        emailMap.set(user.id, user.email)
      }
    })
  } catch (error) {
    console.error('Error fetching user emails:', error)
  }

  return emailMap
}

async function getAllMemberships() {
  const supabase = await createClient()

  // First, get all memberships with their plans
  const { data: memberships, error } = await supabase
    .from('memberships')
    .select(`
      *,
      membership_plans:plan_id (
        id,
        name,
        price
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch memberships: ${error.message}`)
  }

  if (!memberships || memberships.length === 0) {
    return []
  }

  // Get unique user IDs and fetch profiles separately
  const userIds = [...new Set(memberships.map(m => m.user_id))] as string[]
  
  // Fetch profiles (full_name)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds)

  // Fetch emails from auth.users via service client
  const emailMap = await fetchUserEmails(userIds)

  // Create a map for quick lookup
  const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

  // Combine memberships with profile data and email
  return memberships.map(membership => {
    const profile = profileMap.get(membership.user_id)
    const email = emailMap.get(membership.user_id) || 'No email'
    return {
      ...membership,
      profiles: {
        full_name: profile?.full_name || email, // Use email as fallback for name
        email: email,
      }
    }
  })
}

export default async function AdminMembershipsPage() {
  const memberships = await getAllMemberships()

  const activeCount = memberships.filter(m => m.status === 'active').length
  const canceledCount = memberships.filter(m => m.status === 'canceled').length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-white">Memberships Management</h1>
        <p className="text-gray-400">View and manage all memberships</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-400">Total Memberships</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{memberships.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-400">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#50C878]">{activeCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-400">Canceled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{canceledCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">All Memberships</CardTitle>
        </CardHeader>
        <CardContent>
          {memberships.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No memberships found</p>
          ) : (
            <div className="space-y-4">
              {memberships.map((membership: any) => (
                <div
                  key={membership.id}
                  className="flex items-center justify-between p-4 border border-gray-800 rounded-lg bg-black/20 hover:bg-black/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-200">
                        {(membership.membership_plans as any)?.name || 'Unknown Plan'}
                      </span>
                      <Badge variant={
                        membership.status === 'active' ? 'default' :
                          membership.status === 'canceled' ? 'secondary' :
                            'outline'
                      } className={
                        membership.status === 'active' ? 'bg-[#50C878]/20 text-[#50C878] hover:bg-[#50C878]/30 border-0' :
                          membership.status === 'canceled' ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 border-0' :
                            'border-gray-700 text-gray-400'
                      }>
                        {membership.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">
                      {(membership.profiles as any)?.full_name || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Renews: {format(new Date(membership.current_period_end), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">
                      ${(membership.membership_plans as any)?.price || 0}/month
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

