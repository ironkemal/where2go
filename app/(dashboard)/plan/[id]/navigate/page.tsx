'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { TripPlan, TripPlanData } from '@/types/database'
import { useNavigation } from '@/hooks/useNavigation'
import GoogleMapsProvider from '@/components/maps/GoogleMapsProvider'
import NavigationMap from '@/components/navigation/NavigationMap'
import AudioGuidePlayer from '@/components/navigation/AudioGuidePlayer'

export default function NavigatePage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [plan, setPlan] = useState<TripPlan | null>(null)
  const [planData, setPlanData] = useState<TripPlanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAudio, setShowAudio] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data, error } = await (supabase as any)
        .from('trip_plans')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .maybeSingle()
      if (error || !data || !data.plan_data) { router.push('/my-trips'); return }
      setPlan(data as TripPlan)
      setPlanData(data.plan_data as TripPlanData)
      setLoading(false)
    }
    load()
  }, [id, router])

  if (loading || !planData || !plan) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: '#0a0e1a',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '3px solid rgba(245,158,11,0.2)',
          borderTop: '3px solid #f59e0b',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: '#64748b', fontSize: 14, fontFamily: 'system-ui' }}>Rota yükleniyor...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return <NavigatePageInner plan={plan} planData={planData} showAudio={showAudio} setShowAudio={setShowAudio} />
}

interface InnerProps {
  plan: TripPlan
  planData: TripPlanData
  showAudio: boolean
  setShowAudio: (v: boolean) => void
}

function NavigatePageInner({ plan, planData, showAudio, setShowAudio }: InnerProps) {
  const router = useRouter()
  const nav = useNavigation(planData)
  const stops = planData.stops ?? []

  useEffect(() => {
    if (!nav.isNavigating) nav.start()
  }, [])

  const completedStops = stops.slice(0, nav.currentStopIndex)
  const walkMins = nav.distanceToStop === Infinity
    ? null
    : Math.max(1, Math.round(nav.distanceToStop / 80))

  function handleStop() {
    nav.stop()
    router.push(`/plan/${plan.id}`)
  }

  const allDone = nav.currentStopIndex >= stops.length

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#0a0e1a',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      fontFamily: '"DM Sans", system-ui, sans-serif'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse-ring {
          0% { transform: scale(0.9); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes arrive-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          50% { box-shadow: 0 0 0 16px rgba(34,197,94,0); }
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .nav-btn {
          border: none; cursor: pointer; font-family: inherit;
          font-weight: 600; border-radius: 14px; transition: all 0.18s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .nav-btn:active { transform: scale(0.97); }
        .arrive-pulse { animation: arrive-glow 1.8s ease-in-out infinite; }
      `}</style>

      {/* MAP SECTION - top 60% */}
      <div style={{ flex: '0 0 60%', position: 'relative', overflow: 'hidden' }}>
        <GoogleMapsProvider>
          <NavigationMap
            userLocation={nav.userLocation}
            currentStop={nav.currentStop}
            completedStops={completedStops}
            isNearStop={nav.isNearStop}
          />
        </GoogleMapsProvider>

        {/* Top overlay: plan title + exit */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          padding: '16px 16px 0',
          background: 'linear-gradient(to bottom, rgba(10,14,26,0.85) 60%, transparent)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ color: '#64748b', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
              Navigasyon
            </p>
            <p style={{ color: '#f1f5f9', fontSize: 15, fontWeight: 600, margin: '2px 0 0', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {planData.title}
            </p>
          </div>
          <button
            onClick={handleStop}
            className="nav-btn"
            style={{
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444',
              fontSize: 12,
              padding: '7px 12px',
              borderRadius: 10,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
            Bitir
          </button>
        </div>

        {/* GPS error banner */}
        {nav.locationError && (
          <div style={{
            position: 'absolute', bottom: 12, left: 12, right: 12,
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10, padding: '8px 12px',
            color: '#fca5a5', fontSize: 12, textAlign: 'center',
            animation: 'fade-in 0.3s ease',
          }}>
            {nav.locationError}
          </div>
        )}

        {/* Progress dots */}
        <div style={{
          position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 6,
        }}>
          {stops.map((_, i) => (
            <div key={i} style={{
              width: i === nav.currentStopIndex ? 20 : 6,
              height: 6, borderRadius: 3,
              background: i < nav.currentStopIndex
                ? '#22c55e'
                : i === nav.currentStopIndex
                  ? '#f59e0b'
                  : 'rgba(255,255,255,0.15)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>
      </div>

      {/* NAVIGATION PANEL - bottom 40% */}
      <div style={{
        flex: '0 0 40%', background: '#0f1623',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        padding: '16px 20px 20px',
        overflow: 'hidden',
        animation: 'slide-up 0.4s ease',
      }}>

        {allDone ? (
          /* ALL STOPS DONE */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 36 }}>🎉</div>
            <p style={{ color: '#f1f5f9', fontSize: 20, fontWeight: 700, margin: 0 }}>Tur Tamamlandı!</p>
            <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>Tüm duraklara uğradınız.</p>
            <button className="nav-btn" onClick={handleStop} style={{
              background: 'rgba(245,158,11,0.12)',
              border: '1px solid rgba(245,158,11,0.3)',
              color: '#f59e0b', fontSize: 14, padding: '12px 28px', marginTop: 8,
            }}>
              Plana Dön
            </button>
          </div>
        ) : (
          <>
            {/* ARRIVE banner */}
            {nav.isNearStop && (
              <div className="arrive-pulse" style={{
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.35)',
                borderRadius: 12, padding: '8px 14px', marginBottom: 12,
                display: 'flex', alignItems: 'center', gap: 8,
                animation: 'arrive-glow 1.8s ease-in-out infinite, slide-up 0.3s ease',
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                <p style={{ color: '#86efac', fontSize: 13, fontWeight: 600, margin: 0 }}>
                  Varıştınız! Sesli rehberi başlatabilirsiniz.
                </p>
              </div>
            )}

            {/* Current stop header */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
                <span style={{
                  background: 'rgba(245,158,11,0.15)',
                  border: '1px solid rgba(245,158,11,0.25)',
                  color: '#fbbf24', fontSize: 10, fontWeight: 700,
                  padding: '2px 7px', borderRadius: 5, letterSpacing: '0.06em',
                  textTransform: 'uppercase', flexShrink: 0
                }}>
                  {nav.currentStopIndex + 1} / {stops.length}
                </span>
                <span style={{ color: '#64748b', fontSize: 11 }}>
                  {nav.currentStop?.type}
                </span>
              </div>
              <h2 style={{
                color: '#f1f5f9', fontSize: 20, fontWeight: 700, margin: 0,
                lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}>
                {nav.currentStop?.name}
              </h2>
            </div>

            {/* Distance + time */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <div style={{
                flex: 1, background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 10, padding: '8px 12px',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l3 3" />
                </svg>
                <div>
                  <p style={{ color: '#94a3b8', fontSize: 10, margin: 0, fontWeight: 500 }}>MESAFE</p>
                  <p style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 600, margin: 0 }}>
                    {nav.distanceToStop === Infinity
                      ? '—'
                      : nav.distanceToStop < 1000
                        ? `${Math.round(nav.distanceToStop)}m`
                        : `${(nav.distanceToStop / 1000).toFixed(1)}km`}
                  </p>
                </div>
              </div>
              <div style={{
                flex: 1, background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 10, padding: '8px 12px',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                <div>
                  <p style={{ color: '#94a3b8', fontSize: 10, margin: 0, fontWeight: 500 }}>SÜRE</p>
                  <p style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 600, margin: 0 }}>
                    {walkMins ? `~${walkMins} dk` : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Next stop preview */}
            {nav.nextStop && (
              <div style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10, padding: '8px 12px', marginBottom: 12,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                <div style={{ minWidth: 0 }}>
                  <p style={{ color: '#475569', fontSize: 10, fontWeight: 600, margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Sıradaki</p>
                  <p style={{ color: '#94a3b8', fontSize: 12, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {nav.nextStop.name}
                  </p>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
              {nav.isNearStop ? (
                <button
                  className="nav-btn arrive-pulse"
                  onClick={() => { nav.arriveAtCurrentStop(); setShowAudio(false) }}
                  style={{
                    flex: 2, background: 'rgba(34,197,94,0.12)',
                    border: '1px solid rgba(34,197,94,0.4)',
                    color: '#86efac', fontSize: 13, padding: '13px 0',
                    animation: 'arrive-glow 1.8s ease-in-out infinite',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Durağa Vardım
                </button>
              ) : (
                <button
                  className="nav-btn"
                  onClick={nav.arriveAtCurrentStop}
                  style={{
                    flex: 2, background: 'rgba(34,197,94,0.08)',
                    border: '1px solid rgba(34,197,94,0.2)',
                    color: '#4ade80', fontSize: 13, padding: '13px 0',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Durağa Vardım
                </button>
              )}

              <button
                className="nav-btn"
                onClick={nav.skipCurrentStop}
                style={{
                  flex: 1, background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#64748b', fontSize: 13, padding: '13px 0',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="5 12 19 12" />
                  <polyline points="13 6 19 12 13 18" />
                </svg>
                Atla
              </button>
            </div>

            {/* Audio guide button — shows when near stop OR always accessible */}
            {nav.currentStop && (
              <button
                className="nav-btn"
                onClick={() => setShowAudio(true)}
                style={{
                  marginTop: 8, width: '100%',
                  background: nav.isNearStop
                    ? 'rgba(245,158,11,0.12)'
                    : 'rgba(255,255,255,0.03)',
                  border: nav.isNearStop
                    ? '1px solid rgba(245,158,11,0.35)'
                    : '1px solid rgba(255,255,255,0.07)',
                  color: nav.isNearStop ? '#fbbf24' : '#475569',
                  fontSize: 13, padding: '11px 0',
                  transition: 'all 0.3s ease',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
                Sesli Rehberi Başlat
              </button>
            )}
          </>
        )}
      </div>

      {/* Audio Guide Modal */}
      {showAudio && nav.currentStop && (
        <AudioGuidePlayer
          stop={nav.currentStop}
          city={planData.city}
          onClose={() => setShowAudio(false)}
        />
      )}
    </div>
  )
}
