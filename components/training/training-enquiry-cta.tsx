"use client"

import { Button } from "@/components/ui/button"
import { Phone, Mail, ArrowRight, CheckCircle2 } from "lucide-react"

export function TrainingEnquiryCTA() {
  return (
    <section className="relative py-24 bg-black overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#50C878]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left Column: Heading & Text */}
          <div>
            <div className="inline-flex items-center gap-2 mb-6 text-[#50C878]">
              <span className="w-8 h-[1px] bg-[#50C878]" />
              <span className="text-sm font-bold uppercase tracking-widest">Enrollment Open</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              Ready to <br />
              <span className="text-[#50C878]">Level Up?</span>
            </h2>

            <p className="text-xl text-gray-400 mb-8 leading-relaxed max-w-lg">
              Unlock your potential with specialized coaching packages. Whether you're aiming for the podium or just starting out, we have a plan for you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => window.location.href = 'tel:+14169831555'}
                size="lg"
                className="bg-[#50C878] hover:bg-[#45B86A] text-black font-semibold h-14 px-8 rounded-full text-base"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call (416) 983-1555
              </Button>

              <Button
                onClick={() => window.location.href = 'mailto:Info@wsateam.com'}
                variant="outline"
                size="lg"
                className="bg-transparent border-gray-700 text-white hover:bg-white hover:text-black hover:border-white font-semibold h-14 px-8 rounded-full text-base"
              >
                <Mail className="w-5 h-5 mr-2" />
                Email Us
              </Button>
            </div>
          </div>

          {/* Right Column: Key Benefits / Info */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#111] to-[#050505] rounded-3xl transform rotate-3 scale-105 opacity-50 border border-white/5" />
            <div className="relative bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6">Why train with us?</h3>

              <div className="space-y-6">
                {[
                  { title: 'Custom Pricing', desc: 'Tailored rates based on training frequency and goals.' },
                  { title: 'Expert Coaching', desc: 'Led by Abhinay Vaddi, a proven high-performance coach.' },
                  { title: 'Flexible Schedule', desc: 'Morning, evening, and weekend slots available.' },
                  { title: 'All Skill Levels', desc: 'From complete beginners to national competitors.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1 w-6 h-6 rounded-full bg-[#50C878]/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#50C878]" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-base">{item.title}</h4>
                      <p className="text-gray-400 text-sm mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-white/5">
                <p className="text-sm text-gray-500 text-center">
                  Secure payments accepted via credit card or e-transfer.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
