"use client"

import Image from "next/image"
import { ArrowRight, Star } from "lucide-react"

export function TrainingHero() {
  return (
    <section className="relative h-[85vh] min-h-[600px] flex flex-col justify-center overflow-hidden bg-black">
      {/* Background Images with sophisticated overlay */}
      <div className="absolute inset-0 grid grid-cols-2 opacity-60">
        <div className="relative h-full">
          <Image
            src="/explore/TT.jpg"
            alt="Table Tennis Training"
            fill
            className="object-cover transition-transform duration-[20s] hover:scale-105"
            sizes="50vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
        </div>
        <div className="relative h-full">
          <Image
            src="/explore/squash.jpg"
            alt="Squash Training"
            fill
            className="object-cover transition-transform duration-[20s] hover:scale-105"
            sizes="50vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-l from-black via-black/50 to-transparent" />
        </div>
      </div>

      {/* Main Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md mb-8">
            <Star className="w-3.5 h-3.5 text-[#CFEA6C] fill-[#CFEA6C]" />
            <span className="text-xs font-semibold text-white tracking-wider uppercase">Elite Coaching Program</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
            Train Like a <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CFEA6C] to-[#50C878]">
              Champion
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed mb-10">
            World-class instruction for Table Tennis and Squash. From foundational mechanics to high-performance strategy, tailored for every athlete.
          </p>
        </div>
      </div>

      {/* Modern Glass Info Bar */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#50C878]" />
                <span>Coach Abhinay Vaddi</span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                <span>Provincial & National Level</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <span className="font-medium">Customized Performance Plans Available</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
