import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'

export async function GET() {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const [
      { count: todayBookings },
      { count: activeMembers },
      { data: monthlyPayments },
      { count: monthlyBookings },
      { count: totalMembers },
      { count: pendingBookings },
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
        .from('profiles')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
    ])

    const monthlyRevenue = monthlyPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

    return NextResponse.json({
      todayBookings: todayBookings || 0,
      activeMembers: activeMembers || 0,
      monthlyRevenue,
      monthlyBookings: monthlyBookings || 0,
      totalMembers: totalMembers || 0,
      pendingBookings: pendingBookings || 0,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}

