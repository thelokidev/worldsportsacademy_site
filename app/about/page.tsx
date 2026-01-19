import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Phone, Mail, MapPin, Trophy, Users, Target, Clock } from "lucide-react"

export const metadata = {
  title: 'About Us | World Sports Academy',
  description: 'Learn about World Sports Academy - our mission, facilities, and team dedicated to excellence in sports training.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black pt-20 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1C2A24] via-[#2D5B4A] to-[#50C878] opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(80,200,120,0.2)_0%,_transparent_50%)]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            About{' '}
            <span className="bg-gradient-to-r from-white via-[#CFEA6C] to-[#50C878] bg-clip-text text-transparent">
              World Sports Academy
            </span>
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Premier destination for table tennis and squash training in Canada
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                World Sports Academy is dedicated to developing athletes of all levels through 
                expert coaching, world-class facilities, and a commitment to excellence. Whether 
                you're picking up a racket for the first time or competing at the national level, 
                we provide the environment and expertise to help you reach your goals.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed">
                Our programs emphasize not just technical skill, but also mental toughness, 
                strategic thinking, and the love of the game. We believe in creating a supportive 
                community where athletes can grow, challenge themselves, and achieve their best.
              </p>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop"
                alt="World Sports Academy Facility"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Users, number: '500+', label: 'Active Members' },
              { icon: Trophy, number: '50+', label: 'Championships Won' },
              { icon: Target, number: '10k+', label: 'Sessions Completed' },
              { icon: Clock, number: '15+', label: 'Years Experience' },
            ].map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div key={idx} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#50C878]/10 mb-4">
                    <Icon className="w-8 h-8 text-[#50C878]" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Meet the Team Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-400">Expert coaches dedicated to your success</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative w-48 h-48 rounded-2xl overflow-hidden flex-shrink-0">
                  <Image
                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887&auto=format&fit=crop"
                    alt="Coach Abhinay Vaddi"
                    fill
                    className="object-cover"
                    sizes="192px"
                  />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-white mb-2">Abhinay Vaddi</h3>
                  <p className="text-[#50C878] font-semibold mb-4">Head Coach & Director</p>
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    With over 15 years of coaching experience, Abhinay has trained athletes from 
                    beginners to national champions. His coaching philosophy emphasizes technical 
                    excellence, mental toughness, and a deep love for the sport.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                    <Button
                      asChild
                      className="bg-[#50C878] hover:bg-[#3DA860] text-white"
                      size="sm"
                    >
                      <Link href="tel:+14169831555">
                        <Phone className="w-4 h-4 mr-2" />
                        (416) 983-1555
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                      size="sm"
                    >
                      <Link href="mailto:Info@wsateam.com">
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Facilities</h2>
            <p className="text-lg text-gray-400">World-class equipment and amenities</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-black rounded-2xl border border-gray-800 p-8">
              <div className="text-4xl mb-4">🏓</div>
              <h3 className="text-2xl font-bold text-white mb-3">Table Tennis</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#50C878]" />
                  4 Professional tournament-grade tables
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#50C878]" />
                  High-quality lighting and flooring
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#50C878]" />
                  Climate-controlled environment
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#50C878]" />
                  Training equipment and ball machines
                </li>
              </ul>
            </div>

            <div className="bg-black rounded-2xl border border-gray-800 p-8">
              <div className="text-4xl mb-4">🎾</div>
              <h3 className="text-2xl font-bold text-white mb-3">Squash</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#50C878]" />
                  4 International standard courts
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#50C878]" />
                  Professional-grade walls and floors
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#50C878]" />
                  Optimal ventilation systems
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#50C878]" />
                  Video analysis capabilities
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Location & Contact Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Visit Us</h2>
            <p className="text-lg text-gray-400">Come see our facilities and meet the team</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
              <h3 className="text-xl font-bold text-white mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-[#50C878] mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Phone</div>
                    <a href="tel:+14169831555" className="text-white hover:text-[#50C878] transition-colors">
                      (416) 983-1555
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-[#50C878] mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Email</div>
                    <a href="mailto:Info@wsateam.com" className="text-white hover:text-[#50C878] transition-colors">
                      Info@wsateam.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-[#50C878] mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Location</div>
                    <p className="text-white">
                      World Sports Academy<br />
                      Ontario, Canada
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
              <h3 className="text-xl font-bold text-white mb-6">Hours of Operation</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Monday - Friday</span>
                  <span className="text-white font-medium">6:00 AM - 11:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Saturday - Sunday</span>
                  <span className="text-white font-medium">6:00 AM - 11:00 PM</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-800">
                <p className="text-sm text-gray-400">
                  Hours may vary during holidays. Please call ahead to confirm.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button
              asChild
              className="bg-gradient-to-r from-[#50C878] to-[#3DA860] hover:from-[#3DA860] hover:to-[#50C878] text-white font-semibold rounded-xl px-8 py-6 h-auto shadow-lg"
            >
              <Link href="/drop-in">Book a Visit</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
