import { getServiceSupabaseClient } from "@/lib/supabase/service";

type PlanMapping = {
  name: string;
  productId: string;
};

type ServiceSupabaseClient = ReturnType<typeof getServiceSupabaseClient>;

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
  price_1SvJvaDwbguMPSQshdIDI7S5: {
    name: "Drop-In Session",
    productId: "prod_Tt670rQMvzR1Tr",
  },
  price_1SvJxmDwbguMPSQsDdgst4ib: {
    name: "Initiation Fee",
    productId: "prod_Tt6AiHh9sPfqM0",
  },

  // ============================================
  // Legacy Unified Plans (deprecated - kept for backwards compatibility)
  // ============================================
  price_1Sa46pC2I88MOqJ1K8iEy1NH: {
    name: "Monthly Membership",
    productId: "prod_TX8Nj6SfIe7Pif",
  },
  price_1Sa46pC2I88MOqJ1yd0uZ1Lj: {
    name: "Half-Yearly Membership",
    productId: "prod_TX8NDRIaXUjNl6",
  },
  price_1Sa46qC2I88MOqJ1iDaWEf0o: {
    name: "Yearly Membership",
    productId: "prod_TX8Nc4iWv8q7QM",
  },

  // ============================================
  // Table Tennis Plans (Sport-Specific)
  // ============================================
  price_1SrPp0DwbguMPSQs4ux7Q4Sw: {
    name: "Table Tennis Monthly",
    productId: "prod_Tp3wTFdLAGs4WD",
  },
  price_1SrPp1DwbguMPSQsIYDiXQcX: {
    name: "Table Tennis Half-Yearly",
    productId: "prod_Tp3wu9D5lPbapA",
  },
  price_1SrPp1DwbguMPSQsGxCSTUBF: {
    name: "Table Tennis Yearly",
    productId: "prod_Tp3wTNlWzgZQ1a",
  },

  // ============================================
  // Squash Plans (Sport-Specific)
  // ============================================
  price_1SrPp2DwbguMPSQsfmgBrJqP: {
    name: "Squash Monthly",
    productId: "prod_Tp3wyR02WyBbCa",
  },
  price_1SrPp3DwbguMPSQs7zVoskc6: {
    name: "Squash Half-Yearly",
    productId: "prod_Tp3wqSLuAhap3W",
  },
  price_1SrPp3DwbguMPSQs2X8NMw2F: {
    name: "Squash Yearly",
    productId: "prod_Tp3whjjsxU5hWE",
  },
};

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
    .from("membership_plans")
    .select("id, name")
    .eq("stripe_price_id", priceId)
    .maybeSingle();

  if (plan) {
    return plan;
  }

  // Try fallback mapping
  const fallback = MEMBERSHIP_PRICE_MAP[priceId];
  if (!fallback) {
    console.error("[membership-plan-map] No fallback mapping for price", {
      priceId,
    });
    return null;
  }

  console.warn(
    "[membership-plan-map] Plan missing stripe IDs. Updating from fallback mapping.",
    {
      priceId,
      planName: fallback.name,
    },
  );

  const { data: updatedPlan, error } = await supabase
    .from("membership_plans")
    .update({
      stripe_price_id: priceId,
      stripe_product_id: fallback.productId,
    })
    .eq("name", fallback.name)
    .select("id, name")
    .maybeSingle();

  if (error) {
    console.error(
      "[membership-plan-map] Failed to update plan with fallback mapping",
      {
        priceId,
        planName: fallback.name,
        error: error.message,
      },
    );
    return null;
  }

  return updatedPlan;
}
