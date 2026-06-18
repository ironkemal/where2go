'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTripWizardStore } from '@/stores/tripWizardStore'
import { useAccommodations } from '@/hooks/useAccommodations'
import WizardLayout from '@/components/wizard/WizardLayout'
import DurationStep from '@/components/wizard/steps/DurationStep'
import TransportStep from '@/components/wizard/steps/TransportStep'
import ActivityStep from '@/components/wizard/steps/ActivityStep'
import DetailStep from '@/components/wizard/steps/DetailStep'
import BudgetStep from '@/components/wizard/steps/BudgetStep'
import ConfirmStep from '@/components/wizard/steps/ConfirmStep'
import { Loader2 } from 'lucide-react'

export default function NewPlanPage() {
  const router = useRouter()
  const {
    currentStep,
    nextStep,
    prevStep,
    durationHours,
    transportMode,
    activities,
    activityDetails,
    budgetLevel,
    accommodationId,
    setAccommodation,
    reset,
  } = useTripWizardStore()

  const { accommodations, loading: accommodationsLoading } = useAccommodations()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!accommodationsLoading) {
      const active = accommodations.find((a) => a.is_active)
      if (!active) {
        router.replace('/accommodations')
        return
      }
      setAccommodation(active.id)
    }
  }, [accommodations, accommodationsLoading, router, setAccommodation])

  const canProceed = (() => {
    switch (currentStep) {
      case 1:
        return durationHours > 0
      case 2:
        return transportMode !== null
      case 3:
        return activities.length > 0
      case 4:
        return true
      case 5:
        return true
      case 6:
        return true
      default:
        return false
    }
  })()

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accommodationId,
          durationHours,
          transportMode,
          activities,
          activityDetails,
          budgetLevel,
        }),
      })

      const body = await res.json()

      if (!res.ok) {
        setSubmitError(body.error ?? 'Plan oluşturulamadı')
        setIsSubmitting(false)
        return
      }

      reset()
      router.push(`/plan/${body.id}`)
    } catch {
      setSubmitError('Bağlantı hatası oluştu')
      setIsSubmitting(false)
    }
  }

  if (accommodationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#F59E0B' }} strokeWidth={1.5} />
          <p className="text-slate-400 text-sm">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <DurationStep />
      case 2:
        return <TransportStep />
      case 3:
        return <ActivityStep />
      case 4:
        return <DetailStep />
      case 5:
        return <BudgetStep />
      case 6:
        return <ConfirmStep isSubmitting={isSubmitting} />
      default:
        return null
    }
  }

  return (
    <>
      {isSubmitting && currentStep === 6 ? (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8"
          style={{ background: 'rgba(10,18,35,0.97)', backdropFilter: 'blur(20px)' }}
        >
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.2)',
              }}
            >
              <Loader2 className="w-12 h-12 animate-spin" style={{ color: '#F59E0B' }} strokeWidth={1.5} />
            </div>
            <div
              className="absolute -inset-4 rounded-full animate-ping opacity-10"
              style={{ background: 'rgba(245,158,11,0.6)' }}
            />
          </div>
          <div className="text-center space-y-3 max-w-xs">
            <p className="text-white font-bold text-2xl tracking-tight">
              Planın hazırlanıyor
            </p>
            <p className="text-slate-400 text-sm leading-relaxed">
              Yapay zeka tercihlerini analiz ediyor ve senin için en iyi rotayı oluşturuyor...
            </p>
          </div>
          <div className="flex gap-2">
            {[0, 0.2, 0.4].map((delay, i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full animate-bounce"
                style={{ background: '#F59E0B', animationDelay: `${delay}s`, opacity: 0.8 }}
              />
            ))}
          </div>
        </div>
      ) : null}

      {submitError && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
          style={{
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#FCA5A5',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}
        >
          ⚠️ {submitError}
          <button
            onClick={() => setSubmitError(null)}
            className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
        </div>
      )}

      <WizardLayout
        currentStep={currentStep}
        totalSteps={6}
        onNext={nextStep}
        onBack={prevStep}
        onSubmit={handleSubmit}
        canProceed={canProceed}
        isSubmitting={isSubmitting}
      >
        {renderStep()}
      </WizardLayout>
    </>
  )
}
