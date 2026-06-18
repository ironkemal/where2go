'use client'

import { useTripWizardStore } from '@/stores/tripWizardStore'
import { useAccommodations } from '@/hooks/useAccommodations'
import { Loader2, MapPin, Clock, Navigation, Star, Wallet, ChevronRight } from 'lucide-react'

const TRANSPORT_LABELS: Record<string, string> = {
  walking: '🚶 Yürüyerek',
  scooter: '🛴 Scooter / E-Scooter',
  car: '🚗 Arabayla',
  bicycle: '🚲 Bisikletle',
  public_transport: '🚌 Toplu Taşıma',
}

const ACTIVITY_LABELS: Record<string, string> = {
  museum: '🏛️ Müze & Sanat',
  history: '🏺 Tarihi Yerler',
  food: '🍽️ Yemek & Kafe',
  shopping: '🛍️ Alışveriş',
  nature: '🌿 Doğa & Park',
  nightlife: '🌙 Gece Hayatı',
  photo: '📸 Fotoğraf',
  culture: '⛪ Dini & Kültürel',
}

const BUDGET_LABELS: Record<string, string> = {
  budget: '💚 Uygun Bütçe',
  mid: '💛 Orta Bütçe',
  luxury: '💎 Lüks',
}

interface ConfirmStepProps {
  isSubmitting?: boolean
}

export default function ConfirmStep({ isSubmitting = false }: ConfirmStepProps) {
  const {
    accommodationId,
    durationHours,
    transportMode,
    activities,
    activityDetails,
    budgetLevel,
  } = useTripWizardStore()

  const { accommodations } = useAccommodations()
  const accommodation = accommodations.find((a) => a.id === accommodationId)

  if (isSubmitting) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16">
        <div className="relative">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#F59E0B' }} strokeWidth={1.5} />
          </div>
          <div
            className="absolute -inset-3 rounded-full animate-ping opacity-20"
            style={{ background: 'rgba(245,158,11,0.4)' }}
          />
        </div>
        <div className="text-center space-y-2">
          <p className="text-white font-bold text-xl">Yapay Zeka planınızı hazırlıyor...</p>
          <p className="text-slate-400 text-sm">Tercihleriniz analiz ediliyor, en iyi rotanız oluşturuluyor</p>
        </div>
        <div className="flex gap-1.5">
          {[0, 0.15, 0.3].map((delay, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-bounce"
              style={{ background: '#F59E0B', animationDelay: `${delay}s` }}
            />
          ))}
        </div>
      </div>
    )
  }

  const rows = [
    {
      icon: <MapPin className="w-4 h-4" />,
      label: 'Konaklama',
      value: accommodation ? (
        <div>
          <p className="text-white text-sm font-semibold">{accommodation.name}</p>
          <p className="text-slate-500 text-xs mt-0.5">{accommodation.address}</p>
        </div>
      ) : (
        <span className="text-slate-500 text-sm">—</span>
      ),
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: 'Süre',
      value: <span className="text-white text-sm font-semibold">{durationHours} saat</span>,
    },
    {
      icon: <Navigation className="w-4 h-4" />,
      label: 'Ulaşım',
      value: (
        <span className="text-white text-sm font-semibold">
          {transportMode ? TRANSPORT_LABELS[transportMode] : '—'}
        </span>
      ),
    },
    {
      icon: <Star className="w-4 h-4" />,
      label: 'Aktiviteler',
      value:
        activities.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            {activities.map((a) => (
              <div key={a}>
                <span className="text-white text-sm font-medium">{ACTIVITY_LABELS[a] ?? a}</span>
                {activityDetails[a]?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {activityDetails[a].map((d) => (
                      <span
                        key={d}
                        className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <span className="text-slate-500 text-sm">—</span>
        ),
    },
    {
      icon: <Wallet className="w-4 h-4" />,
      label: 'Bütçe',
      value: (
        <span className="text-white text-sm font-semibold">
          {budgetLevel ? BUDGET_LABELS[budgetLevel] : 'Belirtilmedi'}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-2"
          style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          ✅ Adım 6 / 6
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Her şey hazır!</h2>
        <p className="text-slate-400 text-sm">Tercihlerini kontrol et ve planı oluştur</p>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(15,23,42,0.8)' }}
      >
        {rows.map((row, i) => (
          <div
            key={row.label}
            className="flex items-start gap-4 px-5 py-4"
            style={{
              borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}
            >
              {row.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium mb-1" style={{ color: '#4B5563' }}>
                {row.label}
              </p>
              {row.value}
            </div>
            <ChevronRight className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: '#1E293B' }} />
          </div>
        ))}
      </div>

      <div
        className="rounded-2xl p-4 flex items-start gap-3"
        style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}
      >
        <span className="text-lg flex-shrink-0">✨</span>
        <p className="text-xs leading-relaxed" style={{ color: '#78716C' }}>
          Planın hazırlandıktan sonra rotayı haritada görebilir, durakları yeniden sıralayabilir ve detaylı bilgilere ulaşabilirsin.
        </p>
      </div>
    </div>
  )
}
