import { getServiceSupabaseClient } from '@/lib/supabase/service'

type PlanMapping = {
  name: string
  productId: string
}

type ServiceSupabaseClient = ReturnType<typeof getServiceSupabaseClient>

export const MEMBERSHIP_PRICE_MAP: Record<string, PlanMapping> = {
  price_1Sa46oC2I88MOqJ1EoippchK: {
    name: 'Drop-In Session',
    productId: 'prod_TX8NXeBVG5Op9s',
  },
  price_1Sa46oC2I88MOqJ1hWTT8OxV: {
    name: 'Initiation Fee',
    productId: 'prod_TX8N4hRNC5iARd',
  },
  // Legacy Unified Plans (kept for reference)
  price_1Sa46pC2I88MOqJ1K8iEy1NH: {
    name: 'Monthly Membership',
    productId: 'prod_TX8Nj6SfIe7Pif',
  },
  price_1Sa46pC2I88MOqJ1yd0uZ1Lj: {
    name: 'Half-Yearly Membership',
    productId: 'prod_TX8NDRIaXUjNl6',
  },
  price_1Sa46qC2I88MOqJ1iDaWEf0o: {
    name: 'Yearly Membership',
    productId: 'prod_TX8Nc4iWv8q7QM',
  },
  // Table Tennis Plans - TODO: Update with real Stripe IDs
  price_TT_Monthly_PLACEHOLDER: {
    name: 'Table Tennis Monthly',
    productId: 'prod_TT_Monthly_PLACEHOLDER',
  },
  price_TT_HalfYearly_PLACEHOLDER: {
    name: 'Table Tennis Half-Yearly',
    productId: 'prod_TT_HalfYearly_PLACEHOLDER',
  },
  price_TT_Yearly_PLACEHOLDER: {
    name: 'Table Tennis Yearly',
    productId: 'prod_TT_Yearly_PLACEHOLDER',
  },
  // Squash Plans - TODO: Update with real Stripe IDs
  price_Squash_Monthly_PLACEHOLDER: {
    name: 'Squash Monthly',
    productId: 'prod_Squash_Monthly_PLACEHOLDER',
  },
  price_Squash_HalfYearly_PLACEHOLDER: {
    name: 'Squash Half-Yearly',
    productId: 'prod_Squash_HalfYearly_PLACEHOLDER',
  },
  price_Squash_Yearly_PLACEHOLDER: {
    name: 'Squash Yearly',
    productId: 'prod_Squash_Yearly_PLACEHOLDER',
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
