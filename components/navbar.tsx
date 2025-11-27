"use client"

import Link from "next/link"
import { Menu, X, ChevronDown, LogOut, LayoutDashboard, Calendar, CreditCard, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useTransition, useMemo } from "react"
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
  { name: "Home", href: "/" },
  { name: "Programs", href: "/programs" },
  { name: "Book Now", href: "/bookings" },
  { name: "Memberships", href: "/memberships" },
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

    const checkAdmin = async (userId: string) => {
      if (!supabase || !isMounted) return
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single()
        if (isMounted) {
          setIsAdmin(profile?.role === 'admin')
        }
      } catch (err) {
        console.error('[Navbar] checkAdmin error:', err)
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
            await checkAdmin(user.id)
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
          await checkAdmin(session.user.id)
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

  const handleLinkClick = () => {
    setMobileMenuOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Main Navigation */}
      <nav
        className={`transition-all duration-300 ${scrolled
          ? "bg-black/80 backdrop-blur-xl shadow-lg border-b border-gray-800/50"
          : "bg-black/95 backdrop-blur-sm shadow-sm"
          }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link
              href="/"
              prefetch={true}
              className="flex items-center group relative"
            >
              <div className="relative w-12 h-12 group-hover:scale-105 transition-all duration-300">
                <Image
                  src="/logo.png"
                  alt="World Sports Academy Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                  priority
                />
              </div>
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
              {/* Admin Tab - Only visible for admin users */}
              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  prefetch={true}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150 flex items-center gap-2 ${pathname?.startsWith('/admin')
                    ? "text-amber-400 bg-amber-400/10"
                    : "text-amber-400/80 hover:text-amber-400 hover:bg-amber-400/10"
                    } ${mounted && isPending ? "opacity-70" : ""}`}
                >
                  <Shield className="w-4 h-4" />
                  Admin
                  {pathname?.startsWith('/admin') && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-amber-400 rounded-full" />
                  )}
                </Link>
              )}
            </div>

            {/* Right Side - Auth & Mobile Menu */}
            <div className="flex items-center gap-3">
              {loading ? (
                <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-800 hidden md:block" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden md:flex items-center gap-3 px-3 py-2 rounded-xl bg-transparent hover:bg-gray-900 transition-colors group outline-none">
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
                  <div className="hidden md:flex items-center gap-2">
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
                className="lg:hidden p-2.5 rounded-xl hover:bg-gray-900 transition-colors relative"
                aria-label="Toggle menu"
              >
                <div className="relative w-6 h-6">
                  <Menu
                    className={`absolute inset-0 w-6 h-6 text-gray-300 dark:text-gray-300 transition-all duration-300 ${mobileMenuOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
                      }`}
                  />
                  <X
                    className={`absolute inset-0 w-6 h-6 text-gray-300 dark:text-gray-300 transition-all duration-300 ${mobileMenuOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
                      }`}
                  />
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Menu - Slide Animation */}
          <div
            className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
          >
            <div className="py-4 space-y-1 border-t border-gray-800/50 dark:border-gray-800/50 mt-2">
              {navigation.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    prefetch={true}
                    onClick={handleLinkClick}
                    className={`flex items-center px-4 py-3 text-base font-medium rounded-xl transition-colors duration-150 ${active
                      ? "text-[#50C878] bg-[#50C878]/10 dark:bg-[#50C878]/10"
                      : "text-gray-300 hover:text-[#50C878] hover:bg-gray-900"
                      } ${mounted && isPending ? "opacity-70" : ""}`}
                  >
                    {item.name}
                    {active && (
                      <span className="ml-auto w-2 h-2 bg-[#50C878] rounded-full" />
                    )}
                  </Link>
                )
              })}
              {/* Admin Tab - Mobile - Only visible for admin users */}
              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  prefetch={true}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-xl transition-colors duration-150 ${pathname?.startsWith('/admin')
                    ? "text-amber-400 bg-amber-400/10"
                    : "text-amber-400/80 hover:text-amber-400 hover:bg-amber-400/10"
                    } ${mounted && isPending ? "opacity-70" : ""}`}
                >
                  <Shield className="w-5 h-5" />
                  Admin
                  {pathname?.startsWith('/admin') && (
                    <span className="ml-auto w-2 h-2 bg-amber-400 rounded-full" />
                  )}
                </Link>
              )}
              <div className="pt-4 mt-4 border-t border-gray-800/50 dark:border-gray-800/50 space-y-2">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      prefetch={true}
                      onClick={handleLinkClick}
                      className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-300 dark:text-gray-300 hover:text-[#50C878] hover:bg-gray-800 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/bookings"
                      prefetch={true}
                      onClick={handleLinkClick}
                      className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-300 dark:text-gray-300 hover:text-[#50C878] hover:bg-gray-800 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                      <Calendar className="w-5 h-5" />
                      My Bookings
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full mt-2 border-red-800 text-red-400 hover:bg-red-900/20 hover:text-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                      onClick={() => {
                        handleSignOut()
                        setMobileMenuOpen(false)
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  mounted && (
                    <>
                      <Button
                        className="w-full bg-gradient-to-r from-[#50C878] to-[#3DA860] hover:from-[#3DA860] hover:to-[#50C878] text-white shadow-lg"
                        asChild
                      >
                        <Link href="/auth" prefetch={true} onClick={() => setMobileMenuOpen(false)}>Login</Link>
                      </Button>
                    </>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}