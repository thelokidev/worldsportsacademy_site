"use client"

import { Button } from "@/components/ui/button"
import { Activity, Target, Circle, Grid, ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const facilities = [
  {
    icon: Target,
    name: "Squash",
    description: "Professional squash courts with world-class facilities for competitive play and training.",
    image: "/explore/squash.jpg",
    features: ["4 Professional Courts", "Glass Back Walls", "Tournament Ready"]
  },
  {
    icon: Circle,
    name: "Table Tennis",
    description: "Premium table tennis tables with professional-grade equipment for all skill levels.",
    image: "/explore/TT.jpg",
    features: ["6 Competition Tables", "Pro Equipment", "Training Areas"]
  },
  {
    icon: Activity,
    name: "Pilates Studio",
    description: "Modern pilates equipment and spacious studio designed for holistic wellness and core training.",
    image: "/explore/pilates.jpg",
    features: ["Reformer Machines", "Mat Classes", "Private Sessions"]
  },
  {
    icon: Grid,
    name: "Chess",
    description: "Dedicated chess areas with professional boards for strategic training and competitive matches.",
    image: "/explore/chess.jpg",
    features: ["Quiet Study Areas", "Digital Boards", "Master Coaching"],
    comingSoon: true
  }
]

export function FacilitiesSection() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-16 bg-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#50C878]/10 rounded-full blur-3xl" />

      <div className="mx-auto max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="h-0.5 w-10 bg-yellow-400 inline-block" />
            <span className="text-xs tracking-wider text-[#50C878] dark:text-[#50C878] font-semibold uppercase">Our Facilities</span>
            <span className="h-0.5 w-10 bg-yellow-400 inline-block" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white dark:text-white mb-3">
            World-class training facilities
          </h2>
          <p className="text-base text-gray-300 dark:text-gray-300 max-w-2xl mx-auto">
            High-performance spaces equipped with Olympic-standard equipment and professional coaching
          </p>
        </div>

        {/* Facilities Grid - Compact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {facilities.map((facility, index) => {
            const Icon = facility.icon
            return (
              <div
                key={index}
                className="group bg-gradient-to-br from-black to-gray-900 rounded-xl p-4 border border-gray-800/50 hover:border-[#50C878]/40 hover:shadow-lg hover:shadow-[#50C878]/10 transition-all duration-300"
              >
                <div className="relative h-32 rounded-lg overflow-hidden mb-3">
                  <Image
                    src={facility.image}
                    alt={facility.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  {facility.comingSoon && (
                    <div className="absolute top-2 right-2 z-10">
                      <span className="px-2 py-1 bg-[#50C878] text-black text-[10px] font-bold uppercase tracking-wider rounded-md">
                        Coming Soon
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2">
                    <div className="w-8 h-8 rounded-lg bg-[#50C878]/90 backdrop-blur-sm flex items-center justify-center">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white dark:text-white mb-2">{facility.name}</h3>
                <div className="space-y-1.5 mb-3">
                  {facility.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-[#50C878]" />
                      <span className="text-xs text-gray-400 dark:text-gray-400">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA Section - Compact */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild className="bg-[#50C878] hover:bg-[#50C878]/90 text-white rounded-lg px-6 py-3 h-auto font-semibold group">
            <Link href="/programs" className="flex items-center gap-2">
              Explore Programs
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-2 border-gray-800 text-white hover:bg-gray-900 rounded-lg px-6 py-3 h-auto font-semibold"
          >
            <Link href="/bookings">Book Drop-in Session</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
