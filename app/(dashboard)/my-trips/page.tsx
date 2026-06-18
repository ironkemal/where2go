import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { TripPlan } from '@/types/database'

const STATUS_CONFIG: Record<
  TripPlan['status'],
  { label: string; color: string; bg: string; border: string }
> = {
  draft: {
    label: 'Taslak',
    color: '#94a3b8',
    bg: 'rgba(100,116,139,0.1)',
    border: 'rgba(100,116,139,0.2)',
  },
  generated: {
    label: 'Hazır',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.1)',
    border: 'rgba(96,165,250,0.2)',
  },
  active: {
    label: 'Aktif',
    color: '#34d399',
    bg: 'rgba(52,211,153,0.1)',
    border: 'rgba(52,211,153,0.2)',
  },
  completed: {
    label: 'Tamamlandı',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.2)',
  },
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} dk`
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (m === 0) return `${h} sa`
  return `${h} sa ${m} dk`
}

function formatCost(min: number | null, max: number | null, currency: string | null): string {
  const c = currency ?? '€'
  if (!min && !max) return '—'
  if (min === max) return `${c}${min}`
  return `${c}${min ?? 0} – ${c}${max ?? 0}`
}

export default async function MyTripsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: tripsRaw } = await (supabase as any)
    .from('trip_plans')
    .select('id, title, city, country, status, created_at, duration_hours, total_cost_min, total_cost_max, currency, plan_data')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const trips = (tripsRaw ?? []) as TripPlan[]

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: '#fff',
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          Planlarım
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 6 }}>
          {trips.length > 0
            ? `${trips.length} gezi planın var`
            : 'Henüz bir planın yok'}
        </p>
      </div>

      {trips.length === 0 ? (
        <EmptyState />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  )
}

function TripCard({ trip }: { trip: TripPlan }) {
  const cfg = STATUS_CONFIG[trip.status] ?? STATUS_CONFIG.draft
  const stopCount = (trip.plan_data as any)?.stops?.length ?? null

  return (
    <div
      style={{
        background: 'rgba(30,41,59,0.6)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        transition: 'all 0.2s',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(245,158,11,0.2)'
        ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(30,41,59,0.8)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(255,255,255,0.06)'
        ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(30,41,59,0.6)'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'linear-gradient(90deg, #F59E0B, #D97706)',
          opacity: trip.status === 'active' ? 1 : 0.3,
          borderRadius: '16px 16px 0 0',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#fff',
              margin: 0,
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {trip.city}
          </h3>
          {trip.country && (
            <p style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{trip.country}</p>
          )}
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: cfg.color,
            background: cfg.bg,
            border: `1px solid ${cfg.border}`,
            borderRadius: 6,
            padding: '3px 8px',
            flexShrink: 0,
          }}
        >
          {cfg.label}
        </span>
      </div>

      {trip.title && trip.title !== trip.city && (
        <p
          style={{
            fontSize: 13,
            color: '#94a3b8',
            margin: 0,
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          } as React.CSSProperties}
        >
          {trip.title}
        </p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
        }}
      >
        <MetaItem
          icon={
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
          label={formatDuration(trip.duration_hours)}
        />
        {stopCount !== null && (
          <MetaItem
            icon={
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            }
            label={`${stopCount} durak`}
          />
        )}
        <MetaItem
          icon={
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
          label={formatCost(trip.total_cost_min, trip.total_cost_max, trip.currency)}
          highlight
        />
        <MetaItem
          icon={
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
          label={formatDate(trip.created_at)}
        />
      </div>

      <Link
        href={`/plan/${trip.id}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          padding: '9px 16px',
          borderRadius: 10,
          background: 'rgba(245,158,11,0.09)',
          border: '1px solid rgba(245,158,11,0.25)',
          color: '#F59E0B',
          fontSize: 13,
          fontWeight: 600,
          textDecoration: 'none',
          transition: 'all 0.2s',
          marginTop: 2,
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLAnchorElement).style.background = 'rgba(245,158,11,0.15)'
          ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(245,158,11,0.4)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLAnchorElement).style.background = 'rgba(245,158,11,0.09)'
          ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(245,158,11,0.25)'
        }}
      >
        Görüntüle
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </Link>
    </div>
  )
}

function MetaItem({
  icon,
  label,
  highlight = false,
}: {
  icon: React.ReactNode
  label: string
  highlight?: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        color: highlight ? '#F59E0B' : '#64748b',
        fontSize: 12,
        fontWeight: highlight ? 600 : 400,
      }}
    >
      {icon}
      <span>{label}</span>
    </div>
  )
}

function EmptyState() {
  return (
    <div
      style={{
        borderRadius: 20,
        padding: '60px 40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        background: 'rgba(30,41,59,0.4)',
        border: '1px dashed rgba(255,255,255,0.08)',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          background: 'rgba(245,158,11,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="1.5"
          style={{ opacity: 0.7 }}
        >
          <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0" />
          <path d="M3.6 9h16.8M3.6 15h16.8" />
          <path d="M11.5 3a17 17 0 0 0 0 18M12.5 3a17 17 0 0 1 0 18" />
        </svg>
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>
        Henüz plan yok
      </h2>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28, maxWidth: 280, lineHeight: 1.6 }}>
        İlk gezi planını oluştur ve keşfetmeye başla
      </p>
      <Link
        href="/dashboard/new-plan"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '11px 24px',
          borderRadius: 12,
          background: 'linear-gradient(135deg, #F59E0B, #D97706)',
          color: '#fff',
          fontSize: 14,
          fontWeight: 700,
          textDecoration: 'none',
          boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
          transition: 'all 0.2s',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Yeni Plan Oluştur
      </Link>
    </div>
  )
}
