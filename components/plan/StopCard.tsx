'use client'

import type { TripStop } from '@/types/database'

interface StopCardProps {
  stop: TripStop
  index: number
  isActive?: boolean
  isCompleted?: boolean
  onClick?: () => void
}

const TYPE_EMOJI: Record<TripStop['type'], string> = {
  accommodation: '🏨',
  restaurant: '🍽️',
  attraction: '🏛️',
  transport: '🚌',
}

const TYPE_LABEL: Record<TripStop['type'], string> = {
  accommodation: 'Konaklama',
  restaurant: 'Restoran',
  attraction: 'Gezilecek Yer',
  transport: 'Ulaşım',
}

const TRANSPORT_LABEL: Record<string, string> = {
  walking: 'yürüyüş',
  driving: 'araç',
  transit: 'toplu taşıma',
  cycling: 'bisiklet',
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} dk`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h} sa ${m} dk` : `${h} sa`
}

function formatCost(cost: TripStop['cost_estimate'], currency = '€'): string {
  if (cost.min === 0 && cost.max === 0) return 'Ücretsiz'
  if (cost.min === cost.max) return `${currency}${cost.min}`
  return `${currency}${cost.min}–${currency}${cost.max}`
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters} m`
  return `${(meters / 1000).toFixed(1)} km`
}

export default function StopCard({
  stop,
  index,
  isActive = false,
  isCompleted = false,
  onClick,
}: StopCardProps) {
  const hasNext =
    stop.transport_to_next &&
    (stop.transport_to_next.duration_minutes > 0 || stop.transport_to_next.distance_meters > 0)

  return (
    <div className="relative">
      <button
        onClick={onClick}
        className="w-full text-left group"
        style={{ outline: 'none' }}
      >
        <div
          style={{
            background: isActive
              ? 'rgba(245,158,11,0.07)'
              : isCompleted
              ? 'rgba(30,41,59,0.4)'
              : 'rgba(30,41,59,0.6)',
            border: isActive
              ? '1px solid rgba(245,158,11,0.35)'
              : '1px solid rgba(255,255,255,0.06)',
            borderLeft: isActive ? '3px solid #F59E0B' : '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
            transition: 'all 0.2s',
            cursor: onClick ? 'pointer' : 'default',
          }}
          onMouseEnter={(e) => {
            if (!isActive && onClick) {
              e.currentTarget.style.background = 'rgba(30,41,59,0.8)'
              e.currentTarget.style.borderColor = 'rgba(245,158,11,0.2)'
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive) {
              e.currentTarget.style.background = isCompleted
                ? 'rgba(30,41,59,0.4)'
                : 'rgba(30,41,59,0.6)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
            }
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: isActive
                ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                : isCompleted
                ? 'rgba(100,116,139,0.3)'
                : 'rgba(30,41,59,0.9)',
              border: isActive
                ? 'none'
                : isCompleted
                ? '1px solid rgba(100,116,139,0.3)'
                : '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.2s',
            }}
          >
            {isCompleted ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: isActive ? '#fff' : '#94a3b8',
                  lineHeight: 1,
                }}
              >
                {index + 1}
              </span>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 14 }}>{TYPE_EMOJI[stop.type]}</span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: isActive ? '#fff' : isCompleted ? '#64748b' : '#e2e8f0',
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {stop.name}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: 11,
                  color: '#64748b',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 6,
                  padding: '1px 7px',
                }}
              >
                {TYPE_LABEL[stop.type]}
              </span>
              <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 3 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {formatDuration(stop.duration_minutes)}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: isActive ? '#F59E0B' : '#fbbf24',
                }}
              >
                {formatCost(stop.cost_estimate)}
              </span>
            </div>

            {stop.tips && stop.tips.length > 0 && isActive && (
              <p
                style={{
                  fontSize: 11,
                  color: '#94a3b8',
                  marginTop: 6,
                  lineHeight: 1.5,
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  paddingTop: 6,
                }}
              >
                💡 {stop.tips[0]}
              </p>
            )}
          </div>
        </div>
      </button>

      {hasNext && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px 6px 66px',
          }}
        >
          <div
            style={{
              width: 1,
              height: 16,
              background: 'rgba(255,255,255,0.08)',
              marginLeft: -32,
              marginRight: 8,
            }}
          />
          <span style={{ fontSize: 11, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L12 22M12 22L6 16M12 22L18 16" />
            </svg>
            Sonraki durağa:{' '}
            <strong style={{ color: '#64748b' }}>
              {formatDuration(stop.transport_to_next.duration_minutes)}{' '}
              {TRANSPORT_LABEL[stop.transport_to_next.mode] ?? stop.transport_to_next.mode}
            </strong>
            {stop.transport_to_next.distance_meters > 0 && (
              <span style={{ color: '#334155' }}>
                · {formatDistance(stop.transport_to_next.distance_meters)}
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  )
}
