import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServiceSupabaseClientSafe } from '@/lib/supabase/service'
import { requireAdmin } from '@/lib/auth/admin'

/**
 * Fetch user emails from auth.users
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

export async function GET() {
  try {
    await requireAdmin()
    const supabase = await createClient()

    // Recent bookings (last 5)
    const { data: recentBookingsRaw } = await supabase
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
      .limit(5)

    // Recent memberships (last 5)
    const { data: recentMembershipsRaw } = await supabase
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
      .limit(5)

    // Recent payments (last 5)
    const { data: recentPayments } = await supabase
      .from('payments')
      .select(`
        id,
        amount,
        status,
        payment_type,
        created_at,
        user_id
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    // Collect all unique user IDs
    const bookingUserIds = recentBookingsRaw?.map(b => b.user_id).filter(Boolean) || []
    const membershipUserIds = recentMembershipsRaw?.map(m => m.user_id).filter(Boolean) || []
    const paymentUserIds = recentPayments?.map(p => p.user_id).filter(Boolean) || []
    const allUserIds = [...new Set([...bookingUserIds, ...membershipUserIds, ...paymentUserIds])] as string[]

    // Fetch profiles for all users in one query
    let profileMap = new Map<string, { full_name: string | null }>()
    if (allUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', allUserIds)

      profileMap = new Map(profiles?.map(p => [p.id, { full_name: p.full_name }]) || [])
    }

    // Fetch emails from auth.users
    const emailMap = await fetchUserEmails(allUserIds)

    // Combine data with profiles (using email as fallback for name)
    const recentBookings = (recentBookingsRaw || []).map(booking => {
      const profile = profileMap.get(booking.user_id!)
      const email = emailMap.get(booking.user_id!) || 'No email'
      return {
        ...booking,
        profiles: {
          full_name: profile?.full_name || email,
        }
      }
    }).filter(booking => !booking.sports?.display_name?.toLowerCase().includes('chess'))

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

    const paymentsWithProfiles = (recentPayments || []).map(payment => {
      const profile = profileMap.get(payment.user_id!)
      const email = emailMap.get(payment.user_id!) || 'No email'
      return {
        ...payment,
        profiles: {
          full_name: profile?.full_name || email,
        }
      }
    })

    return NextResponse.json({
      bookings: recentBookings,
      memberships: recentMemberships,
      payments: paymentsWithProfiles,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching dashboard activity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard activity' },
      { status: 500 }
    )
  }
}

