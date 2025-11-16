'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export interface SignUpData {
  email: string
  password: string
  fullName?: string
}

export interface SignInData {
  email: string
  password: string
}

export async function signUp(data: SignUpData) {
  const supabase = await createClient()

  // Get the app URL for email redirects
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${appUrl}/auth/callback`,
      data: {
        full_name: data.fullName,
      },
    },
  })

  if (error) {
    console.error('Sign-up error:', error)
    return { error: error.message }
  }

  // Check if email confirmation is required
  // If user exists but email is not confirmed, Supabase will still return success
  // but won't send another email unless we handle it explicitly
  if (authData.user && !authData.session) {
    // User created but needs email confirmation
    revalidatePath('/', 'layout')
    return { 
      success: true, 
      requiresConfirmation: true,
      message: 'Please check your email to confirm your account before signing in.'
    }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signIn(data: SignInData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('[signOut] error:', error.message)
    // We still proceed to redirect to ensure UX flow continues
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function sendMagicLink(email: string, redirectTo?: string) {
  const supabase = await createClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  const callbackUrl = redirectTo 
    ? `${appUrl}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`
    : `${appUrl}/auth/callback`

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callbackUrl,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, message: 'Check your email for the magic link!' }
}
