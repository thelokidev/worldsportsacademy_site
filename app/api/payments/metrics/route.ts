import { NextRequest, NextResponse } from 'next/server'

import { logPaymentError } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'
import { getPaymentMetrics } from '@/lib/payments/metrics'

export async function GET(req: NextRequest) {
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

    const metrics = await getPaymentMetrics()

    return NextResponse.json(metrics)
  } catch (error) {
    logPaymentError('Payments metrics error', error)
    const message = error instanceof Error ? error.message : 'Failed to load metrics'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

