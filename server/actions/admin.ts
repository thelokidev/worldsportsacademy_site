'use server'

import { createClient } from '@/lib/supabase/server'
import { getServiceSupabaseClient } from '@/lib/supabase/service'
import { requireAdmin } from '@/lib/auth/admin'
import { revalidatePath } from 'next/cache'

// Court Management Actions

export async function getAllCourts() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: courts, error } = await supabase
    .from('courts')
    .select(`
      id,
      name,
      is_active,
      is_blocked,
      blocked_reason,
      created_at,
      sports:sport_id (
        id,
        name,
        display_name
      )
    `)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch courts: ${error.message}`)
  }

  // Fetch current and next bookings for all courts
  const now = new Date().toISOString()

  // Fetch active bookings (overlapping with now)
  const { data: activeBookings } = await supabase
    .from('bookings')
    .select(`
      id,
      court_id,
      start_time,
      end_time,
      user_id,
      status
    `)
    .eq('status', 'confirmed')
    .lte('start_time', now)
    .gte('end_time', now)

  // Fetch next upcoming booking for each court (within next 24 hours)
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  const { data: upcomingBookings } = await supabase
    .from('bookings')
    .select(`
      id,
      court_id,
      start_time,
      end_time,
      user_id,
      status
    `)
    .eq('status', 'confirmed')
    .gt('start_time', now)
    .lte('start_time', tomorrow)
    .order('start_time', { ascending: true })

  // Fetch user profiles for these bookings
  const userIds = new Set<string>()
  activeBookings?.forEach(b => {
    if (b.user_id) userIds.add(b.user_id)
  })
  upcomingBookings?.forEach(b => {
    if (b.user_id) userIds.add(b.user_id)
  })

  let profileMap = new Map()
  if (userIds.size > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', Array.from(userIds))

    profileMap = new Map(profiles?.map(p => [p.id, p]) || [])
  }

  // Combine data
  return (courts || []).map(court => {
    const activeBooking = activeBookings?.find(b => b.court_id === court.id)
    // Find the first upcoming booking for this court
    const nextBooking = upcomingBookings?.find(b => b.court_id === court.id)

    return {
      ...court,
      currentBooking: activeBooking ? {
        ...activeBooking,
        user: profileMap.get(activeBooking.user_id)
      } : null,
      nextBooking: nextBooking ? {
        ...nextBooking,
        user: profileMap.get(nextBooking.user_id)
      } : null
    }
  })
}

export async function toggleCourtBlock(courtId: string, isBlocked: boolean, reason?: string) {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('courts')
    .update({
      is_blocked: isBlocked,
      blocked_reason: isBlocked ? reason || null : null,
    })
    .eq('id', courtId)

  if (error) {
    throw new Error(`Failed to update court: ${error.message}`)
  }

  revalidatePath('/admin/courts')
  revalidatePath('/bookings')
  return { success: true }
}

export async function toggleCourtActive(courtId: string, isActive: boolean) {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('courts')
    .update({ is_active: isActive })
    .eq('id', courtId)

  if (error) {
    throw new Error(`Failed to update court: ${error.message}`)
  }

  revalidatePath('/admin/courts')
  revalidatePath('/bookings')
  return { success: true }
}

export async function updateCourtName(courtId: string, name: string) {
  await requireAdmin()
  const supabase = await createClient()

  if (!name || name.trim().length === 0) {
    throw new Error('Court name cannot be empty')
  }

  const { error } = await supabase
    .from('courts')
    .update({ name: name.trim() })
    .eq('id', courtId)

  if (error) {
    throw new Error(`Failed to update court name: ${error.message}`)
  }

  revalidatePath('/admin/courts')
  return { success: true }
}

export async function getCourtBookingStats(courtId: string) {
  await requireAdmin()
  const supabase = await createClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfToday = new Date(now.setHours(0, 0, 0, 0)).toISOString()

  // Today's bookings
  const { count: todayBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('court_id', courtId)
    .gte('start_time', startOfToday)
    .eq('status', 'confirmed')

  // This month's bookings
  const { count: monthlyBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('court_id', courtId)
    .gte('start_time', startOfMonth)
    .eq('status', 'confirmed')

  // Upcoming bookings - fetch without profile join, then fetch profiles separately
  const { data: upcomingBookingsRaw } = await supabase
    .from('bookings')
    .select(`
      id,
      start_time,
      end_time,
      status,
      user_id
    `)
    .eq('court_id', courtId)
    .gte('start_time', new Date().toISOString())
    .eq('status', 'confirmed')
    .order('start_time', { ascending: true })
    .limit(5)

  // Fetch profiles for the upcoming bookings
  let upcomingBookings: any[] = []
  if (upcomingBookingsRaw && upcomingBookingsRaw.length > 0) {
    const userIds = [...new Set(upcomingBookingsRaw.map(b => b.user_id).filter((id): id is string => !!id))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds)

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])
    upcomingBookings = upcomingBookingsRaw.map(booking => ({
      ...booking,
      profiles: booking.user_id ? profileMap.get(booking.user_id) : null
    }))
  }

  return {
    todayBookings: todayBookings || 0,
    monthlyBookings: monthlyBookings || 0,
    upcomingBookings,
  }
}

// Member Management Actions

export async function getAllMembers(page = 1, limit = 50) {
  await requireAdmin()
  const supabase = await createClient()
  const serviceSupabase = getServiceSupabaseClient()

  const offset = (page - 1) * limit

  // Get total count
  const { count: totalCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // Get paginated members with their membership info (including phone_number and stripe_customer_id)
  const { data: members, error } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      phone_number,
      stripe_customer_id,
      role,
      created_at,
      updated_at
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    throw new Error(`Failed to fetch members: ${error.message}`)
  }

  // Get all auth users to get emails (using service role client)
  const { data: authUsersData, error: authError } = await serviceSupabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000, // Fetch up to 1000 users to cover all members
  })

  if (authError) {
    console.error('Failed to fetch auth users:', authError)
  }

  // Create a map of user IDs to emails
  const emailMap = new Map<string, string>()
  authUsersData?.users?.forEach((user) => {
    if (user.email) {
      emailMap.set(user.id, user.email)
    }
  })

  // Get membership info for each member
  const membersWithMemberships = await Promise.all(
    (members || []).map(async (member) => {
      const { data: memberships } = await supabase
        .from('memberships')
        .select(`
          id,
          status,
          current_period_end,
          membership_plans:plan_id (
            name,
            price
          )
        `)
        .eq('user_id', member.id)
        .eq('status', 'active')

      const { count: bookingCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', member.id)

      return {
        ...member,
        email: emailMap.get(member.id) || 'Unknown',
        memberships: memberships || [],
        bookingCount: bookingCount || 0,
      }
    })
  )

  return {
    members: membersWithMemberships,
    total: totalCount || 0,
    totalPages: Math.ceil((totalCount || 0) / limit),
  }
}

export async function updateMemberRole(userId: string, role: 'user' | 'admin') {
  await requireAdmin()
  const supabase = await createClient()

  if (!['user', 'admin'].includes(role)) {
    throw new Error('Invalid role')
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) {
    throw new Error(`Failed to update member role: ${error.message}`)
  }

  revalidatePath('/admin/members')
  return { success: true }
}

export async function getMemberDetails(userId: string) {
  await requireAdmin()
  const supabase = await createClient()
  const serviceSupabase = getServiceSupabaseClient()

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (profileError) {
    throw new Error(`Failed to fetch member: ${profileError.message}`)
  }

  // Get auth user to get email (using service role client)
  const { data: authUser, error: authError } = await serviceSupabase.auth.admin.getUserById(userId)
  
  // Merge email into profile
  const profileWithEmail = {
    ...profile,
    email: authUser?.user?.email || 'Unknown',
  }

  // Get memberships
  const { data: memberships } = await supabase
    .from('memberships')
    .select(`
      id,
      status,
      current_period_start,
      current_period_end,
      cancel_at_period_end,
      membership_plans:plan_id (
        name,
        price
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  // Get bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id,
      start_time,
      end_time,
      status,
      booking_type,
      sports:sport_id (
        display_name
      ),
      courts:court_id (
        name
      )
    `)
    .eq('user_id', userId)
    .order('start_time', { ascending: false })
    .limit(10)

  // Get payments
  const { data: payments } = await supabase
    .from('payments')
    .select('id, amount, payment_type, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  return {
    profile: profileWithEmail,
    memberships: memberships || [],
    bookings: bookings || [],
    payments: payments || [],
  }
}

export async function searchMembers(query: string) {
  await requireAdmin()
  const supabase = await createClient()
  const serviceSupabase = getServiceSupabaseClient()

  if (!query || query.trim().length === 0) {
    return []
  }

  const { data: members, error } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      phone_number,
      stripe_customer_id,
      role,
      created_at
    `)
    .ilike('full_name', `%${query}%`)
    .limit(20)

  if (error) {
    throw new Error(`Failed to search members: ${error.message}`)
  }

  // Get auth users to get emails
  const { data: authUsersData } = await serviceSupabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  const emailMap = new Map<string, string>()
  authUsersData?.users?.forEach((user) => {
    if (user.email) {
      emailMap.set(user.id, user.email)
    }
  })

  // Merge email into results
  return (members || []).map(member => ({
    ...member,
    email: emailMap.get(member.id) || 'Unknown',
  }))
}

// Additional Analytics Actions

export async function getCourtUtilization() {
  await requireAdmin()
  const supabase = await createClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { data: courts } = await supabase
    .from('courts')
    .select(`
      id,
      name,
      sports:sport_id (
        display_name
      )
    `)

  const utilizationData = await Promise.all(
    (courts || []).map(async (court) => {
      const { count: bookingCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('court_id', court.id)
        .gte('start_time', startOfMonth)
        .eq('status', 'confirmed')

      return {
        ...court,
        bookingCount: bookingCount || 0,
      }
    })
  )

  return utilizationData
}

export async function getMembershipStats() {
  await requireAdmin()
  const supabase = await createClient()

  // Active memberships by plan
  const { data: plans } = await supabase
    .from('membership_plans')
    .select('id, name')

  const planStats = await Promise.all(
    (plans || []).map(async (plan) => {
      const { count: activeCount } = await supabase
        .from('memberships')
        .select('*', { count: 'exact', head: true })
        .eq('plan_id', plan.id)
        .eq('status', 'active')
        .gt('current_period_end', new Date().toISOString())

      return {
        planName: plan.name,
        activeCount: activeCount || 0,
      }
    })
  )

  return planStats
}

