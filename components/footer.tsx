"use client";

import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-black text-white mt-24 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4">
        {/* Footer content */}
        <div className="py-12">
          <div className="bg-[#1F3A33] rounded-lg p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Brand & CTA */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="relative w-10 h-10">
                    <Image
                      src="/logo.png"
                      alt="World Sports Academy Logo"
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                  <span className="font-semibold">World Sports Academy</span>
                </div>
                <p className="text-white/70 text-sm mb-4 max-w-xs">
                  High-performance programs, facilities, and coaching for ambitious athletes.
                </p>
                <Button asChild className="bg-[#50C878] hover:bg-[#50C878]/90 text-white rounded-full px-5 py-2 h-auto">
                  <Link href="/bookings">Book Drop-in Session</Link>
                </Button>
              </div>

              {/* Navigation */}
              <div>
                <h4 className="font-semibold mb-4">Navigation</h4>
                <ul className="space-y-2 text-white/80 text-sm">
                  <li><Link href="/" className="hover:opacity-80">Home</Link></li>
                  <li><Link href="/bookings" className="hover:opacity-80">Book a Session</Link></li>
                  <li><Link href="/memberships" className="hover:opacity-80">Memberships</Link></li>
                  <li><a href="mailto:Info@wsateam.com" className="hover:opacity-80">Contact</a></li>
                  <li><a href="tel:+13653249060" className="hover:opacity-80 font-semibold text-[#50C878]">+1 (365) 324-9060</a></li>
                  <li>
                    <a
                      href="https://maps.google.com/?q=1233+Dillon+Rd,+Burlington,+ON+L7M+1K6,+Canada"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-80 text-xs text-gray-400 mt-2 block"
                    >
                      1233 Dillon Rd, Burlington, ON L7M 1K6
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/70">
              <div>Copyright © {new Date().getFullYear()} World Sports Academy. All rights reserved.</div>
              <div className="flex items-center gap-3">
                <a aria-label="Facebook" href="#" className="hover:opacity-80"><Facebook className="w-4 h-4" /></a>
                <a aria-label="Twitter" href="#" className="hover:opacity-80"><Twitter className="w-4 h-4" /></a>
                <a aria-label="Instagram" href="#" className="hover:opacity-80"><Instagram className="w-4 h-4" /></a>
                <a aria-label="YouTube" href="#" className="hover:opacity-80"><Youtube className="w-4 h-4" /></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
