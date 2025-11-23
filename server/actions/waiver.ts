'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function checkWaiverStatus(userId: string) {
  // Validate input
  if (!userId || typeof userId !== 'string') {
    console.error('Invalid userId provided to checkWaiverStatus:', userId)
    return { signed: false, error: 'Invalid user ID' }
  }

  try {
    const supabase = await createClient()
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('waiver_signed_at')
      .eq('id', userId)
      .single()

    if (error) {
      // If profile doesn't exist, user hasn't signed waiver
      if (error.code === 'PGRST116') {
        console.log(`Profile not found for user ${userId}`)
        return { signed: false }
      }
      console.error('Error fetching waiver status:', error)
      return { signed: false, error: error.message }
    }

    const isSigned = !!profile?.waiver_signed_at
    console.log(`Waiver status for user ${userId}: ${isSigned ? 'signed' : 'not signed'}`)
    
    return { signed: isSigned }
  } catch (error) {
    console.error('Check waiver status error:', error)
    return { signed: false, error: 'Failed to check waiver status' }
  }
}

export async function saveWaiverSignature(
  userId: string, 
  signature: { name: string; address: string }
) {
  // Validate inputs
  if (!userId || typeof userId !== 'string') {
    console.error('Invalid userId provided to saveWaiverSignature')
    return { 
      success: false, 
      error: 'Invalid user ID' 
    }
  }

  if (!signature.name || typeof signature.name !== 'string' || signature.name.trim().length === 0) {
    return { 
      success: false, 
      error: 'Name is required and must be a non-empty string' 
    }
  }

  if (!signature.address || typeof signature.address !== 'string' || signature.address.trim().length === 0) {
    return { 
      success: false, 
      error: 'Address is required and must be a non-empty string' 
    }
  }

  // Validate name length (reasonable limits)
  if (signature.name.trim().length > 200) {
    return { 
      success: false, 
      error: 'Name is too long (maximum 200 characters)' 
    }
  }

  // Validate address length
  if (signature.address.trim().length > 500) {
    return { 
      success: false, 
      error: 'Address is too long (maximum 500 characters)' 
    }
  }

  try {
    const supabase = await createClient()
    
    // Verify the user is updating their own profile
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('Auth error in saveWaiverSignature:', authError)
      return { 
        success: false, 
        error: 'Authentication failed' 
      }
    }
    
    if (!user || user.id !== userId) {
      console.error('Unauthorized waiver signature attempt:', { user: user?.id, userId })
      return { 
        success: false, 
        error: 'Unauthorized: You can only sign your own waiver' 
      }
    }

    // Check if waiver already signed
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('waiver_signed_at')
      .eq('id', userId)
      .single()

    if (existingProfile?.waiver_signed_at) {
      console.log(`User ${userId} attempted to sign waiver again (already signed at ${existingProfile.waiver_signed_at})`)
      // Return success since waiver is already signed
      return { success: true }
    }

    const now = new Date().toISOString()

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        waiver_signed_at: now,
        waiver_signature_name: signature.name.trim(),
        waiver_signature_address: signature.address.trim(),
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Database error saving waiver:', updateError)
      return { 
        success: false, 
        error: `Failed to save waiver: ${updateError.message}` 
      }
    }

    console.log(`Waiver successfully signed by user ${userId} at ${now}`)

    // Revalidate relevant paths
    revalidatePath('/dashboard')
    revalidatePath('/waiver')
    
    return { success: true }
  } catch (error) {
    console.error('Save waiver signature error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to save waiver signature' 
    }
  }
}

