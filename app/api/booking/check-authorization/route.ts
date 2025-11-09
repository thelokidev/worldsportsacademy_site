import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkBookingAuthorization } from '@/lib/booking-authorization'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { sportId, durationMinutes } = body

    if (!sportId || !durationMinutes) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await checkBookingAuthorization(
      user.id,
      sportId,
      durationMinutes
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Authorization check error:', error)
    return NextResponse.json(
      { error: 'Failed to check authorization' },
      { status: 500 }
    )
  }
}

