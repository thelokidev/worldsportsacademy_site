"use client"

import Link from "next/link"
import { Menu, X, ChevronDown, LogOut, LayoutDashboard, Calendar, CreditCard, Sparkles } from "lucide-react"
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

  useEffect(() => {
    const supabase = createClient()

    // Get initial session - optimized with caching
    const initAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('Auth error:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
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
        className={`transition-all duration-300 ${
          scrolled
            ? "bg-gray-900/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b border-gray-800/50 dark:border-gray-800/50"
            : "bg-gray-900/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm"
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
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#50C878] to-[#2D5B4A] rounded-xl blur-sm opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-10 h-10 bg-gradient-to-br from-[#50C878] to-[#3DA860] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                  <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-white dark:text-white font-bold text-lg leading-tight group-hover:text-[#50C878] transition-colors">
                  World Sports
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-400 font-medium">Academy</span>
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
                    className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                      active
                        ? "text-[#50C878] bg-[#50C878]/10 dark:bg-[#50C878]/10"
                        : "text-gray-300 dark:text-gray-300 hover:text-[#50C878] hover:bg-gray-800 dark:hover:bg-gray-800"
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
                <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-200 hidden md:block" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden md:flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-800 transition-colors group">
                      <Avatar className="w-9 h-9 ring-2 ring-[#50C878]/20 group-hover:ring-[#50C878]/40 transition-all">
                        <AvatarFallback className="bg-gradient-to-br from-[#50C878] to-[#2D5B4A] text-white font-semibold">
                          {getInitials(user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-semibold text-white dark:text-white">
                          {user.email?.split("@")[0]}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-400">Account</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-400 group-hover:text-gray-300 transition-colors" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-64 p-2 bg-gray-800 dark:bg-gray-800 backdrop-blur-xl border border-gray-700 dark:border-gray-700 shadow-xl rounded-2xl"
                    align="end"
                    forceMount
                  >
                    <div className="px-3 py-2 mb-2">
                      <p className="text-sm font-semibold text-white dark:text-white">
                        {user.email?.split("@")[0]}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator className="bg-gray-700 dark:bg-gray-700" />
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link
                        href="/dashboard"
                        prefetch={true}
                        className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-gray-700 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-300 dark:text-gray-300"
                      >
                        <LayoutDashboard className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                        <span className="text-sm font-medium">Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link
                        href="/dashboard/bookings"
                        prefetch={true}
                        className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-gray-700 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-300 dark:text-gray-300"
                      >
                        <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                        <span className="text-sm font-medium">My Bookings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link
                        href="/dashboard/membership"
                        prefetch={true}
                        className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-gray-700 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-300 dark:text-gray-300"
                      >
                        <CreditCard className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                        <span className="text-sm font-medium">My Membership</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-700 dark:bg-gray-700" />
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
                <div className="hidden md:flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-300 dark:text-gray-300 hover:text-[#50C878] hover:bg-gray-800 dark:hover:bg-gray-800"
                    asChild
                  >
                    <Link href="/signin" prefetch={true}>Login</Link>
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-[#50C878] to-[#3DA860] hover:from-[#3DA860] hover:to-[#50C878] text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    asChild
                  >
                    <Link href="/signup" prefetch={true}>Signup</Link>
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-800 transition-colors relative"
                aria-label="Toggle menu"
              >
                <div className="relative w-6 h-6">
                  <Menu
                    className={`absolute inset-0 w-6 h-6 text-gray-300 dark:text-gray-300 transition-all duration-300 ${
                      mobileMenuOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
                    }`}
                  />
                  <X
                    className={`absolute inset-0 w-6 h-6 text-gray-300 dark:text-gray-300 transition-all duration-300 ${
                      mobileMenuOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Menu - Slide Animation */}
          <div
            className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
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
                    className={`flex items-center px-4 py-3 text-base font-medium rounded-xl transition-colors duration-150 ${
                      active
                        ? "text-[#50C878] bg-[#50C878]/10 dark:bg-[#50C878]/10"
                        : "text-gray-300 dark:text-gray-300 hover:text-[#50C878] hover:bg-gray-800 dark:hover:bg-gray-800"
                    } ${mounted && isPending ? "opacity-70" : ""}`}
                  >
                    {item.name}
                    {active && (
                      <span className="ml-auto w-2 h-2 bg-[#50C878] rounded-full" />
                    )}
                  </Link>
                )
              })}
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
                  <>
                    <Button
                      variant="outline"
                      className="w-full border-gray-700 dark:border-gray-700 text-gray-300 dark:text-gray-300"
                      asChild
                    >
                      <Link href="/signin" prefetch={true} onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                    </Button>
                    <Button
                      className="w-full bg-gradient-to-r from-[#50C878] to-[#3DA860] hover:from-[#3DA860] hover:to-[#50C878] text-white shadow-lg"
                      asChild
                    >
                      <Link href="/signup" prefetch={true} onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}