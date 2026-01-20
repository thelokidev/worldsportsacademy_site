import { getServiceSupabaseClient } from '@/lib/supabase/service'

type PlanMapping = {
  name: string
  productId: string
}

type ServiceSupabaseClient = ReturnType<typeof getServiceSupabaseClient>

/**
 * Stripe Price ID to Plan Name mapping
 * Used as a fallback when plans don't have stripe_price_id set in the database
 * 
 * Sport-Specific Memberships:
 * - Table Tennis: Monthly ($75), Half-Yearly ($400), Yearly ($700)
 * - Squash: Monthly ($75), Half-Yearly ($400), Yearly ($700)
 */
export const MEMBERSHIP_PRICE_MAP: Record<string, PlanMapping> = {
  // ============================================
  // Utility Products (Drop-in, Initiation Fee)
  // ============================================
  price_1Sa46oC2I88MOqJ1EoippchK: {
    name: 'Drop-In Session',
    productId: 'prod_TX8NXeBVG5Op9s',
  },
  price_1Sa46oC2I88MOqJ1hWTT8OxV: {
    name: 'Initiation Fee',
    productId: 'prod_TX8N4hRNC5iARd',
  },

  // ============================================
  // Legacy Unified Plans (deprecated - kept for backwards compatibility)
  // ============================================
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

  // ============================================
  // Table Tennis Plans (Sport-Specific)
  // ============================================
  'price_1SrPqNDrcV6C4UxVwurJIy8P': {
    name: 'Table Tennis Monthly',
    productId: 'prod_Tp3y66WeMEruGq',
  },
  'price_1SrPquDrcV6C4UxVVoIsXWTp': {
    name: 'Table Tennis Half-Yearly',
    productId: 'prod_Tp3y7yvbUGKhaw',
  },
  'price_1SrPqwDrcV6C4UxVga7Xmx5f': {
    name: 'Table Tennis Yearly',
    productId: 'prod_Tp3yhrzsxxJbkg',
  },

  // ============================================
  // Squash Plans (Sport-Specific)
  // ============================================
  'price_1SrPqxDrcV6C4UxVFAt8uTQR': {
    name: 'Squash Monthly',
    productId: 'prod_Tp3yEBQHX37B9T',
  },
  'price_1SrPqzDrcV6C4UxVSjopZuAY': {
    name: 'Squash Half-Yearly',
    productId: 'prod_Tp3yWHfXJPspiX',
  },
  'price_1SrPqzDrcV6C4UxVy3xvhpnt': {
    name: 'Squash Yearly',
    productId: 'prod_Tp3ywHkZ6qp0d7',
  },
}

/**
 * Ensures a membership plan exists for a given Stripe price ID
 * First checks if the plan has the stripe_price_id set in the database
 * If not, uses the fallback mapping to update the plan
 */
export async function ensurePlanForPriceId(
  supabase: ServiceSupabaseClient,
  priceId: string,
) {
  // First try to find plan by stripe_price_id
  const { data: plan } = await supabase
    .from('membership_plans')
    .select('id, name')
    .eq('stripe_price_id', priceId)
    .maybeSingle()

  if (plan) {
    return plan
  }

  // Try fallback mapping
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
