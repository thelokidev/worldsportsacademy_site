"use client";

import { Button } from "@/components/ui/button";
import { Dumbbell, Waves, Flag, Activity } from "lucide-react";

export function FacilitiesSection() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-7xl">
        {/* Heading row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
          {/* Left copy */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-0.5 w-10 bg-yellow-400 inline-block" />
              <span className="text-xs tracking-wider text-[#2D5B4A] font-semibold uppercase">Facilities</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#2D5B4A] leading-tight mb-4">
              First-class facilities
              <br />
              for dedicated athletes
            </h2>
            <p className="text-gray-600 leading-relaxed max-w-md mb-6">
              High-performance spaces designed for training, recovery, and results. Everything you need to compete at your best.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button className="bg-[#50C878] hover:bg-[#50C878]/90 text-white rounded-md px-6 py-2 h-auto">
                Enroll now
              </Button>
              <Button
                variant="outline"
                className="bg-white border border-gray-300 text-black hover:bg-gray-50 rounded-md px-6 py-2 h-auto"
              >
                Our programs
              </Button>
            </div>
          </div>

          {/* Right features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
            <div>
              <div className="w-8 h-8 rounded-md bg-[#DCF1E6] text-[#2D5B4A] flex items-center justify-center mb-3">
                <Waves className="w-5 h-5" />
              </div>
              <h3 className="text-[#2D5B4A] font-semibold mb-1">Olympic pool</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Lorem ipsum dolor sit amet et consectetur in congue porttitor.
              </p>
            </div>
            <div>
              <div className="w-8 h-8 rounded-md bg-[#DCF1E6] text-[#2D5B4A] flex items-center justify-center mb-3">
                <Flag className="w-5 h-5" />
              </div>
              <h3 className="text-[#2D5B4A] font-semibold mb-1">Athletics track</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Lorem ipsum dolor sit amet et consectetur in congue porttitor.
              </p>
            </div>
            <div>
              <div className="w-8 h-8 rounded-md bg-[#DCF1E6] text-[#2D5B4A] flex items-center justify-center mb-3">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-[#2D5B4A] font-semibold mb-1">High performance gym</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Lorem ipsum dolor sit amet et consectetur in congue porttitor.
              </p>
            </div>
            <div>
              <div className="w-8 h-8 rounded-md bg-[#DCF1E6] text-[#2D5B4A] flex items-center justify-center mb-3">
                <Dumbbell className="w-5 h-5" />
              </div>
              <h3 className="text-[#2D5B4A] font-semibold mb-1">Fully gymnastics area</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Lorem ipsum dolor sit amet et consectetur in congue porttitor.
              </p>
            </div>
          </div>
        </div>

        {/* CTA banner */}
        <div className="rounded-2xl bg-[#1F3A33] text-white overflow-hidden relative">
          {/* Decorative yellow threads */}
          <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 1200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-50 330 C200 220 450 440 700 330 C900 250 1050 300 1250 250" stroke="#CFEA6C" strokeWidth="16" strokeLinecap="round" />
            <path d="M-100 160 C220 40 560 280 900 160 C1040 110 1140 120 1300 190" stroke="#CFEA6C" strokeWidth="8" strokeLinecap="round" />
          </svg>

          <div className="relative px-6 sm:px-10 md:px-14 py-14 text-center max-w-3xl mx-auto">
            <p className="uppercase tracking-wider text-[#9FD6B7] text-xs mb-3">Get a program</p>
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Join now and
              <br />
              elevate your game!</h3>
            <p className="text-white/80 text-sm mb-8">
              Lorem ipsum dolor sit amet consectetur sed tristique fermentum malesuada massa cursus vel vulputate.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="bg-white text-[#2D5B4A] rounded-full px-5 py-2 text-sm shadow-sm">contact@worldsportsacademy.com</div>
              <div className="bg-white text-[#2D5B4A] rounded-full px-5 py-2 text-sm shadow-sm">(123) 456 - 7890</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
