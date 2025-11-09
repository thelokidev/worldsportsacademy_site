'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getUserPayments(limit: number = 50) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User must be authenticated')
    }

    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        *,
        bookings:booking_id (
          id,
          start_time,
          end_time,
          sports:sport_id (
            id,
            name,
            display_name
          )
        ),
        memberships:membership_id (
          id,
          membership_plans:plan_id (
            id,
            name
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to fetch payments: ${error.message}`)
    }

    return { success: true, payments: payments || [] }
  } catch (error) {
    console.error('Get payments error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch payments',
      payments: [],
    }
  }
}

export async function getPaymentByIntentId(paymentIntentId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User must be authenticated')
    }

    const { data: payment, error } = await supabase
      .from('payments')
      .select('*')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      throw new Error(`Failed to fetch payment: ${error.message}`)
    }

    return { success: true, payment }
  } catch (error) {
    console.error('Get payment error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch payment',
      payment: null,
    }
  }
}

export async function createPaymentRecord(data: {
  bookingId?: string
  membershipId?: string
  stripePaymentIntentId: string
  amount: number
  currency: string
  paymentType: 'drop_in' | 'membership'
  metadata?: Record<string, unknown>
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User must be authenticated')
    }

    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        booking_id: data.bookingId || null,
        membership_id: data.membershipId || null,
        stripe_payment_intent_id: data.stripePaymentIntentId,
        amount: data.amount,
        currency: data.currency,
        status: 'succeeded',
        payment_type: data.paymentType,
        metadata: data.metadata || {},
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create payment record: ${error.message}`)
    }

    // Update booking with payment ID if it's a drop-in
    if (data.bookingId && data.paymentType === 'drop_in') {
      await supabase
        .from('bookings')
        .update({
          payment_id: payment.id,
          booking_type: 'drop_in',
          payment_status: 'paid',
        })
        .eq('id', data.bookingId)
    }

    revalidatePath('/dashboard')
    revalidatePath('/bookings')

    return { success: true, payment }
  } catch (error) {
    console.error('Create payment error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment record',
    }
  }
}

