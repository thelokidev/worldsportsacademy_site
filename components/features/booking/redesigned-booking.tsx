'use client'

import { useState, useEffect, useMemo, useTransition, type SVGProps } from 'react'
import { getSports } from '@/server/queries/bookings'
import { getCourtsBySport } from '@/server/queries/bookings'
import { Button } from '@/components/ui/button'
import { Loader2, Check, Calendar as CalendarIcon, Clock, CreditCard, Dumbbell, Circle, Grid3x3, ArrowRight, Info, X, Crown, Users } from 'lucide-react'
import { format, addDays, parseISO, addMinutes, startOfDay } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Calendar } from '@/components/ui/calendar'

// Facility timezone - must match the timezone used in server/actions/bookings.ts
const FACILITY_TIMEZONE = 'America/Chicago'

// Table Tennis Social Open Play: Mon/Wed/Fri 7–9 PM, $15 excl. tax
const SOCIAL_OPEN_PLAY_DAYS = [1, 3, 5] // 0=Sun, 1=Mon, 3=Wed, 5=Fri
const SOCIAL_OPEN_PLAY_PRICE = 15
const SOCIAL_OPEN_PLAY_TAX_RATE = 0.13
const SOCIAL_OPEN_PLAY_TIME_LABEL = '7:00 PM – 9:00 PM'

/** Squash racket icon (elongated oval head, short handle – distinct from tennis). */
function SquashIcon({ className, size = 24, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Oval head (squash rackets are more rounded/compact than tennis) */}
      <ellipse cx="12" cy="8" rx="5" ry="6" />
      {/* Handle */}
      <path d="M12 14v8" />
      <path d="M10 22h4" />
    </svg>
  )
}

/** Table tennis paddle icon (round bat + ball). */
function TableTennisIcon({ className, size = 24, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Paddle (round bat) */}
      <circle cx="8" cy="14" r="4" />
      {/* Handle */}
      <path d="M8 18v3" />
      {/* Ball */}
      <circle cx="18" cy="10" r="2.5" />
    </svg>
  )
}

export function RedesignedBooking() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // State
  const [sports, setSports] = useState<any[]>([])
  const [courts, setCourts] = useState<any[]>([])
  const [selectedSport, setSelectedSport] = useState<any>(null)
  const [selectedCourt, setSelectedCourt] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedAvailableSlots, setSelectedAvailableSlots] = useState<number>(0)
  const [participantsCount, setParticipantsCount] = useState<number>(2) // Default to full court
  const [slots, setSlots] = useState<any[]>([])

  // Payment state
  const [checkingAuth, setCheckingAuth] = useState(false)
  const [requiresPayment, setRequiresPayment] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState<{
    price: number
    tax: number
    total: number
  } | null>(null)
  const [isMembershipCovered, setIsMembershipCovered] = useState(false)

  // Loading states
  const [loadingSports, setLoadingSports] = useState(true)
  const [loadingCourts, setLoadingCourts] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  // Transition to keep UI responsive during date changes
  const [isDatePending, startDateTransition] = useTransition()

  const [currentStep, setCurrentStep] = useState(1)
  const [dropInMode, setDropInMode] = useState<'regular' | 'social_open_play' | null>(null)
  const [socialOpenPlayBookingId, setSocialOpenPlayBookingId] = useState<string | null>(null)

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
      bookableWindow: 'bg-[#50C878]/10 text-[#50C878] font-semibold hover:bg-[#50C878]/20',
      lockedWindow: 'opacity-25 text-gray-600 grayscale cursor-not-allowed',
    }),
    []
  )

  // Sport icons – accurate per sport (squash racket, table tennis paddle, etc.)
  const getSportIcon = (sportName: string) => {
    const name = sportName.toLowerCase()
    if (name.includes('squash')) return SquashIcon
    if (name.includes('table') && (name.includes('tennis') || name.includes('ping'))) return TableTennisIcon
    if (name.includes('chess')) return Grid3x3
    if (name.includes('fitness') || name.includes('gym')) return Dumbbell
    return Circle
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
        // Order: Table Tennis first, Squash second, then Soon (Chess, Pilates) at bottom
        const displayOrder = ['table tennis', 'squash', 'chess', 'pilates']
        const orderIndex = (name: string) => {
          const n = (name || '').toLowerCase().trim()
          const idx = displayOrder.findIndex((key) => n.includes(key))
          return idx === -1 ? displayOrder.length : idx
        }
        const sortedData = [...data].sort((a, b) => {
          const nameA = a.display_name || a.name || ''
          const nameB = b.display_name || b.name || ''
          return orderIndex(nameA) - orderIndex(nameB)
        })
        setSports(sortedData)
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
      setIsMembershipCovered(false)
      return
    }

    setRequiresPayment(true)
    setPaymentInfo(null)
    setIsMembershipCovered(false)

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

        if (response.status === 401) {
          toast.info('Please sign in to continue', { duration: 3000 })
          window.location.href = `/auth?redirect=${encodeURIComponent('/drop-in')}`
          return
        }
        if (!response.ok) {
          throw new Error(data?.error || 'Failed to check authorization')
        }

        if (data.coveredByMembership) {
          setIsMembershipCovered(true)
          setRequiresPayment(false)
          setPaymentInfo(null)
          return
        }

        setIsMembershipCovered(false)

        if (data.requiresPayment) {
          if (
            typeof data.dropInPrice === 'number' &&
            typeof data.tax === 'number' &&
            typeof data.total === 'number'
          ) {
            setRequiresPayment(true)
            setPaymentInfo({
              price: data.dropInPrice,
              tax: data.tax,
              total: data.total,
            })
          } else {
            setRequiresPayment(true)
            setPaymentInfo(null)
          }
          return
        }

        if (data.canBook === false && data.reason) {
          toast.error(data.reason, { duration: 4000 })
        }

        setRequiresPayment(true)
        setPaymentInfo(null)
      } catch (error) {
        console.error('Authorization check error:', error)
        setRequiresPayment(true)
        setIsMembershipCovered(false)
        setPaymentInfo(null)
        toast.error('Failed to verify membership. Please try again.', {
          duration: 4000,
        })
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
      .map((s: any) => ({
        ...s,
        availableSlots: s.availableSlots ?? 2, // Default to 2 for backward compatibility
      }))
      .sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime())
  }, [selectedDate, slots])

  // Check if sport is coming soon (chess, pilates)
  const isComingSoon = (sport: any) => {
    const name = sport.display_name?.toLowerCase() || sport.name?.toLowerCase() || ''
    return name.includes('chess') || name.includes('pilates')
  }

  // Handle sport selection
  const handleSportSelect = (sport: any) => {
    if (isComingSoon(sport)) {
      const sportName = sport.display_name || sport.name || 'This sport'
      toast.info(`${sportName} bookings are coming soon!`, {
        duration: 3000,
      })
      return
    }
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
  const handleTimeSelect = (time: string, availableSlots: number) => {
    setSelectedTime(time)
    setSelectedAvailableSlots(availableSlots)
    // Default to max available, or 2 if full capacity
    setParticipantsCount(Math.min(2, availableSlots))
  }

  const cancelPendingBooking = async (bookingId: string) => {
    try {
      await fetch('/api/booking/cancel-pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      })
    } catch (error) {
      console.error('Failed to cancel pending booking:', error)
    }
  }

  const startStripeCheckout = async (bookingId: string) => {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentType: 'drop_in',
          bookingId,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const errorMessage = data?.error || 'Failed to initialize checkout session'
        await cancelPendingBooking(bookingId)
        throw new Error(errorMessage)
      }

      if (data?.url) {
        window.location.href = data.url as string
        return
      }

      await cancelPendingBooking(bookingId)
      throw new Error('Checkout session did not return a redirect URL. Please try again.')
    } catch (error) {
      await cancelPendingBooking(bookingId)
      throw error instanceof Error ? error : new Error('Failed to start checkout session')
    }
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
        const response = await fetch('/api/booking/create-pending', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sportId: selectedSport.id,
            courtId: selectedCourt.id,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            durationMinutes,
            participantsCount,
          }),
        })

        if (response.status === 401) {
          toast.info('Please sign in to continue', { duration: 3000 })
          window.location.href = `/auth?redirect=${encodeURIComponent('/drop-in')}`
          return
        }
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create pending booking')
        }

        const { bookingId } = await response.json()

        if (!bookingId) {
          throw new Error('Failed to create pending booking')
        }

        await startStripeCheckout(bookingId)
        return
      }

      if (!isMembershipCovered) {
        throw new Error('Active membership required to book without payment.')
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
      formData.append('participantsCount', participantsCount.toString())

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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Drop-in Sessions</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Book flexible pay-as-you-go sessions for table tennis and squash. No membership required.
            </p>
          </div>
        </div>
      </div>

      {/* Membership promo – compact */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 -mt-2">
        <div className="relative overflow-hidden rounded-xl bg-black/60 border border-[#50C878]/25 shadow-sm">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_-10%,rgba(80,200,120,0.08),transparent)] pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 md:p-5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-[#50C878]/20 flex items-center justify-center shrink-0">
                <Crown className="w-5 h-5 text-[#50C878]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base md:text-lg font-bold text-white truncate">
                  Play more. <span className="text-[#50C878]">Pay less.</span>
                </h3>
                <p className="text-gray-500 text-xs mt-0.5">From $75/mo · Drop-in $15 vs membership ~$3/session*</p>
              </div>
            </div>
            <Button
              asChild
              className="bg-[#50C878] hover:bg-[#45B86A] text-black font-semibold text-sm px-4 py-2 h-9 rounded-lg shrink-0"
            >
              <Link href="/memberships">View Memberships</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Entry choice: Regular drop-in vs Social Open Play */}
      {dropInMode === null && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto">
            <p className="text-center text-white/80 text-sm mb-6">Choose how you want to play</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setDropInMode('regular')
                  setCurrentStep(1)
                }}
                className="group relative flex flex-col p-6 rounded-2xl bg-black/80 border border-white/10 hover:border-[#50C878]/50 transition-all duration-300 text-left"
                aria-label="Book a regular drop-in session (pick sport, court, date and time)"
              >
                <div className="w-12 h-12 rounded-xl bg-[#50C878]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-[#50C878]" aria-hidden />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Regular drop-in</h3>
                <p className="text-sm text-gray-400">
                  Pick your sport, court, date and time. Flexible pay-as-you-go.
                </p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDropInMode('social_open_play')
                  setCurrentStep(1)
                  setSelectedDate(undefined)
                }}
                className="group relative flex flex-col p-6 rounded-2xl bg-black/80 border border-white/10 hover:border-[#50C878]/50 transition-all duration-300 text-left"
                aria-label="Book Table Tennis Social Open Play (Mon/Wed/Fri 7–9 PM)"
              >
                <div className="w-12 h-12 rounded-xl bg-[#50C878]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-[#50C878]" aria-hidden />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Table Tennis Social Open Play</h3>
                <p className="text-sm text-gray-400 mb-2">
                  Mon, Wed & Fri · 7:00 PM – 9:00 PM · $15 + tax. Play with random drop-ins, organized by Coach Abhinay.
                </p>
                <span className="text-xs text-[#50C878] font-medium">2 hours · Drop-in style</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar – only when mode chosen */}
      {dropInMode !== null && (
        <div className="bg-black/90 backdrop-blur-sm border-b border-gray-800/80 shadow-sm sticky top-20 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {(dropInMode === 'social_open_play'
                ? [
                  { num: 1, label: 'Date', done: !!selectedDate },
                  { num: 2, label: 'Review & Book', done: !!selectedDate },
                ]
                : [
                  { num: 1, label: 'Sport', done: !!selectedSport },
                  { num: 2, label: 'Court', done: !!selectedCourt },
                  { num: 3, label: 'Date & Time', done: !!selectedDate && !!selectedTime },
                  { num: 4, label: 'Review & Book', done: isComplete },
                ]
              ).map((step, idx, arr) => {
                const isHighlighted = step.done || currentStep === step.num
                return (
                  <div key={step.num} className="flex items-center flex-1">
                    <button
                      onClick={() => setCurrentStep(step.num)}
                      className="flex flex-col items-center gap-2 group"
                      aria-current={isHighlighted && step.num === currentStep ? 'step' : undefined}
                      aria-label={`Step ${step.num}: ${step.label}${step.done ? ', completed' : ''}`}
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step.done
                          ? 'bg-[#50C878] text-white scale-110'
                          : isHighlighted
                            ? 'bg-[#50C878] text-white scale-105'
                            : 'bg-gray-900 text-gray-400'
                          }`}
                      >
                        {step.done ? <Check className="w-4 h-4" /> : step.num}
                      </div>
                      <span
                        className={`text-xs font-medium ${isHighlighted ? 'text-[#50C878] dark:text-[#50C878]' : 'text-gray-400 dark:text-gray-400'}`}
                      >
                        {step.label}
                      </span>
                    </button>
                    {idx < arr.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-2 rounded transition-all ${step.done ? 'bg-[#50C878]' : 'bg-gray-900'}`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content - single column */}
      {dropInMode !== null && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-3xl mx-auto space-y-5">
            {dropInMode === 'social_open_play' ? (
              <>
                {/* Social Open Play Step 1: Select Date (Mon/Wed/Fri only) */}
                <div className="bg-black/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-800/80 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#2D5B4A] to-[#50C878] px-5 py-3">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">1</span>
                      Select Date (Mon, Wed or Fri)
                    </h2>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-gray-400 mb-4">
                      Table Tennis Social Open Play runs 7:00 PM – 9:00 PM. Pick a Monday, Wednesday or Friday.
                    </p>
                    <div className="w-full max-w-[320px] shrink-0 max-h-[380px] overflow-hidden flex justify-center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date)
                          setCurrentStep(2)
                        }}
                        disabled={(date) =>
                          !SOCIAL_OPEN_PLAY_DAYS.includes(date.getDay()) ||
                          date < bookingWindowStart ||
                          date > bookingWindowEnd
                        }
                        className="rounded-xl border border-gray-800 bg-[#111111] p-4 w-full shadow-lg shadow-black/50"
                        fromDate={bookingWindowStart}
                        toDate={bookingWindowEnd}
                        modifiers={calendarModifiers}
                        modifiersClassNames={calendarModifierClasses}
                        classNames={{
                          months: 'flex flex-col w-full shrink-0',
                          month: 'space-y-2 w-full shrink-0',
                          month_caption: 'flex justify-between items-center w-full pt-1 pb-2 relative',
                          caption_label: 'text-base font-bold text-white tracking-wide font-sans',
                          nav: 'relative w-full flex items-center justify-between gap-2 min-h-[2rem]',
                          button_previous: 'h-8 w-8 shrink-0 bg-gray-800 hover:bg-[#50C878] hover:text-white rounded-full transition-all flex items-center justify-center border border-gray-700 text-gray-400 shadow hover:scale-105 active:scale-95 duration-200 [&_svg]:w-4 [&_svg]:h-4',
                          button_next: 'h-8 w-8 shrink-0 bg-gray-800 hover:bg-[#50C878] hover:text-white rounded-full transition-all flex items-center justify-center border border-gray-700 text-gray-400 shadow hover:scale-105 active:scale-95 duration-200 [&_svg]:w-4 [&_svg]:h-4',
                          chevron: 'text-current',
                          month_grid: 'w-full border-collapse',
                          weekdays: 'grid grid-cols-7 mb-2 place-items-center',
                          weekday: 'text-gray-500 font-semibold text-[0.75rem] uppercase tracking-wider text-center w-9',
                          weeks: 'space-y-1',
                          week: 'grid grid-cols-7 w-full gap-y-1 place-items-center',
                          day: 'relative p-0 text-center h-9 w-9 flex items-center justify-center',
                          day_button: 'h-9 w-9 p-0 text-sm font-medium rounded-full transition-all text-white hover:scale-105 hover:bg-[#50C878]/20 hover:text-[#50C878] border border-transparent focus:outline-none focus:ring-2 focus:ring-[#50C878] focus:ring-offset-2 focus:ring-offset-black touch-manipulation flex items-center justify-center',
                          selected: '!bg-[#50C878] !text-white !font-bold shadow-[0_0_12px_rgba(80,200,120,0.5)] !scale-105 !z-10 relative !border-none',
                          today: 'bg-white/5 text-white font-bold ring-1 ring-white/20',
                          outside: 'text-gray-700 opacity-20',
                          disabled: 'text-gray-700 opacity-20 cursor-not-allowed hover:!bg-transparent hover:!scale-100',
                          hidden: 'invisible',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Social Open Play Step 2: Review & Book */}
                {selectedDate && (
                  <div className="bg-black/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-800/80 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#2D5B4A] to-[#50C878] px-5 py-3">
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">2</span>
                        Review & Book
                      </h2>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-800/80 bg-gray-900/40">
                          <CalendarIcon className="w-4 h-4 text-[#50C878]" />
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-gray-500">Date</div>
                            <div className="text-sm font-semibold text-white">{format(selectedDate, 'EEE, MMM d, yyyy')}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-800/80 bg-gray-900/40">
                          <Clock className="w-4 h-4 text-[#50C878]" />
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-gray-500">Time</div>
                            <div className="text-sm font-semibold text-white">{SOCIAL_OPEN_PLAY_TIME_LABEL}</div>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg border border-[#50C878]/30 bg-[#50C878]/5">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-300">Table Tennis Social Open Play</span>
                          <span className="font-semibold text-white">
                            ${SOCIAL_OPEN_PLAY_PRICE} + 13% HST = ${(SOCIAL_OPEN_PLAY_PRICE * (1 + SOCIAL_OPEN_PLAY_TAX_RATE)).toFixed(2)} CAD
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={async () => {
                          setSubmitting(true)
                          try {
                            const bookingDateStr = format(selectedDate, 'yyyy-MM-dd')
                            const createRes = await fetch('/api/booking/create-pending-social-open-play', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ bookingDate: bookingDateStr }),
                            })
                            if (createRes.status === 401) {
                              toast.info('Please sign in to continue', { duration: 3000 })
                              window.location.href = `/auth?redirect=${encodeURIComponent('/drop-in')}`
                              return
                            }
                            if (!createRes.ok) {
                              const err = await createRes.json()
                              throw new Error(err.error || 'Failed to create booking')
                            }
                            const { socialOpenPlayBookingId: id } = await createRes.json()
                            if (!id) throw new Error('No booking ID returned')
                            setSocialOpenPlayBookingId(id)
                            const checkoutRes = await fetch('/api/stripe/checkout', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                paymentType: 'social_open_play',
                                socialOpenPlayBookingId: id,
                              }),
                            })
                            if (!checkoutRes.ok) {
                              const err = await checkoutRes.json()
                              throw new Error(err.error || 'Failed to start checkout')
                            }
                            const { url } = await checkoutRes.json()
                            if (url) window.location.href = url
                            else throw new Error('No checkout URL')
                          } catch (e) {
                            toast.error(e instanceof Error ? e.message : 'Booking failed')
                          } finally {
                            setSubmitting(false)
                          }
                        }}
                        disabled={submitting}
                        className="w-full h-10 bg-[#50C878] hover:bg-[#45B86A] text-black font-semibold rounded-lg"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing…
                          </>
                        ) : (
                          'Book & Pay $15 + tax'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Step 1: Select Sport */}
                <div className="bg-black/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-800/80 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#2D5B4A] to-[#50C878] px-5 py-3">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">1</span>
                      Choose Your Sport
                    </h2>
                  </div>
                  <div className="p-5">
                    {loadingSports ? (
                      <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-7 w-7 animate-spin text-[#50C878]" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {sports.map((sport) => {
                          const Icon = getSportIcon(sport.display_name)
                          const comingSoon = isComingSoon(sport)
                          return (
                            <button
                              key={sport.id}
                              onClick={() => handleSportSelect(sport)}
                              disabled={comingSoon}
                              className={`relative group p-4 rounded-lg border transition-all duration-200 text-left ${comingSoon
                                ? 'border-gray-700/80 bg-gray-800/40 opacity-60 cursor-not-allowed'
                                : selectedSport?.id === sport.id
                                  ? 'border-[#50C878] bg-[#50C878]/10 dark:bg-[#50C878]/10 shadow-sm'
                                  : 'border-gray-800/80 hover:border-[#50C878]/40 hover:bg-gray-800/60 bg-gray-900/50'
                                }`}
                            >
                              {comingSoon && (
                                <div className="absolute top-1.5 right-1.5 z-10">
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-semibold uppercase tracking-wide">
                                    Soon
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${comingSoon
                                    ? 'bg-gray-700 text-gray-500'
                                    : selectedSport?.id === sport.id
                                      ? 'bg-[#50C878] text-white'
                                      : 'bg-gray-800 text-white group-hover:bg-[#50C878]/20'
                                    }`}
                                >
                                  <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className={`font-semibold text-sm mb-0.5 truncate ${comingSoon ? 'text-gray-500' : 'text-white dark:text-white'}`}>
                                    {sport.display_name}
                                  </h3>
                                  <p className={`text-xs ${comingSoon ? 'text-gray-600' : 'text-gray-400 dark:text-gray-400'}`}>
                                    {comingSoon ? 'Available soon' : `${sport.duration_minutes} min`}
                                  </p>
                                </div>
                                {selectedSport?.id === sport.id && !comingSoon && (
                                  <Check className="w-5 h-5 text-[#50C878] shrink-0" />
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
                  <div className="bg-black/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-800/80 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#2D5B4A] to-[#50C878] px-5 py-3">
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">2</span>
                        Choose Your Court
                      </h2>
                    </div>
                    <div className="p-5">
                      {loadingCourts ? (
                        <div className="flex items-center justify-center py-10">
                          <Loader2 className="h-7 w-7 animate-spin text-[#50C878]" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {courts.map((court) => (
                            <button
                              key={court.id}
                              onClick={() => handleCourtSelect(court)}
                              className={`p-4 rounded-lg border transition-all duration-200 text-left flex items-center justify-between gap-3 ${selectedCourt?.id === court.id
                                ? 'border-[#50C878] bg-[#50C878]/10 dark:bg-[#50C878]/10 shadow-sm'
                                : 'border-gray-800/80 hover:border-[#50C878]/40 hover:bg-gray-800/60 bg-gray-900/50'
                                }`}
                            >
                              <div className="min-w-0">
                                <h3 className="font-semibold text-sm text-white dark:text-white truncate">{court.name}</h3>
                                <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5 truncate">
                                  {court.location || 'Available for booking'}
                                </p>
                              </div>
                              {selectedCourt?.id === court.id && (
                                <Check className="w-5 h-5 text-[#50C878] shrink-0" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Select Date & Time */}
                {selectedCourt && (
                  <div className="bg-black/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-800/80 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#2D5B4A] to-[#50C878] px-5 py-3">
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">3</span>
                        Pick Date & Time
                      </h2>
                    </div>
                    <div className="p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                        {/* Date Picker - constrained so it doesn't stretch */}
                        <div className="flex flex-col items-center min-w-0">
                          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 w-full text-left">
                            Select Date
                          </label>
                          <div className="w-full max-w-[320px] shrink-0 max-h-[380px] overflow-hidden flex justify-center">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={handleDateSelect}
                              disabled={(date) =>
                                date < bookingWindowStart || date > bookingWindowEnd
                              }
                              className="rounded-xl border border-gray-800 bg-[#111111] p-4 w-full shadow-lg shadow-black/50"
                              fromDate={bookingWindowStart}
                              toDate={bookingWindowEnd}
                              modifiers={calendarModifiers}
                              modifiersClassNames={calendarModifierClasses}
                              classNames={{
                                months: 'flex flex-col w-full shrink-0',
                                month: 'space-y-2 w-full shrink-0',
                                month_caption: 'flex justify-between items-center w-full pt-1 pb-2 relative',
                                caption_label: 'text-base font-bold text-white tracking-wide font-sans',
                                nav: 'relative w-full flex items-center justify-between gap-2 min-h-[2rem]',
                                button_previous: 'h-8 w-8 shrink-0 bg-gray-800 hover:bg-[#50C878] hover:text-white rounded-full transition-all flex items-center justify-center border border-gray-700 text-gray-400 shadow hover:scale-105 active:scale-95 duration-200 [&_svg]:w-4 [&_svg]:h-4',
                                button_next: 'h-8 w-8 shrink-0 bg-gray-800 hover:bg-[#50C878] hover:text-white rounded-full transition-all flex items-center justify-center border border-gray-700 text-gray-400 shadow hover:scale-105 active:scale-95 duration-200 [&_svg]:w-4 [&_svg]:h-4',
                                chevron: 'text-current',
                                month_grid: 'w-full border-collapse',
                                weekdays: 'grid grid-cols-7 mb-2 place-items-center',
                                weekday: 'text-gray-500 font-semibold text-[0.75rem] uppercase tracking-wider text-center w-9',
                                weeks: 'space-y-1',
                                week: 'grid grid-cols-7 w-full gap-y-1 place-items-center',
                                day: 'relative p-0 text-center h-9 w-9 flex items-center justify-center',
                                day_button: 'h-9 w-9 p-0 text-sm font-medium rounded-full transition-all text-white hover:scale-105 hover:bg-[#50C878]/20 hover:text-[#50C878] border border-transparent focus:outline-none focus:ring-2 focus:ring-[#50C878] focus:ring-offset-2 focus:ring-offset-black touch-manipulation flex items-center justify-center',
                                selected: '!bg-[#50C878] !text-white !font-bold shadow-[0_0_12px_rgba(80,200,120,0.5)] !scale-105 !z-10 relative !border-none',
                                today: 'bg-white/5 text-white font-bold ring-1 ring-white/20',
                                outside: 'text-gray-700 opacity-20',
                                disabled: 'text-gray-700 opacity-20 cursor-not-allowed hover:!bg-transparent hover:!scale-100',
                                hidden: 'invisible',
                              }}
                            />
                          </div>
                          <div className="mt-3 flex justify-center">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#50C878]/10 border border-[#50C878]/20">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#50C878] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#50C878]"></span>
                              </span>
                              <span className="text-[10px] font-medium uppercase tracking-wider text-[#50C878]">Next 14 days</span>
                            </div>
                          </div>
                        </div>

                        {/* Time Picker - aligned to top, scrollable list */}
                        <div className="min-w-0 flex flex-col">
                          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Select Time
                          </label>
                          {loadingSlots ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="h-6 w-6 animate-spin text-[#50C878]" />
                            </div>
                          ) : availableTimeSlots.length > 0 ? (
                            <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1.5">
                              {availableTimeSlots.map((slot: any) => {
                                const slotTime = toZonedTime(parseISO(slot.time), FACILITY_TIMEZONE)
                                const slotEndTime = addMinutes(slotTime, durationMinutes)
                                const spotsAvailable = slot.availableSlots ?? 2
                                const isPartial = spotsAvailable === 1
                                return (
                                  <button
                                    key={slot.time}
                                    onClick={() => handleTimeSelect(slot.time, spotsAvailable)}
                                    className={`w-full p-3 rounded-lg border transition-all duration-200 text-left group relative overflow-hidden ${selectedTime === slot.time
                                      ? 'border-[#50C878] bg-[#50C878] text-white shadow-sm'
                                      : 'border-gray-800/80 hover:border-[#50C878]/40 hover:bg-[#50C878]/5 bg-gray-900/50'
                                      }`}
                                  >
                                    <div className="flex items-center justify-between relative z-10 gap-2">
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <Clock className={`w-4 h-4 shrink-0 transition-colors ${selectedTime === slot.time ? 'text-white' : 'text-[#50C878]'}`} />
                                        <div className="min-w-0">
                                          <div className={`font-semibold text-sm truncate ${selectedTime === slot.time ? 'text-white' : 'text-white'}`}>
                                            {format(slotTime, 'h:mm a')} – {format(slotEndTime, 'h:mm a')}
                                          </div>
                                          <div className={`text-xs ${selectedTime === slot.time ? 'text-emerald-100' : 'text-gray-400'}`}>
                                            {durationMinutes} min
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {/* Capacity badge */}
                                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${isPartial
                                          ? selectedTime === slot.time ? 'bg-white/20 text-white' : 'bg-amber-500/20 text-amber-400'
                                          : selectedTime === slot.time ? 'bg-white/20 text-white' : 'bg-green-500/20 text-green-400'
                                          }`}>
                                          {spotsAvailable === 2 ? 'Open' : '1 spot left'}
                                        </span>
                                        {selectedTime === slot.time && (
                                          <Check className="w-4 h-4 text-white shrink-0" />
                                        )}
                                      </div>
                                    </div>
                                  </button>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <CalendarIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
                              <p className="text-sm">No slots for this date</p>
                              <p className="text-xs mt-0.5">Pick another date</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Review & Book */}
                {selectedCourt && (
                  <div className="bg-black/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-800/80 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#2D5B4A] to-[#50C878] px-5 py-3">
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">4</span>
                        Review & Book
                      </h2>
                    </div>
                    <div className="p-5 space-y-4">
                      {/* Selection summary - compact row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-800/80 bg-gray-900/40">
                          {(() => {
                            const SportIcon = getSportIcon(selectedSport?.display_name || '')
                            return <SportIcon className="w-4 h-4 text-[#50C878] shrink-0" />
                          })()}
                          <div className="min-w-0">
                            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">Sport</div>
                            <div className="font-medium text-xs text-white truncate">
                              {selectedSport?.display_name || '—'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-800/80 bg-gray-900/40">
                          <Circle className="w-4 h-4 text-[#50C878] shrink-0" />
                          <div className="min-w-0">
                            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">Court</div>
                            <div className="font-medium text-xs text-white truncate">
                              {selectedCourt?.name || '—'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-800/80 bg-gray-900/40">
                          <CalendarIcon className="w-4 h-4 text-[#50C878] shrink-0" />
                          <div className="min-w-0">
                            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">Date</div>
                            <div className="font-medium text-xs text-white truncate" aria-busy={isDatePending}>
                              {isDatePending ? '…' : (selectedDate ? format(selectedDate, 'EEE, MMM d') : '—')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-800/80 bg-gray-900/40">
                          <Clock className="w-4 h-4 text-[#50C878] shrink-0" />
                          <div className="min-w-0">
                            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">Time</div>
                            <div className="font-medium text-xs text-white truncate" aria-busy={isDatePending}>
                              {isDatePending
                                ? '…'
                                : (selectedTime && endTime
                                  ? format(toZonedTime(parseISO(selectedTime), FACILITY_TIMEZONE), 'h:mm a')
                                  : '—')}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Player Count Selector - only show if time is selected */}
                      {selectedTime && selectedAvailableSlots > 0 && (
                        <div className="bg-gray-900/40 rounded-lg p-4 border border-gray-800/80">
                          <div className="flex items-center gap-2 mb-3">
                            <Users className="w-4 h-4 text-[#50C878]" />
                            <span className="font-semibold text-white text-sm">Number of Players</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => setParticipantsCount(1)}
                              disabled={selectedAvailableSlots < 1}
                              className={`p-3 rounded-lg border transition-all duration-200 text-left ${participantsCount === 1
                                ? 'border-[#50C878] bg-[#50C878]/10'
                                : 'border-gray-800/80 hover:border-[#50C878]/40 bg-gray-900/50'
                                } ${selectedAvailableSlots < 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-semibold text-sm text-white">1 Player</div>
                                  <div className="text-xs text-gray-400 mt-0.5">Open Play - Someone else can join</div>
                                </div>
                                {participantsCount === 1 && <Check className="w-4 h-4 text-[#50C878]" />}
                              </div>
                            </button>
                            <button
                              onClick={() => setParticipantsCount(2)}
                              disabled={selectedAvailableSlots < 2}
                              className={`p-3 rounded-lg border transition-all duration-200 text-left ${participantsCount === 2
                                ? 'border-[#50C878] bg-[#50C878]/10'
                                : 'border-gray-800/80 hover:border-[#50C878]/40 bg-gray-900/50'
                                } ${selectedAvailableSlots < 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-semibold text-sm text-white">2 Players</div>
                                  <div className="text-xs text-gray-400 mt-0.5">Full Court - Private session</div>
                                </div>
                                {participantsCount === 2 && <Check className="w-4 h-4 text-[#50C878]" />}
                              </div>
                            </button>
                          </div>
                          {selectedAvailableSlots === 1 && (
                            <p className="text-xs text-amber-400 mt-2 flex items-center gap-1.5">
                              <Info className="w-3.5 h-3.5" />
                              Only 1 spot available - another player has already booked this slot
                            </p>
                          )}
                        </div>
                      )}

                      {/* Payment Info */}
                      {checkingAuth && (
                        <div className="flex items-center gap-2 text-xs text-gray-400 py-3">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Checking membership...
                        </div>
                      )}

                      {!checkingAuth && requiresPayment && paymentInfo && (
                        <div className="bg-amber-900/20 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-700/40 dark:border-amber-700/40">
                          <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="w-4 h-4 text-amber-400" />
                            <span className="font-semibold text-amber-300 text-sm">Payment Required</span>
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between text-gray-300">
                              <span>Drop-in:</span>
                              <span className="font-medium">${paymentInfo.price.toFixed(2)}</span>
                            </div>
                            {paymentInfo.tax > 0 && (
                              <div className="flex justify-between text-gray-300">
                                <span>Tax:</span>
                                <span className="font-medium">${paymentInfo.tax.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-semibold text-sm pt-1.5 border-t border-amber-700/40 text-amber-300">
                              <span>Total:</span>
                              <span>${paymentInfo.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {!checkingAuth && isMembershipCovered && selectedTime && (
                        <div className="bg-green-900/20 dark:bg-green-900/20 rounded-lg p-3 border border-green-700/40 flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-400 shrink-0" />
                          <span className="text-sm font-medium text-green-300">Covered by membership — no payment required</span>
                        </div>
                      )}

                      {/* Action Button */}
                      <Button
                        onClick={handleSubmit}
                        disabled={!isComplete || submitting || checkingAuth}
                        className="w-full h-11 bg-[#50C878] hover:bg-[#50C878]/90 text-white rounded-lg font-semibold text-sm shadow-sm disabled:opacity-50 transition-all duration-200"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing...
                          </>
                        ) : isMembershipCovered ? (
                          <>
                            <Check className="mr-2 h-5 w-5" />
                            Confirm Booking
                          </>
                        ) : (
                          <>
                            Continue to Payment
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>

                      {!isComplete && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-900/50 rounded-lg px-3 py-2">
                          <Info className="w-3.5 h-3.5 shrink-0" />
                          <p>Complete all steps above to proceed</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

