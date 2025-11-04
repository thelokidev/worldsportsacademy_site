'use client'

import { useState } from 'react'
import { SportSelector } from './sport-selector'
import { CourtSelector } from './court-selector'
import { TimeSlotPicker } from './time-slot-picker'
import { BookingSummary } from './booking-summary'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

type BookingStep = 'sport' | 'court' | 'time' | 'summary'

export function BookingWizard() {
  const [step, setStep] = useState<BookingStep>('sport')
  const [selectedSport, setSelectedSport] = useState<any>(null)
  const [selectedCourt, setSelectedCourt] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  function handleSportSelect(sport: any) {
    setSelectedSport(sport)
    setStep('court')
  }

  function handleCourtSelect(court: any) {
    setSelectedCourt(court)
    setStep('time')
  }

  function handleTimeSelect(date: Date, time: string) {
    setSelectedDate(date)
    setSelectedTime(time)
    setStep('summary')
  }

  function handleBack() {
    if (step === 'summary') {
      setStep('time')
    } else if (step === 'time') {
      setStep('court')
    } else if (step === 'court') {
      setStep('sport')
    }
  }

  return (
    <div className="space-y-6">
      {step !== 'sport' && (
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      )}

      {step === 'sport' && <SportSelector onSelect={handleSportSelect} />}
      {step === 'court' && selectedSport && (
        <CourtSelector sportId={selectedSport.id} onSelect={handleCourtSelect} />
      )}
      {step === 'time' && selectedSport && selectedCourt && (
        <TimeSlotPicker
          sportId={selectedSport.id}
          courtId={selectedCourt.id}
          onSelect={handleTimeSelect}
        />
      )}
      {step === 'summary' && selectedSport && selectedCourt && selectedDate && selectedTime && (
        <BookingSummary
          sport={selectedSport}
          court={selectedCourt}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onBack={handleBack}
        />
      )}
    </div>
  )
}

