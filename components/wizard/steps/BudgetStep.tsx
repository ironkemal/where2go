'use client'

import { useTripWizardStore } from '@/stores/tripWizardStore'

type BudgetLevel = 'budget' | 'mid' | 'luxury'

const BUDGET_OPTIONS: {
  id: BudgetLevel
  emoji: string
  title: string
  subtitle: string
  desc: string
  color: string
  glow: string
}[] = [
  {
    id: 'budget',
    emoji: '💚',
    title: 'Uygun Bütçe',
    subtitle: 'Ücretsiz & ekonomik',
    desc: 'Ücretsiz girişli müzeler, sokak yemekleri, toplu taşıma, park ve meydanlar öncelikli',
    color: '#10B981',
    glow: 'rgba(16,185,129,0.2)',
  },
  {
    id: 'mid',
    emoji: '💛',
    title: 'Orta Bütçe',
    subtitle: 'Kalite-fiyat dengesi',
    desc: 'Uygun restoranlar, seçici müzeler, karma ulaşım. En iyi deneyim için en uygun fiyat',
    color: '#F59E0B',
    glow: 'rgba(245,158,11,0.2)',
  },
  {
    id: 'luxury',
    emoji: '💎',
    title: 'Lüks',
    subtitle: 'En iyisini istiyorum',
    desc: 'Fine dining, özel turlar, VIP girişler, premium konum ve en seçkin deneyimler',
    color: '#A78BFA',
    glow: 'rgba(167,139,250,0.2)',
  },
]

export default function BudgetStep() {
  const { budgetLevel, setBudget } = useTripWizardStore()

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-2"
          style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          💰 Adım 5 / 6
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Bütçe tercihin?</h2>
        <p className="text-slate-400 text-sm">Planı bu beklentiye göre şekillendiriyoruz</p>
      </div>

      <div className="space-y-3">
        {BUDGET_OPTIONS.map((opt) => {
          const isSelected = budgetLevel === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => setBudget(opt.id)}
              className="w-full rounded-2xl p-5 text-left transition-all duration-200"
              style={{
                background: isSelected
                  ? `linear-gradient(135deg, ${opt.glow.replace('0.2)', '0.15)')}, rgba(15,23,42,0.9))`
                  : 'rgba(30,41,59,0.7)',
                border: isSelected
                  ? `2px solid ${opt.color}55`
                  : '2px solid rgba(255,255,255,0.05)',
                boxShadow: isSelected ? `0 6px 24px ${opt.glow}` : 'none',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-13 h-13 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{
                    background: isSelected ? `${opt.color}20` : 'rgba(255,255,255,0.04)',
                    width: '52px',
                    height: '52px',
                  }}
                >
                  {opt.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className="font-bold text-base transition-colors duration-200"
                      style={{ color: isSelected ? opt.color : '#E2E8F0' }}
                    >
                      {opt.title}
                    </p>
                    {isSelected && (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: opt.color }}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p
                    className="text-xs font-medium mt-0.5 mb-1.5"
                    style={{ color: isSelected ? `${opt.color}CC` : '#64748B' }}
                  >
                    {opt.subtitle}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: '#4B5563' }}>
                    {opt.desc}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <button
        onClick={() => setBudget(null)}
        className="w-full py-3 rounded-xl text-xs font-medium transition-all duration-200"
        style={{
          background: budgetLevel === null ? 'rgba(255,255,255,0.07)' : 'transparent',
          color: budgetLevel === null ? '#94A3B8' : '#374151',
          border: '1px dashed rgba(255,255,255,0.1)',
        }}
      >
        Atla — bütçe tercihi yok
      </button>
    </div>
  )
}
