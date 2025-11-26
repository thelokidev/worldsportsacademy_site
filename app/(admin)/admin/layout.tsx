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
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#50C878] to-[#2D5B4A] rounded-lg flex items-center justify-center">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Admin Portal
              </h1>
            </div>
            <Button
              variant="outline"
              className="border-gray-800 text-gray-300 hover:text-[#50C878] hover:bg-gray-900 hover:border-[#50C878]/50 transition-all duration-300"
              asChild
            >
              <Link href="/dashboard">User Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 flex-shrink-0">
            <nav className="space-y-1 sticky top-24">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-400 hover:text-[#50C878] hover:bg-gray-900/50 transition-all duration-200 group"
                  >
                    <Icon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </aside>
          <main className="flex-1 min-w-0">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

