'use client'

import { useMemo } from 'react'
import type { TripPlanData, TripStop } from '@/types/database'
import { useNavigationStore } from '@/stores/navigationStore'
import { useGeolocation } from '@/hooks/useGeolocation'

function haversineDistance(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const sinDLat = Math.sin(dLat / 2)
  const sinDLng = Math.sin(dLng / 2)
  const aVal =
    sinDLat * sinDLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng
  return R * 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal))
}

function formatInstruction(distanceM: number, stopName: string): string {
  if (distanceM < 50) return `${stopName} — Varıştınız!`
  if (distanceM < 100) return `${Math.round(distanceM)}m ileride: ${stopName}`
  if (distanceM < 1000) return `${Math.round(distanceM / 10) * 10}m ileride: ${stopName}`
  return `${(distanceM / 1000).toFixed(1)}km ileride: ${stopName}`
}

export function useNavigation(plan: TripPlanData) {
  const store = useNavigationStore()
  const geo = useGeolocation()

  const currentStop: TripStop | null =
    store.currentPlan?.stops[store.currentStopIndex] ?? null

  const distanceToStop = useMemo<number>(() => {
    if (!geo.location || !currentStop) return Infinity
    return haversineDistance(geo.location, currentStop.coordinates)
  }, [geo.location, currentStop])

  const isNearStop = distanceToStop <= 50

  const currentInstruction = useMemo<string>(() => {
    if (!currentStop) return 'Navigasyon başlatılmadı'
    if (!geo.location) return `${currentStop.name} — Konum bekleniyor`
    return formatInstruction(distanceToStop, currentStop.name)
  }, [distanceToStop, currentStop, geo.location])

  const stops = plan.stops ?? []
  const nextStopIndex = store.currentStopIndex + 1
  const nextStop: TripStop | null =
    nextStopIndex < stops.length ? stops[nextStopIndex] : null

  function start() {
    store.startNavigation(plan)
    geo.startWatching()
  }

  function stop() {
    store.stopNavigation()
    geo.stopWatching()
  }

  function arriveAtCurrentStop() {
    store.nextStop()
  }

  function skipCurrentStop() {
    store.skipStop()
  }

  return {
    isNavigating: store.isNavigating,
    currentStopIndex: store.currentStopIndex,
    currentStop,
    nextStop,
    userLocation: geo.location,
    locationError: geo.error,
    watching: geo.watching,
    distanceToStop,
    isNearStop,
    currentInstruction,
    start,
    stop,
    arriveAtCurrentStop,
    skipCurrentStop,
  }
}
