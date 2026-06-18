'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PlanMap from '@/components/plan/PlanMap'
import StopCard from '@/components/plan/StopCard'
import PlanSummaryBar from '@/components/plan/PlanSummaryBar'
import ChatPanel from '@/components/plan/ChatPanel'
import type { TripPlan, TripPlanData } from '@/types/database'

interface PlanPageClientProps {
  plan: TripPlan
  planData: TripPlanData
}

export default function PlanPageClient({ plan, planData: initialPlanData }: PlanPageClientProps) {
  const router = useRouter()
  const [activeStopIndex, setActiveStopIndex] = useState<number | undefined>(undefined)
  const [currentPlan, setCurrentPlan] = useState<TripPlanData>(initialPlanData)
  const [chatOpen, setChatOpen] = useState(false)

  const stops = currentPlan.stops ?? []

  function handleStartNavigation() {
    router.push(`/plan/${plan.id}/navigate`)
  }

  function handleEditPlan() {
    setChatOpen(true)
  }

  function handlePlanUpdated(newPlan: TripPlanData) {
    setCurrentPlan(newPlan)
    setActiveStopIndex(undefined)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        paddingBottom: 80,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 20,
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <button
              onClick={() => router.back()}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                padding: '4px 10px',
                color: '#94a3b8',
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                transition: 'all 0.2s',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Geri
            </button>
          </div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            {plan.title || currentPlan.title}
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
            {plan.city}
            {plan.country ? `, ${plan.country}` : ''} · {stops.length} durak
          </p>
        </div>

        <button
          onClick={handleEditPlan}
          style={{
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: 10,
            padding: '8px 14px',
            color: '#F59E0B',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          AI ile Düzenle
        </button>
      </div>

      <div
        className="plan-layout"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 20,
          flex: 1,
        }}
      >
        <div
          style={{
            borderRadius: 16,
            overflow: 'hidden',
            height: 260,
            border: '1px solid rgba(255,255,255,0.07)',
          }}
          className="map-mobile"
        >
          <PlanMap
            plan={currentPlan}
            activeStopIndex={activeStopIndex}
            showRoute
            className="w-full h-full"
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 4,
            }}
          >
            Rota Planı
          </h2>
          {stops.map((stop, idx) => (
            <StopCard
              key={idx}
              stop={stop}
              index={idx}
              isActive={activeStopIndex === idx}
              isCompleted={activeStopIndex !== undefined && idx < activeStopIndex}
              onClick={() =>
                setActiveStopIndex((prev) => (prev === idx ? undefined : idx))
              }
            />
          ))}
          {stops.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#475569',
                fontSize: 14,
              }}
            >
              Bu plan için henüz durak oluşturulmamış.
            </div>
          )}
        </div>
      </div>

      <PlanSummaryBar
        plan={currentPlan}
        onStartNavigation={handleStartNavigation}
        onEditPlan={handleEditPlan}
      />

      <ChatPanel
        planId={plan.id}
        currentPlan={currentPlan}
        onPlanUpdated={handlePlanUpdated}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />

      <style>{`
        @media (min-width: 768px) {
          .plan-layout {
            grid-template-columns: 2fr 3fr !important;
          }
          .map-mobile {
            height: 100% !important;
            min-height: 500px !important;
            position: sticky !important;
            top: 0 !important;
            align-self: start !important;
          }
        }
      `}</style>
    </div>
  )
}
