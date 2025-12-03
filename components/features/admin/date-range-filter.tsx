'use client'

import { useState, useCallback } from 'react'
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths, startOfDay, endOfDay } from 'date-fns'
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface DateRange {
  from: Date
  to: Date
  label: string
}

interface DateRangeFilterProps {
  value: DateRange | null
  onChange: (range: DateRange | null) => void
  className?: string
}

const presets = [
  {
    label: 'Today',
    getValue: () => ({
      from: startOfDay(new Date()),
      to: endOfDay(new Date()),
      label: 'Today',
    }),
  },
  {
    label: 'Yesterday',
    getValue: () => ({
      from: startOfDay(subDays(new Date(), 1)),
      to: endOfDay(subDays(new Date(), 1)),
      label: 'Yesterday',
    }),
  },
  {
    label: 'Last 7 days',
    getValue: () => ({
      from: startOfDay(subDays(new Date(), 6)),
      to: endOfDay(new Date()),
      label: 'Last 7 days',
    }),
  },
  {
    label: 'Last 30 days',
    getValue: () => ({
      from: startOfDay(subDays(new Date(), 29)),
      to: endOfDay(new Date()),
      label: 'Last 30 days',
    }),
  },
  {
    label: 'This week',
    getValue: () => ({
      from: startOfWeek(new Date(), { weekStartsOn: 0 }),
      to: endOfWeek(new Date(), { weekStartsOn: 0 }),
      label: 'This week',
    }),
  },
  {
    label: 'This month',
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
      label: 'This month',
    }),
  },
  {
    label: 'Last month',
    getValue: () => ({
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1)),
      label: 'Last month',
    }),
  },
  {
    label: 'Last 3 months',
    getValue: () => ({
      from: startOfMonth(subMonths(new Date(), 2)),
      to: endOfDay(new Date()),
      label: 'Last 3 months',
    }),
  },
]

export function DateRangeFilter({ value, onChange, className }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false)
  const [customRange, setCustomRange] = useState<{ from?: Date; to?: Date }>({})
  const [showCustom, setShowCustom] = useState(false)

  const handlePresetClick = useCallback((preset: typeof presets[0]) => {
    onChange(preset.getValue())
    setOpen(false)
    setShowCustom(false)
  }, [onChange])

  const handleCustomApply = useCallback(() => {
    if (customRange.from && customRange.to) {
      onChange({
        from: startOfDay(customRange.from),
        to: endOfDay(customRange.to),
        label: `${format(customRange.from, 'MMM d')} - ${format(customRange.to, 'MMM d, yyyy')}`,
      })
      setOpen(false)
    }
  }, [customRange, onChange])

  const handleClear = useCallback(() => {
    onChange(null)
    setCustomRange({})
    setShowCustom(false)
  }, [onChange])

  const displayValue = value
    ? value.label
    : 'All time'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-between gap-2 border-gray-700 bg-gray-900/50 text-gray-200 hover:bg-gray-800 hover:text-white min-w-[180px]",
            className
          )}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-[#50C878]" />
            <span className="truncate">{displayValue}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[calc(100vw-32px)] sm:w-auto p-0 bg-gray-900 border-gray-700 max-h-[85vh] overflow-y-auto"
        align="start"
        sideOffset={4}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Presets */}
          <div className={cn(
            "border-b sm:border-b-0 sm:border-r border-gray-700 p-3 space-y-1",
            showCustom ? "hidden sm:block" : "block"
          )}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
              Quick Select
            </p>
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePresetClick(preset)}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors",
                  value?.label === preset.label
                    ? "bg-[#50C878]/20 text-[#50C878]"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                )}
              >
                {preset.label}
              </button>
            ))}
            <div className="pt-2 border-t border-gray-700 mt-2">
              <button
                onClick={() => setShowCustom(true)}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors",
                  showCustom
                    ? "bg-blue-500/20 text-blue-400"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                )}
              >
                Custom range...
              </button>
            </div>
            {value && (
              <div className="pt-2 border-t border-gray-700 mt-2">
                <button
                  onClick={handleClear}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg text-red-400 hover:bg-red-900/20 transition-colors flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear filter
                </button>
              </div>
            )}
          </div>

          {/* Custom Calendar */}
          {showCustom && (
            <div className="p-3 w-full sm:w-auto">
              <div className="flex items-center justify-between mb-2 px-2 sm:hidden">
                <button
                  onClick={() => setShowCustom(false)}
                  className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Select Range
                </p>
              </div>
              <p className="hidden sm:block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                Select Range
              </p>
              <Calendar
                mode="range"
                selected={{
                  from: customRange.from,
                  to: customRange.to,
                }}
                onSelect={(range) => {
                  setCustomRange({
                    from: range?.from,
                    to: range?.to,
                  })
                }}
                numberOfMonths={1}
                className="rounded-lg border border-gray-700 w-full"
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4 w-full",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium text-gray-200",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-gray-400 hover:text-white",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex justify-between",
                  head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2 justify-between",
                  cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                  day: "h-9 w-9 p-0 font-normal text-gray-300 hover:bg-gray-800 rounded-md transition-colors",
                  day_range_end: "day-range-end",
                  day_selected: "bg-[#50C878] text-white hover:bg-[#50C878] hover:text-white focus:bg-[#50C878] focus:text-white",
                  day_today: "bg-gray-800 text-white",
                  day_outside: "text-gray-600 opacity-50",
                  day_disabled: "text-gray-600 opacity-50",
                  day_range_middle: "bg-[#50C878]/20 text-[#50C878]",
                  day_hidden: "invisible",
                }}
              />
              <div className="mt-3 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCustom(false)}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCustomApply}
                  disabled={!customRange.from || !customRange.to}
                  className="bg-[#50C878] text-white hover:bg-[#50C878]/90"
                >
                  Apply
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover >
  )
}

