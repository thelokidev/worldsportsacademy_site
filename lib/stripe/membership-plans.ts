import { getServiceSupabaseClient } from '@/lib/supabase/service'

type PlanMapping = {
  name: string
  productId: string
}

type ServiceSupabaseClient = ReturnType<typeof getServiceSupabaseClient>

export const MEMBERSHIP_PRICE_MAP: Record<string, PlanMapping> = {
  price_1SU8DiDrcV6C4UxVJ9IJUgFN: {
    name: 'Squash Monthly Membership',
    productId: 'prod_TR0EUV4UN3agee',
  },
  price_1SU8HzDrcV6C4UxVkPQVUJZg: {
    name: 'Table Tennis Monthly Membership',
    productId: 'prod_TR0IPewTnDWYGI',
  },
  price_1SU8J6DrcV6C4UxVLHTPsSTb: {
    name: 'Squash + Pilates Monthly Membership',
    productId: 'prod_TR0Jm3UW2QuvHu',
  },
  price_1SU8KqDrcV6C4UxVCCuNwOaE: {
    name: 'Drop-In Session',
    productId: 'prod_TR0LWsYW3ACwFQ',
  },
}

export async function ensurePlanForPriceId(
  supabase: ServiceSupabaseClient,
  priceId: string,
) {
  const { data: plan } = await supabase
    .from('membership_plans')
    .select('id, name')
    .eq('stripe_price_id', priceId)
    .maybeSingle()

  if (plan) {
    return plan
  }

  const fallback = MEMBERSHIP_PRICE_MAP[priceId]
  if (!fallback) {
    console.error('[membership-plan-map] No fallback mapping for price', { priceId })
    return null
  }

  console.warn('[membership-plan-map] Plan missing stripe IDs. Updating from fallback mapping.', {
    priceId,
    planName: fallback.name,
  })

  const { data: updatedPlan, error } = await supabase
    .from('membership_plans')
    .update({
      stripe_price_id: priceId,
      stripe_product_id: fallback.productId,
    })
    .eq('name', fallback.name)
    .select('id, name')
    .maybeSingle()

  if (error) {
    console.error('[membership-plan-map] Failed to update plan with fallback mapping', {
      priceId,
      planName: fallback.name,
      error: error.message,
    })
    return null
  }

  return updatedPlan
}

