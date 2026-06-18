'use client'

import { useState, useEffect, useRef } from 'react'
import { X, MapPin, Search, Save, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import GoogleMapsProvider from '@/components/maps/GoogleMapsProvider'
import PlaceSearch from '@/components/maps/PlaceSearch'
import MapPicker from '@/components/maps/MapPicker'
import { useAccommodations } from '@/hooks/useAccommodations'

interface AddAccommodationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface LatLng {
  lat: number
  lng: number
}

interface FormState {
  name: string
  address: string
  coordinates: LatLng | null
}

export default function AddAccommodationDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddAccommodationDialogProps) {
  const { create } = useAccommodations()
  const [form, setForm] = useState<FormState>({
    name: '',
    address: '',
    coordinates: null,
  })
  const [mapCenter, setMapCenter] = useState<LatLng | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      setForm({ name: '', address: '', coordinates: null })
      setMapCenter(null)
      setError(null)
    }
  }, [open])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) onOpenChange(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onOpenChange])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  function handlePlaceSelect(place: {
    name: string
    address: string
    coordinates: LatLng
  }) {
    setForm({
      name: place.name,
      address: place.address,
      coordinates: place.coordinates,
    })
    setMapCenter(place.coordinates)
    setError(null)
  }

  function handleMapPick(latlng: LatLng) {
    setForm((prev) => ({ ...prev, coordinates: latlng }))
  }

  async function handleSave() {
    if (!form.coordinates) {
      setError('Lütfen haritadan veya arama kutusundan bir konum seçin.')
      return
    }
    if (!form.name.trim()) {
      setError('Konaklama adı gereklidir.')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      await create({
        name: form.name.trim(),
        address: form.address.trim(),
        lat: form.coordinates.lat,
        lng: form.coordinates.lng,
      })
      toast.success('Konaklama başarıyla eklendi!')
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      setError('Konaklama eklenirken bir hata oluştu. Tekrar deneyin.')
    } finally {
      setIsSaving(false)
    }
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) {
      onOpenChange(false)
    }
  }

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="relative w-full sm:max-w-xl max-h-[95vh] sm:max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-2xl overflow-hidden"
        style={{
          background: '#0F172A',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(245,158,11,0.08)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(245,158,11,0.15)' }}
            >
              <MapPin className="w-4.5 h-4.5" style={{ color: '#F59E0B' }} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-white font-semibold text-base leading-tight">
                Yeni Konaklama Ekle
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Otel veya konaklama yerinizi ekleyin
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
            style={{ color: '#64748B' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.color = '#94A3B8'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#64748B'
            }}
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Adres Ara
              </label>
              <GoogleMapsProvider>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none z-10"
                    style={{ color: '#64748B' }}
                    strokeWidth={2}
                  />
                  <PlaceSearch
                    onPlaceSelect={handlePlaceSelect}
                    placeholder="Otel adı veya adres girin..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200"
                  />
                </div>

                <div
                  className="mt-4 rounded-xl overflow-hidden"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <MapPicker
                    value={form.coordinates ?? undefined}
                    onChange={handleMapPick}
                    height="208px"
                  />
                </div>
              </GoogleMapsProvider>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label
                  htmlFor="acc-name"
                  className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2"
                >
                  Konaklama Adı
                </label>
                <input
                  id="acc-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Örn: Hilton İstanbul Boğaz"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(30,41,59,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(245,158,11,0.5)'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.08)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="acc-address"
                  className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2"
                >
                  Adres
                </label>
                <input
                  id="acc-address"
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  placeholder="Tam adres"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(30,41,59,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(245,158,11,0.5)'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.08)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>

            {form.coordinates && (
              <div
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs"
                style={{
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.2)',
                  color: '#F59E0B',
                }}
              >
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
                <span>
                  Konum seçildi: {form.coordinates.lat.toFixed(5)},{' '}
                  {form.coordinates.lng.toFixed(5)}
                </span>
              </div>
            )}

            {error && (
              <div
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#FCA5A5',
                }}
              >
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
                {error}
              </div>
            )}
          </div>
        </div>

        <div
          className="flex items-center justify-end gap-3 px-6 py-4 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
            style={{ color: '#94A3B8', background: 'transparent' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !form.coordinates || !form.name.trim()}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              boxShadow: '0 4px 16px rgba(245,158,11,0.25)',
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(245,158,11,0.35)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(245,158,11,0.25)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
            ) : (
              <Save className="w-4 h-4" strokeWidth={2} />
            )}
            {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  )
}
