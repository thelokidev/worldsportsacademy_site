"use client";

import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Sport {
  id: string;
  name: string;
  image: string;
  days: string;
  time: string;
}

const sports: Sport[] = [
  {
    id: "table-tennis",
    name: "Table Tennis",
    image: "https://images.unsplash.com/photo-1606158770111-c69c0d0f0c0b?q=80&w=2070&auto=format&fit=crop",
    days: "Mon to Fri",
    time: "3:00PM - 6:00 PM",
  },
  {
    id: "squash",
    name: "Squash",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=2070&auto=format&fit=crop",
    days: "Tue to Sun",
    time: "4:00PM - 7:00 PM",
  },
  {
    id: "checkers",
    name: "Checkers",
    image: "https://images.unsplash.com/photo-1585504198199-20277593b94f?q=80&w=2070&auto=format&fit=crop",
    days: "Wed and Fri",
    time: "2:00PM - 4:00 PM",
  },
  {
    id: "chess",
    name: "Chess",
    image: "https://images.unsplash.com/photo-1528819622765-d6bcf132ac08?q=80&w=2070&auto=format&fit=crop",
    days: "Tue and Thu",
    time: "1:00PM - 3:00 PM",
  },
];

export function SportsSection() {
  return (
    <section className="py-16 px-4 relative overflow-hidden bg-white">
      {/* Decorative yellow threads */}
      <div className="pointer-events-none absolute top-6 right-0 w-72 h-72 md:w-80 md:h-80 opacity-80 -z-0">
        <svg viewBox="0 0 300 300" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 120 C90 40 170 200 250 120" stroke="#CFEA6C" strokeWidth="12" strokeLinecap="round" />
          <path d="M40 150 C120 70 200 230 280 150" stroke="#CFEA6C" strokeWidth="6" strokeLinecap="round" />
        </svg>
      </div>
      <div className="pointer-events-none absolute -bottom-6 -left-4 w-[420px] h-[220px] opacity-80 -z-0">
        <svg viewBox="0 0 420 220" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 160 C120 100 200 220 310 160 C360 130 390 130 410 140" stroke="#CFEA6C" strokeWidth="10" strokeLinecap="round" />
          <path d="M-20 120 C100 40 220 180 340 120" stroke="#CFEA6C" strokeWidth="6" strokeLinecap="round" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl relative z-10">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-12">
          <div className="flex-1 max-w-2xl">
            {/* Label */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-semibold text-black uppercase tracking-wider">
                SPORTS
              </span>
              <div className="h-0.5 w-12 bg-yellow-400" />
            </div>

            {/* Title */}
            <h2 className="text-4xl md:text-5xl font-bold text-[#2D5B4A] mb-4">
              Explore our sports
            </h2>

            {/* Description */}
            <p className="text-gray-600 text-base leading-relaxed">
              Fermentum hendrerit donec libero lacinia non et in adipiscing gravida eu risus praesent sit orci in sed id nibh facilisis
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 lg:flex-shrink-0">
            <Button
              className="bg-[#50C878] hover:bg-[#50C878]/90 text-white text-base font-normal rounded-md px-8 py-3 h-auto shadow-sm whitespace-nowrap"
              size="lg"
            >
              Enroll now
            </Button>
            <Button
              variant="outline"
              className="bg-white border border-gray-300 text-black hover:bg-gray-50 text-base font-normal rounded-md px-8 py-3 h-auto shadow-sm whitespace-nowrap"
              size="lg"
            >
              Browse all sports
            </Button>
          </div>
        </div>

        {/* Sports Cards Grid - 1 + 2 + 1 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: tall card */}
          <div>
            <Link href="/bookings">
              <div className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer h-[440px]">
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('${sports[0].image}')` }}
              >
                <div className="absolute inset-0 bg-black/30" />
              </div>
              <div className="absolute top-6 left-6 z-10">
                <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight">{sports[0].name}</h3>
              </div>
              <div className="absolute top-6 right-6 z-10 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-white" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-4 z-10">
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2">
                    <Calendar className="w-4 h-4 text-black" />
                    <span className="text-black text-sm font-medium whitespace-nowrap">{sports[0].days}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2">
                    <Clock className="w-4 h-4 text-black" />
                    <span className="text-black text-sm font-medium whitespace-nowrap">{sports[0].time}</span>
                  </div>
                </div>
              </div>
              </div>
            </Link>
          </div>

          {/* Middle column: two stacked cards */}
          <div className="flex flex-col gap-6">
            {[sports[1], sports[2]].map((sport) => (
              <Link key={sport.id} href="/bookings">
                <div className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer h-[210px]">
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url('${sport.image}')` }}
                >
                  <div className="absolute inset-0 bg-black/30" />
                </div>
                <div className="absolute top-4 left-4 z-10">
                  <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">{sport.name}</h3>
                </div>
                <div className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-3 z-10">
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5">
                      <Calendar className="w-4 h-4 text-black" />
                      <span className="text-black text-sm font-medium whitespace-nowrap">{sport.days}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5">
                      <Clock className="w-4 h-4 text-black" />
                      <span className="text-black text-sm font-medium whitespace-nowrap">{sport.time}</span>
                    </div>
                  </div>
                </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Right column: tall card */}
          <div>
            <Link href="/bookings">
              <div className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer h-[440px]">
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('${sports[3].image}')` }}
              >
                <div className="absolute inset-0 bg-black/30" />
              </div>
              <div className="absolute top-6 left-6 z-10">
                <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight">{sports[3].name}</h3>
              </div>
              <div className="absolute top-6 right-6 z-10 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-white" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-4 z-10">
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2">
                    <Calendar className="w-4 h-4 text-black" />
                    <span className="text-black text-sm font-medium whitespace-nowrap">{sports[3].days}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2">
                    <Clock className="w-4 h-4 text-black" />
                    <span className="text-black text-sm font-medium whitespace-nowrap">{sports[3].time}</span>
                  </div>
                </div>
              </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}