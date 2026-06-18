import type { TripPlanData } from '@/types/database'
import type { PlaceResult } from '@/lib/places'
import { mockRomePlan } from '@/lib/mock-plan'

export interface PlanRequest {
  accommodationName: string
  accommodationAddress: string
  accommodationCoords: { lat: number; lng: number }
  durationHours: number
  transportMode: string
  activities: string[]
  activityDetails: Record<string, string[]>
  budgetLevel: string | null
  nearbyPlaces: PlaceResult[]
  city: string
  country: string
}

function buildPrompt(request: PlanRequest): string {
  const {
    accommodationName,
    accommodationAddress,
    accommodationCoords,
    durationHours,
    transportMode,
    activities,
    activityDetails,
    budgetLevel,
    nearbyPlaces,
    city,
    country,
  } = request

  const nearbyList = nearbyPlaces
    .map(
      (p) =>
        `- ${p.name} (${p.types.join(', ')}) — ${p.address}${p.rating ? `, puan: ${p.rating}` : ''}${typeof p.priceLevel === 'number' ? `, fiyat seviyesi: ${p.priceLevel}/4` : ''}`
    )
    .join('\n')

  const activityList = activities
    .map((a) => {
      const details = activityDetails[a]
      return details?.length ? `${a}: ${details.join(', ')}` : a
    })
    .join('\n')

  return `Sen profesyonel bir turist rehberisin. Kullanıcı verilerini alıp JSON formatında gezi planı oluşturursun.

Kurallar:
- Süreye tam uy: ${durationHours} saat için toplam süre (yol dahil) tam bu kadar olsun
- Konaklamadan başla, konaklamaya dön
- Ulaşım moduna göre gerçekçi yürüyüş/sürüş süreleri ekle
- Her durak için gerçekçi maliyet tahmini (müze giriş, yemek ortalama fiyatı)
- Mümkün olduğunca gerçek POI isimlerini kullan (nearby_places listesinden)
- transport_to_next için: walking=80m/dk, scooter=250m/dk, car=400m/dk
- Verilen nearby_places listesindeki yerleri tercih et, ama yetmezse genel bilginden ekle

Kullanıcı Bilgileri:
- Şehir: ${city}, ${country}
- Konaklama: ${accommodationName}
- Konaklama adresi: ${accommodationAddress}
- Konaklama koordinatları: ${accommodationCoords.lat}, ${accommodationCoords.lng}
- Süre: ${durationHours} saat (${durationHours * 60} dakika)
- Ulaşım modu: ${transportMode}
- Bütçe seviyesi: ${budgetLevel ?? 'belirtilmemiş'}
- İstenen aktiviteler:
${activityList}

Yakındaki Yerler (Google Places):
${nearbyList || 'Veri yok'}

Aşağıdaki JSON şemasına tam uygun yanıt ver. Başka metin ekleme.

{
  "title": "string — turun başlığı",
  "city": "string",
  "total_duration_minutes": number,
  "total_cost_estimate": {
    "min": number,
    "max": number,
    "currency": "string — ISO 4217 (EUR, USD, TRY vb.)"
  },
  "stops": [
    {
      "order": number,
      "name": "string",
      "type": "attraction | restaurant | transport | accommodation",
      "address": "string",
      "coordinates": { "lat": number, "lng": number },
      "duration_minutes": number,
      "cost_estimate": { "min": number, "max": number },
      "description": "string — 2-3 cümle",
      "tips": ["string"],
      "transport_to_next": {
        "mode": "string",
        "duration_minutes": number,
        "distance_meters": number,
        "cost_estimate": number
      }
    }
  ]
}`
}

function parsePlanResponse(raw: string): TripPlanData {
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found in response')
  return JSON.parse(jsonMatch[0]) as TripPlanData
}

export async function generateTripPlan(request: PlanRequest): Promise<TripPlanData> {
  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    return mockRomePlan
  }

  try {
    const prompt = buildPrompt(request)

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://where2go.infinitymade.de',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`OpenRouter API error ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content as string | undefined

    if (!content) throw new Error('Empty response from OpenRouter')

    return parsePlanResponse(content)
  } catch {
    return mockRomePlan
  }
}
