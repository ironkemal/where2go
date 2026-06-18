import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MapPin, LayoutDashboard, BookMarked, UserCircle, Clock, Briefcase, LogOut } from 'lucide-react'

async function SignOutButton() {
  return (
    <form action="/auth/signout" method="POST">
      <button
        type="submit"
        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group"
        style={{ color: '#94A3B8' }}
        onMouseEnter={(e) => {
          const el = e.currentTarget
          el.style.background = 'rgba(239,68,68,0.08)'
          el.style.color = '#FCA5A5'
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget
          el.style.background = 'transparent'
          el.style.color = '#94A3B8'
        }}
      >
        <LogOut className="w-4.5 h-4.5 flex-shrink-0" strokeWidth={1.8} />
        <span>Çıkış Yap</span>
      </button>
    </form>
  )
}

const navItems = [
  { href: '/dashboard', label: 'Ana Sayfa', icon: LayoutDashboard },
  { href: '/dashboard/plans', label: 'Planlarım', icon: BookMarked },
  { href: '/dashboard/profile', label: 'Profilim', icon: UserCircle },
  { href: '/dashboard/history', label: 'Gezi Geçmişi', icon: Clock },
  { href: '/dashboard/business', label: 'İşletme', icon: Briefcase },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const displayName =
    user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Gezgin'
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className="flex min-h-screen"
      style={{ background: '#0F172A' }}
    >
      <aside
        className="hidden md:flex flex-col w-64 flex-shrink-0 sticky top-0 h-screen"
        style={{
          background: 'rgba(15,23,42,0.95)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          className="flex items-center gap-2.5 px-5 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
          >
            <MapPin className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span
            className="text-lg font-bold tracking-tight"
            style={{ color: '#F59E0B' }}
          >
            Where2Go
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{ color: '#94A3B8' }}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" strokeWidth={1.8} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div
          className="px-3 pb-4 pt-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1 rounded-xl">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{displayName}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        <main className="flex-1 p-6 md:p-8">{children}</main>

        <nav
          className="md:hidden flex items-center justify-around px-4 py-2 sticky bottom-0"
          style={{
            background: 'rgba(15,23,42,0.95)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-200"
              style={{ color: '#64748B' }}
            >
              <Icon className="w-5 h-5" strokeWidth={1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          ))}
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-200"
              style={{ color: '#64748B' }}
            >
              <LogOut className="w-5 h-5" strokeWidth={1.8} />
              <span className="text-[10px] font-medium">Çıkış</span>
            </button>
          </form>
        </nav>
      </div>
    </div>
  )
}
