'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { signIn } from '@/server/actions/auth'
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
})

type FormData = z.infer<typeof formSchema>

export function SignInForm() {
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: FormData) {
    const result = await signIn(data)
    if (result?.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
        <Button 
          type="submit" 
          className="w-full bg-[#50C878] hover:bg-[#50C878]/90 text-white font-semibold h-11 text-base shadow-lg hover:shadow-xl transition-all" 
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </Form>
  )
}