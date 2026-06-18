import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchNearbyPlaces } from '@/lib/places'
import { generateTripPlan } from '@/lib/plan-generator'
import type { PlaceResult } from '@/lib/places'

interface GeneratePlanBody {
  accommodationId: string
  durationHours: number
  transportMode: string
  activities: string[]
  activityDetails: Record<string, string[]>
  budgetLevel: string | null
}

const ACTIVITY_TYPE_MAP: Record<
  string,
  'restaurant' | 'museum' | 'tourist_attraction' | 'park' | 'shopping_mall' | 'night_club'
> = {
  food: 'restaurant',
  restaurant: 'restaurant',
  museum: 'museum',
  history: 'tourist_attraction',
  culture: 'tourist_attraction',
  sightseeing: 'tourist_attraction',
  nature: 'park',
  park: 'park',
  shopping: 'shopping_mall',
  nightlife: 'night_club',
}

function resolveActivityType(
  activity: string
): 'restaurant' | 'museum' | 'tourist_attraction' | 'park' | 'shopping_mall' | 'night_club' {
  const lower = activity.toLowerCase()
  for (const [key, type] of Object.entries(ACTIVITY_TYPE_MAP)) {
    if (lower.includes(key)) return type
  }
  return 'tourist_attraction'
}

function extractCoordsFromLocation(location: unknown): { lat: number; lng: number } | null {
  if (!location) return null

  if (typeof location === 'string') {
    const match = location.match(/POINT\(([+-]?\d+\.?\d*)\s([+-]?\d+\.?\d*)\)/)
    if (match) {
      return { lat: parseFloat(match[2]), lng: parseFloat(match[1]) }
    }
  }

  if (typeof location === 'object' && location !== null) {
    const loc = location as Record<string, unknown>
    if (typeof loc.lat === 'number' && typeof loc.lng === 'number') {
      return { lat: loc.lat, lng: loc.lng }
    }
    if (typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
      return { lat: loc.latitude, lng: loc.longitude }
    }
    if (
      typeof loc.coordinates === 'object' &&
      loc.coordinates !== null
    ) {
      const coords = loc.coordinates as Record<string, unknown>
      if (typeof coords.lat === 'number' && typeof coords.lng === 'number') {
        return { lat: coords.lat, lng: coords.lng }
      }
    }
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as GeneratePlanBody
    const { accommodationId, durationHours, transportMode, activities, activityDetails, budgetLevel } =
      body

    if (!accommodationId || !durationHours || !transportMode || !activities?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: accommodation } = await (supabase as any)
      .from('accommodations')
      .select('*')
      .eq('id', accommodationId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!accommodation) {
      return NextResponse.json({ error: 'Accommodation not found' }, { status: 404 })
    }

    const coords = extractCoordsFromLocation(accommodation.location)

    if (!coords) {
      return NextResponse.json({ error: 'Accommodation coordinates not available' }, { status: 422 })
    }

    const placeSearches = activities.map((activity) =>
      searchNearbyPlaces({
        lat: coords.lat,
        lng: coords.lng,
        type: resolveActivityType(activity),
        radius: 3000,
        maxResults: 5,
      })
    )

    const placeResults = await Promise.all(placeSearches)
    const nearbyPlaces: PlaceResult[] = Array.from(
      new Map(
        placeResults
          .flat()
          .filter((p) => p.placeId)
          .map((p) => [p.placeId, p])
      ).values()
    )

    const addressParts = accommodation.address?.split(',') ?? []
    const city = addressParts[addressParts.length - 2]?.trim() ?? ''
    const country = addressParts[addressParts.length - 1]?.trim() ?? ''

    const planData = await generateTripPlan({
      accommodationName: accommodation.name,
      accommodationAddress: accommodation.address ?? '',
      accommodationCoords: coords,
      durationHours,
      transportMode,
      activities,
      activityDetails: activityDetails ?? {},
      budgetLevel: budgetLevel ?? null,
      nearbyPlaces,
      city,
      country,
    })

    const { data: tripPlan, error: insertError } = await (supabase as any)
      .from('trip_plans')
      .insert({
        user_id: user.id,
        accommodation_id: accommodationId,
        title: planData.title,
        city: planData.city,
        country: country || null,
        duration_hours: durationHours,
        transport_mode: transportMode,
        status: 'generated',
        plan_data: planData,
        total_cost_min: planData.total_cost_estimate.min,
        total_cost_max: planData.total_cost_estimate.max,
        currency: planData.total_cost_estimate.currency,
      } as any)
      .select('id')
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ planId: tripPlan.id }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
