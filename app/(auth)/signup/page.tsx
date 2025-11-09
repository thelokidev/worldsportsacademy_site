import Link from 'next/link'
import { SignUpForm } from '@/components/features/auth/sign-up-form'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignUpPage() {
  return (
    <div className="w-full max-w-md">
      <Card className="shadow-2xl border-gray-700 dark:border-gray-700 bg-gray-800 dark:bg-gray-800">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#50C878]/20 to-[#2D5B4A]/20 mb-4">
            <svg className="w-8 h-8 text-[#50C878]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold text-white dark:text-white">Create an Account</CardTitle>
          <CardDescription className="text-gray-300 dark:text-gray-300">
            Enter your information to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm />
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 pt-6 border-t border-gray-700 dark:border-gray-700">
          <div className="text-sm text-gray-400 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/signin" className="text-[#50C878] hover:text-[#50C878]/80 hover:underline font-semibold transition-colors">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}