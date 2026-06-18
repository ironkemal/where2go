'use client'

import { useState, useEffect, useRef } from 'react'

export function useGeolocation() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [watching, setWatching] = useState(false)
  const watchIdRef = useRef<number | null>(null)

  function handleSuccess(pos: GeolocationPosition) {
    setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    setError(null)
  }

  function handleError(err: GeolocationPositionError) {
    switch (err.code) {
      case err.PERMISSION_DENIED:
        setError('Konum erişimi reddedildi. Tarayıcı ayarlarından izin verin.')
        break
      case err.POSITION_UNAVAILABLE:
        setError('Konum bilgisi alınamıyor. GPS sinyali zayıf olabilir.')
        break
      case err.TIMEOUT:
        setError('Konum alınırken zaman aşımı oluştu. Tekrar deneyin.')
        break
      default:
        setError('Konum alınırken bilinmeyen bir hata oluştu.')
    }
  }

  const options: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 5000,
  }

  function startWatching() {
    if (!navigator.geolocation) {
      setError('Bu tarayıcı konum servisini desteklemiyor.')
      return
    }
    if (watchIdRef.current !== null) return
    const id = navigator.geolocation.watchPosition(handleSuccess, handleError, options)
    watchIdRef.current = id
    setWatching(true)
  }

  function stopWatching() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setWatching(false)
  }

  function getCurrentOnce() {
    if (!navigator.geolocation) {
      setError('Bu tarayıcı konum servisini desteklemiyor.')
      return
    }
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options)
  }

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  return { location, error, watching, startWatching, stopWatching, getCurrentOnce }
}
