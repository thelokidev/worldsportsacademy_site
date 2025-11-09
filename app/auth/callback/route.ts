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
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })

    if (!error) {
      // Email confirmed successfully
      return NextResponse.redirect(new URL(`/signin?verified=true`, requestUrl.origin))
    } else {
      console.error('Email verification error:', error)
      return NextResponse.redirect(new URL(`/signin?error=verification_failed`, requestUrl.origin))
    }
  }

  // Handle email confirmation via code (PKCE flow)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Email confirmed and session created
      return NextResponse.redirect(new URL(`/dashboard`, requestUrl.origin))
    } else {
      console.error('Code exchange error:', error)
      return NextResponse.redirect(new URL(`/signin?error=verification_failed`, requestUrl.origin))
    }
  }

  // If no valid parameters, redirect to sign-in
  return NextResponse.redirect(new URL(`/signin?error=invalid_link`, requestUrl.origin))
}

