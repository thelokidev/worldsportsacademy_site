"use client";

import { useState } from "react";
import { Plus, Minus, Mail, MapPin, ArrowRight } from "lucide-react";
import Image from "next/image";

type Campus = {
  id: string;
  city: string;
  blurb: string;
  email: string;
  address: string;
  image: string;
};

const CAMPUSES: Campus[] = [
  {
    id: "nyc",
    city: "New York, NY",
    blurb:
      "Fermentum hendrerit donec libero lacinia non et in adipiscing gravida eu risus praesent sit orci in sed id lectus augue elementum tortor dui tellus",
    email: "newyork@worldsportsacademy.com",
    address: "123 Main Street, New York, NY 10001",
    image:
      "https://images.unsplash.com/photo-1581952979066-0f8f6f52ff89?q=80&w=2000&auto=format&fit=crop",
  },
  {
    id: "sf",
    city: "San Francisco, CA",
    blurb:
      "Cras porttitor, sapien in efficitur tempor, quam lectus ultrices orci, vitae dictum sem velit a lorem.",
    email: "sanfran@worldsportsacademy.com",
    address: "456 Market St, San Francisco, CA 94105",
    image:
      "https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=2000&auto=format&fit=crop",
  },
  {
    id: "la",
    city: "Los Angeles, CA",
    blurb:
      "Aenean finibus, dui at sodales auctor, dolor nibh posuere eros, ut facilisis augue eros sed odio.",
    email: "losangeles@worldsportsacademy.com",
    address: "789 Sunset Blvd, Los Angeles, CA 90028",
    image:
      "https://images.unsplash.com/photo-1576435728678-68c8f3e5b9f4?q=80&w=2000&auto=format&fit=crop",
  },
];

export function LocationsSection() {
  const [activeId, setActiveId] = useState<string>(CAMPUSES[0].id);
  const active = CAMPUSES.find((c) => c.id === activeId)!;

  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-0.5 w-10 bg-yellow-400 inline-block" />
            <span className="text-xs tracking-wider text-[#2D5B4A] font-semibold uppercase">Locations</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#2D5B4A]">Visit our locations</h2>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left: Accordion */}
          <div>
            {CAMPUSES.map((c) => {
              const isActive = c.id === activeId;
              return (
                <div key={c.id} className="border-b border-gray-200">
                  <button
                    type="button"
                    onClick={() => setActiveId(c.id)}
                    className="w-full flex items-center justify-between py-6"
                  >
                    <span className={`text-xl md:text-2xl font-semibold ${isActive ? "text-[#2D5B4A]" : "text-[#2D5B4A]"}`}>{c.city}</span>
                    <span className="w-8 h-8 rounded-full bg-[#E6F5EC] text-[#2D5B4A] flex items-center justify-center">
                      {isActive ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </button>

                  {isActive && (
                    <div className="pb-6 pt-1">
                      <p className="text-gray-600 text-sm leading-relaxed mb-4 max-w-md">{c.blurb}</p>
                      <div className="flex flex-col gap-3">
                        <a href={`mailto:${c.email}`} className="inline-flex items-center gap-2 text-[#2D5B4A] hover:opacity-80">
                          <Mail className="w-4 h-4" />
                          <span className="text-sm">{c.email}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href="#"
                          className="inline-flex items-center gap-2 text-[#2D5B4A] hover:opacity-80"
                        >
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{c.address}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Image */}
          <div>
            <div className="relative rounded-2xl overflow-hidden h-[360px] md:h-[420px]">
              <Image
                src={active.image}
                alt={active.city}
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
