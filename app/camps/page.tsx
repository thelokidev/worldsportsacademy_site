import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, Clock, Users, Trophy, Mail, Phone } from "lucide-react"

export const metadata = {
  title: 'Camps | World Sports Academy',
  description: 'PA Day camps and holiday programs coming soon to World Sports Academy.',
}

export default function CampsPage() {
  return (
    <div className="min-h-screen bg-black pt-20 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1C2A24] via-[#2D5B4A] to-[#50C878] opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(80,200,120,0.3)_0%,_transparent_50%)]" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#50C878]/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#CFEA6C]/10 rounded-full blur-2xl animate-pulse delay-1000" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2.5 mb-6 border border-white/20">
            <Calendar className="w-4 h-4 text-[#CFEA6C]" />
            <span className="text-sm font-semibold text-white">Coming Soon</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            PA Day Camps{' '}
            <span className="bg-gradient-to-r from-white via-[#CFEA6C] to-[#50C878] bg-clip-text text-transparent">
              Coming Soon
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
            Exciting sports camps for kids are on the way! Professional coaching, fun activities, 
            and skill development in a safe and engaging environment.
          </p>

          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-5 py-3 mb-8">
            <span className="text-2xl">🎉</span>
            <span className="text-amber-300 font-semibold">Launching Soon - Stay Tuned!</span>
          </div>
        </div>
      </section>

      {/* What to Expect Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What to Expect</h2>
            <p className="text-lg text-gray-400">Fun, safe, and educational sports camps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Trophy,
                title: 'Skill Development',
                description: 'Learn from professional coaches with proven track records',
                color: 'from-blue-500 to-cyan-500',
              },
              {
                icon: Users,
                title: 'Social Activities',
                description: 'Make new friends while playing sports and games',
                color: 'from-purple-500 to-pink-500',
              },
              {
                icon: Clock,
                title: 'Flexible Schedule',
                description: 'Full-day and half-day options available',
                color: 'from-orange-500 to-red-500',
              },
              {
                icon: Calendar,
                title: 'PA Day Coverage',
                description: 'Perfect solution for school PA days and holidays',
                color: 'from-green-500 to-emerald-500',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div
                  key={idx}
                  className="bg-gray-900 rounded-2xl border border-gray-800 p-6 hover:border-[#50C878]/30 transition-all duration-300"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Age Groups Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Planned Age Groups</h2>
            <p className="text-lg text-gray-400">Programs tailored to different age ranges</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { ages: '5-7 years', name: 'Mini Athletes', emoji: '🌟' },
              { ages: '8-11 years', name: 'Junior Champions', emoji: '⚡' },
              { ages: '12-15 years', name: 'Teen Elite', emoji: '🏆' },
            ].map((group, idx) => (
              <div
                key={idx}
                className="bg-black rounded-2xl border border-gray-800 p-8 text-center"
              >
                <div className="text-5xl mb-4">{group.emoji}</div>
                <h3 className="text-2xl font-bold text-white mb-2">{group.name}</h3>
                <p className="text-[#50C878] font-semibold">{group.ages}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notify Me Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl border border-gray-800 p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#50C878]/10 mb-6">
              <Mail className="w-10 h-10 text-[#50C878]" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Be the First to Know
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Want to be notified when camps are available? Contact us to get on our early notification list!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-gradient-to-r from-[#50C878] to-[#3DA860] hover:from-[#3DA860] hover:to-[#50C878] text-white font-semibold rounded-xl px-8 py-6 h-auto shadow-lg"
              >
                <Link href="mailto:Info@wsateam.com?subject=Camps Notification List">
                  <Mail className="w-5 h-5 mr-2" />
                  Email Us
                </Link>
              </Button>
              
              <Button
                onClick={() => window.location.href = 'tel:+14169831555'}
                variant="outline"
                className="bg-white/10 backdrop-blur-md border-2 border-white text-white hover:bg-white hover:text-black font-semibold rounded-xl px-8 py-6 h-auto shadow-lg"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call: (416) 983-1555
              </Button>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              We'll reach out as soon as registration opens
            </p>
          </div>
        </div>
      </section>

      {/* Meanwhile Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Meanwhile, Check Out Our Other Programs
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Explore our training programs and drop-in sessions available now
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-white text-black hover:bg-gray-100 font-semibold rounded-xl px-8 py-6 h-auto"
            >
              <Link href="/training">View Training Programs</Link>
            </Button>
            
            <Button
              asChild
              variant="outline"
              className="border-2 border-[#50C878] text-[#50C878] hover:bg-[#50C878] hover:text-white font-semibold rounded-xl px-8 py-6 h-auto"
            >
              <Link href="/drop-in">Book Drop-in Session</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
