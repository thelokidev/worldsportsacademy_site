'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { DateRangeFilter, DateRange } from './date-range-filter'

type Sport = {
  id: string
  name: string
  display_name: string
}

export function BookingFilters({
  sports,
  currentStatus,
  currentSportId,
  currentStartDate,
  currentEndDate,
}: {
  sports: Sport[]
  currentStatus?: string
  currentSportId?: string
  currentStartDate?: string
  currentEndDate?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize date range from URL params
  const [dateRange, setDateRange] = useState<DateRange | null>(() => {
    if (currentStartDate && currentEndDate) {
      return {
        from: new Date(currentStartDate),
        to: new Date(currentEndDate),
        label: `${format(new Date(currentStartDate), 'MMM d')} - ${format(new Date(currentEndDate), 'MMM d, yyyy')}`,
      }
    }
    return null
  })

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

  const handleDateChange = useCallback((range: DateRange | null) => {
    setDateRange(range)
    const params = new URLSearchParams(searchParams.toString())
    
    if (range) {
      params.set('startDate', range.from.toISOString())
      params.set('endDate', range.to.toISOString())
    } else {
      params.delete('startDate')
      params.delete('endDate')
    }
    // Reset to page 1 when filters change
    params.delete('page')
    router.push(`/admin/bookings?${params.toString()}`)
  }, [router, searchParams])

  function clearFilters() {
    setDateRange(null)
    router.push('/admin/bookings')
  }

  const hasActiveFilters = currentStatus || currentSportId || dateRange

  return (
    <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-gray-800">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-400">Filters:</span>
      </div>

      {/* Date Range Filter */}
      <DateRangeFilter
        value={dateRange}
        onChange={handleDateChange}
        className="w-full sm:w-auto"
      />

      {/* Status Filter */}
      <Select
        value={currentStatus || 'all'}
        onValueChange={(value) => updateFilter('status', value)}
      >
        <SelectTrigger className="w-full sm:w-[150px] bg-gray-900/50 border-gray-800 text-gray-300">
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
        <SelectTrigger className="w-full sm:w-[180px] bg-gray-900/50 border-gray-800 text-gray-300">
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
          className="gap-1 text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <X className="h-4 w-4" />
          Clear All
        </Button>
      )}
    </div>
  )
}
