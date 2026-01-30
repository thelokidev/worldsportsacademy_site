import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, Clock, Users, Trophy, Mail, Phone, Sparkles, MapPin } from "lucide-react"

export const metadata = {
  title: 'Camps | World Sports Academy',
  description: 'PA Day camps and holiday programs coming soon to World Sports Academy.',
}

export default function CampsPage() {
  return (
    <div className="min-h-screen bg-black pt-20 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 bg-black">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#50C878]/5 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-8 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Registration Opening Soon</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-none">
            Unforgettable <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#50C878] to-[#CFEA6C]">Sports Camps</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
            For PA Days, Holidays, and Summer Break. Give your child the ultimate activity experience with professional coaching and fun games.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-[#50C878] hover:bg-[#45B86A] text-black font-bold h-12 px-8 rounded-full">
              <Link href="#notify">Get Notified</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Trophy,
                title: 'Skill Development',
                description: 'Professional instruction in Table Tennis & Squash.',
                bg: 'bg-blue-500/10',
                text: 'text-blue-500'
              },
              {
                icon: Users,
                title: 'Social Focused',
                description: 'Team activities designed to build friendships.',
                bg: 'bg-purple-500/10',
                text: 'text-purple-500'
              },
              {
                icon: Clock,
                title: 'Extended Hours',
                description: 'Early drop-off and late pick-up options available.',
                bg: 'bg-orange-500/10',
                text: 'text-orange-500'
              },
              {
                icon: Calendar,
                title: 'Year-Round',
                description: 'Camps for every PA Day, March Break, and Summer.',
                bg: 'bg-green-500/10',
                text: 'text-green-500'
              },
            ].map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div
                  key={idx}
                  className="bg-[#0A0A0A] rounded-2xl border border-white/5 p-8 hover:border-white/10 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-6`}>
                    <Icon className={`w-6 h-6 ${feature.text}`} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Age Groups - Interactive Look */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Programs for Every Age</h2>
            <p className="text-gray-400">Tailored activities to ensure maximum engagement and fun.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { range: '5-7 Years', title: 'Mini Athletes', desc: 'Focus on coordination and fun', color: 'border-yellow-500/50' },
              { range: '8-11 Years', title: 'Junior Champs', desc: 'Skill building and game play', color: 'border-[#50C878]/50' },
              { range: '12-15 Years', title: 'Teen Elite', desc: 'Advanced techniques and strategy', color: 'border-blue-500/50' },
            ].map((group, i) => (
              <div key={i} className={`relative p-8 rounded-3xl bg-[#080808] border ${group.color} border-opacity-30 flex flex-col items-center text-center group hover:bg-[#0A0A0A] transition-colors`}>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">{group.range}</div>
                <h3 className="text-2xl font-bold text-white mb-2">{group.title}</h3>
                <p className="text-sm text-gray-400">{group.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notify Section (Sticky/Prominent) */}
      <section id="notify" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#050505]">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#50C878] to-[#CFEA6C] blur-3xl opacity-10 rounded-full" />

          <div className="relative bg-[#0A0A0A] border border-white/10 rounded-3xl p-10 md:p-16 text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Don't Miss Out</h2>
            <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">
              Spots fill up quickly. Join our priority list to get notified 48 hours before public registration opens.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                asChild
                className="bg-white text-black hover:bg-gray-100 font-bold h-14 px-8 rounded-full text-lg w-full sm:w-auto"
              >
                <Link href="mailto:Info@wsateam.com?subject=Add to Camp Waitlist">
                  <Mail className="w-5 h-5 mr-2" />
                  Join Priority List
                </Link>
              </Button>
              <span className="text-gray-500 text-sm font-medium">or</span>
              <Button
                asChild
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 h-14 px-8 rounded-full text-lg w-full sm:w-auto"
              >
                <Link href="tel:+14169831555">
                  Call Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
