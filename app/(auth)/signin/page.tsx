import { redirect } from 'next/navigation'

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string; error?: string; redirect?: string }>
}) {
  const params = await searchParams
  const redirectTo = params?.redirect ? `?redirect=${encodeURIComponent(params.redirect)}` : ''
  redirect(`/auth${redirectTo}`)
}
