'use client'

import Link from 'next/link'
import { useState, useEffect, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  CreditCard,
  LogOut,
  ChevronDown,
  User,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { signOut } from '@/server/actions/auth'

export function AdminHeader() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    startTransition(async () => {
      await signOut()
      setUser(null)
      router.push('/')
      router.refresh()
    })
  }

  const getInitials = (email?: string) => {
    if (!email) return 'U'
    return email
      .split('@')[0]
      .split('.')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#50C878] to-[#2D5B4A] rounded-lg flex items-center justify-center">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Admin Portal
            </h1>
          </Link>

          {/* Account Dropdown */}
          {loading ? (
            <div className="h-10 w-32 animate-pulse rounded-xl bg-gray-800" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 px-3 py-2 rounded-xl bg-transparent hover:bg-gray-900 transition-colors group outline-none">
                  <Avatar className="w-9 h-9 ring-2 ring-[#50C878]/20 group-hover:ring-[#50C878]/40 transition-all">
                    <AvatarFallback className="bg-gradient-to-br from-[#50C878] to-[#2D5B4A] text-white font-semibold">
                      {getInitials(user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold text-white">
                      {user.email?.split('@')[0]}
                    </span>
                    <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">Account</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-300 transition-colors" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-64 p-2 bg-black backdrop-blur-xl border border-gray-800 shadow-xl rounded-2xl"
                align="end"
                forceMount
              >
                <div className="px-3 py-2 mb-2">
                  <p className="text-sm font-semibold text-white">
                    {user.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-gray-900 rounded-lg transition-colors text-gray-300"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium">User Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                  <Link
                    href="/dashboard/bookings"
                    className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-gray-900 rounded-lg transition-colors text-gray-300"
                  >
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium">My Bookings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                  <Link
                    href="/dashboard/memberships"
                    className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-gray-900 rounded-lg transition-colors text-gray-300"
                  >
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium">My Memberships</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  disabled={isPending}
                  className="rounded-lg cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300"
                >
                  <div className="flex items-center gap-3 w-full px-3 py-2.5">
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {isPending ? 'Signing out...' : 'Sign out'}
                    </span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>
    </div>
  )
}

