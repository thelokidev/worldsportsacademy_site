import { getAllCourts } from '@/server/actions/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CourtManagementTable } from '@/components/features/admin/court-management-table'

export default async function AdminCourtsPage() {
  const courts = await getAllCourts()

  const activeCourts = courts.filter(c => c.is_active && !c.is_blocked)
  const blockedCourts = courts.filter(c => c.is_blocked)
  const inactiveCourts = courts.filter(c => !c.is_active)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Courts Management</h1>
        <p className="text-gray-600">Manage court availability, block courts, and view utilization</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Courts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{courts.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Active Courts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{activeCourts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Blocked Courts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{blockedCourts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Inactive Courts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">{inactiveCourts.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Courts Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Courts</CardTitle>
          <CardDescription>
            Click on a court to view details, block/unblock, or change status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CourtManagementTable courts={courts} />
        </CardContent>
      </Card>
    </div>
  )
}

