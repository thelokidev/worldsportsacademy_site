"use client"

import { User, Users, Users2, Trophy, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const trainingTypes = [
  {
    id: 'one-on-one',
    name: 'One-on-One',
    description: 'Personal coaching with dedicated attention to your technique, strategy, and game development.',
    icon: User,
    features: [
      'Individualized training plan',
      'Focus on your specific goals',
      'Video analysis included',
      'Flexible scheduling',
    ],
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'semi-private',
    name: 'Semi-Private',
    description: 'Train with a partner under one coach. Perfect for friends or players at similar skill levels.',
    icon: Users2,
    features: [
      '1 coach, 2 trainees',
      'Partner drills and exercises',
      'Competitive practice',
      'Cost-effective option',
    ],
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'group',
    name: 'Group Training',
    description: 'Learn with a group of players in a dynamic and social training environment.',
    icon: Users,
    features: [
      'Small group sizes',
      'Team drills and games',
      'Build community',
      'Great for beginners',
    ],
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'high-performance',
    name: 'High Performance',
    description: 'Elite training for provincial and national level athletes. Advanced tactics and conditioning.',
    icon: Trophy,
    features: [
      'Advanced technical training',
      'Tournament preparation',
      'Mental toughness coaching',
      'Strength & conditioning',
    ],
    color: 'from-yellow-500 to-amber-500',
    premium: true,
  },
]

const comingSoonPrograms = [
  {
    id: 'strength-training',
    name: 'Strength Training',
    description: 'Sport-specific strength and conditioning programs.',
    icon: Trophy,
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'pilates',
    name: 'Pilates',
    description: 'Core strength and flexibility for enhanced performance.',
    icon: User,
    color: 'from-teal-500 to-cyan-500',
  },
]

export function TrainingTypes() {
  const handleEnquiry = () => {
    window.location.href = 'tel:+14169831555' // Abhinay Vaddi's phone
  }

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-0.5 w-10 bg-yellow-400 inline-block" />
            <span className="text-xs tracking-wider text-[#50C878] font-semibold uppercase">Training Options</span>
            <span className="h-0.5 w-10 bg-yellow-400 inline-block" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Choose Your Training Style
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
            All programs are led by Coach Abhinay Vaddi and tailored to your skill level and goals. 
            Available for both Table Tennis and Squash.
          </p>
        </div>

        {/* Training Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {trainingTypes.map((training) => {
            const Icon = training.icon
            return (
              <div
                key={training.id}
                className="group bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden hover:border-[#50C878]/30 transition-all duration-500 hover:shadow-xl relative"
              >
                {training.premium && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-xs font-bold uppercase tracking-wider">
                      Elite
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${training.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#50C878] transition-colors">
                    {training.name}
                  </h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    {training.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {training.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm text-gray-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#50C878]" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    onClick={handleEnquiry}
                    className="w-full bg-gradient-to-r from-[#50C878] to-[#3DA860] hover:from-[#3DA860] hover:to-[#50C878] text-white font-semibold rounded-xl h-12 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Enquire About This Program
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Coming Soon Section */}
        <div className="border-t border-gray-800 pt-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Coming Soon</h3>
            <p className="text-gray-400">More training programs launching soon</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {comingSoonPrograms.map((program) => {
              const Icon = program.icon
              return (
                <div
                  key={program.id}
                  className="relative bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden p-8 opacity-60"
                >
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                      Coming Soon
                    </span>
                  </div>

                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${program.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <h4 className="text-xl font-bold text-white mb-2">{program.name}</h4>
                  <p className="text-gray-400 text-sm">{program.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
