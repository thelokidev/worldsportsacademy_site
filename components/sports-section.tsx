"use client";

import { Calendar, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
    image: "https://images.unsplash.com/photo-1622163642998-5f44b8f1c3c0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
    days: "Mon to Fri",
    time: "3:00PM - 6:00 PM",
  },
  {
    id: "squash",
    name: "Squash",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
    days: "Tue to Sun",
    time: "4:00PM - 7:00 PM",
  },
  {
    id: "gym",
    name: "Gym",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
    days: "Daily",
    time: "6:00AM - 11:00 PM",
  },
  {
    id: "chess",
    name: "Chess",
    image: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
    days: "Tue and Thu",
    time: "1:00PM - 3:00 PM",
  },
];

export function SportsSection() {
  return (
    <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-white">
      <div className="mx-auto max-w-7xl relative z-10">
        {/* Header Section */}
        <div className="mb-12">
          <div className="max-w-2xl">
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
        </div>

        {/* Sports Cards Grid - 1 + 2 + 1 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: tall card */}
          <div>
            <Link href="/bookings">
              <div className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer h-[440px]">
              <Image
                src={sports[0].image}
                alt={sports[0].name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 33vw"
                priority
              />
              <div className="absolute inset-0 bg-black/30" />
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
                <Image
                  src={sport.image}
                  alt={sport.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/30" />
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
              <Image
                src={sports[3].image}
                alt={sports[3].name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 33vw"
                priority
              />
              <div className="absolute inset-0 bg-black/30" />
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