"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Calendar, CreditCard, Star, Trophy, Users, Target } from "lucide-react"
import Image from "next/image"

export function ProgramCTA() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-black">
      <div className="mx-auto max-w-7xl">
        {/* Main CTA Card */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-16">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3"
              alt="Ready to start"
              fill
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#1C2A24]/95 via-[#2D5B4A]/90 to-[#50C878]/85" />

            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#50C878]/20 to-transparent opacity-0 animate-pulse" />
          </div>

          {/* Floating badges */}
          <div className="absolute top-6 right-6 flex flex-col gap-3 z-10">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/20">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <div>
                  <div className="text-white text-lg font-bold">4.9/5</div>
                  <div className="text-white/80 text-xs">Rating</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative px-8 md:px-16 py-20 md:py-24">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-5 py-2.5 mb-8 border border-white/20">
                <span className="w-2.5 h-2.5 rounded-full bg-[#CFEA6C] animate-pulse" />
                <span className="text-sm font-semibold text-white">Limited Spots Available - Enroll Today</span>
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Ready to start your
                <br />
                <span className="bg-gradient-to-r from-white via-[#CFEA6C] to-[#50C878] bg-clip-text text-transparent">
                  winning journey?
                </span>
              </h2>
              <p className="text-xl text-white/90 mb-12 leading-relaxed max-w-2xl">
                Join hundreds of athletes who have transformed their game with World Sports Academy. Experience professional coaching, world-class facilities, and proven training methods.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button
                  asChild
                  className="bg-[#50C878] hover:bg-[#50C878]/90 text-white text-base font-semibold rounded-xl px-8 py-7 h-auto shadow-xl hover:shadow-2xl transition-all group"
                  size="lg"
                >
                  <Link href="/training" className="flex items-center justify-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Enquire About Training
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-8 pt-8 border-t border-white/20">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#CFEA6C]" />
                  <span className="text-white/90 text-sm font-medium">50+ Championships Won</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#CFEA6C]" />
                  <span className="text-white/90 text-sm font-medium">500+ Active Athletes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#CFEA6C]" />
                  <span className="text-white/90 text-sm font-medium">98% Success Rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { number: '500+', label: 'Active Members', icon: Users, color: 'from-blue-500 to-cyan-500' },
            { number: '15+', label: 'Expert Coaches', icon: Target, color: 'from-purple-500 to-pink-500' },
            { number: '10k+', label: 'Sessions Completed', icon: Trophy, color: 'from-orange-500 to-red-500' },
            { number: '50+', label: 'Championships Won', icon: Star, color: 'from-green-500 to-emerald-500' },
          ].map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="group text-center p-8 bg-black rounded-2xl border border-gray-800 hover:border-[#50C878] hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#50C878]/5 rounded-full blur-2xl group-hover:bg-[#50C878]/10 transition-all duration-500" />

                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-white dark:text-white mb-2 group-hover:text-[#50C878] transition-colors">{stat.number}</div>
                  <div className="text-sm text-gray-300 dark:text-gray-300 font-medium">{stat.label}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

