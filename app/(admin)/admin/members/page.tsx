import { getAllMembers } from '@/server/actions/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MemberManagementTable } from '@/components/features/admin/member-management-table'

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  try {
    const params = await searchParams
    const page = parseInt(params.page || '1')
    const { members, total, totalPages } = await getAllMembers(page, 50)

    const adminCount = members.filter(m => m.role === 'admin').length
    const userCount = members.filter(m => m.role === 'user').length
    const withMembershipCount = members.filter(m => m.memberships && m.memberships.length > 0).length

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">Members Management</h1>
          <p className="text-gray-400">View all members, manage roles, and access member details</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Total Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{total}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Active Memberships</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#50C878]">{withMembershipCount}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Administrators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">{adminCount}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Regular Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-300">{userCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Members Table */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">All Members</CardTitle>
            <CardDescription className="text-gray-400">
              Click on a member to view details or manage their role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MemberManagementTable 
              members={members} 
              currentPage={page}
              totalPages={totalPages}
            />
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error('Error loading members page:', error)
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">Members Management</h1>
          <p className="text-gray-400">View all members, manage roles, and access member details</p>
        </div>
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardContent className="py-8">
            <p className="text-center text-red-500">
              Failed to load members. Please try again later.
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

