'use client'

import { useState } from 'react'
import { MapPin, CheckCircle2, Trash2, Star } from 'lucide-react'
import type { Accommodation } from '@/types/database'

interface AccommodationCardProps {
  accommodation: Accommodation
  onSetActive: (id: string) => void
  onDelete: (id: string) => void
  isLoading?: boolean
}

export default function AccommodationCard({
  accommodation,
  onSetActive,
  onDelete,
  isLoading = false,
}: AccommodationCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    setDeletingId(accommodation.id)
    await onDelete(accommodation.id)
    setDeletingId(null)
  }

  async function handleSetActive() {
    await onSetActive(accommodation.id)
  }

  const isDeleting = deletingId === accommodation.id

  return (
    <div
      className="relative rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: accommodation.is_active
          ? 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(30,41,59,0.9) 60%)'
          : 'rgba(30,41,59,0.7)',
        border: accommodation.is_active
          ? '1px solid rgba(245,158,11,0.35)'
          : '1px solid rgba(255,255,255,0.07)',
        boxShadow: accommodation.is_active
          ? '0 0 0 1px rgba(245,158,11,0.1), inset 0 0 30px rgba(245,158,11,0.04)'
          : 'none',
      }}
    >
      {accommodation.is_active && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
          style={{ background: 'linear-gradient(180deg, #F59E0B, #D97706)' }}
        />
      )}

      <div className="p-5 pl-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{
                background: accommodation.is_active
                  ? 'rgba(245,158,11,0.18)'
                  : 'rgba(255,255,255,0.06)',
              }}
            >
              <MapPin
                className="w-5 h-5"
                style={{ color: accommodation.is_active ? '#F59E0B' : '#64748B' }}
                strokeWidth={1.8}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  className="font-semibold text-white text-sm leading-snug truncate max-w-[200px]"
                >
                  {accommodation.name}
                </h3>
                {accommodation.is_active && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
                    style={{
                      background: 'rgba(245,158,11,0.2)',
                      color: '#F59E0B',
                      border: '1px solid rgba(245,158,11,0.3)',
                    }}
                  >
                    <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} />
                    Aktif Konaklama
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-xs mt-1 line-clamp-1">
                {accommodation.address}
              </p>
              <p className="text-slate-600 text-xs mt-0.5">
                {new Date(accommodation.created_at).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {!accommodation.is_active && (
              <button
                onClick={handleSetActive}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'rgba(245,158,11,0.12)',
                  color: '#F59E0B',
                  border: '1px solid rgba(245,158,11,0.25)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(245,158,11,0.22)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(245,158,11,0.12)'
                }}
              >
                <Star className="w-3 h-3" strokeWidth={2} />
                Aktif Yap
              </button>
            )}

            <button
              onClick={handleDelete}
              disabled={isLoading || isDeleting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={
                confirmDelete
                  ? {
                      background: 'rgba(239,68,68,0.25)',
                      color: '#FCA5A5',
                      border: '1px solid rgba(239,68,68,0.4)',
                    }
                  : {
                      background: 'rgba(239,68,68,0.08)',
                      color: '#F87171',
                      border: '1px solid rgba(239,68,68,0.15)',
                    }
              }
              onMouseEnter={(e) => {
                if (!confirmDelete) {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.15)'
                }
              }}
              onMouseLeave={(e) => {
                if (!confirmDelete) {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
                }
              }}
            >
              <Trash2 className="w-3 h-3" strokeWidth={2} />
              {confirmDelete ? 'Emin misin?' : 'Sil'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
