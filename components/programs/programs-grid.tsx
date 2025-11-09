"use client"

import { Target, Circle, Grid3x3, Dumbbell, Clock, Users, TrendingUp, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

const programs = [
  {
    id: 'squash',
    name: 'Squash Training',
    icon: Target,
    description: 'Master the court with professional squash coaching for all skill levels.',
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
    duration: '60 min sessions',
    level: 'Beginner to Advanced',
    features: [
      'Technical skill development',
      'Match strategy and tactics',
      'Footwork and conditioning',
      'Competitive game analysis',
    ],
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'table-tennis',
    name: 'Table Tennis Program',
    icon: Circle,
    description: 'Develop lightning-fast reflexes and precision with expert table tennis training.',
    image: 'https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
    duration: '60 min sessions',
    level: 'All Levels',
    features: [
      'Serve and return techniques',
      'Spin control mastery',
      'Defensive and offensive play',
      'Tournament preparation',
    ],
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'chess',
    name: 'Chess Academy',
    icon: Grid3x3,
    description: 'Sharpen your strategic thinking with comprehensive chess instruction.',
    image: 'https://images.unsplash.com/photo-1580541631950-7282082b53ce?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
    duration: '90 min sessions',
    level: 'Beginner to Master',
    features: [
      'Opening theory and repertoire',
      'Middlegame tactics',
      'Endgame mastery',
      'Game analysis with coaches',
    ],
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'fitness',
    name: 'High Performance Gym',
    icon: Dumbbell,
    description: 'Achieve peak physical condition with personalized strength and conditioning programs.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
    duration: 'Flexible sessions',
    level: 'All Fitness Levels',
    features: [
      'Personalized training plans',
      'Strength and power development',
      'Sport-specific conditioning',
      'Recovery and nutrition guidance',
    ],
    color: 'from-green-500 to-emerald-500',
  },
]

export function ProgramsGrid() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-0.5 w-10 bg-yellow-400 inline-block" />
            <span className="text-xs tracking-wider text-[#2D5B4A] font-semibold uppercase">Our Programs</span>
            <span className="h-0.5 w-10 bg-yellow-400 inline-block" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#2D5B4A] mb-4">
            Choose Your Path to Excellence
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Whether you're a beginner or an advanced athlete, our expert-led programs are designed to help you achieve your goals.
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {programs.map((program, index) => {
            const Icon = program.icon
            return (
              <div
                key={program.id}
                className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                {/* Image Section */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={program.image}
                    alt={program.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  {/* Icon Badge */}
                  <div className={`absolute top-4 right-4 w-14 h-14 rounded-full bg-gradient-to-br ${program.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Program Name Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-3xl font-bold text-white mb-1">{program.name}</h3>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                  <p className="text-gray-600 mb-6 leading-relaxed">{program.description}</p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 mb-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4 text-[#50C878]" />
                      <span>{program.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <TrendingUp className="w-4 h-4 text-[#50C878]" />
                      <span>{program.level}</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-6">
                    {program.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#E6F5EC] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Award className="w-3 h-3 text-[#50C878]" />
                        </div>
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button
                    asChild
                    className="w-full bg-[#50C878] hover:bg-[#50C878]/90 text-white rounded-lg h-11 font-semibold"
                  >
                    <Link href="/bookings">Start Training</Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-6 text-lg">
            Not sure which program is right for you?
          </p>
          <Button
            asChild
            variant="outline"
            className="border-2 border-[#2D5B4A] text-[#2D5B4A] hover:bg-[#2D5B4A] hover:text-white rounded-lg px-8 py-3 h-auto font-semibold"
          >
            <Link href="mailto:info@worldsportsacademy.com">Contact Our Coaches</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

