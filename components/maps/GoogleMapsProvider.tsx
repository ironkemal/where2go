'use client'

import { LoadScript } from '@react-google-maps/api'
import { GOOGLE_MAPS_LIBRARIES } from '@/lib/maps'

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''

const loadingElement = (
  <div className="flex items-center justify-center w-full h-full min-h-[200px] bg-[#1a1f2e]">
    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
  </div>
)

interface GoogleMapsProviderProps {
  children: React.ReactNode
}

export default function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  if (!apiKey) {
    return (
      <>
        <div className="flex items-center justify-center w-full py-3 px-4 bg-amber-900/20 border border-amber-700/40 rounded-lg text-amber-400 text-sm">
          Google Maps API anahtarı eksik. Lütfen{' '}
          <code className="mx-1 px-1 bg-amber-900/40 rounded text-amber-300">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          </code>{' '}
          env değişkenini ayarlayın.
        </div>
        {children}
      </>
    )
  }

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={GOOGLE_MAPS_LIBRARIES}
      loadingElement={loadingElement}
    >
      {children}
    </LoadScript>
  )
}
