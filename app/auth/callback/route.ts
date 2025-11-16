import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const code = requestUrl.searchParams.get('code')

  const supabase = await createClient()

  // Handle email confirmation via token_hash (magic link style)
  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })

    if (!error && data.session) {
      // Magic link verified and session created - redirect to dashboard or original redirect
      const redirectParam = requestUrl.searchParams.get('redirect')
      const redirectTo = redirectParam 
        ? decodeURIComponent(redirectParam)
        : '/dashboard'
      return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
    } else if (!error) {
      // Email confirmed but no session (shouldn't happen with magic links)
      const redirectTo = requestUrl.searchParams.get('redirect')
      const redirectUrl = redirectTo 
        ? `/auth?verified=true&redirect=${encodeURIComponent(redirectTo)}`
        : '/auth?verified=true'
      return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin))
    } else {
      console.error('Email verification error:', error)
      return NextResponse.redirect(new URL(`/auth?error=verification_failed`, requestUrl.origin))
    }
  }

  // Handle email confirmation via code (PKCE flow - OAuth)
  if (code) {
    // Check if code_verifier is available (required for PKCE flow)
    const codeVerifier = requestUrl.searchParams.get('code_verifier')
    
    if (!codeVerifier) {
      // Try to get code_verifier from cookies (stored during OAuth initiation)
      const cookieStore = await import('next/headers').then(m => m.cookies())
      const codeVerifierCookie = cookieStore.get('sb-code-verifier')?.value
      
      if (!codeVerifierCookie) {
        console.error('Code exchange error: Missing code_verifier')
        return NextResponse.redirect(new URL(`/auth?error=verification_failed&message=Missing verification code`, requestUrl.origin))
      }
    }

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error && data.session) {
        // OAuth session created - redirect to dashboard or original redirect
        const redirectParam = requestUrl.searchParams.get('redirect')
        const redirectTo = redirectParam 
          ? decodeURIComponent(redirectParam)
          : '/dashboard'
        return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
      } else {
        console.error('Code exchange error:', error)
        const errorMessage = error?.message || 'Failed to verify authentication code'
        return NextResponse.redirect(new URL(`/auth?error=verification_failed&message=${encodeURIComponent(errorMessage)}`, requestUrl.origin))
      }
    } catch (err) {
      console.error('Code exchange exception:', err)
      return NextResponse.redirect(new URL(`/auth?error=verification_failed&message=Authentication failed`, requestUrl.origin))
    }
  }

  // If no valid parameters, redirect to auth
  return NextResponse.redirect(new URL(`/auth?error=invalid_link`, requestUrl.origin))
}

