'use client'

import type { TripPlanData } from '@/types/database'

interface PlanSummaryBarProps {
  plan: TripPlanData
  onStartNavigation: () => void
  onEditPlan: () => void
}

function formatTotalDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} dk`
  if (m === 0) return `${h} sa`
  return `${h} sa ${m} dk`
}

export default function PlanSummaryBar({ plan, onStartNavigation, onEditPlan }: PlanSummaryBarProps) {
  const currency = plan.total_cost_estimate.currency ?? '€'
  const costMin = plan.total_cost_estimate.min
  const costMax = plan.total_cost_estimate.max
  const stopCount = plan.stops?.length ?? 0

  const costLabel =
    costMin === 0 && costMax === 0
      ? 'Ücretsiz'
      : costMin === costMax
      ? `${currency}${costMin}`
      : `${currency}${costMin} – ${currency}${costMax}`

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'rgba(10,16,30,0.97)',
        borderTop: '1px solid rgba(245,158,11,0.2)',
        backdropFilter: 'blur(16px)',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          flex: 1,
          overflowX: 'auto',
          minWidth: 0,
        }}
      >
        <SummaryItem
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
          label="Süre"
          value={formatTotalDuration(plan.total_duration_minutes)}
        />
        <Divider />
        <SummaryItem
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
          label="Tahmini Maliyet"
          value={costLabel}
          highlight
        />
        <Divider />
        <SummaryItem
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          }
          label="Durak"
          value={`${stopCount} durak`}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button
          onClick={onEditPlan}
          style={{
            padding: '9px 16px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            color: '#F59E0B',
            background: 'transparent',
            border: '1px solid rgba(245,158,11,0.4)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(245,158,11,0.08)'
            e.currentTarget.style.borderColor = 'rgba(245,158,11,0.6)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'
          }}
        >
          Düzenle
        </button>

        <button
          onClick={onStartNavigation}
          style={{
            padding: '9px 22px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            color: '#fff',
            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(245,158,11,0.45)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(245,158,11,0.3)'
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Geziye Başla
        </button>
      </div>
    </div>
  )
}

function SummaryItem({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
      <span style={{ color: highlight ? '#F59E0B' : '#64748b' }}>{icon}</span>
      <div>
        <div style={{ fontSize: 10, color: '#475569', lineHeight: 1, marginBottom: 2 }}>{label}</div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: highlight ? '#F59E0B' : '#e2e8f0',
            lineHeight: 1,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  )
}

function Divider() {
  return (
    <div
      style={{
        width: 1,
        height: 28,
        background: 'rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}
    />
  )
}
