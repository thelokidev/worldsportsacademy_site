import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

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
    try {
      // Use the built-in exchangeCodeForSession which handles code_verifier from cookies automatically
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error && data.session) {
        const redirectParam = requestUrl.searchParams.get('redirect')
        const redirectTo = redirectParam ? decodeURIComponent(redirectParam) : '/dashboard'
        return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
      }

      // If exchangeCodeForSession fails, log the error and provide details
      console.error('Code exchange error:', error)
      console.error('Error details:', {
        message: error?.message,
        status: error?.status,
        code: code?.substring(0, 20) + '...',
      })

      // Check if code_verifier exists in cookies for debugging
      const cookieStore = await cookies()
      const allCookies = cookieStore.getAll()
      const authCookies = allCookies.filter(c => c.name.includes('sb-') || c.name.includes('auth'))
      console.error('Available auth cookies:', authCookies.map(c => ({ name: c.name, hasValue: !!c.value })))

      return NextResponse.redirect(
        new URL(
          `/auth?error=verification_failed&message=${encodeURIComponent(error?.message || 'Authentication failed')}`,
          requestUrl.origin
        ),
      )
    } catch (err) {
      console.error('Code exchange exception:', err)
      return NextResponse.redirect(
        new URL(`/auth?error=verification_failed&message=Authentication failed`, requestUrl.origin),
      )
    }
  }

  // If no valid parameters, redirect to auth
  return NextResponse.redirect(new URL(`/auth?error=invalid_link`, requestUrl.origin))
}

