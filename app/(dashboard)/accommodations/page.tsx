'use client'

import { useState } from 'react'
import { Plus, Building2, BedDouble } from 'lucide-react'
import { useAccommodations } from '@/hooks/useAccommodations'
import AccommodationCard from '@/components/accommodations/AccommodationCard'
import AddAccommodationDialog from '@/components/accommodations/AddAccommodationDialog'

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-5 animate-pulse"
      style={{
        background: 'rgba(30,41,59,0.7)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.07)' }}
        />
        <div className="flex-1 space-y-2">
          <div
            className="h-4 rounded-lg w-2/3"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          />
          <div
            className="h-3 rounded-lg w-full"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          />
          <div
            className="h-3 rounded-lg w-1/3"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          />
        </div>
        <div className="flex gap-2">
          <div
            className="h-7 w-20 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          />
          <div
            className="h-7 w-14 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          />
        </div>
      </div>
    </div>
  )
}

export default function AccommodationsPage() {
  const { accommodations, loading, setActive, remove, refetch } = useAccommodations()
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(245,158,11,0.15)' }}
            >
              <BedDouble
                className="w-5 h-5"
                style={{ color: '#F59E0B' }}
                strokeWidth={1.8}
              />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Konaklamalarım
            </h1>
          </div>
          <p className="text-slate-500 text-sm ml-13">
            {loading
              ? 'Yükleniyor...'
              : accommodations.length > 0
              ? `${accommodations.length} konaklama kaydedildi`
              : 'Henüz konaklama eklemediniz'}
          </p>
        </div>

        <button
          onClick={() => setDialogOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex-shrink-0 transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            boxShadow: '0 4px 16px rgba(245,158,11,0.25)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 6px 22px rgba(245,158,11,0.38)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(245,158,11,0.25)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span className="hidden sm:inline">Yeni Konaklama Ekle</span>
          <span className="sm:hidden">Ekle</span>
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : accommodations.length === 0 ? (
          <div
            className="rounded-2xl p-12 flex flex-col items-center justify-center text-center"
            style={{
              background: 'rgba(30,41,59,0.4)',
              border: '1px dashed rgba(255,255,255,0.09)',
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: 'rgba(245,158,11,0.1)' }}
            >
              <Building2
                className="w-8 h-8"
                style={{ color: '#F59E0B' }}
                strokeWidth={1.4}
              />
            </div>
            <p className="text-white font-semibold text-lg mb-2">
              Henüz konaklama eklemediniz
            </p>
            <p className="text-slate-500 text-sm mb-6 max-w-xs leading-relaxed">
              Otel veya konaklama yerinizi ekleyerek AI&apos;dan kişisel gezi planı alın
            </p>
            <button
              onClick={() => setDialogOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                boxShadow: '0 4px 16px rgba(245,158,11,0.25)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 6px 22px rgba(245,158,11,0.38)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(245,158,11,0.25)'
              }}
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              İlk Konaklamayı Ekle
            </button>
          </div>
        ) : (
          <>
            {accommodations
              .slice()
              .sort((a, b) => (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0))
              .map((acc) => (
                <AccommodationCard
                  key={acc.id}
                  accommodation={acc}
                  onSetActive={async (id) => {
                    await setActive(id)
                  }}
                  onDelete={async (id) => {
                    await remove(id)
                  }}
                  isLoading={loading}
                />
              ))}
          </>
        )}
      </div>

      <AddAccommodationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={refetch}
      />
    </div>
  )
}
