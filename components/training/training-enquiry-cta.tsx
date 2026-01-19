"use client"

import { Button } from "@/components/ui/button"
import { Phone, Mail, MessageCircle } from "lucide-react"
import Image from "next/image"

export function TrainingEnquiryCTA() {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2070&auto=format&fit=crop"
              alt="Contact Coach"
              fill
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#1C2A24]/95 via-[#2D5B4A]/90 to-[#50C878]/85" />
          </div>

          {/* Content */}
          <div className="relative px-8 md:px-16 py-16 md:py-20">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-5 py-2.5 mb-6 border border-white/20">
                <span className="w-2.5 h-2.5 rounded-full bg-[#CFEA6C] animate-pulse" />
                <span className="text-sm font-semibold text-white">Get Started Today</span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Ready to Elevate Your Game?
              </h2>
              
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Contact Coach Abhinay Vaddi to discuss your training goals and get a personalized quote. 
                All programs are customized to your skill level and objectives.
              </p>

              {/* Contact Options */}
              <div className="space-y-4 mb-10">
                <Button
                  onClick={() => window.location.href = 'tel:+14169831555'}
                  className="w-full sm:w-auto bg-white text-black hover:bg-gray-100 text-base font-semibold rounded-xl px-8 py-6 h-auto shadow-xl transition-all"
                  size="lg"
                >
                  <Phone className="w-5 h-5 mr-3" />
                  Call: (416) 983-1555
                </Button>

                <Button
                  onClick={() => window.location.href = 'mailto:Info@wsateam.com'}
                  variant="outline"
                  className="w-full sm:w-auto bg-white/10 backdrop-blur-md border-2 border-white text-white hover:bg-white hover:text-[#2D5B4A] text-base font-semibold rounded-xl px-8 py-6 h-auto shadow-xl transition-all ml-0 sm:ml-4"
                  size="lg"
                >
                  <Mail className="w-5 h-5 mr-3" />
                  Email Us
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-white/20">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-[#CFEA6C]" />
                  <span className="text-white/90 text-sm font-medium">Fast Response Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-[#CFEA6C]" />
                  <span className="text-white/90 text-sm font-medium">Flexible Scheduling</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-bold text-white mb-2">Custom Pricing</h3>
            <p className="text-gray-400 text-sm">
              Training rates are customized based on your specific needs, frequency, and program type.
            </p>
          </div>
          
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-bold text-white mb-2">Secure Payment</h3>
            <p className="text-gray-400 text-sm">
              Pay conveniently through our website after your consultation with the coach.
            </p>
          </div>
          
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-bold text-white mb-2">Expert Coaching</h3>
            <p className="text-gray-400 text-sm">
              Learn from experienced coaches with proven track records at all competitive levels.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
