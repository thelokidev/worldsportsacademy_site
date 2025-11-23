import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { checkWaiverStatus } from '@/server/actions/waiver'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      redirect('/auth')
    }

    // Check if user has signed the waiver
    const { signed } = await checkWaiverStatus(user.id)
    if (!signed) {
      redirect('/waiver?redirect=/dashboard')
    }
    
    return <>{children}</>
  } catch (error) {
    // If Supabase is not configured or connection fails, redirect to signin
    console.error('Dashboard layout error:', error)
    redirect('/signin')
  }
}