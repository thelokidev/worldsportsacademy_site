"use client"

import { Target, Users, Trophy, Heart, Brain, Zap, CheckCircle2, ArrowRight } from "lucide-react"
import Image from "next/image"

const benefits = [
  {
    icon: Target,
    title: 'Expert Coaching',
    description: 'Learn from certified professionals with years of competitive experience and proven track records',
  },
  {
    icon: Users,
    title: 'Small Group Sessions',
    description: 'Personalized attention with maximum 4-6 athletes per coach for optimal learning',
  },
  {
    icon: Trophy,
    title: 'Competition Ready',
    description: 'Prepare for tournaments with match simulation, strategy sessions, and competitive drills',
  },
  {
    icon: Heart,
    title: 'Fitness Focus',
    description: 'Sport-specific conditioning programs to enhance your athletic performance and endurance',
  },
  {
    icon: Brain,
    title: 'Mental Training',
    description: 'Develop focus, resilience, and winning mindset through proven mental conditioning techniques',
  },
  {
    icon: Zap,
    title: 'Progressive Development',
    description: 'Structured curriculum that advances with your skill level, ensuring continuous improvement',
  },
]

export function ProgramBenefits() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#50C878]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#2D5B4A]/10 rounded-full blur-3xl" />
      
      <div className="mx-auto max-w-7xl relative z-10">
        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left: Content */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-0.5 w-10 bg-yellow-400 inline-block" />
              <span className="text-xs tracking-wider text-[#50C878] dark:text-[#50C878] font-semibold uppercase">Why Choose Us</span>
              <span className="h-0.5 w-10 bg-yellow-400 inline-block" />
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white dark:text-white mb-6 leading-tight">
              Train With the Best
            </h2>
            <p className="text-lg text-gray-300 dark:text-gray-300 mb-8 leading-relaxed">
              Our programs combine technical excellence, physical conditioning, and mental preparation to help you reach your peak performance. Experience the difference that world-class coaching makes.
            </p>
            
            {/* Key highlights */}
            <div className="space-y-4 mb-8">
              {[
                "Certified and experienced coaches",
                "Personalized training programs",
                "State-of-the-art facilities",
                "Proven success methodology"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#50C878]/20 dark:bg-[#50C878]/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-[#50C878] dark:text-[#50C878]" />
                  </div>
                  <span className="text-gray-300 dark:text-gray-300 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Image showcase */}
          <div className="relative">
            <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop"
                alt="Professional Training"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Floating stat cards */}
              <div className="absolute bottom-6 left-6 right-6 grid grid-cols-2 gap-4">
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold text-[#50C878] mb-1">98%</div>
                  <div className="text-xs text-gray-600 font-medium">Success Rate</div>
                </div>
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold text-[#50C878] mb-1">15+</div>
                  <div className="text-xs text-gray-600 font-medium">Expert Coaches</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <div
                key={index}
                className="group bg-black rounded-2xl p-8 border border-gray-800 hover:border-[#50C878] hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 relative overflow-hidden"
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#50C878]/5 rounded-full blur-2xl group-hover:bg-[#50C878]/10 transition-all duration-500" />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#50C878] to-[#2D5B4A] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white dark:text-white mb-3 group-hover:text-[#50C878] transition-colors">{benefit.title}</h3>
                  <p className="text-gray-300 dark:text-gray-300 leading-relaxed text-sm mb-4">{benefit.description}</p>
                  <div className="flex items-center gap-2 text-[#50C878] font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

