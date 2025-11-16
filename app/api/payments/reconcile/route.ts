import { NextRequest, NextResponse } from 'next/server'

import { logPaymentError } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'
import { reconcileStripePayments } from '@/lib/stripe/reconciliation'

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

    let body: { limit?: number } = {}
    try {
      body = await req.json()
    } catch {
      body = {}
    }
    const limit = body.limit

    const result = await reconcileStripePayments({ limit })

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    logPaymentError('Reconciliation error', error)
    const message = error instanceof Error ? error.message : 'Failed to reconcile payments'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

