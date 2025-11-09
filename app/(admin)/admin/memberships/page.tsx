import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

async function getAllMemberships() {
  const supabase = await createClient()
  
  const { data: memberships, error } = await supabase
    .from('memberships')
    .select(`
      *,
      membership_plans:plan_id (
        id,
        name,
        price
      ),
      profiles:user_id (
        id,
        email,
        full_name
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch memberships: ${error.message}`)
  }

  return memberships || []
}

export default async function AdminMembershipsPage() {
  const memberships = await getAllMemberships()

  const activeCount = memberships.filter(m => m.status === 'active').length
  const canceledCount = memberships.filter(m => m.status === 'canceled').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Memberships Management</h1>
        <p className="text-gray-600">View and manage all memberships</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Memberships</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberships.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Canceled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{canceledCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Memberships</CardTitle>
        </CardHeader>
        <CardContent>
          {memberships.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No memberships found</p>
          ) : (
            <div className="space-y-4">
              {memberships.map((membership: any) => (
                <div
                  key={membership.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">
                        {(membership.membership_plans as any)?.name || 'Unknown Plan'}
                      </span>
                      <Badge variant={
                        membership.status === 'active' ? 'default' :
                        membership.status === 'canceled' ? 'secondary' :
                        'outline'
                      }>
                        {membership.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {(membership.profiles as any)?.full_name || (membership.profiles as any)?.email || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Renews: {format(new Date(membership.current_period_end), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ${(membership.membership_plans as any)?.price || 0}/month
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

