import { getAllBookingsForAdmin } from '@/server/queries/bookings'
import { getSports } from '@/server/queries/bookings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { BookingFilters } from '@/components/features/admin/booking-filters'

// Facility timezone - must match the timezone used in server/actions/bookings.ts
const FACILITY_TIMEZONE = 'America/Chicago'

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; sportId?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const { bookings, total, totalPages } = await getAllBookingsForAdmin(page, 20, {
    status: params.status || undefined,
    sportId: params.sportId || undefined,
  })

  const sportsData = await getSports()
  const sports = sportsData as unknown as Array<{ id: string; name: string; display_name: string }>

  const confirmedCount = bookings.filter((b: any) => b.status === 'confirmed').length
  const pendingCount = bookings.filter((b: any) => b.status === 'pending').length
  const canceledCount = bookings.filter((b: any) => b.status === 'canceled').length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-white">Bookings Management</h1>
        <p className="text-gray-400">View and manage all bookings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{total}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#50C878]">{confirmedCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Canceled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{canceledCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">All Bookings</CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">
                Page {page} of {totalPages}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <BookingFilters
            sports={sports}
            currentStatus={params.status}
            currentSportId={params.sportId}
          />

          {/* Bookings List */}
          {bookings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No bookings found</p>
          ) : (
            <>
              <div className="space-y-3 mt-4">
                {bookings.map((booking: any) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 border border-gray-800 rounded-lg bg-black/20 hover:bg-black/40 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-200">
                          {(booking.sports as any)?.display_name || 'Unknown Sport'}
                        </span>
                        <Badge variant={
                          booking.status === 'confirmed' ? 'default' :
                            booking.status === 'pending' ? 'secondary' :
                              'outline'
                        } className={
                          booking.status === 'confirmed' ? 'bg-[#50C878]/20 text-[#50C878] hover:bg-[#50C878]/30 border-0' :
                            booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border-0' :
                              'border-gray-700 text-gray-400'
                        }>
                          {booking.status}
                        </Badge>
                        {booking.booking_type && (
                          <Badge variant="outline" className="text-xs border-gray-700 text-gray-400">
                            {booking.booking_type}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">
                        {(booking.courts as any)?.name || 'Unknown Court'} •{' '}
                        {format(toZonedTime(new Date(booking.start_time), FACILITY_TIMEZONE), 'MMM d, yyyy h:mm a')} -
                        {format(toZonedTime(new Date(booking.end_time), FACILITY_TIMEZONE), 'h:mm a')}
                      </p>
                      {(booking.profiles as any) && (
                        <p className="text-xs text-gray-500 mt-1">
                          {(booking.profiles as any).full_name || (booking.profiles as any).email}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800">
                  <p className="text-sm text-gray-400">
                    Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} bookings
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      className="border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-50"
                      asChild={page > 1}
                    >
                      {page > 1 ? (
                        <Link href={`/admin/bookings?page=${page - 1}${params.status ? `&status=${params.status}` : ''}${params.sportId ? `&sportId=${params.sportId}` : ''}`}>
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Link>
                      ) : (
                        <span>
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </span>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === totalPages}
                      className="border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-50"
                      asChild={page < totalPages}
                    >
                      {page < totalPages ? (
                        <Link href={`/admin/bookings?page=${page + 1}${params.status ? `&status=${params.status}` : ''}${params.sportId ? `&sportId=${params.sportId}` : ''}`}>
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      ) : (
                        <span>
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
