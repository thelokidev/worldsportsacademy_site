import { createClient } from '@/lib/supabase/server'
import { getServiceSupabaseClientSafe } from '@/lib/supabase/service'
import { getPaymentMetrics } from '@/lib/payments/metrics'
import { DashboardWithFilter } from '@/components/features/admin/dashboard-with-filter'

/**
 * Fetch user emails from auth.users for dashboard display
 */
async function fetchUserEmailsForDashboard(userIds: string[]): Promise<Map<string, string>> {
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

async function getInitialDashboardData() {
  const supabase = await createClient()
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  // Fetch all initial data in parallel
  const [
    { count: todayBookings },
    { count: activeMembers },
    { data: monthlyPayments },
    { count: monthlyBookings },
    { data: recentBookingsRaw },
    { data: recentMembershipsRaw },
    paymentMetrics,
  ] = await Promise.all([
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .gte('start_time', startOfToday)
      .eq('status', 'confirmed'),
    supabase
      .from('memberships')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .gt('current_period_end', new Date().toISOString()),
    supabase
      .from('payments')
      .select('amount')
      .eq('status', 'succeeded')
      .gte('created_at', startOfMonth),
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .gte('start_time', startOfMonth)
      .eq('status', 'confirmed'),
    supabase
      .from('bookings')
      .select(`
        id,
        start_time,
        status,
        created_at,
        user_id,
        booking_type,
        payment_status,
        sports:sport_id (
          display_name
        ),
        courts:court_id (
          name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('memberships')
      .select(`
        id,
        status,
        created_at,
        user_id,
        current_period_end,
        membership_plans:plan_id (
          name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5),
    getPaymentMetrics(),
  ])

  const monthlyRevenue = monthlyPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

  // Fetch profiles for recent activity
  const bookingUserIds = recentBookingsRaw?.map(b => b.user_id).filter(Boolean) || []
  const membershipUserIds = recentMembershipsRaw?.map(m => m.user_id).filter(Boolean) || []
  const allUserIds = [...new Set([...bookingUserIds, ...membershipUserIds])] as string[]

  // Fetch profiles (full_name)
  let profileMap = new Map<string, { full_name: string | null }>()
  if (allUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', allUserIds)
    
    profileMap = new Map(profiles?.map(p => [p.id, { full_name: p.full_name }]) || [])
  }

  // Fetch emails from auth.users
  const emailMap = await fetchUserEmailsForDashboard(allUserIds)

  const recentBookings = (recentBookingsRaw || []).map(booking => {
    const profile = profileMap.get(booking.user_id!)
    const email = emailMap.get(booking.user_id!) || 'No email'
    return {
      ...booking,
      profiles: {
        full_name: profile?.full_name || email, // Use email as fallback
      }
    }
  })

  const recentMemberships = (recentMembershipsRaw || []).map(membership => {
    const profile = profileMap.get(membership.user_id!)
    const email = emailMap.get(membership.user_id!) || 'No email'
    return {
      ...membership,
      profiles: {
        full_name: profile?.full_name || email, // Use email as fallback
      }
    }
  })

  return {
    stats: {
      todayBookings: todayBookings || 0,
      activeMembers: activeMembers || 0,
      monthlyRevenue,
      monthlyBookings: monthlyBookings || 0,
    },
    activity: {
      bookings: recentBookings,
      memberships: recentMemberships,
    },
    paymentMetrics,
  }
}

export default async function AdminDashboardPage() {
  const initialData = await getInitialDashboardData()

  // Transform payment metrics for filtered view
  const initialPaymentMetrics = {
    totalRevenue: initialData.stats.monthlyRevenue,
    dropInRevenue: initialData.paymentMetrics?.dropInRevenue || 0,
    membershipRevenue: initialData.paymentMetrics?.membershipRevenue || 0,
    totalTransactions: initialData.paymentMetrics?.totalTransactions || 0,
    newMemberships: initialData.paymentMetrics?.newMemberships || 0,
  }

  return (
    <DashboardWithFilter
      initialStats={initialData.stats}
      initialActivity={initialData.activity}
      initialPaymentMetrics={initialPaymentMetrics}
    />
  )
}
