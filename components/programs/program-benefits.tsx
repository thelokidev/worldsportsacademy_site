"use client"

import { Target, Users, Trophy, Heart, Brain, Zap } from "lucide-react"

const benefits = [
  {
    icon: Target,
    title: 'Expert Coaching',
    description: 'Learn from certified professionals with years of competitive experience',
  },
  {
    icon: Users,
    title: 'Small Group Sessions',
    description: 'Personalized attention with maximum 4-6 athletes per coach',
  },
  {
    icon: Trophy,
    title: 'Competition Ready',
    description: 'Prepare for tournaments with match simulation and strategy',
  },
  {
    icon: Heart,
    title: 'Fitness Focus',
    description: 'Sport-specific conditioning to enhance your athletic performance',
  },
  {
    icon: Brain,
    title: 'Mental Training',
    description: 'Develop focus, resilience, and winning mindset',
  },
  {
    icon: Zap,
    title: 'Progressive Development',
    description: 'Structured curriculum that advances with your skill level',
  },
]

export function ProgramBenefits() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-gradient-to-br from-[#F8FBF9] to-white">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-0.5 w-10 bg-yellow-400 inline-block" />
            <span className="text-xs tracking-wider text-[#2D5B4A] font-semibold uppercase">Why Choose Us</span>
            <span className="h-0.5 w-10 bg-yellow-400 inline-block" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#2D5B4A] mb-4">
            Train With the Best
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our programs combine technical excellence, physical conditioning, and mental preparation to help you reach your peak performance.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <div
                key={index}
                className="group bg-white rounded-xl p-8 border border-gray-100 hover:border-[#50C878] hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#50C878] to-[#2D5B4A] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#2D5B4A] mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

