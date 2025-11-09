"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export function ProgramsHero() {
  return (
    <section className="relative pt-8 pb-12 md:pb-16 px-4 sm:px-6 lg:px-8 mt-[72px]">
      <div className="mx-auto max-w-7xl">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
          {/* Background Image */}
          <Image
            src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3"
            alt="Training programs"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />

          {/* Content Overlay */}
          <div className="relative min-h-[600px] md:min-h-[650px] flex items-end p-8 md:p-12 lg:p-16">
            <div className="max-w-3xl">
              {/* Label */}
              <div className="flex items-center gap-3 mb-4">
                <span className="h-0.5 w-10 bg-[#CFEA6C] inline-block" />
                <span className="text-xs tracking-wider text-white font-semibold uppercase">Training Programs</span>
              </div>

              {/* Hero Text */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
                Train like a
                <br />
                champion
              </h1>

              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl leading-relaxed">
                Structured training programs designed by expert coaches to help you reach your full potential in squash, table tennis, chess, and fitness.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button
                  asChild
                  className="bg-[#50C878] hover:bg-[#50C878]/90 text-white text-base font-semibold rounded-md px-8 py-3 h-auto shadow-lg"
                  size="lg"
                >
                  <Link href="/bookings">Book a Session</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-[#2D5B4A] text-base font-semibold rounded-md px-8 py-3 h-auto shadow-lg transition-all"
                  size="lg"
                >
                  <Link href="/memberships">View Memberships</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

