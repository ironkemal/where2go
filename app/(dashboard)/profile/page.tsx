import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MapPin, Calendar, LayoutGrid } from 'lucide-react'
import ProfileEditForm from '@/components/profile/ProfileEditForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const displayName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Gezgin'
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const memberSince = new Date(user.created_at).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const { data: plans } = await (supabase as any)
    .from('trip_plans')
    .select('id, status, plan_data')
    .eq('user_id', user.id)

  const allPlans = (plans ?? []) as Array<{ id: string; status: string; plan_data: { stops?: unknown[] } | null }>
  const totalPlans = allPlans.length
  const completedPlans = allPlans.filter((p) => p.status === 'completed').length
  const totalStops = allPlans.reduce((acc, p) => acc + (p.plan_data?.stops?.length ?? 0), 0)

  const { data: accommodations } = await (supabase as any)
    .from('accommodations')
    .select('id')
    .eq('user_id', user.id)

  const stats = [
    { label: 'Toplam Plan', value: totalPlans, icon: LayoutGrid, color: '#F59E0B' },
    { label: 'Tamamlanan', value: completedPlans, icon: MapPin, color: '#34D399' },
    { label: 'Ziyaret Edilen Durak', value: totalStops, icon: MapPin, color: '#A5B4FC' },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div
        className="rounded-2xl p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6"
        style={{
          background: 'rgba(30,41,59,0.7)',
          border: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 text-2xl font-bold text-white shadow-lg"
          style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
        >
          {initials}
        </div>
        <div className="text-center sm:text-left space-y-1 min-w-0">
          <h1 className="text-2xl font-bold text-white">{displayName}</h1>
          <p className="text-sm" style={{ color: '#94A3B8' }}>{user.email}</p>
          <p className="text-xs flex items-center justify-center sm:justify-start gap-1.5 mt-2" style={{ color: '#64748B' }}>
            <Calendar className="w-3.5 h-3.5" strokeWidth={1.8} />
            Üye: {memberSince}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-2xl p-5 flex flex-col items-center text-center gap-2"
            style={{
              background: 'rgba(30,41,59,0.7)',
              border: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `${color}18` }}
            >
              <Icon className="w-4.5 h-4.5" style={{ color }} strokeWidth={1.8} />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs" style={{ color: '#64748B' }}>{label}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-base font-semibold text-white mb-4">Profili Düzenle</h2>
        <ProfileEditForm initialName={displayName} />
      </div>
    </div>
  )
}
