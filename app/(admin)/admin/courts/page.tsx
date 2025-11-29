import { getAllCourts } from '@/server/actions/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CourtManagementTable } from '@/components/features/admin/court-management-table'

type CourtWithSport = {
  id: string
  name: string
  is_active: boolean
  is_blocked: boolean
  blocked_reason: string | null
  created_at: string
  sports: {
    id: string
    name: string
    display_name: string
  }
  currentBooking?: any
  nextBooking?: any
}

export default async function AdminCourtsPage() {
  try {
    const courtsData = await getAllCourts()

    // Transform and validate the data to ensure proper structure
    const courts: CourtWithSport[] = courtsData.map((court: any) => ({
      id: court.id,
      name: court.name || 'Unknown Court',
      is_active: court.is_active ?? true,
      is_blocked: court.is_blocked ?? false,
      blocked_reason: court.blocked_reason || null,
      created_at: court.created_at,
      sports: court.sports || { id: '', name: 'unknown', display_name: 'Unknown Sport' },
      currentBooking: court.currentBooking,
      nextBooking: court.nextBooking
    }))

    const activeCourts = courts.filter(c => c.is_active && !c.is_blocked)
    const blockedCourts = courts.filter(c => c.is_blocked)
    const inactiveCourts = courts.filter(c => !c.is_active)

    return (
      <div className="space-y-6 overflow-hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-white">Courts Management</h1>
          <p className="text-sm sm:text-base text-gray-400">Manage court availability, block courts, and view utilization</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Total Courts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{courts.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Active Courts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#50C878]">{activeCourts.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Blocked Courts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">{blockedCourts.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Inactive Courts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-400">{inactiveCourts.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Courts Table */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-white">All Courts</CardTitle>
            <CardDescription className="text-gray-400">
              Click on a court to view details, block/unblock, or change status
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <CourtManagementTable courts={courts} />
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error('Error loading courts:', error)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">Courts Management</h1>
          <p className="text-gray-400">Manage court availability, block courts, and view utilization</p>
        </div>
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardContent className="py-8">
            <p className="text-center text-red-500">
              Failed to load courts. Please try again later.
            </p>
            <p className="text-center text-sm text-gray-500 mt-2">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
}
