export interface PlaceResult {
  placeId: string
  name: string
  address: string
  coordinates: { lat: number; lng: number }
  rating?: number
  priceLevel?: number
  types: string[]
  openNow?: boolean
}

export interface PlaceDetails extends PlaceResult {
  phone?: string
  website?: string
  openingHours?: string[]
  photos?: string[]
  editorialSummary?: string
}

const PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

function mapApiPlace(place: Record<string, unknown>): PlaceResult {
  const location = (place.location as Record<string, number>) ?? {}
  const displayName = (place.displayName as Record<string, string>) ?? {}
  const openingHours = place.currentOpeningHours as Record<string, unknown> | undefined

  return {
    placeId: place.id as string ?? '',
    name: displayName.text ?? (place.name as string) ?? '',
    address: (place.formattedAddress as string) ?? '',
    coordinates: {
      lat: location.latitude ?? 0,
      lng: location.longitude ?? 0,
    },
    rating: place.rating as number | undefined,
    priceLevel: typeof place.priceLevel === 'number' ? place.priceLevel : undefined,
    types: (place.types as string[]) ?? [],
    openNow: openingHours ? (openingHours.openNow as boolean | undefined) : undefined,
  }
}

export async function searchNearbyPlaces(params: {
  lat: number
  lng: number
  type: 'restaurant' | 'museum' | 'tourist_attraction' | 'park' | 'shopping_mall' | 'night_club'
  radius?: number
  maxResults?: number
  keyword?: string
}): Promise<PlaceResult[]> {
  if (!PLACES_API_KEY) return []

  const { lat, lng, type, radius = 2000, maxResults = 10, keyword } = params

  try {
    const body: Record<string, unknown> = {
      includedTypes: [type],
      maxResultCount: maxResults,
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius,
        },
      },
    }

    if (keyword) {
      body.textQuery = keyword
    }

    const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': PLACES_API_KEY,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.priceLevel,places.types,places.currentOpeningHours',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) return []

    const data = await response.json()
    const places = (data.places as Record<string, unknown>[]) ?? []
    return places.map(mapApiPlace)
  } catch {
    return []
  }
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  if (!PLACES_API_KEY) return null

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          'X-Goog-Api-Key': PLACES_API_KEY,
          'X-Goog-FieldMask':
            'id,displayName,formattedAddress,location,rating,priceLevel,types,currentOpeningHours,internationalPhoneNumber,websiteUri,photos,editorialSummary',
        },
      }
    )

    if (!response.ok) return null

    const place = await response.json()
    const base = mapApiPlace(place as Record<string, unknown>)

    const openingHours = place.currentOpeningHours as Record<string, unknown> | undefined
    const editorialSummary = place.editorialSummary as Record<string, string> | undefined
    const photos = (place.photos as Record<string, string>[]) ?? []

    return {
      ...base,
      phone: place.internationalPhoneNumber as string | undefined,
      website: place.websiteUri as string | undefined,
      openingHours: openingHours
        ? (openingHours.weekdayDescriptions as string[] | undefined)
        : undefined,
      photos: photos.map((p) => p.name).filter(Boolean),
      editorialSummary: editorialSummary?.text,
    }
  } catch {
    return null
  }
}

export async function getWikipediaDescription(
  query: string,
  lang: string = 'en'
): Promise<string | null> {
  try {
    const url = new URL(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`)

    const response = await fetch(url.toString(), {
      headers: { 'User-Agent': 'Where2Go/1.0 (https://where2go.infinitymade.de)' },
    })

    if (!response.ok) return null

    const data = await response.json()
    return (data.extract as string) ?? null
  } catch {
    return null
  }
}
