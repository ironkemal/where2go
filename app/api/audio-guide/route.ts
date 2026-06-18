import { NextRequest, NextResponse } from 'next/server'
import { getWikipediaDescription } from '@/lib/places'

interface AudioGuideRequest {
  stopName: string
  stopDescription: string
  city: string
  lang?: string
}

async function generateGuideText(
  stopName: string,
  stopDescription: string,
  city: string,
  wikiText: string | null,
  lang: string
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return wikiText
      ? `${stopName}, ${city}. ${wikiText}`
      : `${stopName}, ${city}. ${stopDescription}`
  }

  const systemPrompt = lang === 'tr'
    ? 'Sen bir seyahat rehberisin. Turistlere sesli anlatım için kısa, akıcı ve ilgi çekici rehber metinleri yazıyorsun. Metin doğal bir konuşma gibi akmalı, karmaşık noktalama işaretleri kullanma. Tarihi ve kültürel bilgileri hikaye formatında anlat.'
    : 'You are a travel guide. Write short, engaging audio guide scripts for tourists. The text should flow naturally like a spoken conversation, avoid complex punctuation. Present historical and cultural information in a storytelling format.'

  const userPrompt = lang === 'tr'
    ? `"${stopName}" için ${city} şehrinde yaklaşık 700 kelimelik sesli rehber metni yaz.
Yer hakkında bilgi: ${stopDescription}
${wikiText ? `Wikipedia özeti: ${wikiText}` : ''}
Akıcı, sohbet havasında bir anlatım yaz. Tarihi, mimari ve kültürel detaylara değin.`
    : `Write an approximately 700-word audio guide for "${stopName}" in ${city}.
About the place: ${stopDescription}
${wikiText ? `Wikipedia summary: ${wikiText}` : ''}
Write in a natural, conversational tone. Cover historical, architectural and cultural highlights.`

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://where2go.app',
        'X-Title': 'Where2Go Audio Guide',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const fallback = wikiText ?? stopDescription
      return `${stopName}. ${fallback}`
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content ?? `${stopName}. ${stopDescription}`
  } catch {
    return `${stopName}. ${wikiText ?? stopDescription}`
  }
}

async function generateAudio(text: string): Promise<Buffer | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) return null

  try {
    const response = await fetch(
      'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM',
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    )
    if (!response.ok) return null
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch {
    return null
  }
}

async function uploadToSupabase(
  audioBuffer: Buffer,
  fileName: string
): Promise<string | null> {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await (supabase as any).storage
      .from('audio-guides')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      })

    if (error) return null

    const { data } = (supabase as any).storage
      .from('audio-guides')
      .getPublicUrl(fileName)

    return data?.publicUrl ?? null
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: AudioGuideRequest = await req.json()
    const { stopName, stopDescription, city, lang = 'tr' } = body

    if (!stopName || !city) {
      return NextResponse.json({ error: 'stopName ve city zorunludur' }, { status: 400 })
    }

    const wikiLang = lang === 'tr' ? 'tr' : 'en'
    const wikiText = await getWikipediaDescription(stopName, wikiLang)

    const guideText = await generateGuideText(
      stopName, stopDescription, city, wikiText, lang
    )

    const audioBuffer = await generateAudio(guideText)

    if (!audioBuffer) {
      return NextResponse.json({ audioUrl: '', text: guideText })
    }

    const slug = stopName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60)
    const fileName = `${slug}-${Date.now()}.mp3`

    const publicUrl = await uploadToSupabase(audioBuffer, fileName)

    if (publicUrl) {
      return NextResponse.json({ audioUrl: publicUrl, text: guideText })
    }

    const base64 = audioBuffer.toString('base64')
    const dataUrl = `data:audio/mpeg;base64,${base64}`
    return NextResponse.json({ audioUrl: dataUrl, text: guideText })
  } catch (err) {
    console.error('audio-guide route error:', err)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
