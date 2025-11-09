'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getUserMemberships() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User must be authenticated')
    }

    const { data: memberships, error } = await supabase
      .from('memberships')
      .select(`
        *,
        membership_plans:plan_id (
          id,
          name,
          description,
          price,
          sport_ids,
          features
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch memberships: ${error.message}`)
    }

    return { success: true, memberships: memberships || [] }
  } catch (error) {
    console.error('Get memberships error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch memberships',
      memberships: [],
    }
  }
}

export async function getActiveMembershipForSport(sportId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, hasMembership: false }
    }

    const { data: memberships, error } = await supabase
      .from('memberships')
      .select(`
        *,
        membership_plans:plan_id (
          id,
          name,
          sport_ids
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gt('current_period_end', new Date().toISOString())

    if (error) {
      throw new Error(`Failed to check membership: ${error.message}`)
    }

    const hasMembership = memberships?.some((membership) => {
      const plan = membership.membership_plans as any
      return plan?.sport_ids?.includes(sportId)
    }) || false

    return { success: true, hasMembership }
  } catch (error) {
    console.error('Check membership error:', error)
    return { success: false, hasMembership: false }
  }
}

export async function getAllMembershipPlans() {
  try {
    const supabase = await createClient()

    // Fetch membership plans
    const { data: plans, error: plansError } = await supabase
      .from('membership_plans')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (plansError) {
      throw new Error(`Failed to fetch membership plans: ${plansError.message}`)
    }

    if (!plans || plans.length === 0) {
      return { success: true, plans: [] }
    }

    // Collect all unique sport IDs from all plans
    const allSportIds = new Set<string>()
    plans.forEach((plan: any) => {
      if (plan.sport_ids && Array.isArray(plan.sport_ids)) {
        plan.sport_ids.forEach((id: string) => allSportIds.add(id))
      }
    })

    // Fetch all sports that are referenced
    let sports: any[] = []
    if (allSportIds.size > 0) {
      const { data: sportsData, error: sportsError } = await supabase
        .from('sports')
        .select('id, name, display_name, status')
        .in('id', Array.from(allSportIds))

      if (sportsError) {
        console.error('Failed to fetch sports:', sportsError)
        // Continue without sports data rather than failing completely
      } else {
        sports = sportsData || []
      }
    }

    // Create a map of sport ID to sport data for quick lookup
    const sportsMap = new Map(sports.map((sport: any) => [sport.id, sport]))

    // Map plans with their associated sports
    const plansWithSports = plans.map((plan: any) => {
      const planSports = plan.sport_ids
        ? plan.sport_ids
            .map((sportId: string) => sportsMap.get(sportId))
            .filter((sport: any) => sport !== undefined)
        : []
      
      return {
        ...plan,
        sports: planSports,
      }
    })

    return { success: true, plans: plansWithSports }
  } catch (error) {
    console.error('Get membership plans error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch membership plans',
      plans: [],
    }
  }
}

export async function cancelMembership(membershipId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User must be authenticated')
    }

    // Get membership with Stripe subscription ID
    const { data: membership } = await supabase
      .from('memberships')
      .select('stripe_subscription_id')
      .eq('id', membershipId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      throw new Error('Membership not found')
    }

    if (!membership.stripe_subscription_id) {
      throw new Error('Stripe subscription ID not found')
    }

    // Cancel subscription at period end via Stripe
    // Note: This should ideally be done via Stripe Customer Portal
    // But we can also cancel via API
    const { stripe } = await import('@/lib/stripe/client')
    
    await stripe.subscriptions.update(membership.stripe_subscription_id, {
      cancel_at_period_end: true,
    })

    // Update membership in database
    const { error } = await supabase
      .from('memberships')
      .update({ cancel_at_period_end: true })
      .eq('id', membershipId)

    if (error) {
      throw new Error(`Failed to cancel membership: ${error.message}`)
    }

    revalidatePath('/dashboard/membership')
    return { success: true }
  } catch (error) {
    console.error('Cancel membership error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel membership',
    }
  }
}

