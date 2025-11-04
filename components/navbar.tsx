"use client";

import Link from "next/link";
import { ChevronDown, ShoppingCart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              {/* CTA Button - Hidden on small screens */}
              <Button
                className="hidden md:block bg-[#50C878] hover:bg-[#50C878]/90 text-white text-sm font-normal rounded-md px-6 py-2 h-auto"
              >
                Enroll now
              </Button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-black p-2"
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
              <div className="flex flex-col gap-4">
                <Link
                  href="/"
                  className="text-black text-sm font-normal hover:text-[#50C878] transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className="text-black text-sm font-normal hover:text-[#50C878] transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/sports"
                  className="text-black text-sm font-normal hover:text-[#50C878] transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sports
                </Link>
                <Link
                  href="/programs"
                  className="text-black text-sm font-normal hover:text-[#50C878] transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Programs
                </Link>
                <Link
                  href="/pages"
                  className="text-black text-sm font-normal hover:text-[#50C878] transition-colors py-2 flex items-center gap-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pages
                  <ChevronDown className="w-4 h-4" />
                </Link>
                <Link
                  href="/cart"
                  className="text-black text-sm font-normal hover:text-[#50C878] transition-colors py-2 flex items-center gap-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Cart (0)
                </Link>
                <Button
                  className="bg-[#50C878] hover:bg-[#50C878]/90 text-white text-sm font-normal rounded-md px-6 py-2 h-auto mt-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Enroll now
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}