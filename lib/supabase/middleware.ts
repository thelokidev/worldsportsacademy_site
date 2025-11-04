import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // If required envs are not available, skip auth middleware to avoid 500s.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
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

    // Refresh session for RSC. Ignore failures.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: { user } } = await supabase.auth.getUser()

    return response
  } catch {
    // Fail-open: never block the request due to middleware errors
    return NextResponse.next({ request })
  }
}