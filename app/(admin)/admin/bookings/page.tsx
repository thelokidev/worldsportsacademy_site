import { getAllBookingsForAdmin } from '@/server/queries/bookings'
import { getSports } from '@/server/queries/bookings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { BookingFilters } from '@/components/features/admin/booking-filters'

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string; sportId?: string }
}) {
  const page = parseInt(searchParams.page || '1')
  const { bookings, total, totalPages } = await getAllBookingsForAdmin(page, 20, {
    status: searchParams.status || undefined,
    sportId: searchParams.sportId || undefined,
  })

  const sports = await getSports()

  const confirmedCount = bookings.filter((b: any) => b.status === 'confirmed').length
  const pendingCount = bookings.filter((b: any) => b.status === 'pending').length
  const canceledCount = bookings.filter((b: any) => b.status === 'canceled').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Bookings Management</h1>
        <p className="text-gray-600">View and manage all bookings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{confirmedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Canceled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{canceledCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Bookings</CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <BookingFilters 
            sports={sports}
            currentStatus={searchParams.status}
            currentSportId={searchParams.sportId}
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
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">
                          {(booking.sports as any)?.display_name || 'Unknown Sport'}
                        </span>
                        <Badge variant={
                          booking.status === 'confirmed' ? 'default' :
                          booking.status === 'pending' ? 'secondary' :
                          'outline'
                        }>
                          {booking.status}
                        </Badge>
                        {booking.booking_type && (
                          <Badge variant="outline" className="text-xs">
                            {booking.booking_type}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {(booking.courts as any)?.name || 'Unknown Court'} •{' '}
                        {format(new Date(booking.start_time), 'MMM d, yyyy h:mm a')} - 
                        {format(new Date(booking.end_time), 'h:mm a')}
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
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} bookings
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      asChild={page > 1}
                    >
                      {page > 1 ? (
                        <Link href={`/admin/bookings?page=${page - 1}${searchParams.status ? `&status=${searchParams.status}` : ''}${searchParams.sportId ? `&sportId=${searchParams.sportId}` : ''}`}>
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
                      asChild={page < totalPages}
                    >
                      {page < totalPages ? (
                        <Link href={`/admin/bookings?page=${page + 1}${searchParams.status ? `&status=${searchParams.status}` : ''}${searchParams.sportId ? `&sportId=${searchParams.sportId}` : ''}`}>
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
