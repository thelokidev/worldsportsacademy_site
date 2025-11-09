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
    <div className="w-full max-w-md px-4">
      <Card className="shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-black">Sign in</CardTitle>
          <CardDescription className="text-gray-600">
            Enter your email and password to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {params?.verified === 'true' && (
            <Alert className="border-[#50C878] bg-[#50C878]/10">
              <CheckCircle2 className="h-4 w-4 text-[#50C878]" />
              <AlertDescription className="text-[#2D5B4A]">
                Email verified successfully! You can now sign in.
              </AlertDescription>
            </Alert>
          )}
          {params?.error === 'verification_failed' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Email verification failed. Please try signing up again or contact support.
              </AlertDescription>
            </Alert>
          )}
          <SignInForm />
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#50C878] hover:text-[#50C878]/90 hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}