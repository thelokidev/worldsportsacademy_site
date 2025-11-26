import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { checkWaiverStatus } from '@/server/actions/waiver'
import type { Database } from '@/types/supabase'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const code = requestUrl.searchParams.get('code')

  // For the callback, we need to handle cookies from the request directly
  // to properly support PKCE flow code_verifier exchange
  const cookieStore = await cookies()
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !anonKey) {
    return NextResponse.redirect(new URL('/auth?error=configuration_error', requestUrl.origin))
  }

  // Create a response object that we can modify
  const response = NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
  
  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          // Set on both the cookie store and the response
          try {
            cookieStore.set(name, value, options)
          } catch {
            // Cookie store might be read-only in some contexts
          }
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  // Handle email confirmation via token_hash (magic link style)
  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })

    if (!error && data.session) {
      // Magic link verified and session created - check waiver status
      const redirectParam = requestUrl.searchParams.get('redirect')
      const intendedRedirect = redirectParam
        ? decodeURIComponent(redirectParam)
        : '/dashboard'

      // Check if user has signed waiver
      const { signed } = await checkWaiverStatus(data.user?.id || '')
      if (!signed && data.user) {
        const waiverResponse = NextResponse.redirect(
          new URL(`/waiver?redirect=${encodeURIComponent(intendedRedirect)}`, requestUrl.origin)
        )
        // Copy session cookies to the redirect response
        response.cookies.getAll().forEach(cookie => {
          waiverResponse.cookies.set(cookie.name, cookie.value)
        })
        return waiverResponse
      }

      const successResponse = NextResponse.redirect(new URL(intendedRedirect, requestUrl.origin))
      response.cookies.getAll().forEach(cookie => {
        successResponse.cookies.set(cookie.name, cookie.value)
      })
      return successResponse
    } else if (!error) {
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
      // Debug: Log available cookies to help diagnose PKCE issues
      const allCookies = cookieStore.getAll()
      const authCookies = allCookies.filter(c => c.name.includes('auth') || c.name.includes('pkce') || c.name.includes('code'))
      console.log('[Auth Callback] Available auth cookies:', authCookies.map(c => ({ name: c.name, hasValue: !!c.value })))
      
      // Exchange the code for a session - this requires the code_verifier cookie
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error && data.session) {
        const redirectParam = requestUrl.searchParams.get('redirect')
        const intendedRedirect = redirectParam ? decodeURIComponent(redirectParam) : '/dashboard'

        // Check if user has signed waiver
        const { signed } = await checkWaiverStatus(data.user.id)
        if (!signed) {
          const waiverResponse = NextResponse.redirect(
            new URL(`/waiver?redirect=${encodeURIComponent(intendedRedirect)}`, requestUrl.origin)
          )
          response.cookies.getAll().forEach(cookie => {
            waiverResponse.cookies.set(cookie.name, cookie.value)
          })
          return waiverResponse
        }

        const successResponse = NextResponse.redirect(new URL(intendedRedirect, requestUrl.origin))
        response.cookies.getAll().forEach(cookie => {
          successResponse.cookies.set(cookie.name, cookie.value)
        })
        return successResponse
      }

      // If exchangeCodeForSession fails, log the error with more details
      console.error('[Auth Callback] Code exchange error:', {
        message: error?.message,
        status: error?.status,
        code: error?.code,
      })

      return NextResponse.redirect(
        new URL(
          `/auth?error=verification_failed&message=${encodeURIComponent(error?.message || 'Authentication failed. Please try again.')}`,
          requestUrl.origin
        ),
      )
    } catch (err) {
      console.error('[Auth Callback] Code exchange exception:', err)
      return NextResponse.redirect(
        new URL(`/auth?error=verification_failed&message=Authentication failed`, requestUrl.origin),
      )
    }
  }

  // If no valid parameters, redirect to auth
  return NextResponse.redirect(new URL(`/auth?error=invalid_link`, requestUrl.origin))
}

