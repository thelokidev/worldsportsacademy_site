"use client";

import { Mail, MapPin, ArrowRight } from "lucide-react";
import Image from "next/image";

export function LocationsSection() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-20 bg-black">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-0.5 w-10 bg-yellow-400 inline-block" />
            <span className="text-xs tracking-wider text-[#50C878] dark:text-[#50C878] font-semibold uppercase">Location</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white dark:text-white">Visit our location</h2>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left: Location Details */}
          <div>
            <div className="mb-6">
              <h3 className="text-2xl md:text-3xl font-bold text-white dark:text-white mb-4">
                Burlington, Ontario
              </h3>
              <p className="text-gray-300 dark:text-gray-300 text-base leading-relaxed mb-6 max-w-md">
                Our state-of-the-art facility in Burlington, Ontario offers world-class sports facilities including squash courts, table tennis tables, chess areas, and a pilates studio. Visit us to experience premium athletic training and competition spaces.
              </p>
              <div className="flex flex-col gap-4">
                <a
                  href="mailto:Info@wsateam.com"
                  className="inline-flex items-center gap-3 text-[#50C878] dark:text-[#50C878] hover:opacity-80 transition-opacity group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#50C878]/20 dark:bg-[#50C878]/20 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-[#50C878] dark:text-[#50C878]" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-400 dark:text-gray-400 block">Email</span>
                    <span className="text-base font-medium text-white dark:text-white">Info@wsateam.com</span>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-[#50C878] dark:text-[#50C878]" />
                </a>
                <a
                  href="https://maps.google.com/?q=1233+Dillon+Rd,+Burlington,+ON+L7M+1K6,+Canada"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-[#50C878] dark:text-[#50C878] hover:opacity-80 transition-opacity group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#50C878]/20 dark:bg-[#50C878]/20 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#50C878] dark:text-[#50C878]" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-400 dark:text-gray-400 block">Address</span>
                    <span className="text-base font-medium text-white dark:text-white">1233 Dillon Rd, Burlington, ON L7M 1K6, Canada</span>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-[#50C878] dark:text-[#50C878]" />
                </a>
              </div>
            </div>
          </div>

          {/* Right: Image */}
          <div>
            <div className="relative rounded-2xl overflow-hidden h-[360px] md:h-[420px] shadow-lg">
              <Image
                src="/loca/ariel.jpg"
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
