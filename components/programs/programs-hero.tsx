"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Award, Users, TrendingUp, Target } from "lucide-react"

export function ProgramsHero() {
  return (
    <section className="relative pt-8 pb-12 md:pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3"
              alt="Training programs"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-[#2D5B4A]/60 to-black/80" />

            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#50C878]/20 to-transparent opacity-0 animate-pulse" />
          </div>

          {/* Floating stats badges */}
          <div className="absolute top-6 right-6 flex flex-col gap-3 z-10">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/20">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-[#CFEA6C]" />
                <div>
                  <div className="text-white text-lg font-bold">15+</div>
                  <div className="text-white/80 text-xs">Expert Coaches</div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/20">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-[#50C878]" />
                <div>
                  <div className="text-white text-lg font-bold">500+</div>
                  <div className="text-white/80 text-xs">Active Athletes</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Overlay */}
          <div className="relative min-h-[700px] md:min-h-[750px] flex items-center p-8 md:p-12 lg:p-16">
            <div className="max-w-4xl">
              {/* Label */}
              <div className="inline-flex items-center gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <span className="h-0.5 w-10 bg-[#CFEA6C] inline-block" />
                  <span className="text-base tracking-wide text-white font-bold uppercase">Training Programs</span>
                </div>
              </div>

              {/* Hero Text with gradient */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.05] mb-6 tracking-tight">
                Train like a
                <br />
                <span className="bg-gradient-to-r from-white via-[#CFEA6C] to-[#50C878] bg-clip-text text-transparent">
                  champion
                </span>
              </h1>

              <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl leading-relaxed">
                Structured training programs designed by expert coaches to help you reach your full potential in squash, table tennis, chess, and fitness. Professional guidance, proven methods, exceptional results.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-12">
                <Button
                  asChild
                  className="bg-[#50C878] hover:bg-[#50C878]/90 text-white text-base font-semibold rounded-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all group"
                  size="lg"
                >
                  <Link href="/bookings" className="flex items-center gap-2">
                    Free Drop-in Session
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-[#2D5B4A] text-base font-semibold rounded-lg px-8 py-6 h-auto shadow-lg transition-all"
                  size="lg"
                >
                  <Link href="/memberships">View Memberships</Link>
                </Button>
              </div>

              {/* Program highlights */}
              <div className="flex flex-wrap items-center gap-6 pt-8 border-t border-white/20">
                {[
                  { icon: Award, text: "Expert Coaching" },
                  { icon: TrendingUp, text: "All Levels" },
                  { icon: Users, text: "Beginners Welcome" }
                ].map((item, idx) => {
                  const Icon = item.icon
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                        <Icon className="w-4 h-4 text-[#CFEA6C]" />
                      </div>
                      <span className="text-white/90 text-sm font-medium">{item.text}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

