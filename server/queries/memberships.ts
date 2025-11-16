import { createClient } from '@/lib/supabase/server'

export async function getMembershipPlans() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('membership_plans')
    .select(`
      *,
      sports:sport_ids (
        id,
        name,
        display_name,
        status
      )
    `)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch membership plans: ${error.message}`)
  }

  return data || []
}

export async function getUserMembership(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
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
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .gt('current_period_end', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw new Error(`Failed to fetch membership: ${error.message}`)
  }

  return data || null
}

export async function getUserAllMemberships(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
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
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch memberships: ${error.message}`)
  }

  return data || []
}

