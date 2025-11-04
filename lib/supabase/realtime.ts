'use client'

import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Subscribe to booking table changes for real-time updates
 */
export function subscribeToBookingChanges(
  callback: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE'
    new?: any
    old?: any
  }) => void
): RealtimeChannel {
  const supabase = createClient()
  
  const channel = supabase
    .channel('bookings-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bookings',
      },
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new,
          old: payload.old,
        })
      }
    )
    .subscribe()

  return channel
}

/**
 * Subscribe to court-specific booking changes
 */
export function subscribeToCourtAvailability(
  courtId: string,
  callback: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE'
    new?: any
    old?: any
  }) => void
): RealtimeChannel {
  const supabase = createClient()
  
  const channel = supabase
    .channel(`court-${courtId}-availability`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `court_id=eq.${courtId}`,
      },
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new,
          old: payload.old,
        })
      }
    )
    .subscribe()

  return channel
}

/**
 * Unsubscribe from a channel
 */
export function unsubscribeFromChannel(channel: RealtimeChannel) {
  const supabase = createClient()
  supabase.removeChannel(channel)
}
