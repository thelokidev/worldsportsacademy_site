"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Play, Trophy, Users, Target } from "lucide-react"
import Image from "next/image"

export function Hero() {
  return (
    <section className="pt-8 pb-12 md:pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
          {/* Background Image with Next.js Image */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 scale-110">
              <Image
                src="/hero.png"
                alt="World Sports Academy - Diverse athletes training in squash, table tennis, chess, and fitness"
                fill
                priority
                className="object-cover"
                style={{ objectPosition: 'center 30%' }}
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-[#2D5B4A]/50" />

            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#50C878]/20 to-transparent opacity-0 animate-pulse" />
          </div>

          {/* FREE REGISTRATION PROMO BANNER - Top centered */}
          {new Date() < new Date('2026-01-01T00:00:00-05:00') && (
            <div className="absolute bottom-4 md:top-6 md:bottom-auto left-1/2 -translate-x-1/2 z-20 max-w-md w-full px-4">
              <div className="bg-gradient-to-r from-[#50C878] via-[#3DA860] to-[#50C878] rounded-full p-[2px] shadow-2xl animate-pulse">
                <div className="bg-black/90 backdrop-blur-lg rounded-full px-6 py-3 flex items-center justify-center gap-3">
                  <span className="text-xl">🎉</span>
                  <div className="text-center">
                    <p className="text-white font-bold text-sm">FREE Registration</p>
                    <p className="text-white/80 text-xs">Save $25 • Until Jan 1, 2026</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Floating badges - Coach Highlight */}
          <div className="absolute top-6 right-6 z-10 hidden md:block">
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-4 max-w-xs hover:bg-black/50 transition-colors cursor-pointer group">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#50C878]">
                <Image
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop"
                  alt="Coach"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-[#50C878] text-xs font-bold uppercase tracking-wider mb-0.5">Head Coach</p>
                <p className="text-white font-semibold text-sm group-hover:text-[#CFEA6C] transition-colors">Meet the Expert</p>
              </div>
              <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-[#50C878] group-hover:translate-x-1 transition-all ml-auto" />
            </div>
          </div>

          {/* Content Overlay */}
          <div className="relative min-h-[700px] md:min-h-[750px] flex items-center p-8 md:p-12 lg:p-16">
            <div className="max-w-4xl">
              {/* Label */}
              <div className="inline-flex items-center gap-4 mb-8 animate-fade-in">
                <div className="flex flex-col">
                  <span className="text-xs tracking-widest text-[#CFEA6C] font-bold uppercase mb-0.5">
                    Welcome to
                  </span>
                  <span className="text-base tracking-wide text-white font-bold uppercase">
                    World Sports Academy
                  </span>
                </div>
              </div>

              {/* Hero Text with gradient */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.05] mb-6 tracking-tight">
                From First Stroke to
                <br />
                <span className="bg-gradient-to-r from-white via-[#CFEA6C] to-[#50C878] bg-clip-text text-transparent">
                  Pro Experience
                </span>
                <br />
                Elite Training for All
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl leading-relaxed">
                Join Canada's premier sports academy. Whether you're a beginner learning the basics or a pro refining your game, we have the expert coaching and world-class facilities for you.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-12">
                <Button
                  asChild
                  className="bg-[#50C878] hover:bg-[#50C878]/90 text-white text-base font-semibold rounded-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all group"
                  size="lg"
                >
                  <Link href="/programs" className="flex items-center gap-2">
                    Explore Programs
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-[#2D5B4A] text-base font-semibold rounded-lg px-8 py-6 h-auto shadow-lg transition-all group"
                  size="lg"
                >
                  <Link href="/bookings" className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Book Drop-in Session
                  </Link>
                </Button>
              </div>

              {/* Trust indicators - Simplified */}
              <div className="flex flex-wrap items-center gap-8 pt-8 border-t border-white/20">
                <div className="flex items-center gap-2">
                  <span className="text-white/90 text-sm font-medium">
                    Trusted by 500+ athletes across Canada
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

