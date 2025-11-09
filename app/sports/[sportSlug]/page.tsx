import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Calendar, Clock, DollarSign, Users } from 'lucide-react'
import { formatDuration } from '@/lib/utils/duration'

async function getSportBySlug(slug: string) {
  const supabase = await createClient()

  const { data: sport } = await supabase
    .from('sports')
    .select(`
      *,
      sport_settings:sport_settings!sport_id (
        status,
        weekday_hours,
        weekend_hours
      ),
      drop_in_pricing:drop_in_pricing!sport_id (
        price,
        duration_minutes,
        tax_rate
      ),
      training_programs:training_programs!sport_id (
        id,
        name,
        description,
        type,
        coordinator_name,
        coordinator_email,
        coordinator_phone
      )
    `)
    .eq('name', slug)
    .single()

  return sport
}

export default async function SportPage({
  params,
}: {
  params: Promise<{ sportSlug: string }>
}) {
  const { sportSlug } = await params
  const sport = await getSportBySlug(sportSlug)

  if (!sport) {
    notFound()
  }

  const settings = (sport.sport_settings as any)?.[0]
  const pricing = (sport.drop_in_pricing as any) || []
  const trainingPrograms = (sport.training_programs as any) || []
  const isComingSoon = settings?.status === 'coming_soon'

  return (
    <div className="min-h-screen bg-white pt-16 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1C2A24] via-[#2D5B4A] to-[#50C878] py-12 md:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.15)_0%,_rgba(255,255,255,0)_60%)] mix-blend-overlay" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-semibold text-white/90 uppercase tracking-wider">
                SPORT DETAILS
              </span>
              <div className="h-0.5 w-12 bg-[#CFEA6C]" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white">{sport.display_name}</h1>
              {isComingSoon && (
                <Badge className="bg-[#CFEA6C] text-[#2D5B4A] text-lg px-3 py-1 border-0">
                  Coming Soon
                </Badge>
              )}
            </div>
            {sport.description && (
              <p className="text-xl text-white/90 max-w-3xl">{sport.description}</p>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-5xl mx-auto">

          {isComingSoon ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-600 mb-4">
                  This sport is coming soon! Stay tuned for updates.
                </p>
                <div className="text-center">
                  <Button asChild>
                    <Link href="/memberships">Join Waitlist</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="border-2 border-gray-200 hover:border-[#50C878]/50 transition-colors shadow-lg">
                  <CardHeader className="bg-gradient-to-br from-[#50C878]/5 to-transparent">
                    <CardTitle className="flex items-center gap-2 text-[#2D5B4A]">
                      <div className="w-10 h-10 rounded-lg bg-[#50C878] flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      Operating Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {settings && (
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-semibold text-[#2D5B4A] mb-1">Weekdays</p>
                          <p className="text-lg font-bold text-gray-900">
                            {settings.weekday_hours?.open} - {settings.weekday_hours?.close}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#2D5B4A] mb-1">Weekends</p>
                          <p className="text-lg font-bold text-gray-900">
                            {settings.weekend_hours?.open} - {settings.weekend_hours?.close}
                          </p>
                        </div>
                        {sport.duration_minutes && (
                          <div className="pt-4 border-t border-gray-200">
                            <p className="text-sm font-semibold text-[#2D5B4A] mb-1">Session Duration</p>
                            <p className="text-lg font-bold text-[#50C878]">
                              {formatDuration(sport.duration_minutes)}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-2 border-gray-200 hover:border-[#50C878]/50 transition-colors shadow-lg">
                  <CardHeader className="bg-gradient-to-br from-[#50C878]/5 to-transparent">
                    <CardTitle className="flex items-center gap-2 text-[#2D5B4A]">
                      <div className="w-10 h-10 rounded-lg bg-[#50C878] flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-white" />
                      </div>
                      Pricing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {pricing.length > 0 ? (
                      <div className="space-y-4">
                        {pricing.map((p: any) => {
                          const tax = Number(p.price) * Number(p.tax_rate)
                          const total = Number(p.price) + tax
                          return (
                            <div key={p.id} className="flex justify-between items-center pb-3 border-b border-gray-200 last:border-0">
                              <div>
                                <p className="text-sm font-semibold text-[#2D5B4A]">Drop-in</p>
                                <p className="text-xs text-gray-500">{formatDuration(p.duration_minutes)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold text-[#50C878]">${total.toFixed(2)}</p>
                                <p className="text-xs text-gray-500">+ tax</p>
                              </div>
                            </div>
                          )
                        })}
                        <div className="pt-4 mt-4 bg-gradient-to-br from-[#50C878]/10 to-transparent rounded-lg p-4">
                          <p className="text-sm font-medium text-[#2D5B4A]">
                            💎 Members get unlimited access with monthly membership
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Pricing information coming soon</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {trainingPrograms.length > 0 && (
                <Card className="mb-8 border-2 border-gray-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-br from-[#50C878]/5 to-transparent">
                    <CardTitle className="flex items-center gap-2 text-[#2D5B4A]">
                      <div className="w-10 h-10 rounded-lg bg-[#50C878] flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      Training Programs
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Contact our coordinator for training options
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {trainingPrograms.map((program: any) => (
                        <div key={program.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-[#50C878]/50 transition-colors bg-gradient-to-br from-white to-[#50C878]/5">
                          <h3 className="font-bold text-lg text-[#2D5B4A] mb-2">{program.name}</h3>
                          {program.description && (
                            <p className="text-sm text-gray-600 mb-4">{program.description}</p>
                          )}
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-[#2D5B4A]">
                              Coordinator: <span className="font-normal text-gray-700">{program.coordinator_name}</span>
                            </p>
                            {program.coordinator_email && (
                              <p className="text-sm text-gray-600">
                                Email: <a href={`mailto:${program.coordinator_email}`} className="text-[#50C878] hover:underline font-medium">
                                  {program.coordinator_email}
                                </a>
                              </p>
                            )}
                            {program.coordinator_phone && (
                              <p className="text-sm text-gray-600">
                                Phone: <span className="font-medium text-gray-900">{program.coordinator_phone}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  asChild 
                  size="lg"
                  className="bg-[#50C878] hover:bg-[#50C878]/90 text-white text-base font-semibold rounded-md px-8 py-3 h-auto shadow-sm"
                >
                  <Link href="/bookings">Book Now</Link>
                </Button>
                <Button 
                  variant="outline" 
                  asChild 
                  size="lg"
                  className="bg-white border-2 border-gray-300 text-[#2D5B4A] hover:bg-gray-50 text-base font-semibold rounded-md px-8 py-3 h-auto shadow-sm"
                >
                  <Link href="/memberships">View Memberships</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

