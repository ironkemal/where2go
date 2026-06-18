'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Accommodation } from '@/types/database'

export function useAccommodations() {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/accommodations')
      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? 'Failed to fetch accommodations')
        return
      }
      const body = await res.json()
      setAccommodations(body.accommodations)
    } catch {
      setError('Failed to fetch accommodations')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const create = useCallback(async (data: {
    name: string
    address: string
    lat: number
    lng: number
  }): Promise<{ accommodation: Accommodation | null; error: string | null }> => {
    try {
      const res = await fetch('/api/accommodations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const body = await res.json()
      if (!res.ok) return { accommodation: null, error: body.error ?? 'Failed to create accommodation' }
      await refetch()
      return { accommodation: body.accommodation, error: null }
    } catch {
      return { accommodation: null, error: 'Failed to create accommodation' }
    }
  }, [refetch])

  const setActive = useCallback(async (id: string): Promise<{ error: string | null }> => {
    try {
      const res = await fetch(`/api/accommodations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: true }),
      })
      const body = await res.json()
      if (!res.ok) return { error: body.error ?? 'Failed to update accommodation' }
      await refetch()
      return { error: null }
    } catch {
      return { error: 'Failed to update accommodation' }
    }
  }, [refetch])

  const remove = useCallback(async (id: string): Promise<{ error: string | null }> => {
    try {
      const res = await fetch(`/api/accommodations/${id}`, {
        method: 'DELETE',
      })
      if (res.status === 204) {
        await refetch()
        return { error: null }
      }
      const body = await res.json()
      return { error: body.error ?? 'Failed to delete accommodation' }
    } catch {
      return { error: 'Failed to delete accommodation' }
    }
  }, [refetch])

  return { accommodations, loading, error, create, setActive, remove, refetch }
}
