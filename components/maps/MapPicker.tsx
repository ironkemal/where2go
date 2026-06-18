'use client'

import { useState, useCallback } from 'react'
import BaseMap from '@/components/maps/BaseMap'
import type { LatLng } from '@/lib/maps'
import { DEFAULT_CENTER } from '@/lib/maps'

interface MapPickerProps {
  value?: LatLng
  onChange: (latlng: LatLng, address?: string) => void
  height?: string
}

async function reverseGeocode(latlng: LatLng): Promise<string | undefined> {
  return new Promise((resolve) => {
    const geocoder = new google.maps.Geocoder()
    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        resolve(results[0].formatted_address)
      } else {
        resolve(undefined)
      }
    })
  })
}

export default function MapPicker({ value, onChange, height = '400px' }: MapPickerProps) {
  const [loading, setLoading] = useState(false)

  const handleMapClick = useCallback(
    async (latlng: LatLng) => {
      setLoading(true)
      try {
        const address = await reverseGeocode(latlng)
        onChange(latlng, address)
      } finally {
        setLoading(false)
      }
    },
    [onChange]
  )

  const markers = value
    ? [{ id: 'selected', position: value, color: 'amber' as const }]
    : []

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-gray-700" style={{ height }}>
      <BaseMap
        center={value ?? DEFAULT_CENTER}
        zoom={value ? 15 : 13}
        markers={markers}
        selectedMarker="selected"
        onMapClick={handleMapClick}
        className="w-full h-full"
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {!value && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/60 rounded-full text-gray-300 text-xs pointer-events-none whitespace-nowrap">
          Konum seçmek için haritaya tıklayın
        </div>
      )}
    </div>
  )
}
