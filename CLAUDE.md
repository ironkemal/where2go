# Travel App (Where2Go) — Project Instructions

## Project Overview
AI destekli günlük gezi planlayıcı. Turist otel konumunu girer, kaç saati olduğunu ve tercihlerini seçer, AI rota + navigasyon + sesli rehber üretir.

## Stack
- Frontend: Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
- State: Zustand
- Backend: Supabase (Auth + PostgreSQL + PostGIS)
- Harita: Google Maps Platform (Maps JS + Places + Routes API)
- AI Plan: OpenRouter → Claude 3.5 Sonnet
- AI Audio Metin: OpenRouter → Llama 3.1 405B
- TTS: ElevenLabs
- Hosting: Vercel (frontend) + Supabase (backend)
- Mobile (Phase 2): Expo + React Native + NativeWind

## Altyapı Bağlantıları
- **Supabase Project Ref:** `eklekdkooezfturikiij`
- **GitHub Repo:** https://github.com/ironkemal/where2go
- **Production URL:** https://where2go.infinitymade.de
- **Vercel:** GitHub'a bağlı, where2go repo'sundan deploy

## Conventions
- Türkçe konuşuyoruz, kod ve değişken isimleri İngilizce olacak
- Commit mesajları İngilizce

## Proje Durumu
- Araştırma tamamlandı (2026-06-18)
- BUILD_PLAN.md hazır — 11 fazlı geliştirme planı
- FAZ 1 devam ediyor
