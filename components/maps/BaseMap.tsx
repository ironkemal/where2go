'use client'

import { GoogleMap, Marker } from '@react-google-maps/api'
import { DEFAULT_CENTER, MAP_STYLES, type LatLng } from '@/lib/maps'

const PIN_COLORS: Record<string, string> = {
  amber: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
  blue: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
  red: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
  green: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
}

interface MarkerItem {
  id: string
  position: LatLng
  label?: string
  color?: 'amber' | 'blue' | 'red' | 'green'
}

interface BaseMapProps {
  center?: LatLng
  zoom?: number
  markers?: MarkerItem[]
  onMapClick?: (latlng: LatLng) => void
  selectedMarker?: string
  onMarkerClick?: (id: string) => void
  className?: string
  children?: React.ReactNode
}

const mapOptions: google.maps.MapOptions = {
  styles: MAP_STYLES,
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
}

export default function BaseMap({
  center = DEFAULT_CENTER,
  zoom = 13,
  markers = [],
  onMapClick,
  selectedMarker,
  onMarkerClick,
  className = 'w-full h-64',
  children,
}: BaseMapProps) {
  function handleMapClick(e: google.maps.MapMouseEvent) {
    if (!e.latLng || !onMapClick) return
    onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() })
  }

  return (
    <div className={className}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={zoom}
        options={mapOptions}
        onClick={handleMapClick}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            label={marker.label}
            icon={{
              url: PIN_COLORS[marker.color ?? 'red'],
              scaledSize: new google.maps.Size(
                marker.id === selectedMarker ? 44 : 36,
                marker.id === selectedMarker ? 44 : 36
              ),
            }}
            onClick={() => onMarkerClick?.(marker.id)}
          />
        ))}
        {children}
      </GoogleMap>
    </div>
  )
}
