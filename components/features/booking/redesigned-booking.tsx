'use client'

import { useState, useEffect, useMemo, useTransition, useRef } from 'react'
import { getSports } from '@/server/queries/bookings'
import { getCourtsBySport } from '@/server/queries/bookings'
import { Button } from '@/components/ui/button'
import { Loader2, Check, Calendar as CalendarIcon, Clock, CreditCard, Trophy, Dumbbell, Circle, Grid3x3, ArrowRight, Info, X } from 'lucide-react'
import { format, addDays, parseISO, addMinutes, startOfDay } from 'date-fns'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Calendar } from '@/components/ui/calendar'
import { PaymentSheet } from '@/components/features/payments/payment-sheet'

export function RedesignedBooking() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State
  const [sports, setSports] = useState<any[]>([])
  const [courts, setCourts] = useState<any[]>([])
  const [selectedSport, setSelectedSport] = useState<any>(null)
  const [selectedCourt, setSelectedCourt] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [slots, setSlots] = useState<any[]>([])
  
  // Payment state
  const [checkingAuth, setCheckingAuth] = useState(false)
  const [requiresPayment, setRequiresPayment] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState<{
    price: number
    tax: number
    total: number
  } | null>(null)
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null)
  const paymentSkipCancelRef = useRef(false)
  
  // Loading states
  const [loadingSports, setLoadingSports] = useState(true)
  const [loadingCourts, setLoadingCourts] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  // Transition to keep UI responsive during date changes
  const [isDatePending, startDateTransition] = useTransition()

  const [currentStep, setCurrentStep] = useState(1)

  const bookingWindowStart = useMemo(() => startOfDay(new Date()), [])
  const bookingWindowEnd = useMemo(
    () => addDays(bookingWindowStart, 14),
    [bookingWindowStart]
  )
  const dateFrom = useMemo(
    () => format(bookingWindowStart, 'yyyy-MM-dd'),
    [bookingWindowStart]
  )
  const dateTo = useMemo(
    () => format(bookingWindowEnd, 'yyyy-MM-dd'),
    [bookingWindowEnd]
  )
  const bookingWindowLabel = useMemo(
    () => format(bookingWindowEnd, 'MMM d, yyyy'),
    [bookingWindowEnd]
  )
  const calendarModifiers = useMemo(
    () => ({
      bookableWindow: { from: bookingWindowStart, to: bookingWindowEnd },
      lockedWindow: (date: Date) => date < bookingWindowStart || date > bookingWindowEnd,
    }),
    [bookingWindowStart, bookingWindowEnd]
  )
  const calendarModifierClasses = useMemo(
    () => ({
      bookableWindow: '!bg-[#50C878]/20 !text-[#50C878] !font-bold ring-1 ring-[#50C878]/30',
      lockedWindow: '!opacity-40 !text-gray-600 line-through !cursor-not-allowed bg-red-900/10',
    }),
    []
  )

  // Sport icons
  const getSportIcon = (sportName: string) => {
    const name = sportName.toLowerCase()
    if (name.includes('squash')) return Trophy
    if (name.includes('table')) return Circle
    if (name.includes('gym')) return Dumbbell
    if (name.includes('chess')) return Grid3x3
    return Trophy
  }

  // Handle payment cancellation
  useEffect(() => {
    const canceled = searchParams.get('canceled')
    if (canceled === 'true') {
      // Cancel any pending bookings created from the cancelled payment
      async function cancelPendingBookings() {
        try {
          const response = await fetch('/api/booking/cancel-pending', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })

          if (response.ok) {
            const data = await response.json()
            if (data.cancelled > 0) {
              toast.success(`Cancelled ${data.cancelled} pending booking(s)`, {
                duration: 4000,
              })
              // Refresh the page to update booking lists
              router.refresh()
            }
          }
        } catch (error) {
          console.error('Failed to cancel pending bookings:', error)
          // Don't show error to user, just log it
        }
      }

      cancelPendingBookings()

      toast.error('Payment was canceled. You can continue booking below.', {
        duration: 5000,
      })
      
      // Remove the canceled parameter from URL
      const params = new URLSearchParams(searchParams.toString())
      params.delete('canceled')
      const newUrl = params.toString() 
        ? `/bookings?${params.toString()}`
        : '/bookings'
      router.replace(newUrl)
    }
  }, [searchParams, router])

  // Fetch sports
  useEffect(() => {
    async function fetchSports() {
      try {
        const data = await getSports()
        setSports(data)
      } catch (error) {
        console.error('Failed to fetch sports:', error)
        toast.error('Failed to load sports')
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
      } catch (error) {
        console.error('Failed to fetch courts:', error)
        toast.error('Failed to load courts')
      } finally {
        setLoadingCourts(false)
      }
    }
    fetchCourts()
  }, [selectedSport?.id])

  // Load availability
  async function loadAvailability() {
    if (!selectedCourt || !selectedSport) return

    setLoadingSlots(true)
    try {
      const params = new URLSearchParams({
        sport_id: selectedSport.id,
        court_id: selectedCourt.id,
        from: dateFrom,
        to: dateTo,
      })
      const res = await fetch(`/api/availability?${params.toString()}`)
      if (!res.ok) throw new Error('Availability request failed')
      const data = await res.json()
      setSlots(data?.slots || [])
    } catch (error) {
      console.error('Failed to fetch availability:', error)
      setSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  useEffect(() => {
    if (!selectedCourt || !selectedSport) {
      setSlots([])
      setSelectedTime(null)
      return
    }
    loadAvailability()
  }, [selectedCourt?.id, selectedSport?.id, dateFrom, dateTo])

  // Check authorization when time is selected
  useEffect(() => {
    if (!selectedSport || !selectedTime) {
      setRequiresPayment(false)
      setPaymentInfo(null)
      return
    }

    const checkAuth = async () => {
      setCheckingAuth(true)
      try {
        const durationMinutes = selectedSport.duration_minutes || 60
        const response = await fetch('/api/booking/check-authorization', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sportId: selectedSport.id,
            durationMinutes,
          }),
        })

        const data = await response.json()

        if (data.requiresPayment) {
          setRequiresPayment(true)
          setPaymentInfo({
            price: data.dropInPrice,
            tax: data.tax,
            total: data.total,
          })
        } else {
          setRequiresPayment(false)
          setPaymentInfo(null)
        }
      } catch (error) {
        console.error('Authorization check error:', error)
      } finally {
        setCheckingAuth(false)
      }
    }

    const timeout = setTimeout(checkAuth, 300)
    return () => clearTimeout(timeout)
  }, [selectedSport?.id, selectedTime])

  // Get available time slots for selected date - optimized
  const availableTimeSlots = useMemo(() => {
    if (!selectedDate || !slots.length) return []
    
    const dateKey = format(selectedDate, 'yyyy-MM-dd')
    // slots[].date is already in 'yyyy-MM-dd' format from the API
    const daySlot = slots.find((s) => s.date === dateKey)

    if (!daySlot) return []

    return (daySlot.slots || [])
      .filter((s: any) => s.available)
      .sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime())
  }, [selectedDate, slots])

  // Handle sport selection
  const handleSportSelect = (sport: any) => {
    setSelectedSport(sport)
    setSelectedCourt(null)
    setSelectedTime(null)
    setCurrentStep(2)
  }

  // Handle court selection
  const handleCourtSelect = (court: any) => {
    setSelectedCourt(court)
    setSelectedTime(null)
    setCurrentStep(3)
  }

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return
    startDateTransition(() => {
      setSelectedDate(date)
      setSelectedTime(null)
      setCurrentStep(4)
    })
  }

  // Handle time selection
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  // Handle booking submission
  async function handleSubmit() {
    if (!selectedSport || !selectedCourt || !selectedDate || !selectedTime) {
      toast.error('Please complete all steps')
      return
    }

    setSubmitting(true)
    try {
      const durationMinutes = selectedSport.duration_minutes || 60
      const start = new Date(selectedTime)
      const end = new Date(start.getTime() + durationMinutes * 60000)

      if (requiresPayment) {
        if (pendingBookingId) {
          // Payment form already shown inline, scroll to it
          document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          return
        }

        const response = await fetch('/api/booking/create-pending', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sportId: selectedSport.id,
            courtId: selectedCourt.id,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            durationMinutes,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create pending booking')
        }

        const { bookingId } = await response.json()
        setPendingBookingId(bookingId)
        // Scroll to payment form after a brief delay to ensure it's rendered
        setTimeout(() => {
          document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
        return
      }

      // Member booking - free
      const { createBooking } = await import('@/server/actions/bookings')
      
      const formData = new FormData()
      formData.append('sportId', selectedSport.id)
      formData.append('courtId', selectedCourt.id)
      formData.append('startTime', start.toISOString())
      formData.append('endTime', end.toISOString())
      formData.append('selectedDuration', durationMinutes.toString())
      formData.append('bookingType', 'member')

      const result = await createBooking(formData)

      if (result.success) {
        toast.success('Booking Confirmed!')
        setTimeout(() => {
          router.push('/dashboard/bookings')
        }, 1500)
      } else {
        throw new Error(result.error || 'Failed to create booking')
      }
    } catch (error) {
      console.error('Booking error:', error)
      toast.error(error instanceof Error ? error.message : 'Booking failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePaymentSuccess = () => {
    paymentSkipCancelRef.current = true
    setPendingBookingId(null)
    toast.success('Booking confirmed!')
    router.push('/dashboard/bookings')
  }

  const handlePaymentError = async (error: Error) => {
    console.error('Payment error:', error)
    // Automatically cancel pending booking when payment fails
    if (pendingBookingId) {
      try {
        await fetch('/api/booking/cancel-pending', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: pendingBookingId }),
        })
        setPendingBookingId(null)
        toast.error('Payment failed. Booking has been cancelled.')
      } catch (cancelError) {
        console.error('Failed to cancel pending booking on payment error:', cancelError)
      }
    }
  }

  const handlePaymentCancel = async () => {
    if (pendingBookingId) {
      try {
        await fetch('/api/booking/cancel-pending', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: pendingBookingId }),
        })
      } catch (error) {
        console.error('Failed to cancel pending booking', error)
      }
    }
    setPendingBookingId(null)
  }

  const durationMinutes = selectedSport?.duration_minutes || 60
  const endTime = selectedTime ? addMinutes(parseISO(selectedTime), durationMinutes) : null

  const isComplete = selectedSport && selectedCourt && selectedDate && selectedTime

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-900 dark:to-gray-800 pt-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#1C2A24] via-[#2D5B4A] to-[#50C878] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#CFEA6C] animate-pulse" />
              <span className="text-sm font-medium">Live Availability</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Book Your Session</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Select your preferred sport, court, date, and time. We'll show you real-time availability and pricing.
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-black border-b border-gray-800 shadow-sm sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { num: 1, label: 'Sport', done: !!selectedSport },
              { num: 2, label: 'Court', done: !!selectedCourt },
              { num: 3, label: 'Date', done: !!selectedDate },
              { num: 4, label: 'Time', done: !!selectedTime },
            ].map((step, idx) => (
              <div key={step.num} className="flex items-center flex-1">
                <button
                  onClick={() => setCurrentStep(step.num)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      step.done
                        ? 'bg-[#50C878] text-white scale-110'
                        : currentStep === step.num
                        ? 'bg-[#50C878] text-white scale-105'
                        : 'bg-gray-900 text-gray-400'
                    }`}
                  >
                    {step.done ? <Check className="w-5 h-5" /> : step.num}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      step.done || currentStep === step.num ? 'text-[#50C878] dark:text-[#50C878]' : 'text-gray-400 dark:text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
                {idx < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded transition-all ${
                      step.done ? 'bg-[#50C878]' : 'bg-gray-900'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Steps */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Select Sport */}
            <div className="bg-black rounded-2xl shadow-sm border border-gray-800 overflow-hidden">
              <div className="bg-gradient-to-r from-[#2D5B4A] to-[#50C878] px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">1</span>
                  Choose Your Sport
                </h2>
              </div>
              <div className="p-6">
                {loadingSports ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#50C878]" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {sports.map((sport) => {
                      const Icon = getSportIcon(sport.display_name)
                      return (
                        <button
                          key={sport.id}
                          onClick={() => handleSportSelect(sport)}
                          className={`relative group p-6 rounded-xl border-2 transition-all text-left ${
                            selectedSport?.id === sport.id
                              ? 'border-[#50C878] bg-[#50C878]/10 dark:bg-[#50C878]/10 shadow-md'
                              : 'border-gray-800 hover:border-[#50C878]/50 hover:shadow-sm bg-gray-900'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                                selectedSport?.id === sport.id
                                  ? 'bg-[#50C878] text-white'
                                  : 'bg-gray-900 text-white group-hover:bg-[#50C878]/20'
                              }`}
                            >
                              <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-white dark:text-white mb-1">{sport.display_name}</h3>
                              <p className="text-sm text-gray-300 dark:text-gray-300">
                                {sport.duration_minutes} min session
                              </p>
                            </div>
                            {selectedSport?.id === sport.id && (
                              <Check className="w-6 h-6 text-[#50C878] absolute top-4 right-4" />
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Select Court */}
            {selectedSport && (
              <div className="bg-black rounded-2xl shadow-sm border border-gray-800 overflow-hidden">
                <div className="bg-gradient-to-r from-[#2D5B4A] to-[#50C878] px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">2</span>
                    Choose Your Court
                  </h2>
                </div>
                <div className="p-6">
                  {loadingCourts ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-[#50C878]" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {courts.map((court) => (
                        <button
                          key={court.id}
                          onClick={() => handleCourtSelect(court)}
                          className={`p-6 rounded-xl border-2 transition-all text-left ${
                            selectedCourt?.id === court.id
                              ? 'border-[#50C878] bg-[#50C878]/10 dark:bg-[#50C878]/10 shadow-md'
                              : 'border-gray-800 hover:border-[#50C878]/50 hover:shadow-sm bg-gray-900'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-lg text-white dark:text-white">{court.name}</h3>
                            {selectedCourt?.id === court.id && (
                              <Check className="w-6 h-6 text-[#50C878]" />
                            )}
                          </div>
                          <p className="text-sm text-gray-300 dark:text-gray-300">
                            {court.location || 'Available for booking'}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3 & 4: Select Date & Time */}
            {selectedCourt && (
              <div className="bg-black rounded-2xl shadow-sm border border-gray-800 overflow-hidden">
                <div className="bg-gradient-to-r from-[#2D5B4A] to-[#50C878] px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">3</span>
                    Pick Date & Time
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Date Picker */}
                    <div>
                      <label className="block text-sm font-semibold text-white dark:text-white mb-3">
                        Select Date
                      </label>
                      <div className="text-xs text-gray-300 mb-2 bg-gray-900 px-3 py-2 rounded-md border border-gray-800">
                        📅 Available: Today to {bookingWindowLabel}
                      </div>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        disabled={(date) =>
                          date < bookingWindowStart || date > bookingWindowEnd
                        }
                        className="rounded-lg border border-gray-800 bg-black [&_.bookableWindow]:bg-[#50C878]/20 [&_.bookableWindow]:text-[#50C878] [&_.bookableWindow]:font-bold [&_.bookableWindow]:ring-1 [&_.bookableWindow]:ring-[#50C878]/40 [&_.lockedWindow]:opacity-40 [&_.lockedWindow]:line-through [&_.lockedWindow]:bg-red-900/10"
                        fromDate={bookingWindowStart}
                        toDate={bookingWindowEnd}
                        modifiers={calendarModifiers}
                        modifiersClassNames={calendarModifierClasses}
                        classNames={{
                          months: 'flex flex-col space-y-4',
                          month: 'space-y-4',
                          caption: 'flex justify-center pt-1 relative items-center mb-4',
                          caption_label: 'text-sm font-semibold text-white',
                          nav: 'space-x-1 flex items-center',
                          nav_button: 'h-8 w-8 bg-transparent p-0 hover:bg-[#50C878]/10 rounded-md transition-colors text-white',
                          nav_button_previous: 'absolute left-1',
                          nav_button_next: 'absolute right-1',
                          table: 'w-full border-collapse',
                          head_row: 'flex mb-2',
                          head_cell: 'text-gray-400 rounded-md w-10 font-medium text-xs',
                          row: 'flex w-full mt-1',
                          cell: 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20',
                          day: 'h-10 w-10 p-0 font-medium rounded-md transition-all text-white bg-[#50C878]/5 hover:bg-[#50C878]/20 border border-[#50C878]/20',
                          day_selected: '!bg-[#50C878] !text-white hover:!bg-[#50C878]/90 focus:!bg-[#50C878] !font-bold',
                          day_today: '!bg-[#50C878]/30 !text-[#50C878] !font-bold !ring-2 !ring-[#50C878]',
                          day_outside: 'text-gray-600 opacity-30',
                          day_disabled: '!text-red-500/70 !bg-red-950/30 !opacity-50 hover:!bg-red-950/30 !cursor-not-allowed relative after:content-["🔒"] after:absolute after:bottom-0 after:right-0 after:text-[10px] after:opacity-60',
                          day_hidden: 'invisible',
                        }}
                      />
                      <div className="mt-3 space-y-2 text-xs text-gray-400">
                        <div className="flex items-center gap-2 bg-[#50C878]/10 px-2 py-1 rounded border border-[#50C878]/30">
                          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#50C878]" aria-hidden="true" />
                          <span className="text-[#50C878] font-semibold">Bookable (Next 14 days)</span>
                        </div>
                        <div className="flex items-center gap-2 bg-red-950/20 px-2 py-1 rounded border border-red-500/30">
                          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500" aria-hidden="true" />
                          <span className="text-red-400 font-semibold">Locked 🔒 (Beyond 14 days)</span>
                        </div>
                      </div>
                    </div>

                    {/* Time Picker */}
                    <div>
                      <label className="block text-sm font-semibold text-white dark:text-white mb-3">
                        Select Time
                      </label>
                      {loadingSlots ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-[#50C878]" />
                        </div>
                      ) : availableTimeSlots.length > 0 ? (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                          {availableTimeSlots.map((slot: any) => {
                            const slotTime = parseISO(slot.time)
                            const slotEndTime = addMinutes(slotTime, durationMinutes)
                            return (
                              <button
                                key={slot.time}
                                onClick={() => handleTimeSelect(slot.time)}
                                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                                  selectedTime === slot.time
                                    ? 'border-[#50C878] bg-[#50C878]/10 dark:bg-[#50C878]/10 shadow-sm'
                                    : 'border-gray-800 hover:border-[#50C878]/50 bg-gray-900'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-[#50C878] dark:text-[#50C878]" />
                                    <div>
                                      <div className="font-semibold text-white dark:text-white">
                                        {format(slotTime, 'h:mm a')} - {format(slotEndTime, 'h:mm a')}
                                      </div>
                                      <div className="text-xs text-gray-300 dark:text-gray-300">
                                        {durationMinutes} minutes
                                      </div>
                                    </div>
                                  </div>
                                  {selectedTime === slot.time && (
                                    <Check className="w-5 h-5 text-[#50C878]" />
                                  )}
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-400 dark:text-gray-400">
                          <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p>No available slots for this date</p>
                          <p className="text-sm mt-1">Please select another date</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-black rounded-2xl shadow-lg border border-gray-800 overflow-hidden sticky top-32">
              <div className="bg-gradient-to-r from-[#2D5B4A] to-[#50C878] px-6 py-4">
                <h2 className="text-xl font-bold text-white">Booking Summary</h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Selection Details */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3 pb-4 border-b border-gray-700 dark:border-gray-700">
                    <Trophy className="w-5 h-5 text-[#50C878] dark:text-[#50C878] mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-400 dark:text-gray-400 mb-1">Sport</div>
                      <div className="font-semibold text-white dark:text-white">
                        {selectedSport?.display_name || 'Not selected'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pb-4 border-b border-gray-700 dark:border-gray-700">
                    <Circle className="w-5 h-5 text-[#50C878] dark:text-[#50C878] mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-400 dark:text-gray-400 mb-1">Court</div>
                      <div className="font-semibold text-white dark:text-white">
                        {selectedCourt?.name || 'Not selected'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pb-4 border-b border-gray-700 dark:border-gray-700">
                    <CalendarIcon className="w-5 h-5 text-[#50C878] dark:text-[#50C878] mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-400 dark:text-gray-400 mb-1">Date</div>
                      <div className="font-semibold text-white dark:text-white" aria-busy={isDatePending}>
                        {isDatePending ? 'Updating...' : (selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Not selected')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pb-4 border-b border-gray-700 dark:border-gray-700">
                    <Clock className="w-5 h-5 text-[#50C878] dark:text-[#50C878] mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-400 dark:text-gray-400 mb-1">Time</div>
                      <div className="font-semibold text-white dark:text-white" aria-busy={isDatePending}>
                        {isDatePending
                          ? 'Updating...'
                          : (selectedTime && endTime ? (
                            <>
                              {format(parseISO(selectedTime), 'h:mm a')} - {format(endTime, 'h:mm a')}
                              <div className="text-xs text-gray-400 dark:text-gray-400 mt-1">
                                {durationMinutes} minutes
                              </div>
                            </>
                          ) : (
                            'Not selected'
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                {checkingAuth && (
                  <div className="flex items-center gap-2 text-sm text-gray-300 dark:text-gray-300 py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking membership status...
                  </div>
                )}

                {!checkingAuth && requiresPayment && paymentInfo && (
                  <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 dark:from-amber-900/30 dark:to-orange-900/30 rounded-lg p-4 border border-amber-700/50 dark:border-amber-700/50">
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard className="w-5 h-5 text-amber-400 dark:text-amber-400" />
                      <h3 className="font-bold text-amber-300 dark:text-amber-300">Payment Required</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-300 dark:text-gray-300">
                        <span>Drop-in Fee:</span>
                        <span className="font-semibold">${paymentInfo.price.toFixed(2)}</span>
                      </div>
                      {paymentInfo.tax > 0 && (
                        <div className="flex justify-between text-gray-300 dark:text-gray-300">
                          <span>Tax:</span>
                          <span className="font-semibold">${paymentInfo.tax.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg pt-2 border-t border-amber-700/50 dark:border-amber-700/50 text-amber-300 dark:text-amber-300">
                        <span>Total:</span>
                        <span>${paymentInfo.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {!checkingAuth && !requiresPayment && selectedTime && (
                  <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg p-4 border border-green-700/50 dark:border-green-700/50">
                    <div className="flex items-center gap-2 text-green-300 dark:text-green-300">
                      <Check className="w-5 h-5" />
                      <span className="font-semibold">Covered by your membership</span>
                    </div>
                    <p className="text-xs text-green-400 dark:text-green-400 mt-1">
                      No additional payment required
                    </p>
                  </div>
                )}

                {/* Action Button */}
                {!pendingBookingId && (
                  <Button
                    onClick={handleSubmit}
                    disabled={!isComplete || submitting || checkingAuth}
                    className="w-full h-12 bg-[#50C878] hover:bg-[#50C878]/90 text-white rounded-lg font-semibold text-base shadow-md disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : requiresPayment ? (
                      <>
                        Continue to Payment
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-5 w-5" />
                        Confirm Booking
                      </>
                    )}
                  </Button>
                )}

                {!isComplete && !pendingBookingId && (
                  <div className="flex items-start gap-2 text-xs text-gray-400 bg-gray-900 rounded-lg p-3">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>Complete all steps above to proceed with your booking</p>
                  </div>
                )}

                {/* Inline Payment Form */}
                {pendingBookingId && paymentInfo && (
                  <div id="payment-section" className="mt-6 pt-6 border-t border-gray-700">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-white mb-2">Complete Payment</h3>
                      <p className="text-sm text-gray-400">
                        Secure payment form powered by Stripe. Your booking is held until payment completes.
                      </p>
                    </div>
                    <PaymentSheet
                      bookingId={pendingBookingId}
                      amount={paymentInfo.total}
                      currency="usd"
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      onCancel={handlePaymentCancel}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

