'use client'

import { useEffect, useState } from 'react'
import { getSports } from '@/server/queries/bookings'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface Sport {
  id: string
  name: string
  display_name: string
  description?: string
}

interface SportSelectorProps {
  onSelect: (sport: Sport) => void
}

export function SportSelector({ onSelect }: SportSelectorProps) {
  const [sports, setSports] = useState<Sport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSports() {
      try {
        const data = await getSports()
        setSports(data as Sport[])
      } catch (error) {
        console.error('Failed to fetch sports:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSports()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (sports.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No sports available</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {sports.map((sport) => {
        const isComingSoon = sport.status === 'coming_soon'
        const isInactive = sport.status === 'inactive'
        
        return (
          <Card
            key={sport.id}
            className={`transition-shadow ${
              isComingSoon || isInactive
                ? 'opacity-60 cursor-not-allowed'
                : 'cursor-pointer hover:shadow-lg'
            }`}
            onClick={() => !isComingSoon && !isInactive && onSelect(sport)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold">{sport.display_name}</h3>
                {isComingSoon && (
                  <Badge variant="secondary">Coming Soon</Badge>
                )}
                {isInactive && (
                  <Badge variant="outline">Unavailable</Badge>
                )}
              </div>
              {sport.description && (
                <p className="text-sm text-muted-foreground">{sport.description}</p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

