'use client'

import { useEffect, useRef } from 'react'
import { GoogleMap, Marker, Circle } from '@react-google-maps/api'
import { MAP_STYLES } from '@/lib/maps'
import type { TripStop } from '@/types/database'

interface NavigationMapProps {
  userLocation: { lat: number; lng: number } | null
  currentStop: TripStop | null
  completedStops: TripStop[]
  isNearStop: boolean
}

const mapOptions: google.maps.MapOptions = {
  styles: MAP_STYLES,
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  gestureHandling: 'greedy',
}

const USER_DOT_ICON = {
  path: 'M-8,0a8,8 0 1,0 16,0a8,8 0 1,0 -16,0',
  fillColor: '#3b82f6',
  fillOpacity: 1,
  strokeColor: '#ffffff',
  strokeWeight: 3,
  scale: 1,
}

const COMPLETED_ICON = {
  path: 'M-5,0a5,5 0 1,0 10,0a5,5 0 1,0 -10,0',
  fillColor: '#475569',
  fillOpacity: 0.8,
  strokeColor: '#334155',
  strokeWeight: 2,
  scale: 1,
}

const ACTIVE_ICON_BASE = {
  path: 'M-12,0a12,12 0 1,0 24,0a12,12 0 1,0 -24,0',
  fillColor: '#f59e0b',
  fillOpacity: 1,
  strokeColor: '#fef3c7',
  strokeWeight: 3,
  scale: 1,
}

export default function NavigationMap({
  userLocation,
  currentStop,
  completedStops,
  isNearStop,
}: NavigationMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null)

  const center = userLocation ??
    currentStop?.coordinates ?? { lat: 41.9028, lng: 12.4964 }

  useEffect(() => {
    if (mapRef.current && userLocation) {
      mapRef.current.panTo(userLocation)
    }
  }, [userLocation])

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={center}
      zoom={16}
      options={mapOptions}
      onLoad={(map) => { mapRef.current = map }}
    >
      {userLocation && (
        <>
          <Circle
            center={userLocation}
            radius={20}
            options={{
              fillColor: '#3b82f6',
              fillOpacity: 0.15,
              strokeColor: '#3b82f6',
              strokeOpacity: 0.4,
              strokeWeight: 1,
            }}
          />
          <Marker
            position={userLocation}
            icon={USER_DOT_ICON}
            zIndex={100}
          />
        </>
      )}

      {completedStops.map((stop, i) => (
        <Marker
          key={`completed-${i}`}
          position={stop.coordinates}
          icon={COMPLETED_ICON}
          zIndex={10}
        />
      ))}

      {currentStop && (
        <Marker
          position={currentStop.coordinates}
          icon={{
            ...ACTIVE_ICON_BASE,
            fillColor: isNearStop ? '#22c55e' : '#f59e0b',
            strokeColor: isNearStop ? '#dcfce7' : '#fef3c7',
          }}
          zIndex={50}
        />
      )}
    </GoogleMap>
  )
}
