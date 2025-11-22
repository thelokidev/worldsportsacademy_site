'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { checkWaiverStatus, saveWaiverSignature } from '@/server/actions/waiver'
import { useEffect } from 'react'

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type FormData = z.infer<typeof formSchema>

export function UnifiedAuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [showWaiver, setShowWaiver] = useState(false)
  const [waiverSigned, setWaiverSigned] = useState(false)
  const [pendingAction, setPendingAction] = useState<'google' | 'magic' | null>(null)
  const [waiverSignature, setWaiverSignature] = useState<{ name: string; address: string } | null>(null)

  // Check waiver status on mount
  useEffect(() => {
    async function checkWaiver() {
      // Only check if we have a user session, but here we are on the auth page so we likely don't.
      // However, we might want to check if the email being entered has a waiver associated with it?
      // Actually, for new logins, we can't know if they signed until they are authenticated.
      // But the user asked to "Save acceptance → Automatically continue to Google OAuth"
      // This implies we need to save the waiver BEFORE full authentication or right after.
      // Since we can't save to profile without auth, the flow must be:
      // 1. User clicks Google
      // 2. If not authenticated, we can't check profile yet.
      // 3. But wait, the requirement says: "The waiver acceptance should be saved (localStorage, cookies, or database)"
      // And "On subsequent visits, the disclaimer shouldn't show again (if already accepted)"
      
      // If they are not logged in, we can't check the database for their profile.
      // The only way to check "if already accepted" for a logged-out user is if they are actually logged in but on the auth page?
      // Or maybe the flow is intended for when they sign up?
      
      // Let's assume the standard flow:
      // 1. Click Google -> OAuth -> Callback -> Check Waiver -> If not signed, show modal -> Sign -> Save -> Dashboard
      // BUT the prompt says: "Disclaimer modal appears immediately (blocking OAuth)"
      // This means we are showing it BEFORE OAuth.
      
      // If we show it BEFORE OAuth, we can't save it to the database linked to the user yet because we don't have the user ID.
      // Unless we save it to localStorage and then sync it after login?
      
      // The prompt says: "User accepts waiver → Save acceptance → Automatically continue to Google OAuth"
      // This implies we accept it locally, then proceed to OAuth.
      // Then "Next time: Skip disclaimer, go straight to OAuth"
      // This implies we need to know they signed it.
      
      // If we want to save it to the DB, we must do it AFTER they have a user ID (after OAuth).
      // BUT the user wants the modal blocking OAuth.
      
      // OPTION A: LocalStorage approach (Pre-Auth)
      // 1. User clicks Google.
      // 2. Check localStorage for 'waiver_signed'.
      // 3. If no, show modal.
      // 4. Sign -> Save to localStorage -> Continue to Google.
      // 5. After OAuth callback, we need to sync this to the DB if not already there.
      
      // OPTION B: The "Waiver First" approach requested seems to be:
      // 1. Click Google
      // 2. Show Waiver
      // 3. Sign
      // 4. Store signature in state/localStorage
      // 5. Redirect to Google
      // 6. Come back
      // 7. Save signature to DB
      
      // Let's implement checking if we have a user session first (maybe they are re-authenticating?)
      const supabase = createBrowserSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { signed } = await checkWaiverStatus(user.id)
        if (signed) {
          setWaiverSigned(true)
        }
      }
    }
    checkWaiver()
  }, [])

  // Decode the redirect URL if it was encoded
  const redirectParam = searchParams.get('redirect')
  const redirectTo = redirectParam
    ? decodeURIComponent(redirectParam)
    : '/dashboard'

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  })
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])

  const handleWaiverSigned = async (signature: { name: string; address: string; date: string }) => {
    setWaiverSigned(true)
    setShowWaiver(false)
    setWaiverSignature({ name: signature.name, address: signature.address })

    // We can't save to DB yet if not logged in, but we can proceed to auth.
    // We'll save it after successful auth or if we are already logged in.
    
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await saveWaiverSignature(user.id, signature)
    } else {
      // Store in sessionStorage to persist across the OAuth redirect if needed, 
      // though usually we want to save it after they come back. 
      // Actually, we can't easily pass this data through Google OAuth flow unless we use state parameter or cookie.
      // Let's use a cookie or sessionStorage.
      sessionStorage.setItem('pending_waiver_signature', JSON.stringify(signature))
    }

    if (pendingAction === 'google') {
      handleGoogleSignIn(true) // Force proceed
    } else if (pendingAction === 'magic') {
      handleMagicLink(form.getValues(), true) // Force proceed
    }
    setPendingAction(null)
  }

  async function handleMagicLink(data: FormData, forceProceed = false) {
    if (!forceProceed && !waiverSigned) {
      setPendingAction('magic')
      setShowWaiver(true)
      return
    }

    setIsLoading(true)
    const result = await sendMagicLink(data.email, redirectTo)
    setIsLoading(false)

    if (result?.error) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive'
      })
      return
    }

    setMagicLinkSent(true)
    toast({
      title: 'Magic link sent!',
      description: 'Check your email for the sign-in link.',
    })
  }

  const onMagicLinkSubmit = (data: FormData) => {
    handleMagicLink(data)
  }

  async function handleGoogleSignIn(forceProceed = false) {
    if (!forceProceed && !waiverSigned) {
      setPendingAction('google')
      setShowWaiver(true)
      return
    }

    if (!supabase) return
    setIsLoading(true)

    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      const callbackUrl = redirectTo
        ? `${appUrl}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`
        : `${appUrl}/auth/callback`

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
          skipBrowserRedirect: false,
        },
      })

      if (error) {
        throw error
      }

      if (data?.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Google sign-in error:', error)
      toast({
        title: 'Authentication error',
        description:
          error instanceof Error ? error.message : 'Failed to start Google sign-in. Please try again.',
        variant: 'destructive',
      })
      setIsLoading(false)
    }
  }

  if (magicLinkSent) {
    return (
      <div className="space-y-6 text-center py-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#50C878]/10 mb-4">
          <Mail className="w-8 h-8 text-[#50C878]" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Check your email</h3>
          <p className="text-gray-400 text-sm mb-4">
            We've sent a magic link to <span className="font-semibold text-white">{form.getValues('email')}</span>
          </p>
          <p className="text-gray-500 text-xs">
            Click the link in the email to sign in. The link will expire in 1 hour.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setMagicLinkSent(false)
            form.reset()
          }}
          className="w-full border-gray-800 text-gray-400 hover:text-white hover:bg-gray-900"
        >
          Use a different email
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <WaiverModal
        isOpen={showWaiver}
        onOpenChange={setShowWaiver}
        onSigned={handleWaiverSigned}
      />

      {/* Social Login Buttons */}
      <div className="space-y-3">
        <Button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full h-12 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-xl transition-all border border-gray-200"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Continue with Google
        </Button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-800"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-black px-4 text-gray-500 font-semibold tracking-wider">OR USE MAGIC LINK</span>
        </div>
      </div>

      {/* Magic Link Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onMagicLinkSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-white font-semibold text-sm">Email address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      className="h-12 bg-black/50 border-gray-800 text-white placeholder:text-gray-500 pl-12 pr-4 focus:border-[#50C878] focus:ring-2 focus:ring-[#50C878]/20 rounded-xl transition-all"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#50C878] to-[#3DA860] hover:from-[#3DA860] hover:to-[#50C878] text-white font-semibold h-12 text-base shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all rounded-xl"
            disabled={isLoading || form.formState.isSubmitting}
          >
            {isLoading || form.formState.isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Send magic link
              </span>
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
