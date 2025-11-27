import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getPaymentMetrics } from '@/lib/payments/metrics'

export async function GET() {
  try {
    await requireAdmin()
    const metrics = await getPaymentMetrics()

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching payment metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment metrics' },
      { status: 500 }
    )
  }
}

