"use client"

import { Star, Quote } from "lucide-react"
import Image from "next/image"
import { Card } from "@/components/ui/card"

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
    id: "4",
    name: "James Anderson",
    role: "Fitness Athlete",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop",
    rating: 5,
    quote: "The high-performance gym and personalized training plans have taken my fitness to the next level. This place is a game-changer for serious athletes.",
    sport: "Fitness"
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
      className={`w-3 h-3 ${
        index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-700 dark:text-gray-700"
      }`}
    />
  ))
}

export function TestimonialsSection() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#50C878]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#2D5B4A]/10 rounded-full blur-3xl" />
      
      <div className="mx-auto max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="h-0.5 w-10 bg-yellow-400 inline-block" />
            <span className="text-xs tracking-wider text-[#50C878] dark:text-[#50C878] font-semibold uppercase">
              Testimonials
            </span>
            <span className="h-0.5 w-10 bg-yellow-400 inline-block" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white dark:text-white mb-3">
            What our athletes say
          </h2>
          <p className="text-base text-gray-300 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Join hundreds of satisfied athletes who have transformed their game with World Sports Academy
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll-testimonials gap-6">
            {/* Duplicate testimonials for seamless loop */}
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <Card
                key={`${testimonial.id}-${index}`}
                className="group bg-gradient-to-br from-black to-gray-900 border border-gray-800/50 rounded-xl p-5 hover:shadow-xl hover:shadow-[#50C878]/10 hover:border-[#50C878]/40 transition-all duration-300 relative overflow-hidden flex-shrink-0 w-[320px] md:w-[340px]"
              >
                {/* Quote decoration */}
                <div className="absolute top-3 right-3 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Quote className="w-12 h-12 text-[#50C878]" />
                </div>

                {/* Header: Sport badge and Rating */}
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#50C878]/15 text-[#50C878] text-xs font-semibold">
                    {testimonial.sport}
                  </div>
                  <div className="flex gap-0.5">
                    {renderStars(testimonial.rating)}
                  </div>
                </div>

                {/* Quote */}
                <p className="text-gray-300 dark:text-gray-300 text-sm leading-relaxed mb-4 relative z-10 min-h-[80px]">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-3 border-t border-gray-800">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden ring-1 ring-[#50C878]/30 flex-shrink-0">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-white dark:text-white text-sm truncate">{testimonial.name}</h4>
                    <p className="text-xs text-gray-400 dark:text-gray-400 truncate">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { number: "500+", label: "Happy Athletes" },
            { number: "4.9/5", label: "Average Rating" },
            { number: "98%", label: "Satisfaction Rate" },
            { number: "10k+", label: "Training Sessions" }
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-5 bg-gradient-to-br from-black to-gray-900 rounded-lg border border-gray-800/50 hover:border-[#50C878]/30 hover:shadow-lg hover:shadow-[#50C878]/5 transition-all"
            >
              <div className="text-2xl md:text-3xl font-bold text-[#50C878] mb-1">
                {stat.number}
              </div>
              <div className="text-xs text-gray-300 dark:text-gray-300 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


