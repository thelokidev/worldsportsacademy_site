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
  phoneNumber: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[\d\s\-\+\(\)]+$/, 'Please enter a valid phone number'),
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
      phoneNumber: '',
    },
  })

  async function onSubmit(data: FormData) {
    const result = await signUp({ email: data.email, password: data.password, fullName: data.fullName, phoneNumber: data.phoneNumber })
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-white font-semibold text-sm">Full Name <span className="text-gray-500 font-normal">(optional)</span></FormLabel>
              <FormControl>
                <Input 
                  placeholder="John Doe" 
                  className="h-12 bg-black/50 border-gray-800 text-white placeholder:text-gray-500 focus:border-[#50C878] focus:ring-2 focus:ring-[#50C878]/20 rounded-xl transition-all" 
                  {...field} 
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-white font-semibold text-sm">Email Address</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="you@example.com" 
                  className="h-12 bg-black/50 border-gray-800 text-white placeholder:text-gray-500 focus:border-[#50C878] focus:ring-2 focus:ring-[#50C878]/20 rounded-xl transition-all" 
                  {...field} 
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-white font-semibold text-sm">Phone Number</FormLabel>
              <FormControl>
                <Input 
                  type="tel" 
                  placeholder="(123) 456-7890" 
                  className="h-12 bg-black/50 border-gray-800 text-white placeholder:text-gray-500 focus:border-[#50C878] focus:ring-2 focus:ring-[#50C878]/20 rounded-xl transition-all" 
                  {...field} 
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-white font-semibold text-sm">Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="Enter your password" 
                  className="h-12 bg-black/50 border-gray-800 text-white placeholder:text-gray-500 focus:border-[#50C878] focus:ring-2 focus:ring-[#50C878]/20 rounded-xl transition-all" 
                  {...field} 
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-white font-semibold text-sm">Confirm Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="Confirm your password" 
                  className="h-12 bg-black/50 border-gray-800 text-white placeholder:text-gray-500 focus:border-[#50C878] focus:ring-2 focus:ring-[#50C878]/20 rounded-xl transition-all" 
                  {...field} 
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-[#50C878] to-[#3DA860] hover:from-[#3DA860] hover:to-[#50C878] text-white font-semibold h-12 text-base shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all rounded-xl" 
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating account...
            </span>
          ) : (
            'Sign Up'
          )}
        </Button>
      </form>
    </Form>
  )
}