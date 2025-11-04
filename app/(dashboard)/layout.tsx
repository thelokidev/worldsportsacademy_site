import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      redirect('/signin')
    }
    
    return <>{children}</>
  } catch {
    // If Supabase is not configured, redirect to signin
    redirect('/signin')
  }
}