export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
// Removed unstable_cache to simplify fail-open behavior
import { getAvailableSlots } from '@/server/actions/bookings'

// Cache key builder
function key(courtId: string, sportId: string, from: string, to: string, duration?: number) {
  // Include a simple version suffix to bust old cached errors
  return `availability:v2:${courtId}:${sportId}:${from}:${to}:${duration ?? 'd'}`
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const courtId = url.searchParams.get('court_id')
    const sportId = url.searchParams.get('sport_id')
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')
    const duration = url.searchParams.get('duration')

    if (!courtId || !sportId || !from || !to) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    try {
      const slots = await getAvailableSlots(
        sportId,
        courtId,
        from,
        to,
        duration ? parseInt(duration) : undefined
      )
      // Derive day summary and recommendations quickly on the server
      const daySummary = slots.map((d: any) => ({
        date: d.date,
        availableCount: (d.slots || []).filter((s: any) => s.available).length,
        firstAvailable: (d.slots || [])
          .filter((s: any) => s.available)
          .sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime())[0]?.time || null,
      }))

      const bestDay = daySummary
        .slice()
        .sort((a: any, b: any) => (b.availableCount || 0) - (a.availableCount || 0))[0] || null

      return NextResponse.json({ slots, daySummary, bestDay })
    } catch (err) {
      console.error('getAvailableSlots error:', err)
      // Fail-open: return empty availability so the UI stays functional
      return NextResponse.json({ slots: [], daySummary: [], bestDay: null, error: err instanceof Error ? err.message : 'unknown error' }, { status: 200 })
    }
  } catch (error) {
    console.error('Availability API error:', error)
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
  }
}