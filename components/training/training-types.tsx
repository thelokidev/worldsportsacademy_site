"use client"

import { User, Users, Users2, Trophy, ArrowRight, Dumbbell, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const trainingTypes = [
  {
    id: 'one-on-one',
    name: 'Private Coaching',
    description: 'Dedicated 1-on-1 attention to refine technique and strategy.',
    icon: User,
    features: [
      'Personalized development plan',
      'Video analysis & feedback',
      'Flexible scheduling',
    ],
    accentBg: 'bg-blue-500/20',
    accentText: 'text-blue-500',
    gradient: 'from-blue-500/20 to-cyan-500/5',
    border: 'hover:border-blue-500/50',
  },
  {
    id: 'semi-private',
    name: 'Semi-Private',
    description: 'Train with a partner. Perfect for friends or similar skill levels.',
    icon: Users2,
    features: [
      '2:1 Player-to-Coach ratio',
      'Partner drills & tactics',
      'Cost-effective training',
    ],
    accentBg: 'bg-indigo-500/20',
    accentText: 'text-indigo-500',
    gradient: 'from-indigo-500/20 to-purple-500/5',
    border: 'hover:border-indigo-500/50',
  },
  {
    id: 'group',
    name: 'Group Sessions',
    description: 'Dynamic group training to build skills in a social environment.',
    icon: Users,
    features: [
      'Small group dynamic',
      'Match play & scenarios',
      'Community building',
    ],
    accentBg: 'bg-orange-500/20',
    accentText: 'text-orange-500',
    gradient: 'from-orange-500/20 to-red-500/5',
    border: 'hover:border-orange-500/50',
  },
  {
    id: 'high-performance',
    name: 'High Performance',
    description: 'Elite coaching for provincial & national level athletes.',
    icon: Trophy,
    features: [
      'Advanced technical training',
      'Tournament preparation',
      'Strength & conditioning',
    ],
    accentBg: 'bg-yellow-500/20',
    accentText: 'text-yellow-500',
    gradient: 'from-yellow-500/20 to-amber-500/5',
    border: 'hover:border-yellow-500/50',
    elite: true,
  },
]

const comingSoonPrograms = [
  {
    id: 'strength',
    name: 'Strength & Conditioning',
    description: 'Sport-specific fitness programs.',
    icon: Dumbbell,
  },
]

export function TrainingTypes() {
  const handleEnquiry = () => {
    window.location.href = 'tel:+14169831555'
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#050505]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#50C878]" />
            <span className="text-xs font-medium text-gray-300 uppercase tracking-wider">World Class Training</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Choose Your Path
          </h2>
          <p className="text-gray-400 text-lg">
            Led by Coach Abhinay Vaddi, our programs are tailored to elevate your game regardless of your starting point.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {trainingTypes.map((type) => {
            const Icon = type.icon
            return (
              <div
                key={type.id}
                className={`group relative flex flex-col p-6 rounded-2xl bg-[#0A0A0A] border border-white/5 ${type.border} transition-all duration-300 hover:shadow-2xl hover:shadow-black/50 hover:-translate-y-1`}
              >
                {/* Elite Badge */}
                {type.elite && (
                  <div className="absolute top-0 right-0 p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-yellow-500/20 text-yellow-500 border border-yellow-500/20">
                      Elite
                    </span>
                  </div>
                )}

                {/* Gradient Bg Hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${type.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl ${type.accentBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 shrink-0 ${type.accentText}`} aria-hidden />
                </div>

                {/* Content */}
                <div className="relative z-10 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-2">{type.name}</h3>
                  <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                    {type.description}
                  </p>

                  <ul className="space-y-3 mb-8 mt-auto">
                    {type.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs font-medium text-gray-400">
                        <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${type.accentText}`} aria-hidden />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={handleEnquiry}
                    className="w-full bg-white/5 hover:bg-white text-white hover:text-black border border-white/10 hover:border-white transition-all duration-300"
                    size="sm"
                  >
                    Enquire Now
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Coming Soon - Minimal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {comingSoonPrograms.map((program) => {
            const Icon = program.icon
            return (
              <div key={program.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 text-left">
                <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="font-semibold text-white">{program.name}</h4>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">Soon</span>
                  </div>
                  <p className="text-xs text-gray-500">{program.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
