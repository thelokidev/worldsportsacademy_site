import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WaiverPageClient } from '@/components/features/auth/waiver-page-client'

export default async function WaiverPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  // Require authentication
  if (error || !user) {
    const redirectParam = params.redirect ? `?redirect=${encodeURIComponent(params.redirect)}` : ''
    redirect(`/auth${redirectParam}`)
  }

  // Decode the redirect URL if it was encoded
  const redirectTo = params.redirect
    ? decodeURIComponent(params.redirect)
    : '/dashboard'

  return <WaiverPageClient userId={user.id} redirectTo={redirectTo} />
}

