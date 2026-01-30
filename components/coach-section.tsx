"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Award, Star, Trophy, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function CoachSection() {
    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#50C878]/5 rounded-full blur-3xl" />

            <div className="mx-auto max-w-7xl relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Image Column */}
                    <div className="relative">
                        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-gray-800 bg-gray-900">
                            {/* Placeholder for Coach Image - using a professional looking placeholder or user can replace */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                            <Image
                                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887&auto=format&fit=crop"
                                alt="Coach Abhinay Vaddi"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />

                            {/* Floating Stats */}
                            <div className="absolute bottom-6 left-6 right-6 z-20">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                                        <div className="text-3xl font-bold text-[#50C878]">15+</div>
                                        <div className="text-xs text-gray-300 uppercase tracking-wider font-medium">Years Experience</div>
                                    </div>
                                    <div className="bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                                        <div className="text-3xl font-bold text-[#CFEA6C]">500+</div>
                                        <div className="text-xs text-gray-300 uppercase tracking-wider font-medium">Athletes Trained</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative elements behind */}
                        <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-[#50C878]/30 rounded-tl-3xl -z-10" />
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-2 border-r-2 border-[#50C878]/30 rounded-br-3xl -z-10" />
                    </div>

                    {/* Content Column */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="h-0.5 w-10 bg-yellow-400 inline-block" />
                            <span className="text-xs tracking-wider text-[#50C878] font-semibold uppercase">
                                Meet the Head Coach
                            </span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                            Expert guidance for <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#50C878] to-[#CFEA6C]">
                                every step of your journey
                            </span>
                        </h2>

                        <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                            "My philosophy is simple: every athlete has untapped potential. Whether you're picking up a racket for the first time or aiming for national rankings, my goal is to provide the technical foundation and strategic mindset you need to excel."
                        </p>

                        <div className="space-y-6 mb-10">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#50C878]/10 flex items-center justify-center flex-shrink-0">
                                    <Award className="w-6 h-6 text-[#50C878]" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">Certified Professional</h3>
                                    <p className="text-gray-400">Internationally recognized coaching certifications and continuous professional development.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#50C878]/10 flex items-center justify-center flex-shrink-0">
                                    <Trophy className="w-6 h-6 text-[#50C878]" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">Proven Track Record</h3>
                                    <p className="text-gray-400">History of developing state and national level champions across multiple age categories.</p>
                                </div>
                            </div>
                        </div>

                        <Button
                            asChild
                            className="bg-[#50C878] hover:bg-[#50C878]/90 text-white text-base font-semibold rounded-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all group"
                        >
                            <Link href="/bookings" className="flex items-center gap-2">
                                Book a Session
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
