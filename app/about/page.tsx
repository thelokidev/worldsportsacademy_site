import { Footer } from "@/components/footer"
import { CoachSection } from "@/components/coach-section"
import { FacilitiesSection } from "@/components/facilities-section"
import { Users, Trophy, Target, Clock, ArrowRight } from "lucide-react"
import Image from "next/image"

export const metadata = {
  title: 'About Us | World Sports Academy',
  description: 'Premier destination for table tennis and squash training in Canada. Dedicated to excellence in sports training.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black pt-20 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 bg-[#050505]">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#50C878]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Forging <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#50C878] to-[#CFEA6C]">Champions</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            World Sports Academy is Canada's premier destination for elite table tennis and squash training, dedicated to developing the next generation of athletes.
          </p>
        </div>
      </section>

      {/* Stats Strip - Glassmorphism */}
      <section className="relative -mt-20 z-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, number: '500+', label: 'Active Members' },
              { icon: Trophy, number: '50+', label: 'Championships' },
              { icon: Target, number: '10k+', label: 'Sessions' },
              { icon: Clock, number: '15+', label: 'Years Legacy' },
            ].map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div key={idx} className="text-center group">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#50C878]/10 mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-[#50C878]" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.number}</div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 mb-6 text-[#50C878]">
                <span className="w-8 h-[1px] bg-[#50C878]" />
                <span className="text-sm font-bold uppercase tracking-widest">Our Mission</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Excellence is not an act, but a habit.
              </h2>
              <p className="text-lg text-gray-400 mb-6 leading-relaxed">
                We believe that every athlete has the potential to achieve greatness. At World Sports Academy, we provide the environment, expertise, and encouragement needed to unlock that potential.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed mb-8">
                Whether you're picking up a racket for the first time or competing on the international stage, our commitment remains the same: to help you become the best version of yourself, both on and off the court.
              </p>
            </div>
            <div className="order-1 lg:order-2 relative">
              <div className="relative aspect-square rounded-3xl overflow-hidden border border-white/10">
                <Image
                  src="https://images.pexels.com/photos/17299533/pexels-photo-17299533.jpeg?auto=compress&cs=tinysrgb&w=1920"
                  alt="Table tennis and squash excellence at World Sports Academy"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              {/* Decorative Element */}
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[#50C878] rounded-full blur-2xl opacity-20" />
            </div>
          </div>
        </div>
      </section>

      {/* Coach Section Component */}
      <CoachSection />

      {/* Facilities Section Component */}
      <FacilitiesSection />

      <Footer />
    </div>
  )
}
