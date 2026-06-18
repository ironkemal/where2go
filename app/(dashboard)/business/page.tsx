'use client'

import { useState } from 'react'
import { Hotel, BarChart2, Target, Code2, Check } from 'lucide-react'

const features = [
  {
    icon: Hotel,
    title: 'İşletmenizi Öne Çıkarın',
    desc: 'Gezginlere AI planlarında otomatik önerilsin',
  },
  {
    icon: BarChart2,
    title: 'Görünürlük Analitikleri',
    desc: 'Kaç gezgine önerildiğinizi görün',
  },
  {
    icon: Target,
    title: 'Hedefli Tanıtım',
    desc: 'İlgili aktivite seçimi yapan gezgine ulaşın',
  },
  {
    icon: Code2,
    title: 'Kurumsal API',
    desc: 'Kendi uygulamanıza Where2Go rotalarını entegre edin',
  },
]

const plans = [
  {
    name: 'Starter',
    price: 'Ücretsiz',
    features: ['5 aylık öneri', 'Temel analitik', 'E-posta destek'],
    highlight: false,
  },
  {
    name: 'Pro',
    price: '€49/ay',
    features: ['Sınırsız öneri', 'Gelişmiş analitik', 'Öncelikli destek', 'Özel profil'],
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Özel Fiyat',
    features: ['API erişimi', 'Dedicated hesap', 'SLA garantisi', 'Beyaz etiket'],
    highlight: false,
  },
]

export default function BusinessPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    const list: string[] = JSON.parse(localStorage.getItem('b2b_waitlist') ?? '[]')
    if (!list.includes(email.trim())) {
      list.push(email.trim())
      localStorage.setItem('b2b_waitlist', JSON.stringify(list))
    }
    setSubmitted(true)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4 pt-4">
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase"
          style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}
        >
          Yakında
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-white">İşletme Portalı</h1>
        <p className="text-base max-w-xl mx-auto" style={{ color: '#94A3B8' }}>
          Oteller, restoranlar ve turistik mekanlar için özel tanıtım ve öneri motoru
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {features.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl p-6 flex gap-4 items-start"
            style={{
              background: 'rgba(30,41,59,0.7)',
              border: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(245,158,11,0.12)' }}
            >
              <Icon className="w-5 h-5" style={{ color: '#F59E0B' }} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-1">{title}</p>
              <p className="text-xs" style={{ color: '#64748B' }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div
        className="rounded-2xl p-8 text-center space-y-5"
        style={{
          background: 'rgba(30,41,59,0.6)',
          border: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <h2 className="text-xl font-bold text-white">Erken erişim için bekleme listesine katılın</h2>
        <p className="text-sm" style={{ color: '#94A3B8' }}>Portal yayına girdiğinde ilk siz haberdar olun.</p>
        {submitted ? (
          <div
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(16,185,129,0.15)', color: '#34D399', border: '1px solid rgba(16,185,129,0.3)' }}
          >
            <Check className="w-4 h-4" strokeWidth={2.5} />
            Teşekkürler! Sizi bilgilendireceğiz.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="isim@sirket.com"
              className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-amber-500/40"
              style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
            >
              Beni Haberdar Et
            </button>
          </form>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white text-center">Fiyatlandırma</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-2xl p-6 flex flex-col gap-4 relative"
              style={{
                background: plan.highlight
                  ? 'linear-gradient(145deg, rgba(245,158,11,0.18), rgba(30,41,59,0.9))'
                  : 'rgba(30,41,59,0.6)',
                border: plan.highlight
                  ? '1px solid rgba(245,158,11,0.4)'
                  : '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
              }}
            >
              {plan.highlight && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#000' }}
                >
                  Popüler
                </span>
              )}
              <div>
                <p className="text-sm font-semibold text-white">{plan.name}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: plan.highlight ? '#F59E0B' : '#fff' }}>
                  {plan.price}
                </p>
              </div>
              <ul className="space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs" style={{ color: '#94A3B8' }}>
                    <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: plan.highlight ? '#F59E0B' : '#64748B' }} strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                disabled
                className="w-full py-2.5 rounded-xl text-xs font-semibold opacity-50 cursor-not-allowed"
                style={
                  plan.highlight
                    ? { background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#000' }
                    : { background: 'rgba(255,255,255,0.06)', color: '#94A3B8' }
                }
              >
                Yakında
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
