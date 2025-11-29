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
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Sidebar - horizontal scroll on mobile, vertical on desktop */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 lg:sticky lg:top-24 scrollbar-hide">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm font-medium rounded-lg lg:rounded-xl text-gray-400 hover:text-[#50C878] hover:bg-gray-900/50 transition-all duration-200 group whitespace-nowrap flex-shrink-0"
                  >
                    <Icon className="h-4 w-4 lg:h-5 lg:w-5 group-hover:scale-110 transition-transform duration-200" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </aside>
          <main className="flex-1 min-w-0 overflow-hidden">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

