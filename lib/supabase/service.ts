import 'server-only'

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

let serviceClient:
  | ReturnType<typeof createClient<Database>>
  | null = null

export const getServiceSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'Missing Supabase service configuration. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.',
    )
  }

  if (serviceClient) {
    return serviceClient
  }

  serviceClient = createClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
    },
  })

  return serviceClient
}

/**
 * Safely get the service client, returns null if not configured
 */
export const getServiceSupabaseClientSafe = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    console.warn('Service role key not configured - some admin features may be limited')
    return null
  }

  if (serviceClient) {
    return serviceClient
  }

  serviceClient = createClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
    },
  })

  return serviceClient
}

