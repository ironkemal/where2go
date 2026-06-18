'use client'

import { useTripWizardStore } from '@/stores/tripWizardStore'

type TransportMode = 'walking' | 'scooter' | 'car' | 'bicycle' | 'public_transport'

const TRANSPORT_OPTIONS: {
  id: TransportMode
  emoji: string
  title: string
  desc: string
  speed: string
}[] = [
  {
    id: 'walking',
    emoji: '🚶',
    title: 'Yürüyerek',
    desc: 'En çok detay, en organik deneyim',
    speed: '~4 km/s',
  },
  {
    id: 'scooter',
    emoji: '🛴',
    title: 'Scooter / E-Scooter',
    desc: 'Hızlı, eğlenceli, park sorunu yok',
    speed: '~15 km/s',
  },
  {
    id: 'car',
    emoji: '🚗',
    title: 'Arabayla',
    desc: 'Geniş alan, konforlu ulaşım',
    speed: '~30 km/s',
  },
  {
    id: 'bicycle',
    emoji: '🚲',
    title: 'Bisikletle',
    desc: 'Çevre dostu, sağlıklı, esnek',
    speed: '~12 km/s',
  },
  {
    id: 'public_transport',
    emoji: '🚌',
    title: 'Toplu Taşıma',
    desc: 'Metro, otobüs, tramvay kombinasyonu',
    speed: '~20 km/s',
  },
]

export default function TransportStep() {
  const { transportMode, setTransport } = useTripWizardStore()

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-2"
          style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          🛴 Adım 2 / 6
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Nasıl gidiyorsun?</h2>
        <p className="text-slate-400 text-sm">Ulaşım tercihin rotayı şekillendirir</p>
      </div>

      <div className="space-y-3">
        {TRANSPORT_OPTIONS.map((opt) => {
          const isSelected = transportMode === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => setTransport(opt.id)}
              className="w-full flex items-center gap-4 rounded-2xl px-5 py-4 text-left transition-all duration-200"
              style={{
                background: isSelected
                  ? 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.08))'
                  : 'rgba(30,41,59,0.7)',
                border: isSelected
                  ? '2px solid rgba(245,158,11,0.5)'
                  : '2px solid rgba(255,255,255,0.05)',
                boxShadow: isSelected ? '0 4px 20px rgba(245,158,11,0.15)' : 'none',
                transform: isSelected ? 'translateX(4px)' : 'translateX(0)',
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
                style={{
                  background: isSelected ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
                }}
              >
                {opt.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="font-semibold text-sm transition-colors duration-200"
                  style={{ color: isSelected ? '#F59E0B' : '#E2E8F0' }}
                >
                  {opt.title}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>
                  {opt.desc}
                </p>
              </div>
              <div
                className="text-xs font-bold px-2.5 py-1 rounded-lg flex-shrink-0"
                style={{
                  background: isSelected ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.04)',
                  color: isSelected ? '#F59E0B' : '#475569',
                  border: `1px solid ${isSelected ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.05)'}`,
                }}
              >
                {opt.speed}
              </div>
              {isSelected && (
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: '#F59E0B' }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
