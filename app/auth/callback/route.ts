import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

async function exchangeCodeUsingVerifier(
  supabase: Awaited<ReturnType<typeof createClient>>,
  code: string,
  codeVerifier: string,
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=pkce`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseAnonKey,
    },
    body: JSON.stringify({
      auth_code: code,
      code_verifier: codeVerifier,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    const message = data?.error_description || data?.error || 'Failed to exchange code for session'
    throw new Error(message)
  }

  if (!data?.session) {
    throw new Error('Supabase did not return a session')
  }

  await supabase.auth.setSession({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  })

  return data
}

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
    const cookieStore = await cookies()
    const codeVerifierParam = requestUrl.searchParams.get('code_verifier')
    const codeVerifierCookie = cookieStore.get('sb-code-verifier')?.value
    const codeVerifierFromCookie = codeVerifierCookie?.split('/')?.[0]
    const codeVerifier = codeVerifierParam || codeVerifierFromCookie

    if (!codeVerifier) {
      console.error('Code exchange error: Missing code_verifier')
      return NextResponse.redirect(
        new URL(`/auth?error=verification_failed&message=Missing verification code`, requestUrl.origin),
      )
    }

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error && data.session) {
        const redirectParam = requestUrl.searchParams.get('redirect')
        const redirectTo = redirectParam ? decodeURIComponent(redirectParam) : '/dashboard'
        return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
      }

      console.error('Code exchange error:', error)
      // Fall back to manual exchange using the code verifier
      await exchangeCodeUsingVerifier(supabase, code, codeVerifier)

      const redirectParam = requestUrl.searchParams.get('redirect')
      const redirectTo = redirectParam ? decodeURIComponent(redirectParam) : '/dashboard'
      return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
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

