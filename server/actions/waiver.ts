'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function checkWaiverStatus(userId: string) {
  try {
    const supabase = await createClient()
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('waiver_signed_at')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching waiver status:', error)
      return { signed: false }
    }

    return { signed: !!profile?.waiver_signed_at }
  } catch (error) {
    console.error('Check waiver status error:', error)
    return { signed: false }
  }
}

export async function saveWaiverSignature(
  userId: string, 
  signature: { name: string; address: string }
) {
  try {
    const supabase = await createClient()
    
    // Verify the user is updating their own profile
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || user.id !== userId) {
      throw new Error('Unauthorized')
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        waiver_signed_at: new Date().toISOString(),
        waiver_signature_name: signature.name,
        waiver_signature_address: signature.address,
      })
      .eq('id', userId)

    if (error) {
      throw new Error(`Failed to save waiver: ${error.message}`)
    }

    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Save waiver signature error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to save waiver signature' 
    }
  }
}

