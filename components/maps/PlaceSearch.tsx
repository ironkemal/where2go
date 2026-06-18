'use client'

import { useRef } from 'react'
import { Autocomplete } from '@react-google-maps/api'
import type { LatLng } from '@/lib/maps'

interface PlaceSearchProps {
  onPlaceSelect: (place: {
    name: string
    address: string
    coordinates: LatLng
    placeId: string
  }) => void
  placeholder?: string
  className?: string
}

export default function PlaceSearch({
  onPlaceSelect,
  placeholder = 'Bir yer arayın...',
  className = '',
}: PlaceSearchProps) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  function handleLoad(autocomplete: google.maps.places.Autocomplete) {
    autocompleteRef.current = autocomplete
  }

  function handlePlaceChanged() {
    const autocomplete = autocompleteRef.current
    if (!autocomplete) return

    const place = autocomplete.getPlace()
    if (!place.geometry?.location || !place.place_id) return

    onPlaceSelect({
      name: place.name ?? '',
      address: place.formatted_address ?? '',
      coordinates: {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      },
      placeId: place.place_id,
    })
  }

  return (
    <Autocomplete onLoad={handleLoad} onPlaceChanged={handlePlaceChanged}>
      <input
        type="text"
        placeholder={placeholder}
        className={[
          'flex h-10 w-full rounded-md border border-gray-700 bg-[#1a1f2e]',
          'px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500',
          'transition-colors',
          className,
        ]
          .join(' ')
          .trim()}
      />
    </Autocomplete>
  )
}
