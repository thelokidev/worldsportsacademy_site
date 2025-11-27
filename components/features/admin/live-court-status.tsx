'use client'

import { useCourtStatus, CourtStatus } from '@/hooks/use-admin-dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { format, formatDistanceToNow } from 'date-fns'
import {
  MapPin,
  Clock,
  AlertCircle,
  RefreshCw,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react'

function CourtStatusSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-5 w-24 bg-gray-700" />
            <Skeleton className="h-5 w-16 rounded-full bg-gray-700" />
          </div>
          <Skeleton className="h-4 w-32 bg-gray-700 mb-2" />
          <Skeleton className="h-3 w-40 bg-gray-700" />
        </div>
      ))}
    </div>
  )
}

function CourtCard({ court }: { court: CourtStatus }) {
  const statusConfig = {
    available: {
      color: 'bg-[#50C878]/20 text-[#50C878] border-[#50C878]/30',
      icon: CheckCircle,
      label: 'Available',
    },
    occupied: {
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      icon: User,
      label: 'In Use',
    },
    blocked: {
      color: 'bg-red-500/20 text-red-400 border-red-500/30',
      icon: XCircle,
      label: 'Blocked',
    },
    inactive: {
      color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      icon: AlertTriangle,
      label: 'Inactive',
    },
  }

  const config = statusConfig[court.status]
  const StatusIcon = config.icon

  return (
    <div className={`bg-gray-800/50 rounded-lg p-4 border transition-all duration-300 hover:bg-gray-800/70 ${
      court.status === 'occupied' ? 'border-blue-500/30' :
      court.status === 'blocked' ? 'border-red-500/30' :
      court.status === 'available' ? 'border-[#50C878]/30' :
      'border-gray-700'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="font-medium text-white">{court.name}</span>
        </div>
        <Badge className={`text-xs border ${config.color}`}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {config.label}
        </Badge>
      </div>

      <p className="text-xs text-gray-400 mb-2">
        {court.sports?.display_name || 'Unknown Sport'}
      </p>

      {court.status === 'occupied' && court.currentBooking && (
        <div className="bg-blue-500/10 rounded-md p-2 mt-2">
          <p className="text-xs text-blue-300 font-medium">
            {court.currentBooking.user?.full_name || 'Unknown User'}
          </p>
          <p className="text-xs text-blue-400/70 flex items-center gap-1 mt-1">
            <Clock className="h-3 w-3" />
            Until {format(new Date(court.currentBooking.end_time), 'h:mm a')}
          </p>
        </div>
      )}

      {court.status === 'blocked' && court.blocked_reason && (
        <div className="bg-red-500/10 rounded-md p-2 mt-2">
          <p className="text-xs text-red-400">
            {court.blocked_reason}
          </p>
        </div>
      )}

      {court.status === 'available' && court.nextBooking && (
        <div className="bg-gray-700/50 rounded-md p-2 mt-2">
          <p className="text-xs text-gray-400">
            Next: {court.nextBooking.user?.full_name || 'Unknown'}
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <Clock className="h-3 w-3" />
            {format(new Date(court.nextBooking.start_time), 'h:mm a')}
          </p>
        </div>
      )}
    </div>
  )
}

export function LiveCourtStatus() {
  const { courtData, isLoading, error, refetch } = useCourtStatus()

  if (error) {
    return (
      <Card className="bg-red-900/20 border-red-800">
        <CardContent className="flex items-center gap-3 py-4">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <span className="text-red-400">Failed to load court status</span>
          <button 
            onClick={refetch}
            className="ml-auto text-red-400 hover:text-red-300 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <MapPin className="h-5 w-5 text-[#50C878]" />
            Court Status
            <div className="h-2 w-2 rounded-full bg-[#50C878] animate-pulse ml-1" />
          </CardTitle>
          {courtData?.lastUpdated && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(courtData.lastUpdated), { addSuffix: true })}
            </span>
          )}
        </div>

        {/* Summary badges */}
        {courtData?.summary && (
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" className="bg-[#50C878]/10 text-[#50C878] border-[#50C878]/30">
              <CheckCircle className="h-3 w-3 mr-1" />
              {courtData.summary.available} Available
            </Badge>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
              <User className="h-3 w-3 mr-1" />
              {courtData.summary.occupied} Occupied
            </Badge>
            {courtData.summary.blocked > 0 && (
              <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">
                <XCircle className="h-3 w-3 mr-1" />
                {courtData.summary.blocked} Blocked
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <CourtStatusSkeleton />
        ) : !courtData?.courts?.length ? (
          <p className="text-sm text-gray-500 text-center py-8">No courts found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courtData.courts.map((court) => (
              <CourtCard key={court.id} court={court} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

