'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

type Sport = {
  id: string
  name: string
  display_name: string
}

export function BookingFilters({
  sports,
  currentStatus,
  currentSportId,
}: {
  sports: Sport[]
  currentStatus?: string
  currentSportId?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    // Reset to page 1 when filters change
    params.delete('page')
    router.push(`/admin/bookings?${params.toString()}`)
  }

  function clearFilters() {
    router.push('/admin/bookings')
  }

  const hasActiveFilters = currentStatus || currentSportId

  return (
    <div className="flex flex-wrap items-center gap-3 pb-4 border-b">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Filters:</span>
      </div>

      {/* Status Filter */}
      <Select
        value={currentStatus || 'all'}
        onValueChange={(value) => updateFilter('status', value)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="confirmed">Confirmed</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="canceled">Canceled</SelectItem>
        </SelectContent>
      </Select>

      {/* Sport Filter */}
      <Select
        value={currentSportId || 'all'}
        onValueChange={(value) => updateFilter('sportId', value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Sports" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sports</SelectItem>
          {sports.map((sport) => (
            <SelectItem key={sport.id} value={sport.id}>
              {sport.display_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="gap-1"
        >
          <X className="h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </div>
  )
}

