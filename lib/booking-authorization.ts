import { getServiceSupabaseClient } from '@/lib/supabase/service'

export type BookingAuthorizationResult = {
  canBook: boolean
  requiresPayment: boolean
  reason?: string
  dropInPrice?: number
  tax?: number
  total?: number
  coveredByMembership?: boolean
}

export async function checkBookingAuthorization(
  userId: string,
  sportId: string,
  durationMinutes: number
): Promise<BookingAuthorizationResult> {
  const supabase = getServiceSupabaseClient()
  const nowIso = new Date().toISOString()

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

  // Gather membership coverage for this user
  const membershipCoverage = await getMembershipCoverage(supabase, userId, nowIso)
  const hasMembershipForSport = membershipCoverage.has(sportId)

  // Check if sport requires membership
  if (sportSettings?.requires_membership_for_booking) {
    // Check if user has active membership for this sport
    if (!hasMembershipForSport) {
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
      coveredByMembership: true,
    }
  }

  // Sport allows drop-ins - check if user has membership (free) or needs to pay
  if (hasMembershipForSport) {
    // Member can book for free
    return {
      canBook: true,
      requiresPayment: false,
      coveredByMembership: true,
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

async function getMembershipCoverage(
  supabase: ReturnType<typeof getServiceSupabaseClient>,
  userId: string,
  nowIso: string,
) {
  const coverage = new Set<string>()

  const { data, error } = await supabase
    .from('memberships')
    .select(
      `
        id,
        status,
        current_period_end,
        membership_plans:plan_id (
          sport_ids
        )
      `,
    )
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .gt('current_period_end', nowIso)

  if (error) {
    console.error('Failed to load membership coverage:', error)
    return coverage
  }

  for (const membership of data || []) {
    const plan = membership.membership_plans as { sport_ids?: string[] } | null
    if (plan?.sport_ids?.length) {
      plan.sport_ids.forEach((sportId) => {
        if (typeof sportId === 'string' && sportId.length > 0) {
          coverage.add(sportId)
        }
      })
    }
  }

  return coverage
}

