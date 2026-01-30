"use client"

import { Star, Quote, Trophy, Users, Activity, Calendar } from "lucide-react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Testimonial {
  id: string
  name: string
  role: string
  image: string
  rating: number
  quote: string
  sport: string
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    role: "Professional Squash Player",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop",
    rating: 5,
    quote: "The coaching at World Sports Academy transformed my game completely. The personalized training programs and world-class facilities helped me reach the national championships.",
    sport: "Squash"
  },
  {
    id: "2",
    name: "Michael Chen",
    role: "Table Tennis Enthusiast",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop",
    rating: 5,
    quote: "I've been training here for 2 years and the improvement in my technique has been remarkable. The coaches are incredibly knowledgeable and supportive.",
    sport: "Table Tennis"
  },
  {
    id: "3",
    name: "Emma Rodriguez",
    role: "Chess Master Candidate",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=256&auto=format&fit=crop",
    rating: 5,
    quote: "The chess program here is exceptional. The strategic training and competitive environment have helped me achieve my master rating faster than I ever imagined.",
    sport: "Chess"
  },
  {
    id: "5",
    name: "Priya Patel",
    role: "Junior Squash Champion",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop",
    rating: 5,
    quote: "As a junior player, the academy provided me with everything I needed to compete at the highest level. The facilities and coaching are truly world-class.",
    sport: "Squash"
  }
]

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }).map((_, index) => (
    <Star
      key={index}
      className={cn(
        "w-3.5 h-3.5",
        index < rating ? "fill-[#50C878] text-[#50C878]" : "text-gray-700"
      )}
    />
  ))
}

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#50C878]/10 rounded-[100%] blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl relative z-10 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#50C878]/10 border border-[#50C878]/20 mb-6">
            <Star className="w-4 h-4 text-[#50C878] fill-[#50C878]" />
            <span className="text-sm font-semibold text-[#50C878] uppercase tracking-wide">Success Stories</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            Voices of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#50C878] to-[#CFEA6C]">Victory</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Discover how World Sports Academy is shaping the next generation of champions through expert coaching and dedication.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative -mx-4 sm:mx-0 mb-24 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

          <div className="flex animate-scroll-testimonials gap-6 py-4">
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <div
                key={`${testimonial.id}-${index}`}
                className="group relative w-[350px] flex-shrink-0"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-[#50C878]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl" />
                <Card className="relative h-full bg-zinc-900/40 backdrop-blur-xl border-white/10 p-8 rounded-2xl hover:border-[#50C878]/30 transition-all duration-300 hover:-translate-y-1">
                  {/* Quote Icon */}
                  <Quote className="absolute top-6 right-6 w-10 h-10 text-[#50C878]/10 group-hover:text-[#50C878]/20 transition-colors" />

                  {/* Content */}
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-1 mb-6">
                      {renderStars(testimonial.rating)}
                    </div>

                    <blockquote className="flex-1 text-lg text-gray-300 leading-relaxed mb-8 font-light italic">
                      "{testimonial.quote}"
                    </blockquote>

                    <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#50C878]/20 group-hover:ring-[#50C878] transition-all">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-[#50C878] transition-colors">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#50C878]" />
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section - Redesigned */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 border-t border-white/10 pt-16">
          {[
            { number: "500+", label: "Happy Athletes", icon: Users },
            { number: "4.9/5", label: "Average Rating", icon: Star },
            { number: "98%", label: "Satisfaction Rate", icon: Activity },
            { number: "10k+", label: "Sessions Completed", icon: Trophy }
          ].map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="flex flex-col items-center text-center group">
                <div className="w-12 h-12 rounded-2xl bg-[#50C878]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-[#50C878]" />
                </div>
                <div className="text-4xl font-bold text-white mb-2 tracking-tight group-hover:text-[#50C878] transition-colors">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-400 font-medium uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
