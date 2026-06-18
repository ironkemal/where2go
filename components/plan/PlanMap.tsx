'use client'

import { useCallback, useRef, useState } from 'react'
import { GoogleMap, Marker, Polyline, InfoWindow } from '@react-google-maps/api'
import GoogleMapsProvider from '@/components/maps/GoogleMapsProvider'
import { MAP_STYLES } from '@/lib/maps'
import type { TripPlanData, TripStop } from '@/types/database'

interface PlanMapProps {
  plan: TripPlanData
  activeStopIndex?: number
  showRoute?: boolean
  className?: string
}

const STOP_COLORS: Record<TripStop['type'], string> = {
  accommodation: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
  restaurant: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
  attraction: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
  transport: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
}

const TYPE_EMOJI: Record<TripStop['type'], string> = {
  accommodation: '🏨',
  restaurant: '🍽️',
  attraction: '🏛️',
  transport: '🚌',
}

const mapOptions: google.maps.MapOptions = {
  styles: MAP_STYLES,
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} dk`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h} sa ${m} dk` : `${h} sa`
}

function formatCost(cost: TripStop['cost_estimate'], currency = '€'): string {
  if (cost.min === 0 && cost.max === 0) return 'Ücretsiz'
  if (cost.min === cost.max) return `${currency}${cost.min}`
  return `${currency}${cost.min}–${currency}${cost.max}`
}

function MapInner({
  plan,
  activeStopIndex,
  showRoute = true,
}: Omit<PlanMapProps, 'className'>) {
  const mapRef = useRef<google.maps.Map | null>(null)
  const [selectedStopIdx, setSelectedStopIdx] = useState<number | null>(null)

  const stops = plan.stops ?? []

  const fitAllBounds = useCallback(() => {
    if (!mapRef.current || stops.length === 0) return
    const bounds = new google.maps.LatLngBounds()
    stops.forEach((s) => bounds.extend({ lat: s.coordinates.lat, lng: s.coordinates.lng }))
    mapRef.current.fitBounds(bounds, 60)
  }, [stops])

  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map
      if (stops.length === 0) return
      const bounds = new google.maps.LatLngBounds()
      stops.forEach((s) => bounds.extend({ lat: s.coordinates.lat, lng: s.coordinates.lng }))
      map.fitBounds(bounds, 60)
    },
    [stops]
  )

  const routePath = stops.map((s) => ({ lat: s.coordinates.lat, lng: s.coordinates.lng }))

  const selectedStop = selectedStopIdx !== null ? stops[selectedStopIdx] : null

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={stops[0]?.coordinates ?? { lat: 41.9028, lng: 12.4964 }}
        zoom={13}
        options={mapOptions}
        onLoad={onMapLoad}
        onClick={() => setSelectedStopIdx(null)}
      >
        {showRoute && stops.length > 1 && (
          <Polyline
            path={routePath}
            options={{
              strokeColor: '#F59E0B',
              strokeOpacity: 0,
              strokeWeight: 3,
              icons: [
                {
                  icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 },
                  offset: '0',
                  repeat: '14px',
                },
              ],
            }}
          />
        )}

        {stops.map((stop, idx) => {
          const isActive = idx === activeStopIndex
          const isSelected = idx === selectedStopIdx
          const size = isActive || isSelected ? 48 : 36
          return (
            <Marker
              key={idx}
              position={{ lat: stop.coordinates.lat, lng: stop.coordinates.lng }}
              icon={{
                url: STOP_COLORS[stop.type],
                scaledSize: new google.maps.Size(size, size),
              }}
              zIndex={isActive ? 100 : isSelected ? 90 : idx}
              onClick={() => setSelectedStopIdx(idx === selectedStopIdx ? null : idx)}
            />
          )
        })}

        {selectedStop && selectedStopIdx !== null && (
          <InfoWindow
            position={{
              lat: selectedStop.coordinates.lat,
              lng: selectedStop.coordinates.lng,
            }}
            onCloseClick={() => setSelectedStopIdx(null)}
          >
            <div
              style={{
                background: '#1e293b',
                color: '#f1f5f9',
                padding: '10px 14px',
                borderRadius: 10,
                minWidth: 180,
                maxWidth: 240,
                fontFamily: 'inherit',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 18 }}>{TYPE_EMOJI[selectedStop.type]}</span>
                <span style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>
                  {selectedStop.name}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>
                ⏱ {formatDuration(selectedStop.duration_minutes)}
              </div>
              <div style={{ fontSize: 12, color: '#fbbf24', fontWeight: 600 }}>
                {formatCost(selectedStop.cost_estimate, plan.total_cost_estimate.currency)}
              </div>
              {selectedStop.description && (
                <div
                  style={{
                    fontSize: 11,
                    color: '#64748b',
                    marginTop: 6,
                    lineHeight: 1.5,
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    paddingTop: 6,
                  }}
                >
                  {selectedStop.description.slice(0, 80)}
                  {selectedStop.description.length > 80 ? '…' : ''}
                </div>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      <button
        onClick={fitAllBounds}
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          background: 'rgba(15,23,42,0.92)',
          border: '1px solid rgba(245,158,11,0.4)',
          color: '#F59E0B',
          borderRadius: 10,
          padding: '8px 14px',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          zIndex: 10,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(245,158,11,0.15)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(15,23,42,0.92)'
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
        </svg>
        Tüm Rotayı Gör
      </button>
    </div>
  )
}

export default function PlanMap({ plan, activeStopIndex, showRoute = true, className = 'w-full h-full' }: PlanMapProps) {
  return (
    <GoogleMapsProvider>
      <div className={className}>
        <MapInner plan={plan} activeStopIndex={activeStopIndex} showRoute={showRoute} />
      </div>
    </GoogleMapsProvider>
  )
}
