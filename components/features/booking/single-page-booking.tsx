'use client'

import { useState, useEffect, useMemo } from 'react'
import { getSports } from '@/server/queries/bookings'
import { getCourtsBySport } from '@/server/queries/bookings'
import { getAvailableSlots } from '@/server/actions/bookings'
import { createBooking } from '@/server/actions/bookings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Loader2, Calendar as CalendarIcon, Clock, MapPin, CheckCircle2 } from 'lucide-react'
import { format, addDays, parseISO } from 'date-fns'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function SinglePageBooking() {
  const router = useRouter()
  
  // State
  const [sports, setSports] = useState<any[]>([])
  const [courts, setCourts] = useState<any[]>([])
  const [selectedSport, setSelectedSport] = useState<any>(null)
  const [selectedCourt, setSelectedCourt] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [slots, setSlots] = useState<any[]>([])
  
  // Loading states
  const [loadingSports, setLoadingSports] = useState(true)
  const [loadingCourts, setLoadingCourts] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Date range for availability (memoized to prevent recalculation on every render)
  const dateFrom = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])
  const dateTo = useMemo(() => format(addDays(new Date(), 14), 'yyyy-MM-dd'), [])

  // Fetch sports on mount
  useEffect(() => {
    async function fetchSports() {
      try {
        const data = await getSports()
        setSports(data)
      } catch (error) {
        console.error('Failed to fetch sports:', error)
        toast.error('Error', {
          description: 'Failed to load sports. Please refresh the page.',
        })
      } finally {
        setLoadingSports(false)
      }
    }
    fetchSports()
  }, [])

  // Fetch courts when sport is selected
  useEffect(() => {
    if (!selectedSport) {
      setCourts([])
      setSelectedCourt(null)
      return
    }

    async function fetchCourts() {
      setLoadingCourts(true)
      try {
        const data = await getCourtsBySport(selectedSport.id)
        setCourts(data)
        // Reset court selection
        setSelectedCourt(null)
      } catch (error) {
        console.error('Failed to fetch courts:', error)
        toast.error('Error', {
          description: 'Failed to load courts. Please try again.',
        })
      } finally {
        setLoadingCourts(false)
      }
    }
    fetchCourts()
  }, [selectedSport?.id])

  // Fetch availability when court and date are selected
  useEffect(() => {
    if (!selectedCourt || !selectedDate || !selectedSport) {
      setSlots([])
      setSelectedTime(null)
      return
    }

    async function fetchAvailability() {
      setLoadingSlots(true)
      try {
        const availability = await getAvailableSlots(
          selectedSport.id,
          selectedCourt.id,
          dateFrom,
          dateTo
        )
        setSlots(availability || [])
      } catch (error) {
        console.error('Failed to fetch availability:', error)
        setSlots([])
      } finally {
        setLoadingSlots(false)
      }
    }
    fetchAvailability()
  }, [selectedCourt?.id, selectedDate, selectedSport?.id, dateFrom, dateTo])

  // Get available slots for selected date
  const selectedDaySlots = selectedDate
    ? slots.find((s) => format(parseISO(s.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'))
    : null

  // Handle booking submission
  async function handleSubmit() {
    if (!selectedSport || !selectedCourt || !selectedDate || !selectedTime) {
      toast.error('Missing Information', {
        description: 'Please select a sport, court, date, and time.',
      })
      return
    }

    setSubmitting(true)
    try {
      // Calculate end time (default 60 minutes, or use sport duration)
      const durationMinutes = selectedSport.duration_minutes || 60
      const start = new Date(selectedTime)
      const end = new Date(start.getTime() + durationMinutes * 60000)

      const formData = new FormData()
      formData.append('sportId', selectedSport.id)
      formData.append('courtId', selectedCourt.id)
      formData.append('startTime', start.toISOString())
      formData.append('endTime', end.toISOString())

      const result = await createBooking(formData)

      if (result.success) {
        toast.success('Booking Confirmed!', {
          description: 'Your court booking has been confirmed.',
        })
        // Reset selections
        setSelectedSport(null)
        setSelectedCourt(null)
        setSelectedDate(undefined)
        setSelectedTime(null)
        setSlots([])
        // Redirect to bookings page
        setTimeout(() => {
          router.push('/dashboard/bookings')
        }, 1500)
      } else {
        throw new Error(result.error || 'Failed to create booking')
      }
    } catch (error) {
      console.error('Booking error:', error)
      toast.error('Booking Failed', {
        description: error instanceof Error ? error.message : 'Failed to create booking. Please try again.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-semibold text-black uppercase tracking-wider">
              BOOKING
            </span>
            <div className="h-0.5 w-12 bg-yellow-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2D5B4A] mb-2">
            Book Your Court Session
          </h1>
          <p className="text-gray-600 text-base">
            Select your sport, court, date, and time to reserve your session
          </p>
        </div>

        {/* Main Content - Non-scrollable grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-280px)] overflow-hidden">
          {/* Left Column: Selection Steps */}
          <div className="lg:col-span-2 space-y-6 overflow-y-auto pr-2">
            {/* Step 1: Sport Selection */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[#2D5B4A]">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#50C878] text-white text-sm font-bold">
                    1
                  </span>
                  <span>Select Sport</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSports ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#50C878]" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {sports.map((sport) => (
                      <button
                        key={sport.id}
                        onClick={() => setSelectedSport(sport)}
                        className={`p-5 rounded-lg border-2 text-left transition-all ${
                          selectedSport?.id === sport.id
                            ? 'border-[#50C878] bg-[#DCF1E6] shadow-sm'
                            : 'border-gray-200 hover:border-[#50C878]/50 hover:shadow-sm bg-white'
                        }`}
                      >
                        <h3 className="font-semibold text-[#2D5B4A] mb-2">{sport.display_name}</h3>
                        {sport.description && (
                          <p className="text-sm text-gray-600">{sport.description}</p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Court Selection */}
            {selectedSport && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-[#2D5B4A]">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#50C878] text-white text-sm font-bold">
                      2
                    </span>
                    <span>Select Court</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingCourts ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-[#50C878]" />
                    </div>
                  ) : courts.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">
                      No courts available for this sport
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {courts.map((court) => (
                        <button
                          key={court.id}
                          onClick={() => setSelectedCourt(court)}
                          className={`p-5 rounded-lg border-2 text-left transition-all ${
                            selectedCourt?.id === court.id
                              ? 'border-[#50C878] bg-[#DCF1E6] shadow-sm'
                              : 'border-gray-200 hover:border-[#50C878]/50 hover:shadow-sm bg-white'
                          }`}
                        >
                          <h3 className="font-semibold text-[#2D5B4A]">{court.name}</h3>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 3: Date Selection */}
            {selectedCourt && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-[#2D5B4A]">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#50C878] text-white text-sm font-bold">
                      3
                    </span>
                    <span>Select Date</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      className="rounded-md border"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Time Selection */}
            {selectedDate && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-[#2D5B4A]">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#50C878] text-white text-sm font-bold">
                      4
                    </span>
                    <span>Select Time</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-[#50C878]" />
                    </div>
                  ) : selectedDaySlots?.slots && selectedDaySlots.slots.length > 0 ? (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {selectedDaySlots.slots
                        .filter((slot: any) => slot.available)
                        .map((slot: any) => (
                          <button
                            key={slot.time}
                            onClick={() => setSelectedTime(slot.time)}
                            className={`p-3 rounded-md border-2 text-sm font-medium transition-all ${
                              selectedTime === slot.time
                                ? 'border-[#50C878] bg-[#50C878] text-white shadow-sm'
                                : 'border-gray-200 hover:border-[#50C878]/50 hover:shadow-sm bg-white text-[#2D5B4A]'
                            }`}
                          >
                            {format(parseISO(slot.time), 'h:mm a')}
                          </button>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600">
                        No available slots for this date
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Booking Summary & Submit */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#2D5B4A]">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedSport && (
                  <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                    <CheckCircle2 className="h-5 w-5 text-[#50C878] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Sport</p>
                      <p className="font-semibold text-[#2D5B4A]">{selectedSport.display_name}</p>
                    </div>
                  </div>
                )}

                {selectedCourt && (
                  <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                    <MapPin className="h-5 w-5 text-[#50C878] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Court</p>
                      <p className="font-semibold text-[#2D5B4A]">{selectedCourt.name}</p>
                    </div>
                  </div>
                )}

                {selectedDate && (
                  <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                    <CalendarIcon className="h-5 w-5 text-[#50C878] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-semibold text-[#2D5B4A]">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
                    </div>
                  </div>
                )}

                {selectedTime && (
                  <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                    <Clock className="h-5 w-5 text-[#50C878] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="font-semibold text-[#2D5B4A]">{format(parseISO(selectedTime), 'h:mm a')}</p>
                    </div>
                  </div>
                )}

                {!selectedSport && (
                  <p className="text-sm text-gray-600 text-center py-8">
                    Select a sport to begin
                  </p>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={!selectedSport || !selectedCourt || !selectedDate || !selectedTime || submitting}
                  className="w-full bg-[#50C878] hover:bg-[#50C878]/90 text-white rounded-md px-6 py-3 h-auto shadow-sm"
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
