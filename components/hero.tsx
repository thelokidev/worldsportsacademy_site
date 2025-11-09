"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
  return (
    <section className="pt-8 pb-12 md:pb-16 px-4 sm:px-6 lg:px-8 mt-[72px]">
      <div className="mx-auto max-w-7xl">
        <div className="relative rounded-2xl overflow-hidden shadow-lg">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />
          </div>

          {/* Content Overlay */}
          <div className="relative min-h-[650px] md:min-h-[700px] flex items-end p-8 md:p-12 lg:p-16">
            <div className="max-w-3xl">
              {/* Hero Text */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-8 tracking-tight">
                Elevate your
                <br />
                performance,
                <br />
                train smarter
              </h1>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button
                  asChild
                  className="bg-[#50C878] hover:bg-[#50C878]/90 text-white text-base font-normal rounded-md px-8 py-3 h-auto shadow-sm"
                  size="lg"
                >
                  <Link href="/memberships">Enroll now</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="bg-white border border-gray-300 text-black hover:bg-gray-50 text-base font-normal rounded-md px-8 py-3 h-auto shadow-sm"
                  size="lg"
                >
                  <Link href="/programs">Explore programs</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

