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
    image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=400&auto=format&fit=crop",
    features: ["4 Professional Courts", "Glass Back Walls", "Tournament Ready"]
  },
  {
    icon: Circle,
    name: "Table Tennis",
    description: "Premium table tennis tables with professional-grade equipment for all skill levels.",
    image: "https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?q=80&w=400&auto=format&fit=crop",
    features: ["6 Competition Tables", "Pro Equipment", "Training Areas"]
  },
  {
    icon: Activity,
    name: "High Performance Gym",
    description: "State-of-the-art fitness equipment and training spaces designed for peak athletic performance.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop",
    features: ["Modern Equipment", "Personal Training", "Recovery Zone"]
  },
  {
    icon: Grid,
    name: "Chess",
    description: "Dedicated chess areas with professional boards for strategic training and competitive matches.",
    image: "https://images.unsplash.com/photo-1580541631950-7282082b53ce?q=80&w=400&auto=format&fit=crop",
    features: ["Quiet Study Areas", "Digital Boards", "Master Coaching"]
  }
]

export function FacilitiesSection() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#50C878]/10 rounded-full blur-3xl" />
      
      <div className="mx-auto max-w-7xl relative z-10">
        {/* Heading row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left copy */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-0.5 w-10 bg-yellow-400 inline-block" />
              <span className="text-xs tracking-wider text-[#50C878] dark:text-[#50C878] font-semibold uppercase">Our Facilities</span>
              <span className="h-0.5 w-10 bg-yellow-400 inline-block" />
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white dark:text-white leading-tight mb-6">
              First-class facilities
              <br />
              for dedicated athletes
            </h2>
            <p className="text-lg text-gray-300 dark:text-gray-300 leading-relaxed mb-8">
              High-performance spaces designed for training, recovery, and results. Everything you need to compete at your best in a world-class environment.
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              <Button asChild className="bg-[#50C878] hover:bg-[#50C878]/90 text-white rounded-lg px-8 py-6 h-auto font-semibold group">
                <Link href="/memberships" className="flex items-center gap-2">
                  Enroll now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-white border-2 border-[#2D5B4A] text-[#2D5B4A] hover:bg-[#2D5B4A] hover:text-white rounded-lg px-8 py-6 h-auto font-semibold"
              >
                <Link href="/bookings">Book a Session</Link>
              </Button>
            </div>
            
            {/* Key highlights */}
            <div className="space-y-3">
              {["Olympic-standard equipment", "Climate-controlled spaces", "Professional coaching available"].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#50C878] flex-shrink-0" />
                  <span className="text-gray-300 dark:text-gray-300 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right image showcase */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="relative h-48 rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=400&auto=format&fit=crop"
                    alt="Squash Courts"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop"
                    alt="Gym Facilities"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src="https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?q=80&w=400&auto=format&fit=crop"
                    alt="Table Tennis"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <div className="relative h-48 rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src="https://images.unsplash.com/photo-1580541631950-7282082b53ce?q=80&w=400&auto=format&fit=crop"
                    alt="Chess Area"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {facilities.map((facility, index) => {
            const Icon = facility.icon
            return (
              <div
                key={index}
                className="group bg-black rounded-2xl p-6 border border-gray-800 hover:border-[#50C878] hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-40 rounded-xl overflow-hidden mb-4">
                  <Image
                    src={facility.image}
                    alt={facility.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <div className="w-10 h-10 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#2D5B4A]" />
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white dark:text-white mb-2">{facility.name}</h3>
                <p className="text-sm text-gray-300 dark:text-gray-300 leading-relaxed mb-4">
                  {facility.description}
                </p>
                <div className="space-y-2">
                  {facility.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#50C878]" />
                      <span className="text-xs text-gray-400 dark:text-gray-400">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA banner */}
        <div className="rounded-2xl bg-black text-white overflow-hidden relative border border-gray-800">
          <div className="relative px-6 sm:px-10 md:px-14 py-14 text-center max-w-3xl mx-auto">
            <p className="uppercase tracking-wider text-[#50C878] dark:text-[#50C878] text-xs mb-3">Get Started</p>
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-white dark:text-white">Join now and
              <br />
              elevate your game!</h3>
            <p className="text-gray-300 dark:text-gray-300 text-sm mb-8 max-w-2xl mx-auto">
              Experience world-class sports facilities including squash courts, table tennis tables, chess areas, and a high-performance gym. Book your session today or explore our membership options.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="mailto:info@worldsportsacademy.com" 
                className="bg-[#50C878] text-white rounded-full px-5 py-2 text-sm shadow-sm hover:bg-[#50C878]/90 transition-colors"
              >
                info@worldsportsacademy.com
              </a>
              <a 
                href="https://maps.google.com/?q=1233+Dillon+Rd,+Burlington,+ON+L7M+1K6,+Canada"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#50C878] text-white rounded-full px-5 py-2 text-sm shadow-sm hover:bg-[#50C878]/90 transition-colors"
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
