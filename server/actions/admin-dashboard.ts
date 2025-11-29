'use server'

import { createClient } from '@/lib/supabase/server'
import { getServiceSupabaseClientSafe } from '@/lib/supabase/service'
import { getPaymentMetrics } from '@/lib/payments/metrics'

interface DateRange {
  from: string
  to: string
}

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

export async function getDashboardStats(dateRange?: DateRange) {
  const supabase = await createClient()
  
  // Use provided date range or default to current month
  const now = new Date()
  const startDate = dateRange?.from || new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const endDate = dateRange?.to || new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()
  
  // For today's bookings, use start of today
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

  const [
    { count: periodBookings },
    { count: todayBookings },
    { data: periodPayments },
    { count: activeMembers },
  ] = await Promise.all([
    // Bookings in selected period
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .gte('start_time', startDate)
      .lte('start_time', endDate)
      .eq('status', 'confirmed'),
    // Today's bookings (always show today's regardless of filter)
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .gte('start_time', startOfToday)
      .eq('status', 'confirmed'),
    // Payments in selected period
    supabase
      .from('payments')
      .select('amount')
      .eq('status', 'succeeded')
      .gte('created_at', startDate)
      .lte('created_at', endDate),
    // Active members (current state, not filtered by date)
    supabase
      .from('memberships')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .gt('current_period_end', new Date().toISOString()),
  ])

  const periodRevenue = periodPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

  return {
    periodBookings: periodBookings || 0,
    todayBookings: todayBookings || 0,
    activeMembers: activeMembers || 0,
    periodRevenue,
  }
}

export async function getDashboardActivity(dateRange?: DateRange) {
  const supabase = await createClient()
  
  // Use provided date range or default to recent
  const startDate = dateRange?.from
  const endDate = dateRange?.to

  // Build booking query
  let bookingQuery = supabase
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
    .limit(10)

  if (startDate) {
    bookingQuery = bookingQuery.gte('created_at', startDate)
  }
  if (endDate) {
    bookingQuery = bookingQuery.lte('created_at', endDate)
  }

  // Build membership query
  let membershipQuery = supabase
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
    .limit(10)

  if (startDate) {
    membershipQuery = membershipQuery.gte('created_at', startDate)
  }
  if (endDate) {
    membershipQuery = membershipQuery.lte('created_at', endDate)
  }

  const [
    { data: recentBookingsRaw },
    { data: recentMembershipsRaw },
  ] = await Promise.all([
    bookingQuery,
    membershipQuery,
  ])

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
        full_name: profile?.full_name || email,
      }
    }
  })

  const recentMemberships = (recentMembershipsRaw || []).map(membership => {
    const profile = profileMap.get(membership.user_id!)
    const email = emailMap.get(membership.user_id!) || 'No email'
    return {
      ...membership,
      profiles: {
        full_name: profile?.full_name || email,
      }
    }
  })

  return {
    bookings: recentBookings,
    memberships: recentMemberships,
  }
}

export async function getFilteredPaymentMetrics(dateRange?: DateRange) {
  const supabase = await createClient()
  
  const now = new Date()
  const startDate = dateRange?.from || new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const endDate = dateRange?.to || new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

  const [
    { data: payments },
    { data: membershipPayments },
  ] = await Promise.all([
    supabase
      .from('payments')
      .select('id, amount, payment_type, status, created_at')
      .gte('created_at', startDate)
      .lte('created_at', endDate),
    supabase
      .from('memberships')
      .select(`
        id,
        created_at,
        membership_plans:plan_id (
          price
        )
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate),
  ])

  const succeededPayments = payments?.filter(p => p.status === 'succeeded') || []
  const dropInRevenue = succeededPayments
    .filter(p => p.payment_type === 'drop_in')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  const membershipRevenue = (membershipPayments || []).reduce((sum, m: any) => {
    return sum + Number(m.membership_plans?.price || 0)
  }, 0)

  const totalRevenue = dropInRevenue + membershipRevenue
  const totalTransactions = succeededPayments.length + (membershipPayments?.length || 0)

  return {
    totalRevenue,
    dropInRevenue,
    membershipRevenue,
    totalTransactions,
    newMemberships: membershipPayments?.length || 0,
  }
}

export async function getRevenueAnalytics(dateRange?: DateRange) {
  const supabase = await createClient()
  
  const now = new Date()
  const startDate = dateRange?.from || new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const endDate = dateRange?.to || new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

  // Calculate previous period for comparison
  const startDateObj = new Date(startDate)
  const endDateObj = new Date(endDate)
  const periodDuration = endDateObj.getTime() - startDateObj.getTime()
  const prevStartDate = new Date(startDateObj.getTime() - periodDuration).toISOString()
  const prevEndDate = new Date(startDateObj.getTime() - 1).toISOString()

  const [
    { data: currentPayments },
    { data: prevPayments },
    { data: currentMemberships },
    { data: prevMemberships },
    { data: activeMemberships },
    { data: refundedPayments },
  ] = await Promise.all([
    // Current period payments
    supabase
      .from('payments')
      .select('id, amount, payment_type, status, created_at')
      .eq('status', 'succeeded')
      .gte('created_at', startDate)
      .lte('created_at', endDate),
    // Previous period payments
    supabase
      .from('payments')
      .select('amount')
      .eq('status', 'succeeded')
      .gte('created_at', prevStartDate)
      .lt('created_at', prevEndDate),
    // Current period memberships
    supabase
      .from('memberships')
      .select(`
        id,
        status,
        created_at,
        membership_plans:plan_id (
          name,
          price
        )
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate),
    // Previous period memberships
    supabase
      .from('memberships')
      .select(`
        id,
        membership_plans:plan_id (
          price
        )
      `)
      .gte('created_at', prevStartDate)
      .lt('created_at', prevEndDate),
    // Currently active memberships
    supabase
      .from('memberships')
      .select(`
        id,
        status,
        membership_plans:plan_id (
          name,
          price,
          billing_interval
        )
      `)
      .eq('status', 'active')
      .gt('current_period_end', new Date().toISOString()),
    // Refunds in current period
    supabase
      .from('payments')
      .select('amount')
      .eq('status', 'refunded')
      .gte('created_at', startDate)
      .lte('created_at', endDate),
  ])

  // Calculate current period revenue
  const currentDropInRevenue = (currentPayments || [])
    .filter(p => p.payment_type === 'drop_in')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  const currentMembershipRevenue = (currentMemberships as any[] || []).reduce((sum, m) => {
    return sum + Number(m.membership_plans?.price || 0)
  }, 0)

  // Calculate MRR from active memberships
  const monthlyRecurringRevenue = (activeMemberships as any[] || []).reduce((sum, m) => {
    if (m.membership_plans?.price) {
      const price = Number(m.membership_plans.price)
      if (m.membership_plans.billing_interval === 'year') {
        return sum + (price / 12)
      }
      return sum + price
    }
    return sum
  }, 0)

  // Previous period totals
  const prevDropInRevenue = (prevPayments || []).reduce((sum, p) => sum + Number(p.amount), 0)
  const prevMembershipRevenue = (prevMemberships as any[] || []).reduce((sum, m) => {
    return sum + Number(m.membership_plans?.price || 0)
  }, 0)

  const currentTotal = currentDropInRevenue + currentMembershipRevenue
  const prevTotal = prevDropInRevenue + prevMembershipRevenue

  // Calculate growth
  const growth = prevTotal > 0
    ? ((currentTotal - prevTotal) / prevTotal) * 100
    : currentTotal > 0 ? 100 : 0

  // Total refunds
  const totalRefunds = (refundedPayments || []).reduce((sum, p) => sum + Number(p.amount), 0)

  // Membership breakdown by plan
  const membershipBreakdown = (activeMemberships as any[] || []).reduce((acc, m) => {
    const planName = m.membership_plans?.name || 'Unknown Plan'
    const price = Number(m.membership_plans?.price || 0)
    if (!acc[planName]) {
      acc[planName] = { count: 0, revenue: 0 }
    }
    acc[planName].count += 1
    acc[planName].revenue += price
    return acc
  }, {} as Record<string, { count: number; revenue: number }>)

  return {
    totalPeriodRevenue: currentTotal,
    dropInRevenue: currentDropInRevenue,
    membershipRevenue: currentMembershipRevenue,
    monthlyRecurringRevenue,
    previousPeriodRevenue: prevTotal,
    growth,
    totalRefunds,
    activeMembershipCount: activeMemberships?.length || 0,
    newMembershipsCount: currentMemberships?.length || 0,
    membershipBreakdown,
    recentPayments: currentPayments || [],
  }
}

