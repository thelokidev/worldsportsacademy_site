"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Trophy, Users, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const audiences = [
    {
        id: "beginner",
        label: "Beginner",
        title: "Start Your Journey",
        description: "Never held a racket? No problem. Our beginner programs are designed to teach you the fundamentals in a fun, supportive environment.",
        features: ["Learn basic techniques", "Equipment provided", "Group learning", "Fun social atmosphere"],
        image: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?q=80&w=1926&auto=format&fit=crop",
        icon: Users,
        cta: "Book a Trial Session"
    },
    {
        id: "recreational",
        label: "Recreational",
        title: "Stay Active & Have Fun",
        description: "Looking for a great workout and friendly competition? Join our recreational leagues and drop-in sessions to stay fit and meet new people.",
        features: ["Flexible scheduling", "Weekly leagues", "Social events", "Fitness focused"],
        image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1936&auto=format&fit=crop",
        icon: Zap,
        cta: "View Schedule"
    },
    {
        id: "pro",
        label: "Competitive / Pro",
        title: "Reach Peak Performance",
        description: "For athletes aiming for the podium. Our high-performance training includes advanced tactics, physical conditioning, and mental toughness coaching.",
        features: ["Elite coaching", "Video analysis", "Tournament prep", "Strength & conditioning"],
        image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=1999&auto=format&fit=crop",
        icon: Trophy,
        cta: "Apply for Elite Program"
    }
];

export function AudienceTabs() {
    const [activeTab, setActiveTab] = useState("beginner");
    const activeContent = audiences.find(a => a.id === activeTab) || audiences[0];

    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black relative">
            <div className="mx-auto max-w-7xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Training for <span className="text-[#50C878]">Every Level</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Whether you're just starting out or chasing national titles, we have a pathway tailored to your goals.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap justify-center gap-2 mb-12">
                    {audiences.map((audience) => (
                        <button
                            key={audience.id}
                            onClick={() => setActiveTab(audience.id)}
                            className={cn(
                                "px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 border",
                                activeTab === audience.id
                                    ? "bg-[#50C878] text-black border-[#50C878] shadow-lg shadow-[#50C878]/20"
                                    : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:border-white/20"
                            )}
                        >
                            {audience.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden backdrop-blur-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Image Side */}
                        <div className="relative h-64 lg:h-auto min-h-[400px]">
                            <Image
                                src={activeContent.image}
                                alt={activeContent.title}
                                fill
                                className="object-cover transition-opacity duration-500"
                                key={activeContent.image} // Force re-render for animation
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-gray-900/50" />
                        </div>

                        {/* Text Side */}
                        <div className="p-8 md:p-12 flex flex-col justify-center">
                            <div className="w-12 h-12 rounded-xl bg-[#50C878]/10 flex items-center justify-center mb-6">
                                <activeContent.icon className="w-6 h-6 text-[#50C878]" />
                            </div>

                            <h3 className="text-3xl font-bold text-white mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500" key={activeContent.title}>
                                {activeContent.title}
                            </h3>

                            <p className="text-gray-300 mb-8 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100" key={activeContent.description}>
                                {activeContent.description}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                                {activeContent.features.map((feature, idx) => (
                                    <div
                                        key={`${activeContent.id}-${idx}`}
                                        className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500"
                                        style={{ animationDelay: `${150 + (idx * 50)}ms` }}
                                    >
                                        <CheckCircle2 className="w-5 h-5 text-[#50C878] flex-shrink-0" />
                                        <span className="text-gray-300 text-sm">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                asChild
                                className="w-fit bg-white text-black hover:bg-gray-200 font-semibold rounded-lg px-8 py-6 h-auto animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300"
                                key={activeContent.cta}
                            >
                                <Link href="/bookings" className="flex items-center gap-2">
                                    {activeContent.cta}
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
