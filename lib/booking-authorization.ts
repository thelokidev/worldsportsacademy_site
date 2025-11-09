import { createClient } from '@/lib/supabase/server'

export type BookingAuthorizationResult = {
  canBook: boolean
  requiresPayment: boolean
  reason?: string
  dropInPrice?: number
  tax?: number
  total?: number
}

export async function checkBookingAuthorization(
  userId: string,
  sportId: string,
  durationMinutes: number
): Promise<BookingAuthorizationResult> {
  const supabase = await createClient()

  // Get sport settings
  const { data: sportSettings } = await supabase
    .from('sport_settings')
    .select('requires_membership_for_booking, status')
    .eq('sport_id', sportId)
    .single()

  // Check if sport is available
  if (sportSettings?.status === 'coming_soon') {
    return {
      canBook: false,
      requiresPayment: false,
      reason: 'This sport is coming soon',
    }
  }

  if (sportSettings?.status === 'inactive') {
    return {
      canBook: false,
      requiresPayment: false,
      reason: 'This sport is currently unavailable',
    }
  }

  // Check if sport requires membership
  if (sportSettings?.requires_membership_for_booking) {
    // Check if user has active membership for this sport
    const { data: memberships } = await supabase
      .from('memberships')
      .select(`
        id,
        status,
        current_period_end,
        membership_plans:plan_id (
          sport_ids
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('current_period_end', new Date().toISOString())

    const hasMembership = memberships?.some((membership) => {
      const plan = membership.membership_plans as any
      return plan?.sport_ids?.includes(sportId)
    })

    if (!hasMembership) {
      return {
        canBook: false,
        requiresPayment: false,
        reason: 'Membership required for this sport',
      }
    }

    // Member can book for free
    return {
      canBook: true,
      requiresPayment: false,
    }
  }

  // Sport allows drop-ins - check if user has membership (free) or needs to pay
  const { data: memberships } = await supabase
    .from('memberships')
    .select(`
      id,
      status,
      current_period_end,
      membership_plans:plan_id (
        sport_ids
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .gt('current_period_end', new Date().toISOString())

  const hasMembership = memberships?.some((membership) => {
    const plan = membership.membership_plans as any
    return plan?.sport_ids?.includes(sportId)
  })

  if (hasMembership) {
    // Member can book for free
    return {
      canBook: true,
      requiresPayment: false,
    }
  }

  // User needs to pay for drop-in
  const { data: pricing } = await supabase
    .from('drop_in_pricing')
    .select('price, tax_rate')
    .eq('sport_id', sportId)
    .eq('duration_minutes', durationMinutes)
    .single()

  if (!pricing) {
    return {
      canBook: false,
      requiresPayment: false,
      reason: 'Pricing not available for this sport and duration',
    }
  }

  const subtotal = Number(pricing.price)
  const tax = subtotal * Number(pricing.tax_rate)
  const total = subtotal + tax

  return {
    canBook: true,
    requiresPayment: true,
    dropInPrice: subtotal,
    tax,
    total,
  }
}

