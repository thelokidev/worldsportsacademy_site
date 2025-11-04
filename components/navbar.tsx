"use client";

import Link from "next/link";
import { ChevronDown, ShoppingCart, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/server/actions/auth";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await signOut();
    router.refresh();
    setUser(null);
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Main Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#50C878] rounded flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="7" r="3" fill="white" />
                  <path
                    d="M12 10V14M12 14L9 17M12 14L15 17"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 10C8 8 9 7 10 7H14C15 7 16 8 16 10"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M7 20L9 18M17 20L15 18"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-black font-bold text-lg">World Sports Academy</span>
            </Link>

            {/* Navigation Links - Desktop */}
            <div className="hidden lg:flex items-center gap-8">
              <Link
                href="/"
                className="text-black text-sm font-normal hover:text-[#50C878] transition-colors"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-black text-sm font-normal hover:text-[#50C878] transition-colors"
              >
                About
              </Link>
              <Link
                href="/sports"
                className="text-black text-sm font-normal hover:text-[#50C878] transition-colors"
              >
                Sports
              </Link>
              <Link
                href="/programs"
                className="text-black text-sm font-normal hover:text-[#50C878] transition-colors"
              >
                Programs
              </Link>
              <Link
                href="/bookings"
                className="text-black text-sm font-normal hover:text-[#50C878] transition-colors"
              >
                Book Now
              </Link>
              <div className="relative group">
                <Link
                  href="/pages"
                  className="text-black text-sm font-normal hover:text-[#50C878] transition-colors flex items-center gap-1"
                >
                  Pages
                  <ChevronDown className="w-4 h-4" />
                </Link>
              </div>
              <Link
                href="/cart"
                className="text-black text-sm font-normal hover:text-[#50C878] transition-colors flex items-center gap-1"
              >
                <ShoppingCart className="w-4 h-4" />
                Cart (0)
              </Link>
            </div>

                         {/* Right Side - CTA Button & Mobile Menu */}
             <div className="flex items-center gap-4">
               {loading ? (
                 <div className="h-9 w-20 animate-pulse rounded-md bg-gray-200 hidden md:block" />
               ) : user ? (
                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <Button variant="ghost" className="relative h-9 w-9 rounded-full hidden md:flex">
                       <User className="h-5 w-5" />
                     </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent className="w-56" align="end" forceMount>
                     <DropdownMenuItem className="flex flex-col items-start space-y-1">
                       <p className="text-sm font-medium leading-none">
                         {user.email?.split('@')[0]}
                       </p>
                       <p className="text-xs leading-none text-muted-foreground">
                         {user.email}
                       </p>
                     </DropdownMenuItem>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem asChild>
                       <Link href="/dashboard">Dashboard</Link>
                     </DropdownMenuItem>
                     <DropdownMenuItem asChild>
                       <Link href="/dashboard/bookings">My Bookings</Link>
                     </DropdownMenuItem>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem onClick={handleSignOut}>
                       Sign Out
                     </DropdownMenuItem>
                   </DropdownMenuContent>
                 </DropdownMenu>
               ) : (
                 <div className="hidden md:flex items-center gap-2">
                   <Button variant="outline" size="sm" asChild>
                     <Link href="/signin">Sign In</Link>
                   </Button>
                   <Button size="sm" className="bg-[#50C878] hover:bg-[#50C878]/90 text-white" asChild>
                     <Link href="/signup">Sign Up</Link>
                   </Button>
                 </div>
               )}

               {/* Mobile Menu Button */}
               <button
                 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                 className="lg:hidden p-2 rounded-md hover:bg-gray-100"
                 aria-label="Toggle menu"
               >
                 {mobileMenuOpen ? (
                   <X className="w-6 h-6" />
                 ) : (
                   <Menu className="w-6 h-6" />
                 )}
               </button>
             </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-3">
                <Link
                  href="/"
                  className="text-black text-sm font-normal hover:text-[#50C878] transition-colors px-4 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className="text-black text-sm font-normal hover:text-[#50C878] transition-colors px-4 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/sports"
                  className="text-black text-sm font-normal hover:text-[#50C878] transition-colors px-4 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sports
                </Link>
                <Link
                  href="/programs"
                  className="text-black text-sm font-normal hover:text-[#50C878] transition-colors px-4 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Programs
                </Link>
                <Link
                  href="/bookings"
                  className="text-black text-sm font-normal hover:text-[#50C878] transition-colors px-4 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Book Now
                </Link>
                <Link
                  href="/pages"
                  className="text-black text-sm font-normal hover:text-[#50C878] transition-colors px-4 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pages
                </Link>
                <Link
                  href="/cart"
                  className="text-black text-sm font-normal hover:text-[#50C878] transition-colors px-4 py-2 flex items-center gap-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Cart (0)
                </Link>
                <div className="px-4 pt-2 space-y-2 border-t border-gray-200 mt-2 pt-4">
                  {user ? (
                    <>
                      <Link
                        href="/dashboard"
                        className="block text-black text-sm font-normal hover:text-[#50C878] transition-colors px-4 py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/bookings"
                        className="block text-black text-sm font-normal hover:text-[#50C878] transition-colors px-4 py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Bookings
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          handleSignOut();
                          setMobileMenuOpen(false);
                        }}
                      >
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="w-full"
                        asChild
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link href="/signin">Sign In</Link>
                      </Button>
                      <Button
                        className="bg-[#50C878] hover:bg-[#50C878]/90 text-white rounded-full px-5 py-2 h-auto w-full"
                        asChild
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link href="/signup">Sign Up</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}