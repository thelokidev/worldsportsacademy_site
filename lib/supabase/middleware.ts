import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // If required envs are not available, skip auth middleware to avoid 500s.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    return NextResponse.next({ request })
  }

  // Skip middleware for auth callback to prevent interfering with PKCE flow
  if (request.nextUrl.pathname.startsWith('/auth/callback')) {
    return NextResponse.next({ request })
  }

  const response = NextResponse.next({ request })

  try {
    const supabase = createServerClient(url, anon, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    })

    // Refresh session for RSC. This ensures cookies are properly set
    // especially when returning from external redirects (like Stripe).
    // getUser() will automatically refresh the session if needed and update cookies.
    await supabase.auth.getUser()

    return response
  } catch {
    // Fail-open: never block the request due to middleware errors
    return NextResponse.next({ request })
  }
}