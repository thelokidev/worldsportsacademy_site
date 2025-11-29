import { requireAdmin } from '@/lib/auth/admin'
import Link from 'next/link'
import {
  LayoutDashboard,
  Calendar,
  Users,
  DollarSign,
  MapPin,
} from 'lucide-react'
import { AdminHeader } from '@/components/features/admin/admin-header'

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
      <AdminHeader />
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

