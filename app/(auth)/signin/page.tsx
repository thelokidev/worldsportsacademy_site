import Link from 'next/link'
import { SignInForm } from '@/components/features/auth/sign-in-form'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle } from 'lucide-react'

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string; error?: string }>
}) {
  const params = await searchParams
  return (
    <div className="w-full max-w-md">
      <Card className="shadow-2xl border-gray-700 dark:border-gray-700 bg-gray-800 dark:bg-gray-800">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#50C878]/20 to-[#2D5B4A]/20 mb-4">
            <svg className="w-8 h-8 text-[#50C878]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold text-white dark:text-white">Welcome Back</CardTitle>
          <CardDescription className="text-gray-300 dark:text-gray-300">
            Enter your email and password to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {params?.verified === 'true' && (
            <Alert className="border-[#50C878] bg-[#50C878]/10 dark:bg-[#50C878]/10">
              <CheckCircle2 className="h-4 w-4 text-[#50C878]" />
              <AlertDescription className="text-[#50C878] dark:text-[#50C878]">
                Email verified successfully! You can now sign in.
              </AlertDescription>
            </Alert>
          )}
          {params?.error === 'verification_failed' && (
            <Alert variant="destructive" className="bg-red-900/20 dark:bg-red-900/20 border-red-700 dark:border-red-700">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-300 dark:text-red-300">
                Email verification failed. Please try signing up again or contact support.
              </AlertDescription>
            </Alert>
          )}
          <SignInForm />
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 pt-6 border-t border-gray-700 dark:border-gray-700">
          <div className="text-sm text-gray-400 dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#50C878] hover:text-[#50C878]/80 hover:underline font-semibold transition-colors">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}