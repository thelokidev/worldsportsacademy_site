import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      redirect('/signin')
    }
    
    return <>{children}</>
  } catch (error) {
    // If Supabase is not configured or connection fails, redirect to signin
    console.error('Dashboard layout error:', error)
    redirect('/signin')
  }
}