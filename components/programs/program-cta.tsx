"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Calendar, CreditCard } from "lucide-react"
import Image from "next/image"

export function ProgramCTA() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-7xl">
        {/* Main CTA Card */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
          <Image
            src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3"
            alt="Ready to start"
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1C2A24]/95 via-[#2D5B4A]/90 to-[#50C878]/80" />

          <div className="relative px-8 md:px-16 py-16 md:py-20">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <span className="w-2 h-2 rounded-full bg-[#CFEA6C] animate-pulse" />
                <span className="text-sm font-medium text-white">Limited Spots Available</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Ready to start your journey?
              </h2>
              <p className="text-xl text-white/90 mb-10 leading-relaxed max-w-2xl">
                Join hundreds of athletes who have transformed their game with World Sports Academy. Book your first session today.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  className="bg-[#50C878] hover:bg-[#50C878]/90 text-white text-base font-semibold rounded-lg px-8 py-6 h-auto shadow-lg group"
                  size="lg"
                >
                  <Link href="/bookings" className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Book Your Session
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-[#2D5B4A] text-base font-semibold rounded-lg px-8 py-6 h-auto shadow-lg"
                  size="lg"
                >
                  <Link href="/memberships" className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    View Memberships
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          {[
            { number: '500+', label: 'Active Members' },
            { number: '15+', label: 'Expert Coaches' },
            { number: '10k+', label: 'Sessions Completed' },
            { number: '50+', label: 'Championships Won' },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 bg-gradient-to-br from-[#F8FBF9] to-white rounded-xl border border-gray-100"
            >
              <div className="text-4xl md:text-5xl font-bold text-[#50C878] mb-2">{stat.number}</div>
              <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

