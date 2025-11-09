import { requireAdmin } from '@/lib/auth/admin'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  DollarSign, 
  MapPin,
  BarChart3
} from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/bookings', label: 'Bookings', icon: Calendar },
    { href: '/admin/memberships', label: 'Memberships', icon: Users },
    { href: '/admin/revenue', label: 'Revenue', icon: DollarSign },
    { href: '/admin/courts', label: 'Courts', icon: MapPin },
    { href: '/admin/members', label: 'Members', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <Button variant="outline" asChild>
              <Link href="/dashboard">User Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </aside>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}

