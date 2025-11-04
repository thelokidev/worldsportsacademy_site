import Link from 'next/link'
import { SignUpForm } from '@/components/features/auth/sign-up-form'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignUpPage() {
  return (
    <div className="w-full max-w-md px-4">
      <Card className="shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-black">Create an account</CardTitle>
          <CardDescription className="text-gray-600">
            Enter your information to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm />
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/signin" className="text-[#50C878] hover:text-[#50C878]/90 hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}