import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Clock, MapPin, DollarSign, ArrowRight, CheckCircle, FileText, Zap } from 'lucide-react'
import type { TripPlan } from '@/types/database'

function StatusBadge({ status }: { status: TripPlan['status'] }) {
  const map: Record<TripPlan['status'], { label: string; bg: string; color: string }> = {
    completed: { label: 'Tamamlandı', bg: 'rgba(16,185,129,0.15)', color: '#34D399' },
    active:    { label: 'Aktif',       bg: 'rgba(245,158,11,0.15)', color: '#FCD34D' },
    generated: { label: 'Oluşturuldu', bg: 'rgba(99,102,241,0.15)', color: '#A5B4FC' },
    draft:     { label: 'Taslak',      bg: 'rgba(100,116,139,0.15)', color: '#94A3B8' },
  }
  const s = map[status]
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  )
}

function PlanCard({ plan }: { plan: TripPlan }) {
  const stopCount = plan.plan_data?.stops?.length ?? 0
  const costMin = plan.total_cost_min
  const costMax = plan.total_cost_max
  const currency = plan.currency ?? 'EUR'
  const date = new Date(plan.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:translate-y-[-2px]"
      style={{
        background: 'rgba(30,41,59,0.7)',
        border: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#F59E0B' }} strokeWidth={2} />
            <span className="text-xs font-medium" style={{ color: '#F59E0B' }}>{plan.city}{plan.country ? `, ${plan.country}` : ''}</span>
          </div>
          <h3 className="text-base font-semibold text-white truncate">{plan.title}</h3>
        </div>
        <StatusBadge status={plan.status} />
      </div>

      <div className="flex flex-wrap gap-4 text-xs" style={{ color: '#94A3B8' }}>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" strokeWidth={1.8} />
          {date}
        </span>
        <span className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" strokeWidth={1.8} />
          {plan.duration_hours} saat
        </span>
        {stopCount > 0 && (
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" strokeWidth={1.8} />
            {stopCount} durak
          </span>
        )}
        {costMin != null && costMax != null && (
          <span className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" strokeWidth={1.8} />
            {costMin}–{costMax} {currency}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Link
          href={`/dashboard/plans/${plan.id}`}
          className="text-xs font-medium flex items-center gap-1 transition-colors hover:text-amber-400"
          style={{ color: '#94A3B8' }}
        >
          <FileText className="w-3.5 h-3.5" strokeWidth={1.8} />
          Detay
        </Link>
        <Link
          href="/dashboard/plans/new"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
        >
          Tekrar Planla
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
        </Link>
      </div>
    </div>
  )
}

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: allPlans } = await (supabase as any)
    .from('trip_plans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const plans: TripPlan[] = allPlans ?? []
  const completed = plans.filter((p) => p.status === 'completed')
  const others = plans.filter((p) => p.status !== 'completed')
  const sorted = [...completed, ...others]

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Gezi Geçmişi</h1>
        <p className="text-sm" style={{ color: '#64748B' }}>Tüm seyahat planlarınız</p>
      </div>

      {sorted.length === 0 ? (
        <div
          className="rounded-2xl p-12 flex flex-col items-center text-center gap-4"
          style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(245,158,11,0.1)' }}
          >
            <CheckCircle className="w-7 h-7" style={{ color: '#F59E0B' }} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-base font-semibold text-white mb-1">Henüz tamamlanan gezi yok</p>
            <p className="text-sm" style={{ color: '#64748B' }}>İlk gezinizi planlayın ve keşfetmeye başlayın.</p>
          </div>
          <Link
            href="/dashboard/plans/new"
            className="mt-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
          >
            Gezi Planla
          </Link>
        </div>
      ) : (
        <>
          {completed.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#34D399' }}>
                Tamamlanan — {completed.length}
              </h2>
              {completed.map((plan) => <PlanCard key={plan.id} plan={plan} />)}
            </section>
          )}
          {others.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#94A3B8' }}>
                Diğer Planlar — {others.length}
              </h2>
              {others.map((plan) => <PlanCard key={plan.id} plan={plan} />)}
            </section>
          )}
        </>
      )}
    </div>
  )
}
