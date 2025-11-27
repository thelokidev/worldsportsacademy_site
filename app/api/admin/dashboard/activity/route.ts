import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'

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
    const allUserIds = [...new Set([...bookingUserIds, ...membershipUserIds, ...paymentUserIds])]

    // Fetch profiles for all users in one query
    let profileMap = new Map<string, { full_name: string | null }>()
    if (allUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', allUserIds)
      
      profileMap = new Map(profiles?.map(p => [p.id, { full_name: p.full_name }]) || [])
    }

    // Combine data with profiles
    const recentBookings = (recentBookingsRaw || []).map(booking => ({
      ...booking,
      profiles: profileMap.get(booking.user_id!) || null
    }))

    const recentMemberships = (recentMembershipsRaw || []).map(membership => ({
      ...membership,
      profiles: profileMap.get(membership.user_id!) || null
    }))

    const paymentsWithProfiles = (recentPayments || []).map(payment => ({
      ...payment,
      profiles: profileMap.get(payment.user_id!) || null
    }))

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

