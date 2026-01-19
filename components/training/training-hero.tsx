"use client"

import Image from "next/image"

export function TrainingHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background with dual images */}
      <div className="relative h-[500px] md:h-[600px]">
        <div className="absolute inset-0 grid grid-cols-2">
          {/* Table Tennis Side */}
          <div className="relative">
            <Image
              src="/explore/TT.jpg"
              alt="Table Tennis Training"
              fill
              className="object-cover"
              sizes="50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/80" />
          </div>
          
          {/* Squash Side */}
          <div className="relative">
            <Image
              src="/explore/squash.jpg"
              alt="Squash Training"
              fill
              className="object-cover"
              sizes="50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/40 to-black/80" />
          </div>
        </div>
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black" />
        
        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2.5 mb-6 border border-white/20">
              <span className="w-2.5 h-2.5 rounded-full bg-[#CFEA6C] animate-pulse" />
              <span className="text-sm font-semibold text-white">Professional Coaching</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Train Like a{' '}
              <span className="bg-gradient-to-r from-white via-[#CFEA6C] to-[#50C878] bg-clip-text text-transparent">
                Champion
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Elite coaching for table tennis and squash. From beginners learning the fundamentals to 
              provincial and national level athletes refining their game.
            </p>
          </div>
        </div>
      </div>
      
      {/* Info Banner */}
      <div className="bg-gradient-to-r from-[#2D5B4A] to-[#50C878] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-white text-sm md:text-base">
            <span className="font-bold">Custom Pricing:</span> Contact us for personalized rates based on your training needs • Pay securely via our website
          </p>
        </div>
      </div>
    </section>
  )
}
