import { NextRequest, NextResponse } from 'next/server'

import { logPaymentError } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'
import { initiateBookingRefund } from '@/lib/stripe/payments'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { bookingId, reason } = body

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    const result = await initiateBookingRefund({
      bookingId,
      reason,
    })

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    logPaymentError('Refund initiation error', error)
    const message = error instanceof Error ? error.message : 'Failed to initiate refund'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

