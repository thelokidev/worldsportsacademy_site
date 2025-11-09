"use client";

import { Button } from "@/components/ui/button";
import { Activity, Target, Circle, Grid } from "lucide-react";
import Link from "next/link";

export function FacilitiesSection() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-20">
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
              <Button asChild className="bg-[#50C878] hover:bg-[#50C878]/90 text-white rounded-md px-6 py-2 h-auto">
                <Link href="/memberships">Enroll now</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-white border border-gray-300 text-black hover:bg-gray-50 rounded-md px-6 py-2 h-auto"
              >
                <Link href="/bookings">Book a Session</Link>
              </Button>
            </div>
          </div>

          {/* Right features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
            <div>
              <div className="w-8 h-8 rounded-md bg-[#DCF1E6] text-[#2D5B4A] flex items-center justify-center mb-3">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-[#2D5B4A] font-semibold mb-1">Squash</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Professional squash courts with world-class facilities for competitive play and training.
              </p>
            </div>
            <div>
              <div className="w-8 h-8 rounded-md bg-[#DCF1E6] text-[#2D5B4A] flex items-center justify-center mb-3">
                <Circle className="w-5 h-5" />
              </div>
              <h3 className="text-[#2D5B4A] font-semibold mb-1">Table Tennis</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Premium table tennis tables with professional-grade equipment for all skill levels.
              </p>
            </div>
            <div>
              <div className="w-8 h-8 rounded-md bg-[#DCF1E6] text-[#2D5B4A] flex items-center justify-center mb-3">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-[#2D5B4A] font-semibold mb-1">High performance gym</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                State-of-the-art fitness equipment and training spaces designed for peak athletic performance.
              </p>
            </div>
            <div>
              <div className="w-8 h-8 rounded-md bg-[#DCF1E6] text-[#2D5B4A] flex items-center justify-center mb-3">
                <Grid className="w-5 h-5" />
              </div>
              <h3 className="text-[#2D5B4A] font-semibold mb-1">Chess</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Dedicated chess areas with professional boards for strategic training and competitive matches.
              </p>
            </div>
          </div>
        </div>

        {/* CTA banner */}
        <div className="rounded-2xl bg-[#1F3A33] text-white overflow-hidden relative">
          <div className="relative px-6 sm:px-10 md:px-14 py-14 text-center max-w-3xl mx-auto">
            <p className="uppercase tracking-wider text-[#9FD6B7] text-xs mb-3">Get Started</p>
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Join now and
              <br />
              elevate your game!</h3>
            <p className="text-white/80 text-sm mb-8 max-w-2xl mx-auto">
              Experience world-class sports facilities including squash courts, table tennis tables, chess areas, and a high-performance gym. Book your session today or explore our membership options.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="mailto:info@worldsportsacademy.com" 
                className="bg-white text-[#2D5B4A] rounded-full px-5 py-2 text-sm shadow-sm hover:bg-white/90 transition-colors"
              >
                info@worldsportsacademy.com
              </a>
              <a 
                href="https://maps.google.com/?q=1233+Dillon+Rd,+Burlington,+ON+L7M+1K6,+Canada"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-[#2D5B4A] rounded-full px-5 py-2 text-sm shadow-sm hover:bg-white/90 transition-colors"
              >
                1233 Dillon Rd, Burlington, ON
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
