'use client'

import { useTripWizardStore } from '@/stores/tripWizardStore'

const ACTIVITY_DETAIL_MAP: Record<string, { emoji: string; label: string; options: string[] }> = {
  food: {
    emoji: '🍽️',
    label: 'Yemek & Kafe',
    options: ['Yöresel', 'İtalyan/Pizza', 'Fastfood', 'Vejetaryen', 'Lüks Fine Dining', 'Deniz Ürünleri'],
  },
  museum: {
    emoji: '🏛️',
    label: 'Müze & Sanat',
    options: ['Sanat Müzesi', 'Tarih Müzesi', 'Bilim Merkezi', 'Arkeoloji', 'Çocuklara Uygun'],
  },
  history: {
    emoji: '🏺',
    label: 'Tarihi Yerler',
    options: ['Antik Kalıntılar', 'Kilise & Katedral', 'Kale & Saray', 'Anıt & Meydan'],
  },
  shopping: {
    emoji: '🛍️',
    label: 'Alışveriş',
    options: ['Butik Mağaza', 'Çarşı & Pazar', 'Alışveriş Merkezi', 'Hediyelik Eşya'],
  },
  nature: {
    emoji: '🌿',
    label: 'Doğa & Park',
    options: ['Botanik Bahçesi', 'Nehir Kenarı', 'Vadi & Tepeler', 'Plaj'],
  },
  nightlife: {
    emoji: '🌙',
    label: 'Gece Hayatı',
    options: ['Bar & Pub', 'Canlı Müzik', 'Dans & Club', 'Gece Gezisi'],
  },
}

export default function DetailStep() {
  const { activities, activityDetails, setActivityDetails } = useTripWizardStore()

  const relevantActivities = activities.filter((a) => ACTIVITY_DETAIL_MAP[a])

  const toggleDetail = (activityId: string, option: string) => {
    const current = activityDetails[activityId] ?? []
    const next = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option]
    setActivityDetails(activityId, next)
  }

  if (relevantActivities.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-1.5">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-2"
            style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            ✨ Adım 4 / 6
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Detaylandır</h2>
        </div>
        <div
          className="rounded-2xl p-8 flex flex-col items-center text-center gap-3"
          style={{ background: 'rgba(30,41,59,0.5)', border: '1px dashed rgba(255,255,255,0.08)' }}
        >
          <span className="text-4xl">🎯</span>
          <p className="text-slate-400 text-sm">Seçtiğin aktiviteler için detay tercihi gerekmiyor.</p>
          <p className="text-slate-500 text-xs">Devam etmek için İleri'ye bas.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-2"
          style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          ✨ Adım 4 / 6
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Detaylandır</h2>
        <p className="text-slate-400 text-sm">Opsiyonel — istediğin kadar spesifik ol</p>
      </div>

      <div className="space-y-5">
        {relevantActivities.map((actId) => {
          const config = ACTIVITY_DETAIL_MAP[actId]
          if (!config) return null
          const selected = activityDetails[actId] ?? []

          return (
            <div key={actId} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-base">{config.emoji}</span>
                <h3 className="text-sm font-semibold" style={{ color: '#E2E8F0' }}>
                  {config.label}
                </h3>
                {selected.length > 0 && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}
                  >
                    {selected.length} seçili
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {config.options.map((opt) => {
                  const isChosen = selected.includes(opt)
                  return (
                    <button
                      key={opt}
                      onClick={() => toggleDetail(actId, opt)}
                      className="px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200"
                      style={{
                        background: isChosen
                          ? 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(217,119,6,0.15))'
                          : 'rgba(30,41,59,0.8)',
                        color: isChosen ? '#FCD34D' : '#94A3B8',
                        border: isChosen
                          ? '1.5px solid rgba(245,158,11,0.5)'
                          : '1.5px solid rgba(255,255,255,0.06)',
                        transform: isChosen ? 'scale(1.04)' : 'scale(1)',
                      }}
                    >
                      {isChosen ? '✓ ' : ''}{opt}
                    </button>
                  )
                })}
              </div>
              <div
                style={{ height: '1px', background: 'rgba(255,255,255,0.04)', marginTop: '4px' }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
