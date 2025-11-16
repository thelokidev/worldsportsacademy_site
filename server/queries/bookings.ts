'use server'

import { createClient } from '@/lib/supabase/server'

export async function getSports() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sports')
    .select('*')
    .order('display_name')

  if (error) {
    throw new Error(`Failed to fetch sports: ${error.message}`)
  }

  return data || []
}

export async function getCourtsBySport(sportId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('courts')
    .select('*')
    .eq('sport_id', sportId)
    .eq('is_active', true)
    .order('name')

  if (error) {
    throw new Error(`Failed to fetch courts: ${error.message}`)
  }

  return data || []
}

export async function getAllBookings(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      sports: sport_id (
        id,
        name,
        display_name
      ),
      courts: court_id (
        id,
        name
      )
    `)
    .eq('user_id', userId)
    .order('start_time', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch bookings: ${error.message}`)
  }

  return data || []
}

export async function getUpcomingBookings(userId: string) {
  const supabase = await createClient()
  const now = new Date().toISOString()
  
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      sports: sport_id (
        id,
        name,
        display_name
      ),
      courts: court_id (
        id,
        name
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'confirmed')
    .gte('start_time', now)
    .order('start_time', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch upcoming bookings: ${error.message}`)
  }

  return data || []
}

export async function getCourtSchedule(courtId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('court_schedules')
    .select('*')
    .eq('court_id', courtId)
    .order('day_of_week', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch court schedule: ${error.message}`)
  }

  return data || []
}

export async function getAllBookingsForAdmin(
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    sportId?: string
    courtId?: string
    status?: string
    dateFrom?: string
    dateTo?: string
  }
) {
  const supabase = await createClient()
  
  let query = supabase
    .from('bookings')
    .select(`
      *,
      sports: sport_id (
        id,
        name,
        display_name
      ),
      courts: court_id (
        id,
        name
      ),
      profiles: user_id (
        id,
        email,
        full_name
      )
    `, { count: 'exact' })

  if (filters?.sportId) {
    query = query.eq('sport_id', filters.sportId)
  }

  if (filters?.courtId) {
    query = query.eq('court_id', filters.courtId)
  }

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.dateFrom) {
    query = query.gte('start_time', filters.dateFrom)
  }

  if (filters?.dateTo) {
    query = query.lte('start_time', filters.dateTo)
  }

  const offset = (page - 1) * pageSize
  query = query.order('start_time', { ascending: false })
    .range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch bookings: ${error.message}`)
  }

  return {
    bookings: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

export async function getBookingStats(startDate?: string, endDate?: string) {
  const supabase = await createClient()
  
  let bookingsQuery = supabase
    .from('bookings')
    .select('status, start_time, sports!inner(price_per_hour)')

  if (startDate) {
    bookingsQuery = bookingsQuery.gte('start_time', startDate)
  }

  if (endDate) {
    bookingsQuery = bookingsQuery.lte('start_time', endDate)
  }

  const { data: bookings, error } = await bookingsQuery

  if (error) {
    throw new Error(`Failed to fetch booking stats: ${error.message}`)
  }

  const stats = {
    total: bookings?.length || 0,
    confirmed: bookings?.filter((b: any) => b.status === 'confirmed').length || 0,
    pending: bookings?.filter((b: any) => b.status === 'pending').length || 0,
    cancelled: bookings?.filter((b: any) => b.status === 'cancelled').length || 0,
    revenue: 0,
  }

  // Calculate revenue from confirmed bookings
  if (bookings) {
    stats.revenue = bookings
      .filter((b: any) => b.status === 'confirmed' && b.sports?.price_per_hour)
      .reduce((sum: number, booking: any) => {
        const start = new Date(booking.start_time)
        const end = new Date(booking.end_time || booking.start_time)
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        const pricePerHour = parseFloat(booking.sports.price_per_hour) || 0
        return sum + hours * pricePerHour
      }, 0)
  }

  return stats
}
