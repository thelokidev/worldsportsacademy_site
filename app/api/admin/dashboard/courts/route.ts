import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'

export async function GET() {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const now = new Date().toISOString()

    // Get all courts with their current status
    const { data: courts } = await supabase
      .from('courts')
      .select(`
        id,
        name,
        is_active,
        is_blocked,
        blocked_reason,
        sports:sport_id (
          id,
          display_name
        )
      `)
      .order('name', { ascending: true })

    // Fetch active bookings (currently in session)
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

    // Fetch next upcoming booking for each court (within next 2 hours)
    const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
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
      .lte('start_time', twoHoursFromNow)
      .order('start_time', { ascending: true })

    // Get user profiles for active and upcoming bookings
    const userIds = new Set<string>()
    activeBookings?.forEach(b => { if (b.user_id) userIds.add(b.user_id) })
    upcomingBookings?.forEach(b => { if (b.user_id) userIds.add(b.user_id) })

    let profileMap = new Map<string, { full_name: string | null }>()
    if (userIds.size > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', Array.from(userIds))
      
      profileMap = new Map(profiles?.map(p => [p.id, { full_name: p.full_name }]) || [])
    }

    // Combine court data with booking info
    const courtsWithStatus = (courts || []).map(court => {
      const activeBooking = activeBookings?.find(b => b.court_id === court.id)
      const nextBooking = upcomingBookings?.find(b => b.court_id === court.id)

      let status: 'available' | 'occupied' | 'blocked' | 'inactive' = 'available'
      if (!court.is_active) status = 'inactive'
      else if (court.is_blocked) status = 'blocked'
      else if (activeBooking) status = 'occupied'

      return {
        ...court,
        status,
        currentBooking: activeBooking ? {
          ...activeBooking,
          user: profileMap.get(activeBooking.user_id!) || null
        } : null,
        nextBooking: nextBooking ? {
          ...nextBooking,
          user: profileMap.get(nextBooking.user_id!) || null
        } : null,
      }
    })

    // Calculate summary stats
    const totalCourts = courtsWithStatus.length
    const availableCourts = courtsWithStatus.filter(c => c.status === 'available').length
    const occupiedCourts = courtsWithStatus.filter(c => c.status === 'occupied').length
    const blockedCourts = courtsWithStatus.filter(c => c.status === 'blocked').length

    return NextResponse.json({
      courts: courtsWithStatus,
      summary: {
        total: totalCourts,
        available: availableCourts,
        occupied: occupiedCourts,
        blocked: blockedCourts,
      },
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching court status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch court status' },
      { status: 500 }
    )
  }
}

