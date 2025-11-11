import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UnifiedAuthForm } from '@/components/features/auth/unified-auth-form'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle } from 'lucide-react'

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string; error?: string; redirect?: string }>
}) {
  const params = await searchParams
  
  // Check if user is already logged in
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const redirectTo = params?.redirect || '/dashboard'
    redirect(redirectTo)
  }
  
  return (
    <div className="w-full max-w-md">
      <Card className="relative overflow-hidden shadow-2xl border border-[#50C878]/40 hover:border-[#50C878]/60 bg-black/95 backdrop-blur-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#50C878]/5">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#50C878]/5 via-transparent to-[#2D5B4A]/5 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#50C878]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="relative z-10">
          <CardHeader className="space-y-4 text-center pb-8 pt-10">
            {/* Logo */}
            <div className="inline-flex items-center justify-center mb-2 group">
              <div className="relative w-20 h-20 group-hover:scale-110 transition-transform">
                <Image
                  src="/logo.png"
                  alt="World Sports Academy Logo"
                  width={80}
                  height={80}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Welcome to World Sports Academy
            </CardTitle>
            <CardDescription className="text-gray-400 text-base leading-relaxed">
              Sign in with your email or social account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 px-8 pb-8">
            {params?.verified === 'true' && (
              <Alert className="border-[#50C878]/50 bg-[#50C878]/10 backdrop-blur-sm rounded-xl">
                <CheckCircle2 className="h-5 w-5 text-[#50C878]" />
                <AlertDescription className="text-[#50C878] font-medium">
                  Email verified successfully! You can now sign in.
                </AlertDescription>
              </Alert>
            )}
            {params?.error === 'verification_failed' && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-700/50 backdrop-blur-sm rounded-xl">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription className="text-red-300">
                  Email verification failed. Please try again or contact support.
                </AlertDescription>
              </Alert>
            )}
            <UnifiedAuthForm />
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-3 pt-6 pb-8 px-8 border-t border-gray-800/50">
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              By continuing, you agree to our{' '}
              <a href="/terms" className="text-[#50C878] hover:text-[#CFEA6C] transition-colors underline">
                Terms of Service
              </a>
              {' '}and{' '}
              <a href="/privacy" className="text-[#50C878] hover:text-[#CFEA6C] transition-colors underline">
                Privacy Policy
              </a>
            </p>
          </CardFooter>
        </div>
      </Card>
    </div>
  )
}

