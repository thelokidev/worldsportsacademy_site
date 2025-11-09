"use client";

import { Mail, MapPin, ArrowRight } from "lucide-react";
import Image from "next/image";

export function LocationsSection() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-0.5 w-10 bg-yellow-400 inline-block" />
            <span className="text-xs tracking-wider text-[#2D5B4A] font-semibold uppercase">Location</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#2D5B4A]">Visit our location</h2>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left: Location Details */}
          <div>
            <div className="mb-6">
              <h3 className="text-2xl md:text-3xl font-bold text-[#2D5B4A] mb-4">
                Burlington, Ontario
              </h3>
              <p className="text-gray-600 text-base leading-relaxed mb-6 max-w-md">
                Our state-of-the-art facility in Burlington, Ontario offers world-class sports facilities including squash courts, table tennis tables, chess areas, and a high-performance gym. Visit us to experience premium athletic training and competition spaces.
              </p>
              <div className="flex flex-col gap-4">
                <a
                  href="mailto:info@worldsportsacademy.com"
                  className="inline-flex items-center gap-3 text-[#2D5B4A] hover:opacity-80 transition-opacity group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#E6F5EC] flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block">Email</span>
                    <span className="text-base font-medium">info@worldsportsacademy.com</span>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
                <a
                  href="https://maps.google.com/?q=1233+Dillon+Rd,+Burlington,+ON+L7M+1K6,+Canada"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-[#2D5B4A] hover:opacity-80 transition-opacity group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#E6F5EC] flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block">Address</span>
                    <span className="text-base font-medium">1233 Dillon Rd, Burlington, ON L7M 1K6, Canada</span>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>
            </div>
          </div>

          {/* Right: Image */}
          <div>
            <div className="relative rounded-2xl overflow-hidden h-[360px] md:h-[420px] shadow-lg">
              <Image
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
                alt="World Sports Academy - Burlington, Ontario"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
