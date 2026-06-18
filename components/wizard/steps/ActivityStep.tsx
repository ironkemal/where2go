'use client'

import { useTripWizardStore } from '@/stores/tripWizardStore'

const ACTIVITIES = [
  { id: 'museum', emoji: '🏛️', title: 'Müze & Sanat', desc: 'Galeri, sergi, sanat' },
  { id: 'history', emoji: '🏺', title: 'Tarihi Yerler', desc: 'Antik, mimari, miras' },
  { id: 'food', emoji: '🍽️', title: 'Yemek & Kafe', desc: 'Restoran, sokak lezzeti' },
  { id: 'shopping', emoji: '🛍️', title: 'Alışveriş', desc: 'Pazar, çarşı, butik' },
  { id: 'nature', emoji: '🌿', title: 'Doğa & Park', desc: 'Park, bahçe, yürüyüş' },
  { id: 'nightlife', emoji: '🌙', title: 'Gece Hayatı', desc: 'Bar, müzik, eğlence' },
  { id: 'photo', emoji: '📸', title: 'Fotoğraf', desc: 'Manzara, panorama, ikonik' },
  { id: 'culture', emoji: '⛪', title: 'Dini & Kültürel', desc: 'Cami, kilise, tapınak' },
]

export default function ActivityStep() {
  const { activities, toggleActivity } = useTripWizardStore()

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-2"
          style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          🏛️ Adım 3 / 6
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Ne yapmak istiyorsun?</h2>
        <p className="text-slate-400 text-sm">Birden fazla seçebilirsin</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {ACTIVITIES.map((act) => {
          const isSelected = activities.includes(act.id)
          return (
            <button
              key={act.id}
              onClick={() => toggleActivity(act.id)}
              className="relative flex flex-col items-start gap-2 rounded-2xl p-4 text-left transition-all duration-200"
              style={{
                background: isSelected
                  ? 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(217,119,6,0.08))'
                  : 'rgba(30,41,59,0.7)',
                border: isSelected
                  ? '2px solid rgba(245,158,11,0.5)'
                  : '2px solid rgba(255,255,255,0.05)',
                boxShadow: isSelected ? '0 4px 16px rgba(245,158,11,0.15)' : 'none',
              }}
            >
              {isSelected && (
                <div
                  className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
                style={{
                  background: isSelected ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
                }}
              >
                {act.emoji}
              </div>
              <div>
                <p
                  className="font-semibold text-sm transition-colors duration-200"
                  style={{ color: isSelected ? '#F59E0B' : '#E2E8F0' }}
                >
                  {act.title}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#4B5563' }}>
                  {act.desc}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {activities.length > 0 && (
        <div
          className="rounded-xl px-4 py-2.5 flex items-center gap-2"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}
        >
          <span className="text-xs" style={{ color: '#F59E0B' }}>
            {activities.length} aktivite seçildi
          </span>
          <div className="flex flex-wrap gap-1.5 ml-1">
            {activities.map((id) => {
              const act = ACTIVITIES.find((a) => a.id === id)
              return act ? (
                <span
                  key={id}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(245,158,11,0.15)', color: '#FCD34D' }}
                >
                  {act.emoji} {act.title}
                </span>
              ) : null
            })}
          </div>
        </div>
      )}
    </div>
  )
}
