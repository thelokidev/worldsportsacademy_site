'use client'

import { useEffect, useState } from 'react'
import { getCourtsBySport } from '@/server/queries/bookings'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface Court {
  id: string
  name: string
  is_active: boolean
}

interface CourtSelectorProps {
  sportId: string
  onSelect: (court: Court) => void
}

export function CourtSelector({ sportId, onSelect }: CourtSelectorProps) {
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCourts() {
      try {
        const data = await getCourtsBySport(sportId)
        setCourts(data as Court[])
      } catch (error) {
        console.error('Failed to fetch courts:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCourts()
  }, [sportId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (courts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No courts available for this sport</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {courts.map((court) => (
        <Card
          key={court.id}
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onSelect(court)}
        >
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold">{court.name}</h3>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

