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

          {/* Floating badges */}
          <div className="absolute top-6 right-6 flex flex-col gap-3 z-10">
            <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-2 border border-white/20">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-white text-sm font-semibold">Award Winning</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-2 border border-white/20">
              <Users className="w-4 h-4 text-[#50C878]" />
              <span className="text-white text-sm font-semibold">500+ Members</span>
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
              <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.05] mb-6 tracking-tight">
                Elevate your
                <br />
                <span className="bg-gradient-to-r from-white via-[#CFEA6C] to-[#50C878] bg-clip-text text-transparent">
                  performance
                </span>
                <br />
                train smarter
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl leading-relaxed">
                Join Canada's premier sports academy for squash, table tennis, chess, and high-performance training. Expert coaching, world-class facilities, proven results.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-12">
                <Button
                  asChild
                  className="bg-[#50C878] hover:bg-[#50C878]/90 text-white text-base font-semibold rounded-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all group"
                  size="lg"
                >
                  <Link href="/memberships" className="flex items-center gap-2">
                    Enroll now
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-[#2D5B4A] text-base font-semibold rounded-lg px-8 py-6 h-auto shadow-lg transition-all group"
                  size="lg"
                >
                  <Link href="/programs" className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Explore programs
                  </Link>
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-8 pt-8 border-t border-white/20">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
                      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
                      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
                      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces"
                    ].map((avatar, i) => (
                      <div
                        key={i}
                        className="relative w-10 h-10 rounded-full border-2 border-white overflow-hidden ring-2 ring-black/20"
                      >
                        <Image
                          src={avatar}
                          alt={`Athlete ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    ))}
                  </div>
                  <span className="text-white/90 text-sm font-medium ml-2">
                    Join 500+ athletes
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 fill-yellow-400 text-yellow-400"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-white/90 text-sm font-medium">
                    4.9/5 Rating
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

