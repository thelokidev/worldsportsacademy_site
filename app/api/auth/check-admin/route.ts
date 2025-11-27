import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ isAdmin: false, error: 'Not authenticated' })
    }
    
    // Check if user is admin - this uses service role so bypasses RLS
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profileError) {
      console.error('[check-admin] Profile query error:', profileError)
      return NextResponse.json({ isAdmin: false, error: profileError.message })
    }
    
    const isAdmin = profile?.role === 'admin'
    console.log('[check-admin] Result:', { userId: user.id, role: profile?.role, isAdmin })
    
    return NextResponse.json({ isAdmin, role: profile?.role })
  } catch (error) {
    console.error('[check-admin] Error:', error)
    return NextResponse.json({ isAdmin: false, error: 'Server error' })
  }
}

