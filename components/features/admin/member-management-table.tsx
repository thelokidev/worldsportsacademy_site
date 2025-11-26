'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { 
  User, 
  Shield, 
  Calendar,
  CreditCard,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'
import { updateMemberRole, getMemberDetails } from '@/server/actions/admin'
import { format } from 'date-fns'
import Link from 'next/link'

type Member = {
  id: string
  full_name: string | null
  role: string
  created_at: string
  updated_at: string
  memberships: Array<{
    id: string
    status: string
    current_period_end: string
    membership_plans: {
      name: string
      price: number
    }
  }>
  bookingCount: number
}

type MemberDetails = {
  profile: any
  memberships: any[]
  bookings: any[]
  payments: any[]
}

export function MemberManagementTable({ 
  members, 
  currentPage,
  totalPages 
}: { 
  members: Member[]
  currentPage: number
  totalPages: number
}) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [memberDetails, setMemberDetails] = useState<MemberDetails | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'user' | 'admin'>('user')
  const [loading, setLoading] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredMembers = members.filter(member => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return member.full_name?.toLowerCase().includes(query)
  })

  async function handleViewDetails(member: Member) {
    setSelectedMember(member)
    setDialogOpen(true)
    setLoadingDetails(true)
    
    try {
      const details = await getMemberDetails(member.id)
      setMemberDetails(details)
    } catch (error) {
      toast.error('Failed to load member details')
    } finally {
      setLoadingDetails(false)
    }
  }

  async function handleChangeRole(member: Member) {
    setSelectedMember(member)
    setSelectedRole(member.role as 'user' | 'admin')
    setRoleDialogOpen(true)
  }

  async function confirmRoleChange() {
    if (!selectedMember) return
    
    setLoading(true)
    try {
      await updateMemberRole(selectedMember.id, selectedRole)
      toast.success('Member role updated successfully')
      setRoleDialogOpen(false)
      window.location.reload()
    } catch (error) {
      toast.error('Failed to update member role')
    } finally {
      setLoading(false)
    }
  }

  function getRoleBadge(role: string) {
    if (role === 'admin') {
      return <Badge className="gap-1 bg-blue-600"><Shield className="h-3 w-3" /> Admin</Badge>
    }
    return <Badge variant="outline" className="gap-1"><User className="h-3 w-3" /> User</Badge>
  }

  return (
    <>
      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search members by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Members List */}
      <div className="space-y-3 mb-4">
        {filteredMembers.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No members found</p>
        ) : (
          filteredMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold">
                    {member.full_name || 'No Name'}
                  </h3>
                  {getRoleBadge(member.role)}
                  {member.memberships.length > 0 && (
                    <Badge variant="default" className="bg-green-600">
                      Active Member
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{member.bookingCount} bookings</span>
                </div>
                {member.memberships.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    {member.memberships.map((m: any) => (
                      <span key={m.id} className="mr-3">
                        {m.membership_plans?.name} - ${m.membership_plans?.price}/mo
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Joined: {format(new Date(member.created_at), 'MMM d, yyyy')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(member)}
                >
                  View Details
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleChangeRole(member)}
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Change Role
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              asChild
            >
              <Link href={`/admin/members?page=${currentPage - 1}`}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              asChild
            >
              <Link href={`/admin/members?page=${currentPage + 1}`}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Member Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedMember?.full_name || 'Member Details'}</DialogTitle>
            <DialogDescription>
              Member ID: {selectedMember?.id}
            </DialogDescription>
          </DialogHeader>

          {loadingDetails ? (
            <div className="py-8 text-center text-gray-500">Loading details...</div>
          ) : memberDetails ? (
            <div className="space-y-6">
              {/* Profile Info */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile Information
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Full Name</p>
                    <p className="font-medium">{memberDetails.profile.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Role</p>
                    <p className="font-medium">{getRoleBadge(memberDetails.profile.role)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Stripe Customer</p>
                    <p className="font-medium">{memberDetails.profile.stripe_customer_id ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Joined</p>
                    <p className="font-medium">{memberDetails.profile.created_at ? format(new Date(memberDetails.profile.created_at), 'MMM d, yyyy') : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Memberships */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Memberships ({memberDetails.memberships.length})
                </h4>
                {memberDetails.memberships.length === 0 ? (
                  <p className="text-sm text-gray-500">No active memberships</p>
                ) : (
                  <div className="space-y-2">
                    {memberDetails.memberships.map((membership: any) => (
                      <div key={membership.id} className="border rounded p-3 text-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{membership.membership_plans?.name}</p>
                            <p className="text-gray-600">${membership.membership_plans?.price}/month</p>
                          </div>
                          <Badge variant={membership.status === 'active' ? 'default' : 'secondary'}>
                            {membership.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          Current period: {format(new Date(membership.current_period_start), 'MMM d')} - 
                          {format(new Date(membership.current_period_end), 'MMM d, yyyy')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Bookings */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Recent Bookings (Last 10)
                </h4>
                {memberDetails.bookings.length === 0 ? (
                  <p className="text-sm text-gray-500">No bookings found</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {memberDetails.bookings.map((booking: any) => (
                      <div key={booking.id} className="border rounded p-3 text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              {booking.sports?.display_name} - {booking.courts?.name}
                            </p>
                            <p className="text-gray-600">
                              {format(new Date(booking.start_time), 'MMM d, yyyy h:mm a')}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">{booking.status}</Badge>
                            <p className="text-xs text-gray-500 mt-1">{booking.booking_type}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Payments */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Recent Payments (Last 10)
                </h4>
                {memberDetails.payments.length === 0 ? (
                  <p className="text-sm text-gray-500">No payments found</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {memberDetails.payments.map((payment: any) => (
                      <div key={payment.id} className="border rounded p-3 text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">${payment.amount}</p>
                            <p className="text-gray-600 capitalize">{payment.payment_type}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={payment.status === 'succeeded' ? 'default' : 'secondary'}>
                              {payment.status}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              {format(new Date(payment.created_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Member Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedMember?.full_name || 'this member'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={selectedRole} onValueChange={(value: 'user' | 'admin') => setSelectedRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User - Regular member</SelectItem>
                  <SelectItem value="admin">Admin - Full access</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedRole === 'admin' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                ⚠️ Admins have full access to all admin features and can manage other users.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmRoleChange}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

