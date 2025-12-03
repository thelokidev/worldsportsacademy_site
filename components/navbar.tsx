"use client"

import Link from "next/link"
import { Menu, X, ChevronDown, LogOut, LayoutDashboard, Calendar, CreditCard, ChevronRight, Home, Dumbbell, CalendarCheck, Crown, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useTransition, useMemo, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "@/server/actions/auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Image from "next/image"

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Programs", href: "/programs", icon: Dumbbell },
  { name: "Book Now", href: "/bookings", icon: CalendarCheck },
  { name: "Memberships", href: "/memberships", icon: Crown },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let isMounted = true
    let supabase: ReturnType<typeof createClient> | null = null

    // Safety timeout to prevent infinite loading state
    const loadingTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('[Navbar] Auth check timed out after 10s, clearing loading state')
        setLoading(false)
      }
    }, 10000)

    const checkAdmin = async () => {
      if (!isMounted) return
      try {
        console.log('[Navbar] Checking admin status via API...')
        const response = await fetch('/api/auth/check-admin')
        const data = await response.json()

        console.log('[Navbar] Admin check API response:', data)

        if (isMounted) {
          setIsAdmin(data.isAdmin === true)
        }
      } catch (err) {
        console.error('[Navbar] checkAdmin error:', err)
        if (isMounted) {
          setIsAdmin(false)
        }
      }
    }

    // Get initial session
    const initAuth = async () => {
      try {
        supabase = createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error) {
          console.error('[Navbar] getUser error:', error.message)
        }

        if (isMounted) {
          setUser(user)
          if (user) {
            await checkAdmin()
          }
        }
      } catch (error) {
        console.error('[Navbar] Auth initialization error:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
          clearTimeout(loadingTimeout)
        }
      }
    }

    initAuth()

    // Listen for auth changes
    const setupSubscription = async () => {
      if (!supabase) {
        supabase = createClient()
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!isMounted) return

        setUser(session?.user ?? null)
        setLoading(false) // Ensure loading is cleared on any auth state change

        if (session?.user) {
          await checkAdmin()
        } else {
          setIsAdmin(false)
        }
      })

      return subscription
    }

    let subscription: { unsubscribe: () => void } | null = null
    setupSubscription().then(sub => {
      subscription = sub
    })

    return () => {
      isMounted = false
      clearTimeout(loadingTimeout)
      subscription?.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
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
    if (!email) return "U"
    return email
      .split("@")[0]
      .split(".")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const isActive = useMemo(() => {
    return (href: string) => {
      if (href === "/") {
        return pathname === "/"
      }
      return pathname?.startsWith(href)
    }
  }, [pathname])

  const handleLinkClick = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Main Navigation */}
      <nav
        className={`transition-all duration-300 ${scrolled
          ? "bg-black/90 backdrop-blur-xl shadow-lg border-b border-white/10"
          : "bg-transparent backdrop-blur-none border-b border-transparent"
          }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link
              href="/"
              prefetch={true}
              className="flex items-center gap-3 group relative"
            >
              <div className="relative w-10 h-10 md:w-12 md:h-12 group-hover:scale-105 transition-all duration-300">
                <Image
                  src="/logo.png"
                  alt="World Sports Academy Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                  priority
                />
              </div>
              <span className="font-bold text-lg md:text-xl text-white tracking-tight hidden sm:block group-hover:text-[#50C878] transition-colors">
                World Sports Academy
              </span>
            </Link>

            {/* Navigation Links - Desktop */}
            <div className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    prefetch={true}
                    className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${active
                      ? "text-[#50C878] bg-[#50C878]/10 dark:bg-[#50C878]/10"
                      : "text-gray-300 hover:text-[#50C878] hover:bg-gray-900"
                      } ${mounted && isPending ? "opacity-70" : ""}`}
                  >
                    {item.name}
                    {active && (
                      <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#50C878] rounded-full" />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Right Side - Auth & Mobile Menu */}
            <div className="flex items-center gap-3">
              {loading ? (
                <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-800 hidden lg:block" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden lg:flex items-center gap-3 px-3 py-2 rounded-xl bg-transparent hover:bg-gray-900 transition-colors group outline-none">
                      <Avatar className="w-9 h-9 ring-2 ring-[#50C878]/20 group-hover:ring-[#50C878]/40 transition-all">
                        <AvatarFallback className="bg-gradient-to-br from-[#50C878] to-[#2D5B4A] text-white font-semibold">
                          {getInitials(user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-semibold text-white">
                          {user.email?.split("@")[0]}
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
                      <p className="text-sm font-semibold text-white dark:text-white">
                        {user.email?.split("@")[0]}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator className="bg-gray-800" />
                    {isAdmin && (
                      <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                        <Link
                          href="/admin/dashboard"
                          prefetch={true}
                          className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-gray-900 rounded-lg transition-colors text-gray-300"
                        >
                          <LayoutDashboard className="w-4 h-4 text-[#50C878]" />
                          <span className="text-sm font-medium text-[#50C878]">Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link
                        href="/dashboard"
                        prefetch={true}
                        className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-gray-900 rounded-lg transition-colors text-gray-300"
                      >
                        <LayoutDashboard className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                        <span className="text-sm font-medium">User Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link
                        href="/dashboard/bookings"
                        prefetch={true}
                        className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-gray-900 rounded-lg transition-colors text-gray-300"
                      >
                        <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                        <span className="text-sm font-medium">My Bookings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link
                        href="/dashboard/membership"
                        prefetch={true}
                        className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-gray-900 rounded-lg transition-colors text-gray-300"
                      >
                        <CreditCard className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                        <span className="text-sm font-medium">My Membership</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="rounded-lg cursor-pointer text-red-400 dark:text-red-400 focus:text-red-400 focus:bg-red-900/20"
                    >
                      <div className="flex items-center gap-3 w-full px-3 py-2.5">
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Sign Out</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                mounted && (
                  <div className="hidden lg:flex items-center gap-2">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-[#50C878] to-[#3DA860] hover:from-[#3DA860] hover:to-[#50C878] text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      asChild
                    >
                      <Link href="/auth" prefetch={true}>Login</Link>
                    </Button>
                  </div>
                )
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl hover:bg-gray-800/50 active:bg-gray-800/70 transition-all duration-200 relative z-[60]"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                <div className="relative w-6 h-6">
                  <Menu
                    className={`absolute inset-0 w-6 h-6 text-gray-200 transition-all duration-300 ease-out ${mobileMenuOpen ? "opacity-0 rotate-180 scale-50" : "opacity-100 rotate-0 scale-100"
                      }`}
                  />
                  <X
                    className={`absolute inset-0 w-6 h-6 text-gray-200 transition-all duration-300 ease-out ${mobileMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-180 scale-50"
                      }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Full Screen Overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-all duration-300 ${mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${mobileMenuOpen ? "opacity-100" : "opacity-0"
            }`}
          onClick={handleLinkClick}
          aria-hidden="true"
        />

        {/* Menu Panel */}
        <div
          className={`absolute top-0 right-0 h-full w-full max-w-sm bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 shadow-2xl transform transition-transform duration-300 ease-out ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          {/* Menu Header */}
          <div className="flex items-center justify-between p-5 pt-6 border-b border-gray-800/50">
            <Link
              href="/"
              prefetch={true}
              onClick={handleLinkClick}
              className="flex items-center gap-3"
            >
              <div className="relative w-10 h-10">
                <Image
                  src="/logo.png"
                  alt="World Sports Academy"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <span className="text-lg font-bold text-white">WSA</span>
            </Link>
            <button
              onClick={handleLinkClick}
              className="p-2 rounded-xl hover:bg-gray-800/50 active:bg-gray-800/70 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Scrollable Menu Content */}
          <div className="h-[calc(100%-80px)] overflow-y-auto overscroll-contain">
            {/* User Section (if logged in) */}
            {user && (
              <div className="p-5 border-b border-gray-800/50">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-gray-800/50 to-gray-800/30 border border-gray-700/50">
                  <Avatar className="w-12 h-12 ring-2 ring-[#50C878]/30">
                    <AvatarFallback className="bg-gradient-to-br from-[#50C878] to-[#2D5B4A] text-white text-lg font-semibold">
                      {getInitials(user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-white truncate">
                      {user.email?.split("@")[0]}
                    </p>
                    <p className="text-sm text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Main Navigation */}
            <div className="p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                Navigation
              </p>
              <nav className="space-y-1">
                {navigation.map((item, index) => {
                  const active = isActive(item.href)
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      prefetch={true}
                      onClick={handleLinkClick}
                      className={`group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${active
                        ? "bg-[#50C878]/15 border border-[#50C878]/30"
                        : "hover:bg-gray-800/50 border border-transparent"
                        }`}
                      style={{
                        animationDelay: `${index * 50}ms`,
                      }}
                    >
                      <div className={`p-2 rounded-lg transition-colors ${active
                        ? "bg-[#50C878]/20 text-[#50C878]"
                        : "bg-gray-800 text-gray-400 group-hover:text-[#50C878] group-hover:bg-gray-700"
                        }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`flex-1 text-base font-medium transition-colors ${active ? "text-[#50C878]" : "text-gray-200 group-hover:text-white"
                        }`}>
                        {item.name}
                      </span>
                      <ChevronRight className={`w-5 h-5 transition-all ${active
                        ? "text-[#50C878] translate-x-0 opacity-100"
                        : "text-gray-600 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                        }`} />
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* User Actions Section */}
            {user && (
              <div className="p-5 border-t border-gray-800/50">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Account
                </p>
                <nav className="space-y-1">
                  {isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      prefetch={true}
                      onClick={handleLinkClick}
                      className="group flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-[#50C878]/10 border border-transparent hover:border-[#50C878]/30 transition-all duration-200"
                    >
                      <div className="p-2 rounded-lg bg-[#50C878]/20 text-[#50C878]">
                        <Shield className="w-5 h-5" />
                      </div>
                      <span className="flex-1 text-base font-medium text-[#50C878]">
                        Admin Dashboard
                      </span>
                      <ChevronRight className="w-5 h-5 text-[#50C878]/50 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    prefetch={true}
                    onClick={handleLinkClick}
                    className="group flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-gray-800/50 border border-transparent transition-all duration-200"
                  >
                    <div className="p-2 rounded-lg bg-gray-800 text-gray-400 group-hover:text-[#50C878] group-hover:bg-gray-700 transition-colors">
                      <LayoutDashboard className="w-5 h-5" />
                    </div>
                    <span className="flex-1 text-base font-medium text-gray-200 group-hover:text-white transition-colors">
                      User Dashboard
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-600 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                  </Link>
                  <Link
                    href="/dashboard/bookings"
                    prefetch={true}
                    onClick={handleLinkClick}
                    className="group flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-gray-800/50 border border-transparent transition-all duration-200"
                  >
                    <div className="p-2 rounded-lg bg-gray-800 text-gray-400 group-hover:text-[#50C878] group-hover:bg-gray-700 transition-colors">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <span className="flex-1 text-base font-medium text-gray-200 group-hover:text-white transition-colors">
                      My Bookings
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-600 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                  </Link>
                  <Link
                    href="/dashboard/membership"
                    prefetch={true}
                    onClick={handleLinkClick}
                    className="group flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-gray-800/50 border border-transparent transition-all duration-200"
                  >
                    <div className="p-2 rounded-lg bg-gray-800 text-gray-400 group-hover:text-[#50C878] group-hover:bg-gray-700 transition-colors">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <span className="flex-1 text-base font-medium text-gray-200 group-hover:text-white transition-colors">
                      My Membership
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-600 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                  </Link>
                </nav>
              </div>
            )}

            {/* Action Buttons */}
            <div className="p-5 pt-2">
              {user ? (
                <Button
                  variant="outline"
                  className="w-full h-12 border-red-900/50 bg-red-950/20 text-red-400 hover:bg-red-900/30 hover:text-red-300 hover:border-red-800/50 rounded-xl font-medium transition-all duration-200"
                  onClick={() => {
                    handleSignOut()
                    setMobileMenuOpen(false)
                  }}
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </Button>
              ) : (
                mounted && (
                  <Button
                    className="w-full h-12 bg-gradient-to-r from-[#50C878] to-[#3DA860] hover:from-[#45B86B] hover:to-[#38A058] text-white shadow-lg shadow-[#50C878]/25 rounded-xl font-semibold transition-all duration-200"
                    asChild
                  >
                    <Link href="/auth" prefetch={true} onClick={handleLinkClick}>
                      Login / Sign Up
                    </Link>
                  </Button>
                )
              )}
            </div>

            {/* Footer */}
            <div className="p-5 pt-0 pb-8">
              <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-800/50">
                <p className="text-xs text-gray-500 text-center">
                  World Sports Academy © {new Date().getFullYear()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}