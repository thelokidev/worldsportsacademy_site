'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { signUp } from '@/server/actions/auth'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  fullName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof formSchema>

export function SignUpForm() {
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
    },
  })

  async function onSubmit(data: FormData) {
    const result = await signUp({ email: data.email, password: data.password, fullName: data.fullName })
    if (result?.error) {
      toast({ 
        title: 'Sign-up Error', 
        description: result.error, 
        variant: 'destructive',
        duration: 5000
      })
      return
    }
    
    // Show appropriate message based on email confirmation requirement
    const message = result?.requiresConfirmation 
      ? result.message || 'Please check your email to confirm your account before signing in.'
      : 'Account created successfully! Please check your email to verify your account.'
    
    toast({ 
      title: 'Account Created', 
      description: message,
      duration: 8000
    })
    
    router.push('/signin')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white dark:text-white">Full Name (optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="John Doe" 
                  className="bg-gray-700 dark:bg-gray-700 border-gray-600 dark:border-gray-600 text-white placeholder:text-gray-400 focus:border-[#50C878] focus:ring-[#50C878]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white dark:text-white">Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="you@example.com" 
                  className="bg-gray-700 dark:bg-gray-700 border-gray-600 dark:border-gray-600 text-white placeholder:text-gray-400 focus:border-[#50C878] focus:ring-[#50C878]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white dark:text-white">Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="bg-gray-700 dark:bg-gray-700 border-gray-600 dark:border-gray-600 text-white placeholder:text-gray-400 focus:border-[#50C878] focus:ring-[#50C878]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white dark:text-white">Confirm Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="bg-gray-700 dark:bg-gray-700 border-gray-600 dark:border-gray-600 text-white placeholder:text-gray-400 focus:border-[#50C878] focus:ring-[#50C878]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          className="w-full bg-[#50C878] hover:bg-[#50C878]/90 text-white font-semibold h-11 text-base shadow-lg hover:shadow-xl transition-all" 
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Creating account...' : 'Sign Up'}
        </Button>
      </form>
    </Form>
  )
}