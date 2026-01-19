"use client"

import { Target, Circle, Grid3x3, Activity, Clock, Users, TrendingUp, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

const programs = [
  {
    id: 'squash',
    name: 'Squash Training',
    icon: Target,
    description: 'Master the court with professional squash coaching for all skill levels.',
    image: '/explore/squash.jpg',
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
    image: '/explore/TT.jpg',
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
    image: '/explore/chess.jpg',
    duration: '90 min sessions',
    level: 'Beginner to Master',
    features: [
      'Opening theory and repertoire',
      'Middlegame tactics',
      'Endgame mastery',
      'Game analysis with coaches',
    ],
    color: 'from-purple-500 to-pink-500',
    comingSoon: true,
  },
  {
    id: 'pilates',
    name: 'Pilates Studio',
    icon: Activity,
    description: 'Strengthen your core and improve flexibility with our comprehensive pilates programs.',
    image: '/explore/pilates.jpg',
    duration: '60 min sessions',
    level: 'All Levels',
    features: [
      'Core strength training',
      'Flexibility improvement',
      'Posture correction',
      'Mind-body connection',
    ],
    color: 'from-green-500 to-emerald-500',
    comingSoon: true,
  },
]

export function ProgramsGrid() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-20 left-0 w-96 h-96 bg-[#50C878]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-0 w-96 h-96 bg-[#2D5B4A]/10 rounded-full blur-3xl" />

      <div className="mx-auto max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-0.5 w-10 bg-yellow-400 inline-block" />
            <span className="text-xs tracking-wider text-[#50C878] dark:text-[#50C878] font-semibold uppercase">Our Programs</span>
            <span className="h-0.5 w-10 bg-yellow-400 inline-block" />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white dark:text-white mb-6 leading-tight">
            Choose Your Path to Excellence
          </h2>
          <p className="text-lg text-gray-300 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Whether you're a beginner or an advanced athlete, our expert-led programs are designed to help you achieve your goals with personalized coaching and proven training methods.
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {programs.map((program, index) => {
            const Icon = program.icon
            return (
              <div
                key={program.id}
                className="group bg-black rounded-3xl border border-gray-800 overflow-hidden hover:shadow-2xl hover:border-[#50C878]/30 transition-all duration-500 hover:-translate-y-1 flex flex-col"
              >
                {/* Image Section */}
                <div className="relative h-72 overflow-hidden flex-shrink-0">
                  <Image
                    src={program.image}
                    alt={program.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-all duration-500" />

                  {/* Animated gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#50C878]/0 to-transparent group-hover:from-[#50C878]/20 transition-all duration-500" />

                  {/* Coming Soon Badge */}
                  {program.comingSoon && (
                    <div className="absolute top-5 left-5 z-20">
                      <span className="px-3 py-1 bg-[#50C878] text-black text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                        Coming Soon
                      </span>
                    </div>
                  )}

                  {/* Icon Badge */}
                  <div className={`absolute top-5 right-5 w-16 h-16 rounded-2xl bg-gradient-to-br ${program.color} flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Program Name Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-2 group-hover:text-[#CFEA6C] transition-colors duration-300">{program.name}</h3>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-white/90">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{program.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/90">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-medium">{program.level}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-8 flex flex-col flex-1">
                  <p className="text-gray-300 dark:text-gray-300 leading-relaxed mb-6 text-base">{program.description}</p>

                  {/* Features List */}
                  <div className="space-y-3 mb-8 flex-1">
                    {program.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3 group/item">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#E6F5EC] to-[#D0F0E0] flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform">
                          <Award className="w-3.5 h-3.5 text-[#50C878]" />
                        </div>
                        <span className="text-sm text-gray-300 dark:text-gray-300 font-medium leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button - Pushed to bottom */}
                  <div className="mt-auto">
                    <Button
                      asChild={!program.comingSoon}
                      disabled={program.comingSoon}
                      className={`w-full bg-gradient-to-r from-[#50C878] to-[#3DA860] hover:from-[#3DA860] hover:to-[#50C878] text-white rounded-xl h-12 font-semibold shadow-lg hover:shadow-xl transition-all group/btn ${program.comingSoon ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {program.comingSoon ? (
                        <span className="flex items-center justify-center gap-2">
                          Coming Soon
                          <Clock className="w-4 h-4" />
                        </span>
                      ) : (
                        <Link href="/drop-in" className="flex items-center justify-center gap-2">
                          Book Drop-in
                          <Users className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-300 dark:text-gray-300 mb-6 text-lg">
            Not sure which program is right for you?
          </p>
          <Button
            asChild
            variant="outline"
            className="border-2 border-[#50C878] text-[#50C878] hover:bg-[#50C878] hover:text-white rounded-lg px-8 py-3 h-auto font-semibold"
          >
            <Link href="mailto:Info@wsateam.com">Contact Our Coaches</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

