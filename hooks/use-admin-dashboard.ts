'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

// Types for dashboard data
export interface DashboardStats {
  todayBookings: number
  activeMembers: number
  monthlyRevenue: number
  monthlyBookings: number
  totalMembers: number
  pendingBookings: number
  lastUpdated: string
}

export interface RecentBooking {
  id: string
  start_time: string
  status: string
  created_at: string
  user_id: string
  booking_type: string | null
  payment_status: string | null
  participants_count?: number | null
  sports: { display_name: string } | null
  courts: { name: string } | null
  profiles: { full_name: string | null } | null
}

export interface RecentMembership {
  id: string
  status: string
  created_at: string
  user_id: string
  current_period_end: string
  membership_plans: { name: string } | null
  profiles: { full_name: string | null } | null
}

export interface RecentPayment {
  id: string
  amount: number
  status: string
  payment_type: string
  created_at: string
  user_id: string
  profiles: { full_name: string | null } | null
}

export interface DashboardActivity {
  bookings: RecentBooking[]
  memberships: RecentMembership[]
  payments: RecentPayment[]
  lastUpdated: string
}

export interface CourtStatus {
  id: string
  name: string
  is_active: boolean
  is_blocked: boolean
  blocked_reason: string | null
  sports: { id: string; display_name: string } | null
  status: 'available' | 'occupied' | 'blocked' | 'inactive'
  currentBooking: {
    id: string
    start_time: string
    end_time: string
    user: { full_name: string | null } | null
  } | null
  nextBooking: {
    id: string
    start_time: string
    end_time: string
    user: { full_name: string | null } | null
  } | null
}

export interface CourtsSummary {
  courts: CourtStatus[]
  summary: {
    total: number
    available: number
    occupied: number
    blocked: number
  }
  lastUpdated: string
}

// Hook for dashboard stats with real-time updates
export function useDashboardStats(initialData?: DashboardStats) {
  const [stats, setStats] = useState<DashboardStats | null>(initialData || null)
  const [isLoading, setIsLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)
  const channelsRef = useRef<RealtimeChannel[]>([])

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/dashboard/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      setStats(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()

    const supabase = createClient()

    // Subscribe to bookings changes
    const bookingsChannel = supabase
      .channel('admin-stats-bookings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => fetchStats()
      )
      .subscribe()

    // Subscribe to memberships changes
    const membershipsChannel = supabase
      .channel('admin-stats-memberships')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'memberships' },
        () => fetchStats()
      )
      .subscribe()

    // Subscribe to payments changes
    const paymentsChannel = supabase
      .channel('admin-stats-payments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        () => fetchStats()
      )
      .subscribe()

    channelsRef.current = [bookingsChannel, membershipsChannel, paymentsChannel]

    // Auto-refresh every 30 seconds as a fallback
    const interval = setInterval(fetchStats, 30000)

    return () => {
      clearInterval(interval)
      channelsRef.current.forEach(channel => supabase.removeChannel(channel))
    }
  }, [fetchStats])

  return { stats, isLoading, error, refetch: fetchStats }
}

// Hook for dashboard activity with real-time updates
export function useDashboardActivity(initialData?: DashboardActivity) {
  const [activity, setActivity] = useState<DashboardActivity | null>(initialData || null)
  const [isLoading, setIsLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)
  const channelsRef = useRef<RealtimeChannel[]>([])

  const fetchActivity = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/dashboard/activity')
      if (!response.ok) throw new Error('Failed to fetch activity')
      const data = await response.json()
      setActivity(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activity')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchActivity()

    const supabase = createClient()

    // Subscribe to bookings changes
    const bookingsChannel = supabase
      .channel('admin-activity-bookings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => fetchActivity()
      )
      .subscribe()

    // Subscribe to memberships changes
    const membershipsChannel = supabase
      .channel('admin-activity-memberships')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'memberships' },
        () => fetchActivity()
      )
      .subscribe()

    // Subscribe to payments changes
    const paymentsChannel = supabase
      .channel('admin-activity-payments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        () => fetchActivity()
      )
      .subscribe()

    channelsRef.current = [bookingsChannel, membershipsChannel, paymentsChannel]

    // Auto-refresh every 30 seconds as a fallback
    const interval = setInterval(fetchActivity, 30000)

    return () => {
      clearInterval(interval)
      channelsRef.current.forEach(channel => supabase.removeChannel(channel))
    }
  }, [fetchActivity])

  return { activity, isLoading, error, refetch: fetchActivity }
}

// Hook for court status with real-time updates
export function useCourtStatus(initialData?: CourtsSummary) {
  const [courtData, setCourtData] = useState<CourtsSummary | null>(initialData || null)
  const [isLoading, setIsLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  const fetchCourtStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/dashboard/courts')
      if (!response.ok) throw new Error('Failed to fetch court status')
      const data = await response.json()

      // Filter out chess courts (Coming Soon)
      if (data && data.courts) {
        data.courts = data.courts.filter((court: any) =>
          !court.sports?.display_name?.toLowerCase().includes('chess')
        )

        // Recalculate summary based on filtered courts
        data.summary = {
          total: data.courts.length,
          available: data.courts.filter((c: any) => c.status === 'available').length,
          occupied: data.courts.filter((c: any) => c.status === 'occupied').length,
          blocked: data.courts.filter((c: any) => c.status === 'blocked').length
        }
      }

      setCourtData(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch court status')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCourtStatus()

    const supabase = createClient()

    // Subscribe to bookings changes for court status updates
    const channel = supabase
      .channel('admin-court-status')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => fetchCourtStatus()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'courts' },
        () => fetchCourtStatus()
      )
      .subscribe()

    channelRef.current = channel

    // Auto-refresh every 60 seconds for court status
    const interval = setInterval(fetchCourtStatus, 60000)

    return () => {
      clearInterval(interval)
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [fetchCourtStatus])

  return { courtData, isLoading, error, refetch: fetchCourtStatus }
}

