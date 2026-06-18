'use client'

import { useTripWizardStore } from '@/stores/tripWizardStore'
import { Clock } from 'lucide-react'

const HOUR_DESCRIPTIONS: Record<number, string> = {
  1: 'Hızlı bir yürüyüş, tek bir mahalle',
  2: 'Ana cazibe merkezleri ve bir öğün',
  3: 'Rahat bir sabah veya öğleden sonra',
  4: 'Yarım günlük tam tur',
  5: 'Birkaç mahalle + öğün molası',
  6: 'Tam gün keşif deneyimi',
  7: 'Kapsamlı şehir turu',
  8: 'Geniş bir çevre + gizli köşeler',
  9: 'Gün boyu macera, her şey dahil',
  10: 'Neredeyse tüm şehri görmek',
  11: 'Sabahtan akşama tam immersive',
  12: 'Şehrin tüm ruhunu hisset',
}

export default function DurationStep() {
  const { durationHours, setDuration } = useTripWizardStore()

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-2"
          style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          <Clock className="w-3 h-3" strokeWidth={2.5} />
          Adım 1 / 6
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Kaç saatin var?</h2>
        <p className="text-slate-400 text-sm">Gezin için ayırdığın süreyi seç</p>
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => {
          const isSelected = durationHours === hour
          return (
            <button
              key={hour}
              onClick={() => setDuration(hour)}
              className="relative flex flex-col items-center justify-center aspect-square rounded-2xl font-bold text-2xl transition-all duration-200"
              style={{
                background: isSelected
                  ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                  : 'rgba(30,41,59,0.8)',
                color: isSelected ? '#fff' : '#94A3B8',
                border: isSelected
                  ? '2px solid rgba(245,158,11,0.6)'
                  : '2px solid rgba(255,255,255,0.05)',
                boxShadow: isSelected ? '0 4px 20px rgba(245,158,11,0.4)' : 'none',
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {hour}
              <span
                className="text-[9px] font-medium absolute bottom-1.5"
                style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : '#475569' }}
              >
                saat
              </span>
            </button>
          )
        })}
      </div>

      {durationHours && (
        <div
          className="rounded-2xl px-5 py-4 flex items-start gap-3 transition-all duration-300"
          style={{
            background: 'rgba(245,158,11,0.07)',
            border: '1px solid rgba(245,158,11,0.2)',
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: 'rgba(245,158,11,0.15)' }}
          >
            <Clock className="w-4 h-4" style={{ color: '#F59E0B' }} strokeWidth={2} />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">
              Yaklaşık {durationHours} saat
            </p>
            <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
              {HOUR_DESCRIPTIONS[durationHours]}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
