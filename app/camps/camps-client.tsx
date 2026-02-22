"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, Clock, Users, Trophy, Mail, Sparkles, Target, Activity, Flame, Phone } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

export function CampsClient() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    })

    // Parallex effects
    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

    const staggerContainer = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
    }

    return (
        <div className="min-h-screen bg-black overflow-x-hidden selection:bg-[#50C878]/30 selection:text-[#50C878]" ref={containerRef}>
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
                {/* Abstract Background */}
                <div className="absolute inset-0 bg-black">
                    <motion.div
                        style={{ y, opacity }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] md:w-[1000px] md:h-[1000px] bg-[#50C878]/10 rounded-full blur-[120px]"
                    />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-xl shadow-2xl shadow-[#50C878]/10 group cursor-default"
                    >
                        <Sparkles className="w-4 h-4 text-[#50C878] group-hover:animate-pulse" />
                        <span className="text-sm font-semibold text-white tracking-wide uppercase">Registration Opening Soon</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                        className="text-6xl md:text-8xl lg:text-9xl font-extrabold text-white mb-6 tracking-tighter leading-[1.1]"
                    >
                        Unleash Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#50C878] via-[#8EEA6C] to-[#50C878]">Potential</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                        className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-12"
                    >
                        The ultimate sports camp experience. Professional coaching, dynamic teamwork, and relentless fun for PA Days, Holidays, and Summer Breaks.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                        className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                    >
                        <Button className="relative group bg-[#50C878] hover:bg-[#45B86A] text-black font-bold h-14 px-10 rounded-full text-lg overflow-hidden transition-all duration-300 transform hover:scale-105" asChild>
                            <Link href="#notify">
                                <span className="relative z-10 flex items-center gap-2">
                                    Get Notified <Mail className="w-5 h-5" />
                                </span>
                                <div className="absolute inset-0 h-full w-full bg-white/20 scale-x-0 group-hover:scale-x-100 transform origin-left transition-transform duration-300 ease-out" />
                            </Link>
                        </Button>
                        <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold h-14 px-10 rounded-full text-lg backdrop-blur-md transition-all duration-300" asChild>
                            <Link href="#features">Explore Camps</Link>
                        </Button>
                    </motion.div>
                </div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-500 animate-bounce"
                >
                    <div className="w-1 h-12 bg-gradient-to-b from-gray-500 to-transparent rounded-full opacity-50" />
                </motion.div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-32 px-4 sm:px-6 lg:px-8 bg-black relative z-10">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">Why Choose Our Camps?</h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">Designed to build confidence, skill, and lasting friendships in a premium facility.</p>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {[
                            {
                                icon: Target,
                                title: 'Elite Coaching',
                                description: 'Professional instruction to elevate your game in Table Tennis & Squash.',
                                color: 'from-blue-500/20 to-blue-500/5',
                                border: 'group-hover:border-blue-500/50',
                                iconColor: 'text-blue-400',
                                iconBg: 'bg-blue-500/10'
                            },
                            {
                                icon: Activity,
                                title: 'Dynamic Play',
                                description: 'High-energy drills, matches, and activities to keep athletes moving.',
                                color: 'from-purple-500/20 to-purple-500/5',
                                border: 'group-hover:border-purple-500/50',
                                iconColor: 'text-purple-400',
                                iconBg: 'bg-purple-500/10'
                            },
                            {
                                icon: Users,
                                title: 'Team Building',
                                description: 'Collaborative challenges designed to build friendships and communication.',
                                color: 'from-orange-500/20 to-orange-500/5',
                                border: 'group-hover:border-orange-500/50',
                                iconColor: 'text-orange-400',
                                iconBg: 'bg-orange-500/10'
                            },
                            {
                                icon: Clock,
                                title: 'Max Flexibility',
                                description: 'Early drop-off and late pick-up options to fit your busy schedule.',
                                color: 'from-[#50C878]/20 to-[#50C878]/5',
                                border: 'group-hover:border-[#50C878]/50',
                                iconColor: 'text-[#50C878]',
                                iconBg: 'bg-[#50C878]/10'
                            },
                        ].map((feature, idx) => {
                            const Icon = feature.icon;
                            return (
                                <motion.div
                                    key={idx}
                                    variants={fadeInUp}
                                    className={`group relative bg-[#050505] rounded-3xl p-8 border border-white/10 w-full ${feature.border} transition-all duration-500 overflow-hidden hover:shadow-2xl hover:-translate-y-2`}
                                >
                                    <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                                    <div className="relative z-10 w-full">
                                        <div className={`w-14 h-14 rounded-2xl ${feature.iconBg} flex items-center justify-center mb-8 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                                            <Icon className={`w-7 h-7 ${feature.iconColor}`} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
                                        <p className="text-gray-400 leading-relaxed text-sm font-medium">{feature.description}</p>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                </div>
            </section>

            {/* Age Groups Section */}
            <section className="py-32 px-4 sm:px-6 lg:px-8 bg-[#020202] relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-16 lg:items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            className="lg:w-1/3 flex flex-col justify-center"
                        >
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Tailored <br /><span className="text-[#50C878]">Programs</span></h2>
                            <p className="text-lg text-gray-400 mb-8">From mastering the basics to advanced competitive strategy, our camps are segmented by age to ensure maximum engagement, safety, and fun.</p>

                            <div className="flex items-center gap-4 text-white p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm w-fit">
                                <Flame className="w-6 h-6 text-orange-500" />
                                <span className="font-semibold">Spots are limited per group</span>
                            </div>
                        </motion.div>

                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, margin: "-100px" }}
                            className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-6"
                        >
                            {[
                                { range: '5-7 Years', title: 'Mini Athletes', desc: 'Focus on fundamental movement, hand-eye coordination, and joyful play.', color: 'border-yellow-500/30 hover:border-yellow-500', glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(234,179,8,0.3)]' },
                                { range: '8-11 Years', title: 'Junior Champs', desc: 'Skill building, technique refinement, and introduction to friendly competition.', color: 'border-[#50C878]/30 hover:border-[#50C878]', glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(80,200,120,0.3)]' },
                                { range: '12-15 Years', title: 'Teen Elite', desc: 'Advanced techniques, strategy, intense drills, and match-play scenarios.', color: 'border-blue-500/30 hover:border-blue-500', glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]' },
                            ].map((group, i) => (
                                <motion.div
                                    key={i}
                                    variants={fadeInUp}
                                    className={`group relative p-8 rounded-3xl bg-[#080808] border ${group.color} ${group.glow} flex flex-col h-full transition-all duration-300 transform hover:-translate-y-2 cursor-default`}
                                >
                                    <div className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4 group-hover:text-white transition-colors">{group.range}</div>
                                    <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{group.title}</h3>
                                    <p className="text-sm text-gray-400 font-medium leading-relaxed flex-grow">{group.desc}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Modern Notify CTA */}
            <section id="notify" className="py-32 px-4 sm:px-6 lg:px-8 relative z-10 overflow-hidden">
                <div className="absolute inset-0 bg-black" />
                <div className="max-w-5xl mx-auto relative">
                    {/* Animated Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#50C878]/20 via-blue-500/20 to-[#50C878]/20 blur-3xl rounded-full opacity-50 animate-pulse pointer-events-none" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="relative bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-10 md:p-20 text-center overflow-hidden shadow-2xl"
                    >
                        {/* Inner glow lines */}
                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

                        <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">Join the <span className="text-[#50C878]">Waitlist</span></h2>
                        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
                            Our camps hit capacity fast. Get exclusive priority access and secure your spot 48 hours before the public.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                            <Button
                                asChild
                                className="bg-white text-black hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 font-bold h-16 px-10 rounded-full text-lg w-full sm:w-auto shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
                            >
                                <Link href="mailto:Info@wsateam.com?subject=Add to Camp Waitlist">
                                    <Mail className="w-5 h-5 mr-3" />
                                    Join Priority List
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="border-white/20 bg-white/5 hover:bg-white/10 text-white transform hover:scale-105 transition-all duration-300 font-bold h-16 px-10 rounded-full text-lg w-full sm:w-auto backdrop-blur-md"
                            >
                                <Link href="tel:+14169831555">
                                    <Phone className="w-5 h-5 mr-3" />
                                    Call Us
                                </Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}
