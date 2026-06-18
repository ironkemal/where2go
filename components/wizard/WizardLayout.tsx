'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from 'lucide-react'

interface WizardLayoutProps {
  currentStep: number
  totalSteps: number
  onNext: () => void
  onBack: () => void
  onSubmit: () => void
  canProceed: boolean
  isSubmitting: boolean
  children: React.ReactNode
}

const STEP_LABELS = ['Süre', 'Ulaşım', 'Aktivite', 'Detay', 'Bütçe', 'Özet']

export default function WizardLayout({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onSubmit,
  canProceed,
  isSubmitting,
  children,
}: WizardLayoutProps) {
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [animating, setAnimating] = useState(false)
  const [displayStep, setDisplayStep] = useState(currentStep)
  const prevStepRef = useRef(currentStep)

  useEffect(() => {
    if (currentStep !== prevStepRef.current) {
      setDirection(currentStep > prevStepRef.current ? 'forward' : 'back')
      setAnimating(true)
      const t = setTimeout(() => {
        setDisplayStep(currentStep)
        setAnimating(false)
        prevStepRef.current = currentStep
      }, 180)
      return () => clearTimeout(t)
    }
  }, [currentStep])

  const isLastStep = currentStep === totalSteps
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'transparent' }}>
      <div
        className="sticky top-0 z-10 px-4 pt-4 pb-4"
        style={{ background: 'rgba(10,18,35,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            {STEP_LABELS.map((label, i) => {
              const stepNum = i + 1
              const isActive = stepNum === currentStep
              const isDone = stepNum < currentStep
              return (
                <div key={label} className="flex flex-col items-center gap-1" style={{ flex: 1 }}>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                    style={{
                      background: isDone
                        ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                        : isActive
                        ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                        : 'rgba(255,255,255,0.07)',
                      color: isDone || isActive ? '#fff' : '#4B5563',
                      boxShadow: isActive ? '0 0 16px rgba(245,158,11,0.5)' : 'none',
                      transform: isActive ? 'scale(1.15)' : 'scale(1)',
                    }}
                  >
                    {isDone ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      stepNum
                    )}
                  </div>
                  <span
                    className="text-[9px] font-medium tracking-wide uppercase transition-colors duration-300"
                    style={{ color: isActive ? '#F59E0B' : isDone ? '#6B7280' : '#374151' }}
                  >
                    {label}
                  </span>
                </div>
              )
            })}
          </div>

          <div
            className="h-0.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #F59E0B, #D97706)',
                boxShadow: '0 0 8px rgba(245,158,11,0.6)',
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 overflow-hidden">
        <div className="max-w-xl mx-auto h-full">
          <div
            className="transition-all duration-300"
            style={{
              opacity: animating ? 0 : 1,
              transform: animating
                ? direction === 'forward'
                  ? 'translateX(24px)'
                  : 'translateX(-24px)'
                : 'translateX(0)',
            }}
          >
            {children}
          </div>
        </div>
      </div>

      <div
        className="sticky bottom-0 px-4 pb-6 pt-4"
        style={{ background: 'rgba(10,18,35,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-xl mx-auto flex gap-3">
          {currentStep > 1 && (
            <button
              onClick={onBack}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-40"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: '#9CA3AF',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)' }}
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              Geri
            </button>
          )}

          {isLastStep ? (
            <button
              onClick={onSubmit}
              disabled={!canProceed || isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: canProceed && !isSubmitting
                  ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 60%, #B45309 100%)'
                  : 'rgba(245,158,11,0.3)',
                color: '#fff',
                boxShadow: canProceed && !isSubmitting ? '0 8px 24px rgba(245,158,11,0.4)' : 'none',
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />
                  Hazırlanıyor...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" strokeWidth={2} />
                  Plan Oluştur
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onNext}
              disabled={!canProceed || isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: canProceed
                  ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 60%, #B45309 100%)'
                  : 'rgba(245,158,11,0.2)',
                color: canProceed ? '#fff' : '#6B7280',
                boxShadow: canProceed ? '0 6px 20px rgba(245,158,11,0.35)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (canProceed) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 28px rgba(245,158,11,0.5)'
              }}
              onMouseLeave={(e) => {
                if (canProceed) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(245,158,11,0.35)'
              }}
            >
              İleri
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
