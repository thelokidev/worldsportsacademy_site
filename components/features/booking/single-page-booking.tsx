'use client'

import { useState, useEffect, useMemo, useRef, useCallback, useTransition } from 'react'
import { getSports } from '@/server/queries/bookings'
import { getCourtsBySport } from '@/server/queries/bookings'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2, Check, Calendar as CalendarIcon, MapPin, Clock, Users, Star, CreditCard } from 'lucide-react'
import { DateTimePicker } from '@/components/features/booking/date-time-picker'
import { format, addDays, parseISO, addMinutes } from 'date-fns'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { subscribeToCourtAvailability, unsubscribeFromChannel } from '@/lib/supabase/realtime'
import { formatDuration } from '@/lib/utils/duration'
import { PaymentSheet } from '@/components/features/payments/payment-sheet'

export function SinglePageBooking() {
  const router = useRouter()
  const sportRef = useRef<HTMLDivElement>(null)
  const courtRef = useRef<HTMLDivElement>(null)
  const dateRef = useRef<HTMLDivElement>(null)
  const timeRef = useRef<HTMLDivElement>(null)
  
  // State
  const [sports, setSports] = useState<any[]>([])
  const [courts, setCourts] = useState<any[]>([])
  const [selectedSport, setSelectedSport] = useState<any>(null)
  const [selectedCourt, setSelectedCourt] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(new Date().setHours(0,0,0,0)))
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [slots, setSlots] = useState<any[]>([])
  
  // Payment and authorization state
  const [checkingAuth, setCheckingAuth] = useState(false)
  const [requiresPayment, setRequiresPayment] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState<{
    price: number
    tax: number
    total: number
  } | null>(null)
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  
  // Debounce refs for performance
  const authCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const dateChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const paymentSkipCancelRef = useRef(false)
  
  // Loading states
  const [loadingSports, setLoadingSports] = useState(true)
  const [loadingCourts, setLoadingCourts] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  // Transition to avoid blocking UI on date changes
  const [isDatePending, startDateTransition] = useTransition()

  // Abort controller to cancel stale requests
  const availabilityAbortRef = useRef<AbortController | null>(null)
  // Realtime channel for court updates
  const realtimeChannelRef = useRef<any>(null)
  const realtimeDebounceRef = useRef<number | null>(null)

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
        setSelectedCourt(null)
        setRequiresPayment(false)
        setPaymentInfo(null)
      } catch (error) {
        console.error('Failed to fetch courts:', error)
        toast.error('Failed to load courts')
      } finally {
        setLoadingCourts(false)
      }
    }
    fetchCourts()
  }, [selectedSport?.id])

  // Check authorization when time is selected (debounced to avoid lag)
  useEffect(() => {
    // Clear any pending auth check
    if (authCheckTimeoutRef.current) {
      clearTimeout(authCheckTimeoutRef.current)
    }

    if (!selectedSport || !selectedTime) {
      setRequiresPayment(false)
      setPaymentInfo(null)
      return
    }

    // Debounce authorization check to avoid lag when switching dates
    authCheckTimeoutRef.current = setTimeout(async () => {
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
    }, 300) // 300ms debounce

    return () => {
      if (authCheckTimeoutRef.current) {
        clearTimeout(authCheckTimeoutRef.current)
      }
    }
  }, [selectedSport?.id, selectedTime])

  // Internal: load availability with cancellation
  async function loadAvailability() {
    if (!selectedCourt || !selectedSport) return
    // Cancel prior request
    if (availabilityAbortRef.current) {
      availabilityAbortRef.current.abort()
    }
    const controller = new AbortController()
    availabilityAbortRef.current = controller

    setLoadingSlots(true)
    try {
      const params = new URLSearchParams({
        sport_id: selectedSport.id,
        court_id: selectedCourt.id,
        from: dateFrom,
        to: dateTo,
      })
      const res = await fetch(`/api/availability?${params.toString()}`, {
        signal: controller.signal,
      })
      if (!res.ok) throw new Error('Availability request failed')
      const data = await res.json()
      setSlots(data?.slots || [])
    } catch (error) {
      if ((error as any)?.name === 'AbortError') {
        // aborted due to newer request; ignore
      } else {
        console.error('Failed to fetch availability:', error)
        setSlots([])
      }
    } finally {
      setLoadingSlots(false)
    }
  }

  // Fetch availability when inputs change
  useEffect(() => {
    if (!selectedCourt || !selectedSport) {
      setSlots([])
      setSelectedTime(null)
      return
    }
    loadAvailability()
    // Cleanup abort on dependency change
    return () => {
      availabilityAbortRef.current?.abort()
    }
  }, [selectedCourt?.id, selectedSport?.id, dateFrom, dateTo])

  // Realtime: refresh availability when bookings change for selected court
  useEffect(() => {
    // Clean up previous channel
    if (realtimeChannelRef.current) {
      unsubscribeFromChannel(realtimeChannelRef.current)
      realtimeChannelRef.current = null
    }

    if (!selectedCourt?.id) return

    const channel = subscribeToCourtAvailability(selectedCourt.id, () => {
      // Debounce rapid events to avoid spamming fetches
      if (realtimeDebounceRef.current) {
        window.clearTimeout(realtimeDebounceRef.current)
      }
      realtimeDebounceRef.current = window.setTimeout(() => {
        loadAvailability()
      }, 250)
    })
    realtimeChannelRef.current = channel

    return () => {
      if (realtimeChannelRef.current) {
        unsubscribeFromChannel(realtimeChannelRef.current)
        realtimeChannelRef.current = null
      }
      if (realtimeDebounceRef.current) {
        window.clearTimeout(realtimeDebounceRef.current)
        realtimeDebounceRef.current = null
      }
    }
  }, [selectedCourt?.id])

  // Memoize selected day slots - optimized to avoid redundant parseISO calls
  const selectedDaySlots = useMemo(() => {
    if (!selectedDate || !slots.length) return null
    const dateKey = format(selectedDate, 'yyyy-MM-dd')
    // slots[].date is already a string in 'yyyy-MM-dd' format from the API
    return slots.find((s) => s.date === dateKey) || null
  }, [selectedDate, slots])

  // Recommendations based on availability
  const bestDay = useMemo(() => {
    if (!slots || slots.length === 0) return null
    return slots.reduce((best: any, day: any) => {
      const count = (day?.slots || []).filter((s: any) => s.available).length
      const bestCount = (best?.slots || []).filter((s: any) => s.available).length
      return count > bestCount ? day : best
    }, null as any)
  }, [slots])

  const recommendedSlots = useMemo(() => {
    if (!selectedDaySlots?.slots) return []
    const avail = selectedDaySlots.slots
      .filter((s: any) => s.available)
      .sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime())
    return avail.slice(0, 3)
  }, [selectedDaySlots])

  // Hour options mapped to server availability - optimized for instant updates
  const hourOptions = useMemo(() => {
    if (!selectedDate || !selectedDaySlots) return [] as Array<{ label: string; iso: string | null; available: boolean }>
    
    const daySlots = selectedDaySlots.slots || []
    const dateKey = format(selectedDate, 'yyyy-MM-dd')
    
    // Pre-compute hour labels once (avoid 18 format() calls per date change)
    const hourLabels = ['6:00 am', '7:00 am', '8:00 am', '9:00 am', '10:00 am', '11:00 am', 
                        '12:00 pm', '1:00 pm', '2:00 pm', '3:00 pm', '4:00 pm', '5:00 pm',
                        '6:00 pm', '7:00 pm', '8:00 pm', '9:00 pm', '10:00 pm', '11:00 pm']
    
    // Build O(1) lookup map - parse each slot time only once
    const slotMap = new Map<number, { time: string; available: boolean }>()
    daySlots.forEach((s: any) => {
      if (!s.time) return
      const slotTime = parseISO(s.time)
      const slotDateKey = format(slotTime, 'yyyy-MM-dd')
      if (slotDateKey === dateKey) {
        slotMap.set(slotTime.getHours(), s)
      }
    })
    
    // Build result array with minimal object creation
    const arr: Array<{ label: string; iso: string | null; available: boolean }> = []
    for (let h = 6; h <= 23; h++) {
      const slot = slotMap.get(h)
      arr.push({ 
        label: hourLabels[h - 6], 
        iso: slot?.time || null, 
        available: slot?.available === true 
      })
    }
    return arr
  }, [selectedDate, selectedDaySlots])

  const sectionRefs = [sportRef, courtRef, dateRef, timeRef]
  const firstIncompleteIndex = useMemo(() => {
    const idx = [!!selectedSport, !!selectedCourt, !!selectedDate, !!selectedTime].findIndex((c) => !c)
    return idx === -1 ? 3 : idx
  }, [selectedSport, selectedCourt, selectedDate, selectedTime])

  function scrollToSection(index: number) {
    const el = sectionRefs[index]?.current
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Handle booking submission with payment check
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
          setPaymentDialogOpen(true)
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
        setPaymentDialogOpen(true)
        return
      }

      // Member booking - free, create directly using server action
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
    setPaymentDialogOpen(false)
    toast.success('Booking confirmed!')
    router.push('/dashboard/bookings')
  }

  const handlePaymentDialogChange = async (open: boolean) => {
    setPaymentDialogOpen(open)
    if (open) return

    if (paymentSkipCancelRef.current) {
      paymentSkipCancelRef.current = false
      return
    }

    if (!pendingBookingId) {
      return
    }

    try {
      await fetch('/api/booking/cancel-pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: pendingBookingId }),
      })
    } catch (error) {
      console.error('Failed to cancel pending booking', error)
    } finally {
      setPendingBookingId(null)
    }
  }

  const steps = [
    { number: 1, title: 'Sport', completed: !!selectedSport },
    { number: 2, title: 'Court', completed: !!selectedCourt },
    { number: 3, title: 'Date', completed: !!selectedDate },
    { number: 4, title: 'Time', completed: !!selectedTime },
  ]

  const durationMinutes = selectedSport?.duration_minutes || 60
  const endTime = selectedTime ? addMinutes(parseISO(selectedTime), durationMinutes) : null

  // Optimized date selection handler - prevents unnecessary re-renders
  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (!date) return
    startDateTransition(() => {
      setSelectedDate(date)
      setSelectedTime(null)
      // Clear payment info when date changes (immediate UI update)
      setRequiresPayment(false)
      setPaymentInfo(null)
    })
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (authCheckTimeoutRef.current) {
        clearTimeout(authCheckTimeoutRef.current)
      }
      if (dateChangeTimeoutRef.current) {
        clearTimeout(dateChangeTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-white pt-16 overflow-x-hidden">
      {/* Premium Hero */}
      <div
        className="relative overflow-hidden"
        aria-label="Booking hero"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#1C2A24] via-[#2D5B4A] to-[#50C878]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.15)_0%,_rgba(255,255,255,0)_60%)] mix-blend-overlay" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-white/90 uppercase tracking-wider">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#CFEA6C] animate-pulse" aria-hidden />
              Live availability
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow">
            Book a premium session
          </h1>
          <p className="text-white/90 mt-1 text-sm max-w-xl">
            Choose your sport, court, date, and time. Enjoy a refined, fast and accessible booking experience.
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between overflow-x-auto">
            {steps.map((step, idx) => (
              <button
                key={step.number}
                type="button"
                onClick={() => scrollToSection(idx)}
                aria-current={idx === firstIncompleteIndex ? 'step' : undefined}
                className="flex items-center flex-1 min-w-0 group"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 flex-shrink-0 ${
                      step.completed
                        ? 'bg-[#50C878] text-white shadow-md'
                        : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                    }`}
                  >
                    {step.completed ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : step.number}
                  </div>
                  <span
                    className={`text-xs font-semibold whitespace-nowrap ${
                      step.completed ? 'text-black' : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-1 sm:mx-2 transition-all duration-300 min-w-[20px] ${
                      step.completed ? 'bg-[#50C878]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Sport + Court Dropdowns */}
              <div ref={sportRef} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#50C878] flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#2D5B4A]">Choose Your Sport & Court</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Sport Dropdown */}
                  <div>
                    {loadingSports ? (
                      <div className="flex items-center justify-center h-20">
                        <Loader2 className="h-6 w-6 animate-spin text-[#50C878]" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label htmlFor="sport-select" className="text-xs font-semibold text-[#2D5B4A]">Select sport</label>
                        <select
                          id="sport-select"
                          aria-label="Select sport"
                          value={selectedSport?.id || ''}
                          onChange={(e) => {
                            const value = e.target.value
                            const sport = sports.find((s) => s.id === value) || null
                            setSelectedSport(sport)
                            setSelectedTime(null)
                          }}
                          className="w-full h-10 sm:h-11 rounded-md border border-gray-300 bg-white px-3 text-sm text-[#2D5B4A] focus:outline-none focus:ring-2 focus:ring-[#50C878] focus:border-[#50C878]"
                        >
                          <option value="">Choose a sport</option>
                          {sports.map((sport) => (
                            <option key={sport.id} value={sport.id}>{sport.display_name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  {/* Court Dropdown */}
                  <div ref={courtRef}>
                    {loadingCourts ? (
                      <div className="flex items-center justify-center h-20">
                        <Loader2 className="h-6 w-6 animate-spin text-[#50C878]" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label htmlFor="court-select" className="text-xs font-semibold text-[#2D5B4A]">Select court</label>
                        <select
                          id="court-select"
                          aria-label="Select court"
                          disabled={!selectedSport}
                          value={selectedCourt?.id || ''}
                          onChange={(e) => {
                            const value = e.target.value
                            const court = courts.find((c) => c.id === value) || null
                            setSelectedCourt(court)
                            setSelectedTime(null)
                          }}
                          className="w-full h-10 sm:h-11 rounded-md border border-gray-300 bg-white px-3 text-sm text-[#2D5B4A] disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#50C878] focus:border-[#50C878]"
                        >
                          <option value="">Choose a court</option>
                          {courts.map((court) => (
                            <option key={court.id} value={court.id}>{court.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Date & Time Picker - Fully Responsive */}
              <div ref={dateRef} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6" aria-live="polite">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#50C878] flex items-center justify-center flex-shrink-0">
                    <CalendarIcon className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#2D5B4A]">Pick Date & Time</h2>
                </div>
                
                {/* Date & Time Picker */}
                <div ref={timeRef} className="mb-4">
                  <DateTimePicker
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    onDateSelect={handleDateSelect}
                    onTimeSelect={setSelectedTime}
                    availableSlots={hourOptions}
                    loadingSlots={loadingSlots}
                    disabled={!selectedSport || !selectedCourt}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between border-t pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto h-10 px-4" 
                    onClick={() => { 
                      setSelectedDate(new Date(new Date().setHours(0,0,0,0))); 
                      setSelectedTime(null) 
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!selectedSport || !selectedCourt || !selectedDate || !selectedTime || submitting || checkingAuth}
                    className="w-full sm:w-auto h-10 px-6 bg-[#50C878] hover:bg-[#50C878]/90 text-white rounded-md shadow-sm"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : requiresPayment ? (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay & Book
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Confirm Booking
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 sticky top-4 space-y-4">
                <h2 className="text-lg sm:text-xl font-bold text-[#2D5B4A] mb-3">Your Selection</h2>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Sport:</span>
                    <span className="font-semibold text-[#2D5B4A] text-right">
                      {selectedSport?.display_name || 'Not selected'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Court:</span>
                    <span className="font-semibold text-[#2D5B4A] text-right">
                      {selectedCourt?.name || 'Not selected'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold text-[#2D5B4A] text-right" aria-busy={isDatePending}>
                      {isDatePending ? 'Updating...' : (selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Not selected')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-semibold text-[#2D5B4A] text-right" aria-busy={isDatePending}>
                      {isDatePending
                        ? 'Updating...'
                        : selectedTime
                        ? (
                          <>
                            {format(parseISO(selectedTime), 'h:mm a')}
                            {endTime && ` - ${format(endTime, 'h:mm a')}`}
                          </>
                        )
                        : 'Not selected'}
                    </span>
                  </div>
                  {selectedTime && selectedSport && (
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-semibold text-[#2D5B4A]">
                        {formatDuration(durationMinutes)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Payment Info */}
                {checkingAuth && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Checking membership...
                    </div>
                  </div>
                )}

                {!checkingAuth && requiresPayment && paymentInfo && (
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-4 w-4 text-[#50C878]" />
                      <p className="text-sm font-semibold text-[#2D5B4A]">Payment Required</p>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Drop-in Fee:</span>
                        <span>${paymentInfo.price.toFixed(2)}</span>
                      </div>
                      {paymentInfo.tax > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax:</span>
                          <span>${paymentInfo.tax.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold pt-2 border-t">
                        <span>Total:</span>
                        <span className="text-[#50C878]">${paymentInfo.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {!checkingAuth && !requiresPayment && selectedTime && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Check className="h-4 w-4" />
                      <span className="font-medium">Covered by membership</span>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {bestDay && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-[#CFEA6C]" />
                      <h3 className="text-sm font-semibold text-[#2D5B4A]">Recommended</h3>
                    </div>
                    <p className="text-xs text-gray-600">
                      Best availability on{' '}
                      <span className="font-semibold">
                        {format(parseISO(bestDay.date), 'EEE, MMM d')}
                      </span>
                    </p>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full h-9 text-sm"
                    onClick={() => {
                      setSelectedSport(null)
                      setSelectedCourt(null)
                      setSelectedDate(new Date(new Date().setHours(0,0,0,0)))
                      setSelectedTime(null)
                    }}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={paymentDialogOpen} onOpenChange={handlePaymentDialogChange}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              Securely enter your payment details to finalize this booking.
            </DialogDescription>
          </DialogHeader>
          {pendingBookingId && paymentInfo && (
            <PaymentSheet
              bookingId={pendingBookingId}
              amount={paymentInfo.total}
              currency="usd"
              onSuccess={handlePaymentSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
