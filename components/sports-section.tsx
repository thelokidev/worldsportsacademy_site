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
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gray-900 dark:bg-gray-900">
      {/* Background decoration */}
      <div className="absolute top-20 left-0 w-72 h-72 bg-[#50C878]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-0 w-96 h-96 bg-[#2D5B4A]/10 rounded-full blur-3xl" />
      
      <div className="mx-auto max-w-7xl relative z-10">
        {/* Header Section */}
        <div className="mb-16">
          <div className="max-w-3xl">
            {/* Label */}
            <div className="flex items-center gap-3 mb-4">
              <span className="h-0.5 w-10 bg-yellow-400 inline-block" />
              <span className="text-xs tracking-wider text-[#50C878] dark:text-[#50C878] font-semibold uppercase">
                Our Sports
              </span>
              <span className="h-0.5 w-10 bg-yellow-400 inline-block" />
            </div>

            {/* Title */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white dark:text-white mb-6 leading-tight">
              Explore our sports programs
            </h2>

            {/* Description */}
            <p className="text-lg text-gray-300 dark:text-gray-300 leading-relaxed">
              From competitive squash to strategic chess, discover world-class training facilities and expert coaching across multiple disciplines. Choose your path to excellence.
            </p>
          </div>
        </div>

        {/* Sports Cards Grid - 1 + 2 + 1 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: tall card */}
          <div>
            <Link href="/bookings">
              <div className="group relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer h-[440px] border border-gray-800 dark:border-gray-800">
              <Image
                src={sports[0].image}
                alt={sports[0].name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                sizes="(max-width: 1024px) 100vw, 33vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/70 group-hover:from-black/30 group-hover:to-black/80 transition-all duration-500" />
              
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#50C878]/0 to-transparent group-hover:from-[#50C878]/30 transition-all duration-500" />
              
              <div className="absolute top-6 left-6 z-10">
                <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight group-hover:text-[#CFEA6C] transition-colors duration-300">{sports[0].name}</h3>
              </div>
              <div className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 group-hover:bg-[#50C878] group-hover:border-[#50C878] transition-all duration-300 group-hover:scale-110">
                <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform duration-300" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-md p-5 z-10 group-hover:bg-black/80 transition-all duration-300">
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2 bg-white group-hover:bg-[#50C878] rounded-lg px-3 py-2 transition-all duration-300">
                    <Calendar className="w-4 h-4 text-black group-hover:text-white transition-colors" />
                    <span className="text-black group-hover:text-white text-sm font-medium whitespace-nowrap transition-colors">{sports[0].days}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white group-hover:bg-[#50C878] rounded-lg px-3 py-2 transition-all duration-300">
                    <Clock className="w-4 h-4 text-black group-hover:text-white transition-colors" />
                    <span className="text-black group-hover:text-white text-sm font-medium whitespace-nowrap transition-colors">{sports[0].time}</span>
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
                <div className="group relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer h-[210px] border border-gray-800 dark:border-gray-800">
                <Image
                  src={sport.image}
                  alt={sport.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/70 group-hover:from-black/30 group-hover:to-black/80 transition-all duration-500" />
                
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#50C878]/0 to-transparent group-hover:from-[#50C878]/30 transition-all duration-500" />
                
                <div className="absolute top-4 left-4 z-10">
                  <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight group-hover:text-[#CFEA6C] transition-colors duration-300">{sport.name}</h3>
                </div>
                <div className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 group-hover:bg-[#50C878] group-hover:border-[#50C878] transition-all duration-300 group-hover:scale-110">
                  <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform duration-300" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-md p-3 z-10 group-hover:bg-black/80 transition-all duration-300">
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-2 bg-white group-hover:bg-[#50C878] rounded-lg px-3 py-1.5 transition-all duration-300">
                      <Calendar className="w-4 h-4 text-black group-hover:text-white transition-colors" />
                      <span className="text-black group-hover:text-white text-sm font-medium whitespace-nowrap transition-colors">{sport.days}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white group-hover:bg-[#50C878] rounded-lg px-3 py-1.5 transition-all duration-300">
                      <Clock className="w-4 h-4 text-black group-hover:text-white transition-colors" />
                      <span className="text-black group-hover:text-white text-sm font-medium whitespace-nowrap transition-colors">{sport.time}</span>
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
              <div className="group relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer h-[440px] border border-gray-800 dark:border-gray-800">
              <Image
                src={sports[3].image}
                alt={sports[3].name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                sizes="(max-width: 1024px) 100vw, 33vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/70 group-hover:from-black/30 group-hover:to-black/80 transition-all duration-500" />
              
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#50C878]/0 to-transparent group-hover:from-[#50C878]/30 transition-all duration-500" />
              
              <div className="absolute top-6 left-6 z-10">
                <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight group-hover:text-[#CFEA6C] transition-colors duration-300">{sports[3].name}</h3>
              </div>
              <div className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 group-hover:bg-[#50C878] group-hover:border-[#50C878] transition-all duration-300 group-hover:scale-110">
                <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform duration-300" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-md p-5 z-10 group-hover:bg-black/80 transition-all duration-300">
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2 bg-white group-hover:bg-[#50C878] rounded-lg px-3 py-2 transition-all duration-300">
                    <Calendar className="w-4 h-4 text-black group-hover:text-white transition-colors" />
                    <span className="text-black group-hover:text-white text-sm font-medium whitespace-nowrap transition-colors">{sports[3].days}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white group-hover:bg-[#50C878] rounded-lg px-3 py-2 transition-all duration-300">
                    <Clock className="w-4 h-4 text-black group-hover:text-white transition-colors" />
                    <span className="text-black group-hover:text-white text-sm font-medium whitespace-nowrap transition-colors">{sports[3].time}</span>
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