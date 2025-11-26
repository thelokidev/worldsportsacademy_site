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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Lock,
  Unlock,
  Power,
  PowerOff,
  Calendar,
  Edit2,
  TrendingUp
} from 'lucide-react'
import { toast } from 'sonner'
import { toggleCourtBlock, toggleCourtActive, updateCourtName, getCourtBookingStats } from '@/server/actions/admin'
import { format } from 'date-fns'

type Court = {
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
}

type CourtStats = {
  todayBookings: number
  monthlyBookings: number
  upcomingBookings: Array<{
    id: string
    start_time: string
    end_time: string
    status: string
    profiles: {
      full_name: string | null
    } | null
  }>
}

export function CourtManagementTable({ courts }: { courts: Court[] }) {
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [blockDialogOpen, setBlockDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [blockReason, setBlockReason] = useState('')
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(false)
  const [courtStats, setCourtStats] = useState<CourtStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)

  async function handleViewDetails(court: Court) {
    setSelectedCourt(court)
    setDialogOpen(true)
    setLoadingStats(true)

    try {
      const stats = await getCourtBookingStats(court.id)
      setCourtStats(stats)
    } catch (error) {
      toast.error('Failed to load court statistics')
    } finally {
      setLoadingStats(false)
    }
  }

  async function handleBlockUnblock(court: Court, block: boolean) {
    if (block) {
      setSelectedCourt(court)
      setBlockReason('')
      setBlockDialogOpen(true)
    } else {
      setLoading(true)
      try {
        await toggleCourtBlock(court.id, false)
        toast.success('Court unblocked successfully')
        window.location.reload()
      } catch (error) {
        toast.error('Failed to unblock court')
      } finally {
        setLoading(false)
      }
    }
  }

  async function confirmBlock() {
    if (!selectedCourt) return

    setLoading(true)
    try {
      await toggleCourtBlock(selectedCourt.id, true, blockReason)
      toast.success('Court blocked successfully')
      setBlockDialogOpen(false)
      window.location.reload()
    } catch (error) {
      toast.error('Failed to block court')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleActive(court: Court) {
    setLoading(true)
    try {
      await toggleCourtActive(court.id, !court.is_active)
      toast.success(`Court ${court.is_active ? 'deactivated' : 'activated'} successfully`)
      window.location.reload()
    } catch (error) {
      toast.error('Failed to update court status')
    } finally {
      setLoading(false)
    }
  }

  async function handleEditName(court: Court) {
    setSelectedCourt(court)
    setNewName(court.name)
    setEditDialogOpen(true)
  }

  async function confirmEditName() {
    if (!selectedCourt || !newName.trim()) return

    setLoading(true)
    try {
      await updateCourtName(selectedCourt.id, newName)
      toast.success('Court name updated successfully')
      setEditDialogOpen(false)
      window.location.reload()
    } catch (error) {
      toast.error('Failed to update court name')
    } finally {
      setLoading(false)
    }
  }

  function getStatusBadge(court: Court) {
    if (court.is_blocked) {
      return <Badge variant="destructive" className="gap-1"><Lock className="h-3 w-3" /> Blocked</Badge>
    }
    if (!court.is_active) {
      return <Badge variant="secondary" className="gap-1"><PowerOff className="h-3 w-3" /> Inactive</Badge>
    }
    return <Badge variant="default" className="gap-1 bg-green-600"><Power className="h-3 w-3" /> Active</Badge>
  }

  return (
    <>
      <div className="space-y-3">
        {courts.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No courts found</p>
        ) : (
          courts.map((court) => (
            <div
              key={court.id}
              className="flex items-center justify-between p-4 border border-gray-800 rounded-lg bg-black/20 hover:bg-black/40 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg text-gray-200">{court.name}</h3>
                  {getStatusBadge(court)}
                  <Badge variant="outline" className="text-xs border-gray-700 text-gray-400">
                    {court.sports?.display_name || 'Unknown Sport'}
                  </Badge>
                </div>
                {court.is_blocked && court.blocked_reason && (
                  <p className="text-sm text-red-600 mb-1">
                    Reason: {court.blocked_reason}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Created: {format(new Date(court.created_at), 'MMM d, yyyy')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(court)}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  View Details
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditName(court)}
                  disabled={loading}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>

                {court.is_blocked ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBlockUnblock(court, false)}
                    disabled={loading}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Unlock className="h-4 w-4 mr-1" />
                    Unblock
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBlockUnblock(court, true)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Lock className="h-4 w-4 mr-1" />
                    Block
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(court)}
                  disabled={loading}
                >
                  {court.is_active ? (
                    <PowerOff className="h-4 w-4" />
                  ) : (
                    <Power className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Court Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedCourt?.name}</DialogTitle>
            <DialogDescription>
              {selectedCourt?.sports?.display_name} • {getStatusBadge(selectedCourt!)}
            </DialogDescription>
          </DialogHeader>

          {loadingStats ? (
            <div className="py-8 text-center text-gray-500">Loading statistics...</div>
          ) : courtStats ? (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Calendar className="h-4 w-4" />
                    Today's Bookings
                  </div>
                  <div className="text-2xl font-bold">{courtStats.todayBookings}</div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <TrendingUp className="h-4 w-4" />
                    This Month
                  </div>
                  <div className="text-2xl font-bold">{courtStats.monthlyBookings}</div>
                </div>
              </div>

              {/* Upcoming Bookings */}
              <div>
                <h4 className="font-semibold mb-3">Upcoming Bookings</h4>
                {courtStats.upcomingBookings.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No upcoming bookings</p>
                ) : (
                  <div className="space-y-2">
                    {courtStats.upcomingBookings.map((booking: any) => (
                      <div key={booking.id} className="border rounded p-3 text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              {booking.profiles?.full_name || 'Unknown User'}
                            </p>
                            <p className="text-gray-600">
                              {format(new Date(booking.start_time), 'MMM d, yyyy h:mm a')} -
                              {format(new Date(booking.end_time), 'h:mm a')}
                            </p>
                          </div>
                          <Badge variant="outline">{booking.status}</Badge>
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

      {/* Block Court Dialog */}
      <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block Court</DialogTitle>
            <DialogDescription>
              Block {selectedCourt?.name} from being booked. Provide a reason below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Maintenance, Repairs, Event..."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmBlock}
              disabled={loading}
            >
              {loading ? 'Blocking...' : 'Block Court'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Name Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Court Name</DialogTitle>
            <DialogDescription>
              Change the name of {selectedCourt?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Court Name</Label>
              <Input
                id="name"
                placeholder="Enter court name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmEditName}
              disabled={loading || !newName.trim()}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

