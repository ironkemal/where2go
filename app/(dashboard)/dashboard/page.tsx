import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  MapPin,
  Plus,
  ArrowRight,
  Compass,
  CalendarDays,
  Building2,
  BedDouble,
  CheckCircle2,
} from 'lucide-react'

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string | number
}) {
  return (
    <div
      className="rounded-2xl p-5 flex items-center gap-4"
      style={{
        background: 'rgba(30,41,59,0.7)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(245,158,11,0.12)' }}
      >
        <Icon className="w-5 h-5" style={{ color: '#F59E0B' }} strokeWidth={1.8} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const displayName =
    user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Gezgin'

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar'

  const { data: activeAccommodation } = await supabase
    .from('accommodations')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle() as { data: { id: string; name: string; address: string | null; is_active: boolean } | null; error: unknown }

  const { count: planCount } = await supabase
    .from('trip_plans')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: accommodationCount } = await supabase
    .from('accommodations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const hasActiveAccommodation = !!activeAccommodation

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <p className="text-slate-400 text-sm font-medium">
          {greeting}, {displayName.split(' ')[0]} 👋
        </p>
        <h1 className="text-3xl font-bold text-white mt-1 tracking-tight">
          Nereye gitmek istersin?
        </h1>
      </div>

      {hasActiveAccommodation ? (
        <Link
          href="/plan/new"
          className="group flex items-center justify-between w-full rounded-2xl p-6 transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)',
            boxShadow: '0 8px 32px rgba(245,158,11,0.25)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(245,158,11,0.35)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(245,158,11,0.25)'
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Compass className="w-6 h-6 text-white" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">
                Yeni Gezi Planla
              </p>
              <p className="text-amber-100/80 text-sm mt-0.5">
                Konaklama konumunu gir, AI planını oluştursun
              </p>
            </div>
          </div>
          <ArrowRight
            className="w-5 h-5 text-white/70 transition-transform duration-200 group-hover:translate-x-1"
            strokeWidth={2}
          />
        </Link>
      ) : (
        <div
          className="flex items-center justify-between w-full rounded-2xl p-6"
          style={{
            background: 'rgba(30,41,59,0.7)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(245,158,11,0.1)' }}
            >
              <Compass
                className="w-6 h-6"
                style={{ color: '#F59E0B', opacity: 0.6 }}
                strokeWidth={1.8}
              />
            </div>
            <div>
              <p className="text-slate-400 font-semibold text-base leading-tight">
                Gezi Planla
              </p>
              <p className="text-slate-500 text-sm mt-0.5">
                Önce konaklama ekleyin
              </p>
            </div>
          </div>
          <div
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: '#64748B',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            Devre dışı
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-300">Aktif Konaklama</h2>
          <Link
            href="/dashboard/accommodations"
            className="text-xs font-medium flex items-center gap-1 transition-colors duration-200"
            style={{ color: '#F59E0B' }}
          >
            {hasActiveAccommodation ? 'Değiştir' : 'Konaklama Ekle'}
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {hasActiveAccommodation ? (
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.07) 0%, rgba(30,41,59,0.8) 70%)',
              border: '1px solid rgba(245,158,11,0.3)',
            }}
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
              style={{ background: 'linear-gradient(180deg, #F59E0B, #D97706)' }}
            />
            <div className="p-5 pl-6 flex items-center gap-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(245,158,11,0.15)' }}
              >
                <BedDouble
                  className="w-5 h-5"
                  style={{ color: '#F59E0B' }}
                  strokeWidth={1.8}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold text-sm truncate">
                    {activeAccommodation.name}
                  </p>
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
                    style={{
                      background: 'rgba(245,158,11,0.18)',
                      color: '#F59E0B',
                      border: '1px solid rgba(245,158,11,0.3)',
                    }}
                  >
                    <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} />
                    Aktif
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-1 truncate">
                  {activeAccommodation.address}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <Link
            href="/dashboard/accommodations"
            className="group flex items-center gap-4 rounded-2xl p-5 transition-all duration-200"
            style={{
              background: 'rgba(30,41,59,0.4)',
              border: '1px dashed rgba(255,255,255,0.09)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(30,41,59,0.7)'
              e.currentTarget.style.borderColor = 'rgba(245,158,11,0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(30,41,59,0.4)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'
            }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(245,158,11,0.08)' }}
            >
              <Plus
                className="w-5 h-5"
                style={{ color: '#F59E0B', opacity: 0.7 }}
                strokeWidth={2}
              />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium group-hover:text-white transition-colors duration-200">
                Konaklama Ekle
              </p>
              <p className="text-slate-600 text-xs mt-0.5">
                Gezi planı oluşturmak için konaklama gerekli
              </p>
            </div>
            <ArrowRight
              className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5"
              style={{ color: '#F59E0B' }}
              strokeWidth={2}
            />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={CalendarDays} label="Toplam Plan" value={planCount ?? 0} />
        <StatCard icon={Building2} label="Konaklama" value={accommodationCount ?? 0} />
        <StatCard icon={MapPin} label="Ziyaret Edilen" value={0} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Son Planlar</h2>
          <Link
            href="/dashboard/plans"
            className="text-sm font-medium flex items-center gap-1 transition-colors duration-200"
            style={{ color: '#F59E0B' }}
          >
            Tümü <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div
          className="rounded-2xl p-8 flex flex-col items-center justify-center text-center"
          style={{
            background: 'rgba(30,41,59,0.5)',
            border: '1px dashed rgba(255,255,255,0.1)',
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(245,158,11,0.1)' }}
          >
            <Compass
              className="w-7 h-7"
              style={{ color: '#F59E0B' }}
              strokeWidth={1.5}
            />
          </div>
          <p className="text-white font-semibold mb-1">Henüz plan yok</p>
          <p className="text-slate-500 text-sm mb-5 max-w-xs">
            İlk gezi planını oluştur ve maceraya başla
          </p>
          {hasActiveAccommodation ? (
            <Link
              href="/plan/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                boxShadow: '0 4px 16px rgba(245,158,11,0.25)',
              }}
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Plan Oluştur
            </Link>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed opacity-50"
                style={{
                  background: 'rgba(245,158,11,0.2)',
                  color: '#F59E0B',
                }}
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                Plan Oluştur
              </div>
              <p className="text-slate-600 text-xs">
                Önce konaklama ekleyin
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
