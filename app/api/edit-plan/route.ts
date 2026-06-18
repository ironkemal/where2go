import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { TripPlanData } from '@/types/database'

interface EditPlanBody {
  planId: string
  message: string
  currentPlan: TripPlanData
}

function buildEditPrompt(currentPlan: TripPlanData, userMessage: string): string {
  return `Sen profesyonel bir turist rehberisin. Kullanıcının mevcut gezi planını, isteğine göre güncelliyorsun.

Mevcut Plan (JSON):
${JSON.stringify(currentPlan, null, 2)}

Kullanıcı İsteği: "${userMessage}"

Kurallar:
- Kullanıcının isteğini dikkate alarak planı güncelle
- Toplam süreyi ve maliyeti güncel tut
- stop order'larını doğru sırala
- transport_to_next alanlarını gerçekçi tut
- Yalnızca JSON döndür, başka metin ekleme

Güncellenmiş planı aynı JSON şemasıyla döndür:
{
  "title": "string",
  "city": "string",
  "total_duration_minutes": number,
  "total_cost_estimate": { "min": number, "max": number, "currency": "string" },
  "stops": [...]
}`
}

function extractJson(raw: string): TripPlanData | null {
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    return JSON.parse(match[0]) as TripPlanData
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const body = (await request.json()) as EditPlanBody
  const { planId, message, currentPlan } = body

  if (!planId || !message || !currentPlan) {
    return new Response('Missing required fields', { status: 400 })
  }

  const { data: existingPlan } = await (supabase as any)
    .from('trip_plans')
    .select('id')
    .eq('id', planId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!existingPlan) {
    return new Response('Plan not found', { status: 404 })
  }

  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    const mockStream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder()
        const mockText = 'Plan güncellendi (AI bağlantısı yapılandırılmamış).'
        controller.enqueue(encoder.encode(`data: ${mockText}\n\n`))
        controller.enqueue(
          encoder.encode(`data: [PLAN_UPDATED]${JSON.stringify(currentPlan)}\n\n`)
        )
        controller.close()
      },
    })

    return new Response(mockStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    })
  }

  const prompt = buildEditPrompt(currentPlan, message)

  const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://where2go.infinitymade.de',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    }),
  })

  if (!openRouterResponse.ok || !openRouterResponse.body) {
    const mockStream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder()
        controller.enqueue(
          encoder.encode(`data: AI şu anda yanıt veremiyor, plan değiştirilmedi.\n\n`)
        )
        controller.enqueue(
          encoder.encode(`data: [PLAN_UPDATED]${JSON.stringify(currentPlan)}\n\n`)
        )
        controller.close()
      },
    })
    return new Response(mockStream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    })
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      const reader = openRouterResponse.body!.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              const delta = parsed?.choices?.[0]?.delta?.content as string | undefined
              if (delta) {
                fullText += delta
                controller.enqueue(encoder.encode(`data: ${delta}\n\n`))
              }
            } catch {
              // malformed chunk — skip
            }
          }
        }

        const updatedPlan = extractJson(fullText)

        if (updatedPlan) {
          await (supabase as any)
            .from('trip_plans')
            .update({
              plan_data: updatedPlan,
              title: updatedPlan.title,
              total_cost_min: updatedPlan.total_cost_estimate.min,
              total_cost_max: updatedPlan.total_cost_estimate.max,
              currency: updatedPlan.total_cost_estimate.currency,
            } as any)
            .eq('id', planId)

          controller.enqueue(
            encoder.encode(`data: [PLAN_UPDATED]${JSON.stringify(updatedPlan)}\n\n`)
          )
        } else {
          controller.enqueue(
            encoder.encode(`data: [PLAN_UPDATED]${JSON.stringify(currentPlan)}\n\n`)
          )
        }
      } catch {
        controller.enqueue(
          encoder.encode(`data: [PLAN_UPDATED]${JSON.stringify(currentPlan)}\n\n`)
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  })
}
