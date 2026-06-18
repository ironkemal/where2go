# TRAVEL APP — DETAYLI İNŞA PLANI

> Bu dosya uygulamanın sıfırdan nasıl geliştirileceğini tanımlar.
> Her faz bağımsız olarak tamamlanabilir ve test edilebilir.
> Sıralamayı değiştirme — her faz bir sonrakinin temeli.

---

## GENEL MİMARİ

```
KULLANICI AKIŞI (özet)
Kayıt/Giriş
  → Konaklama konumu gir
    → "Gezi planla" butonuna bas
      → Sihirbaz: kaç saat? nasıl gidiyorsun? ne yapmak istiyorsun?
        → AI plan oluşturur (harita + maliyet + süre)
          → Planı incele / AI chat ile düzenle
            → "Başla" → Turn-by-turn navigasyon
              → Landmark'a gel → Audio guide başlat
                → Tur bitti → Özet göster
```

---

## TECH STACK

| Katman | Teknoloji | Neden |
|--------|-----------|-------|
| Frontend | Next.js 15 + TypeScript | Web-first, Expo'ya geçiş kolay |
| Styling | Tailwind CSS + shadcn/ui | Hızlı, temiz, AI-friendly |
| State | Zustand | Sihirbaz akışı için ideal |
| Backend | Supabase (Auth + PostgreSQL + PostGIS) | Ücretsiz başlar, ölçeklenir |
| Harita | Google Maps Platform | Startup kredisi var, en zengin POI |
| AI Plan | OpenRouter → Claude 3.5 Sonnet | Yapılandırılmış JSON çıktı |
| AI Audio | OpenRouter → Llama 3.1 405B | Ucuz, yeterince iyi |
| TTS | ElevenLabs | Doğal ses kalitesi |
| Hosting | Vercel (frontend) + Supabase (backend) | İkisi de ücretsiz tier var |

---

## FAZ YAPISI

```
FAZ 1: Temel Altyapı          (Proje kurulumu + Auth)
FAZ 2: Konaklama & Profil     (Konum girişi + kullanıcı profili)
FAZ 3: Planlama Sihirbazı     (Tercih toplama UI)
FAZ 4: AI Plan Motoru         (LLM entegrasyonu + rota oluşturma)
FAZ 5: Harita & Görselleştirme (Google Maps + rota gösterimi)
FAZ 6: AI Chat Düzenleme      (Planı sohbetle değiştirme)
FAZ 7: Navigasyon Modu        (Turn-by-turn, canlı konum)
FAZ 8: Audio Guide            (Landmark tespiti + TTS)
FAZ 9: Hesap & Geçmiş         (Kaydedilen planlar, tercihler)
FAZ 10: B2B İşletme Portalı   (Restoran kaydı, kupon sistemi)
FAZ 11: Mobile (Expo)         (iOS + Android'e geçiş)
```

---

## FAZ 1: TEMEL ALTYAPISI

**Hedef:** Çalışan bir Next.js projesi, Supabase bağlantısı, temel auth.

### 1.1 Proje Kurulumu
- [ ] `create-next-app` ile Next.js 15 + TypeScript + Tailwind projesi oluştur
- [ ] shadcn/ui kur ve yapılandır (`npx shadcn@latest init`)
- [ ] Temel klasör yapısını oluştur:
  ```
  /app          → Next.js App Router sayfaları
  /components   → UI bileşenleri
  /lib          → Supabase client, yardımcı fonksiyonlar
  /stores       → Zustand store'ları
  /types        → TypeScript type tanımları
  /hooks        → Custom React hooks
  ```
- [ ] ESLint + Prettier yapılandır
- [ ] `.env.local` şablonu oluştur (Supabase, Google Maps, OpenRouter, ElevenLabs key'leri)

### 1.2 Supabase Kurulumu
- [ ] Supabase projesi oluştur (ücretsiz tier)
- [ ] `@supabase/supabase-js` ve `@supabase/ssr` kur
- [ ] Supabase client'ı yapılandır (server + client component'ları için ayrı)
- [ ] PostGIS extension'ı etkinleştir (`CREATE EXTENSION postgis`)

### 1.3 Veritabanı Şeması — İlk Tablolar
```sql
-- Kullanıcılar (Supabase Auth ile otomatik)
-- profiles: auth.users'ı genişletir
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  display_name TEXT,
  preferred_language TEXT DEFAULT 'tr',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Konaklama konumları
CREATE TABLE accommodations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                    -- "Otel Roma Palace"
  address TEXT,
  location GEOGRAPHY(POINT, 4326),       -- PostGIS konum
  is_active BOOLEAN DEFAULT true,        -- şu an burada mı?
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tur planları
CREATE TABLE trip_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  accommodation_id UUID REFERENCES accommodations(id),
  title TEXT,
  city TEXT,
  country TEXT,
  duration_hours NUMERIC,
  transport_mode TEXT,                   -- walking, scooter, car, etc.
  status TEXT DEFAULT 'draft',           -- draft, active, completed
  plan_data JSONB,                       -- AI'ın ürettiği tam plan
  total_cost_estimate NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanici kendi profilini görür" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Kullanici kendi konumlarini görür" ON accommodations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Kullanici kendi planlarini görür" ON trip_plans FOR ALL USING (auth.uid() = user_id);
```

### 1.4 Authentication
- [ ] Supabase Auth yapılandır (email + şifre ile başla)
- [ ] Sign up sayfası `/app/(auth)/signup/page.tsx`
- [ ] Sign in sayfası `/app/(auth)/login/page.tsx`
- [ ] Middleware ile route koruması (`/app/middleware.ts`)
- [ ] Auth callback route (`/app/auth/callback/route.ts`)
- [ ] Oturum açık değilse login'e yönlendir

### 1.5 Temel Layout
- [ ] Ana layout (`/app/(dashboard)/layout.tsx`) — sidebar/bottom nav
- [ ] Landing sayfası (`/app/page.tsx`) — giriş yapmamış kullanıcılar için
- [ ] Dashboard ana sayfası (`/app/(dashboard)/page.tsx`)

**FAZ 1 TAMAMLANMA KRİTERİ:** Kullanıcı kayıt olabiliyor, giriş yapabiliyor, dashboard'a ulaşabiliyor.

---

## FAZ 2: KONAKLAMA & PROFİL

**Hedef:** Kullanıcı otelini/Airbnb'sini haritada seçip kaydedebilir.

### 2.1 Konaklama Konumu Girişi
- [ ] Google Maps Places Autocomplete ile adres arama bileşeni
- [ ] Harita üzerinde konum seçme (pin bırakma)
- [ ] Konum kaydetme formu (isim, adres, konum)
- [ ] Birden fazla konaklama kaydı (farklı şehirler için)
- [ ] "Aktif konaklama" seçimi

### 2.2 Google Maps Entegrasyonu (İlk Kurulum)
- [ ] `@react-google-maps/api` kur
- [ ] Google Maps API key yapılandır (Maps JS + Places)
- [ ] Temel harita bileşeni oluştur (`/components/maps/BaseMap.tsx`)
- [ ] Autocomplete bileşeni (`/components/maps/PlaceSearch.tsx`)

### 2.3 Kullanıcı Profili
- [ ] Profil sayfası (`/app/(dashboard)/profile/page.tsx`)
- [ ] Görünen ad düzenleme
- [ ] Dil tercihi (tur anlatımı hangi dilde olsun)
- [ ] Kayıtlı konaklamalar listesi

**FAZ 2 TAMAMLANMA KRİTERİ:** Kullanıcı otelini haritadan seçip kaydedebiliyor.

---

## FAZ 3: PLANLAMA SİHİRBAZI (UI)

**Hedef:** Adım adım kullanıcıdan tercihlerini toplayan akıcı bir UI.

### 3.1 Sihirbaz Akışı Yapısı
```
Adım 1: Kaç saatin var?       → Slider (1-12 saat)
Adım 2: Nasıl gidiyorsun?     → Kart seçimi (yürüyerek/scooter/araba/bisiklet)
Adım 3: Ne yapmak istiyorsun? → Çoklu seçim kartları
  Örnekler: Müze gez / Tarihi yerler / Yemek ye / Alışveriş / Doğa/Park / Gece hayatı
Adım 4: Detaylandır           → Seçime göre dinamik sorular
  "Yemek" seçildiyse: Yöresel / İtalyan / Fastfood / Vejetaryen / Lüks / Uygun fiyat
  "Müze" seçildiyse: Sanat / Tarih / Bilim / Çocuklara uygun
Adım 5: Bütçe (opsiyonel)     → Kişi başı bütçe aralığı seç
Adım 6: Hazır!                → "Plan Oluştur" butonu
```

### 3.2 Bileşenler
- [ ] Sihirbaz container (`/components/wizard/TripWizard.tsx`)
- [ ] İlerleme çubuğu bileşeni
- [ ] Adım 1: `DurationStep.tsx` — saat slider'ı
- [ ] Adım 2: `TransportStep.tsx` — ulaşım kartları (ikonlu)
- [ ] Adım 3: `ActivityStep.tsx` — aktivite kartları (çoklu seçim)
- [ ] Adım 4: `DetailStep.tsx` — dinamik detay soruları (seçime göre değişir)
- [ ] Adım 5: `BudgetStep.tsx` — bütçe seçimi
- [ ] Adım 6: `ConfirmStep.tsx` — özet ve onay

### 3.3 Zustand Store
```typescript
// /stores/tripWizardStore.ts
interface TripWizardStore {
  // Adım durumu
  currentStep: number
  
  // Kullanıcı tercihleri
  durationHours: number
  transportMode: 'walking' | 'scooter' | 'car' | 'bicycle' | 'public'
  activities: string[]        // ['museum', 'food', 'history']
  activityDetails: Record<string, string[]>  // { food: ['local', 'vegetarian'] }
  budgetPerPerson: 'budget' | 'mid' | 'luxury' | null
  
  // Actions
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  setDuration: (hours: number) => void
  setTransport: (mode: string) => void
  toggleActivity: (activity: string) => void
  setActivityDetail: (activity: string, details: string[]) => void
  setBudget: (budget: string) => void
  reset: () => void
}
```

**FAZ 3 TAMAMLANMA KRİTERİ:** Sihirbazın tüm adımları çalışıyor, veriler store'da tutuluyor.

---

## FAZ 4: AI PLAN MOTORU

**Hedef:** Sihirbazdan gelen verilerle LLM üzerinden gerçek bir gezi planı üretmek.

### 4.1 Google Places API Entegrasyonu
- [ ] Yakındaki POI'leri çeken fonksiyon (`/lib/places.ts`)
  - Restoran arama (tip + bütçe filtresi ile)
  - Müze/tarihi yer arama
  - Park/doğa alanı arama
- [ ] Place Details çekme (saatler, fiyat seviyesi, rating)
- [ ] Wikipedia API ile landmark açıklaması çekme
- [ ] Verileri LLM'e göndermeden önce temizleme/biçimlendirme

### 4.2 AI Plan Oluşturma API Route
- [ ] `/app/api/generate-plan/route.ts` oluştur
- [ ] OpenRouter Claude 3.5 Sonnet entegrasyonu
- [ ] Sistem promptu yaz:
  ```
  Sen bir profesyonel turist rehberisin. Kullanıcının konaklamasından başlayan,
  zaman kısıtlarına uyan, tercihlerine göre optimize edilmiş bir gün planı oluştur.
  Her durağı için gerçekçi süre, maliyet tahmini ve kısa açıklama ekle.
  Konaklamaya dönüşle bitir. JSON formatında döndür.
  ```
- [ ] JSON şema tanımla:
  ```typescript
  interface TripPlan {
    title: string
    city: string
    total_duration_minutes: number
    total_cost_estimate: { min: number; max: number; currency: string }
    stops: TripStop[]
  }
  
  interface TripStop {
    order: number
    name: string
    type: 'attraction' | 'restaurant' | 'transport' | 'accommodation'
    address: string
    coordinates: { lat: number; lng: number }
    duration_minutes: number
    cost_estimate: { min: number; max: number }
    description: string
    tips: string[]
    transport_to_next: {
      mode: string
      duration_minutes: number
      distance_meters: number
      cost_estimate: number
    }
  }
  ```
- [ ] Streaming response (kullanıcı beklerken "Planın hazırlanıyor..." animasyonu)
- [ ] Hata yönetimi (API limiti, geçersiz konum vb.)

### 4.3 Plan Kaydetme
- [ ] Oluşturulan planı Supabase'e kaydet
- [ ] Plan önizleme sayfası (`/app/(dashboard)/plan/[id]/page.tsx`)

**FAZ 4 TAMAMLANMA KRİTERİ:** Sihirbazı doldur → AI gerçek bir JSON plan döndürüyor → plan veritabanına kaydediliyor.

---

## FAZ 5: HARİTA & GÖRSELLEŞT İRME

**Hedef:** Planı haritada göster, her durağı işaretle, rotayı çiz.

### 5.1 Plan Haritası
- [ ] Plan harita bileşeni (`/components/maps/PlanMap.tsx`)
- [ ] Tüm durağı haritada marker olarak göster
  - Farklı ikon tipler: restoran 🍽️, müze 🏛️, park 🌳
  - Marker tıklanınca durak detayı popup'ı açılır
- [ ] Durağlar arası rota çizgisi (Google Routes API ile)
- [ ] Her rota segmentinin rengi ve süre etiketi

### 5.2 Plan Detay Sayfası
- [ ] Sol panel: duraklar listesi (sıralı, süre ve maliyet ile)
- [ ] Sağ panel: harita görünümü
- [ ] Her durak kartı:
  - Sıra numarası
  - Yer adı + tipi
  - Önerilen süre
  - Maliyet tahmini
  - Kısa açıklama
  - "Sonraki durağa nasıl gidilir" bilgisi
- [ ] Alt özet bar: toplam süre, toplam tahmini maliyet
- [ ] "Geziye Başla" butonu (FAZ 7'yi açar)
- [ ] "Planı Düzenle" butonu (FAZ 6'yı açar)

### 5.3 Plan Paylaşma
- [ ] Planı link ile paylaşma (read-only)
- [ ] Planı PDF olarak indirme (opsiyonel)

**FAZ 5 TAMAMLANMA KRİTERİ:** Kullanıcı planını haritada görüyor, tüm durağlar işaretli, rotalar çizili.

---

## FAZ 6: AI CHAT İLE PLAN DÜZENLEME

**Hedef:** Kullanıcı konuşarak planı değiştirebilir.

### 6.1 Chat Arayüzü
- [ ] Plan sayfasına sohbet paneli ekle (sağ kenar veya modal)
- [ ] Mesaj geçmişi gösterimi
- [ ] Yazı giriş alanı
- [ ] Streaming yanıt (AI yazarken görünür)

### 6.2 Plan Düzenleme API Route
- [ ] `/app/api/edit-plan/route.ts` oluştur
- [ ] Mevcut planı ve kullanıcı mesajını birlikte LLM'e gönder
- [ ] LLM'den güncellenmiş plan JSON'ı al
- [ ] Örnekler:
  - "Çok acıktım, yemeği öne al" → Sıralamanın yeniden düzenlenmesi
  - "Müzeyi iptal et, daha uzun öğle yemeği yiyelim" → Değiştirme
  - "Bütçem az, daha ucuz seçenekler göster" → Filtreleme
- [ ] Değişiklikleri gerçek zamanlı haritaya yansıt
- [ ] Değişiklik öncesi/sonrası karşılaştırma göster

### 6.3 Durum Yönetimi
- [ ] Chat geçmişi Zustand store'a ekle
- [ ] Plan değişiklikleri Supabase'e kaydet (versiyon geçmişi)

**FAZ 6 TAMAMLANMA KRİTERİ:** Kullanıcı chatbot ile konuşarak planı değiştirebiliyor, harita güncelleniyor.

---

## FAZ 7: NAVIGASYON MODU

**Hedef:** Google Maps benzeri sıra adım navigasyon.

### 7.1 Canlı Konum
- [ ] Browser Geolocation API entegrasyonu
- [ ] Kullanıcının anlık konumunu haritada göster
- [ ] Konum güncellemelerini dinle (watchPosition)
- [ ] Konum izni yönetimi (reddedilirse alternatif)

### 7.2 Turn-by-Turn Navigasyon
- [ ] Google Routes API ile adım adım yol tarifi
- [ ] Aktif adımı vurgula ("50m sonra sola dön")
- [ ] Harita otomatik kullanıcıyı takip eder
- [ ] Bir sonraki durağa kalan mesafe ve süre göster

### 7.3 Durak Geçiş Mantığı
- [ ] Kullanıcı durağa yaklaştığında (50m içinde) bildirim
- [ ] "Varıştınız: Kolezyum" ekranı
- [ ] Audio guide başlatma butonu (FAZ 8'i açar)
- [ ] "Sonraki durağa git" butonu
- [ ] Durağı atla seçeneği

### 7.4 Navigasyon Store
```typescript
interface NavigationStore {
  isNavigating: boolean
  currentPlan: TripPlan | null
  currentStopIndex: number
  userLocation: { lat: number; lng: number } | null
  distanceToNextStop: number
  
  startNavigation: (plan: TripPlan) => void
  stopNavigation: () => void
  arriveAtStop: (stopIndex: number) => void
  skipStop: () => void
  nextStop: () => void
}
```

**FAZ 7 TAMAMLANMA KRİTERİ:** Kullanıcı "Başla" deyince harita üzerinde adım adım yönlendirme alıyor.

---

## FAZ 8: AUDIO GUIDE

**Hedef:** Kullanıcı bir landmark'a geldiğinde AI sesli anlatım başlatabilir.

### 8.1 Audio Guide Metin Üretimi
- [ ] `/app/api/audio-guide/route.ts` oluştur
- [ ] Durak bilgisi + Wikipedia verisi → Llama 3.1 405B ile anlatım metni
- [ ] Prompt: "700 kelime, akıcı, sesli anlatıma uygun (karmaşık noktalama yok), tarihi hikayeyi anlat"
- [ ] Metni Supabase'e cache'le (aynı yer için tekrar üretme)
- [ ] Dil desteği (kullanıcı dil tercihi)

### 8.2 Text-to-Speech
- [ ] ElevenLabs API entegrasyonu (`/lib/elevenlabs.ts`)
- [ ] Ses dosyasını üret (MP3)
- [ ] Supabase Storage'a kaydet (cache)
- [ ] Streaming playback (üretilirken oynat)

### 8.3 Oynatıcı UI
- [ ] Ses oynatıcı bileşeni (`/components/AudioPlayer.tsx`)
  - Oynat/Durdur
  - Hız ayarı (0.75x, 1x, 1.25x, 1.5x)
  - İleri/geri 15sn
  - Kalan süre
- [ ] Navigasyon modunda küçük oynatıcı overlay
- [ ] Arka planda devam eder (kullanıcı haritaya bakabilir)

**FAZ 8 TAMAMLANMA KRİTERİ:** Kullanıcı landmark'a gelince "Anlatımı Başlat" deyebiliyor, AI sesi çıkıyor.

---

## FAZ 9: HESAP & GEÇMİŞ

**Hedef:** Kullanıcı geçmiş planlarını görebilir, tekrar kullanabilir.

### 9.1 Geçmiş Planlar
- [ ] Planlar listesi sayfası (`/app/(dashboard)/my-trips/page.tsx`)
- [ ] Her plan kartı: şehir, tarih, süre, durak sayısı
- [ ] Planı tekrar aç / düzenle / sil
- [ ] Planı favori olarak işaretle

### 9.2 Veritabanı Ekleri
```sql
-- Plan geçmişi (tamamlanan turlar)
CREATE TABLE trip_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  plan_id UUID REFERENCES trip_plans(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  stops_visited INTEGER,
  total_stops INTEGER
);
```

### 9.3 Kullanıcı Tercihleri
- [ ] Tercihler tablosu (önceki seçimler otomatik hatırlansın)
- [ ] Sonraki plan oluştururken öneriler: "Geçen sefer tarihi yerleri sevmiştin"

**FAZ 9 TAMAMLANMA KRİTERİ:** Kullanıcı tüm geçmiş planlarını görüyor, dilediğini tekrar açabiliyor.

---

## FAZ 10: B2B İŞLETME PORTALI

**Hedef:** Restoranlar ve işletmeler platforma kayıt olabilir, kupon sağlar.

### 10.1 Veritabanı
```sql
CREATE TABLE businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  category TEXT,                          -- restaurant, cafe, museum, shop
  address TEXT,
  location GEOGRAPHY(POINT, 4326),
  google_place_id TEXT,
  status TEXT DEFAULT 'pending',          -- pending, approved, active
  tier TEXT DEFAULT 'free',               -- free, featured ($99/mo)
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id),
  title TEXT,                             -- "%10 indirim"
  description TEXT,
  discount_percent INTEGER,
  valid_from DATE,
  valid_until DATE,
  max_redemptions INTEGER,
  current_redemptions INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE coupon_redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID REFERENCES coupons(id),
  user_id UUID REFERENCES profiles(id),
  redeemed_at TIMESTAMPTZ DEFAULT now(),
  commission_amount NUMERIC               -- biz ne kazandık
);
```

### 10.2 İşletme Kayıt Akışı
- [ ] İşletme kayıt formu (Google Place ID ile konum doğrulama)
- [ ] Admin onay süreci (manuel veya otomatik)
- [ ] İşletme dashboard'u: görüntülenme, kupon kullanım istatistikleri

### 10.3 Kullanıcı Tarafı
- [ ] Plan oluştururken kayıtlı işletmeleri önceliklendir (aynı bölgedeyse)
- [ ] "Kuponlu yer" rozeti göster
- [ ] Kuponu görüntüle ve "Kullan" butonu

**FAZ 10 TAMAMLANMA KRİTERİ:** İşletme kayıt olabiliyor, kupon ekleyebiliyor, kullanıcılar planlarda görüyor.

---

## FAZ 11: MOBİLE (EXPO)

**Hedef:** Web app'i iOS ve Android'e taşı.

### 11.1 Expo Kurulumu
- [ ] Expo + React Native kurulumu (monorepo yapısında)
- [ ] NativeWind ile Tailwind syntax'ını mobile'a taşı
- [ ] NativeCN bileşenlerini kur (shadcn/ui mobile karşılığı)
- [ ] Expo Router (web'deki App Router yapısıyla aynı)

### 11.2 Paylaşılan Kod
- [ ] Tüm Zustand store'ları doğrudan çalışır (değişiklik yok)
- [ ] Tüm API route'ları doğrudan çalışır (değişiklik yok)
- [ ] TypeScript tipleri doğrudan çalışır (değişiklik yok)
- [ ] Supabase client doğrudan çalışır (değişiklik yok)

### 11.3 Mobile-Spesifik Değişiklikler
- [ ] `react-native-maps` ile Google Maps (web'deki @react-google-maps yerine)
- [ ] `expo-location` ile GPS (browser Geolocation yerine)
- [ ] `expo-av` ile ses oynatma (HTML Audio yerine)
- [ ] Bottom tab navigation (web sidebar yerine)
- [ ] Push notification (Expo Notifications)
- [ ] App Store + Play Store dağıtımı (EAS Build)

**FAZ 11 TAMAMLANMA KRİTERİ:** App iOS ve Android'de çalışıyor, tüm temel özellikler aktif.

---

## BAŞLAMADAN ÖNCE YAPILACAKLAR (Bir Kere)

```
HESAPLAR & API KEY'LER
□ Supabase hesabı aç → proje oluştur → API key al
□ Google Cloud Console → Maps Platform aktif et → API key al
  (Maps JS API + Places API + Routes API aktif et)
□ Google Cloud Startup Program'a başvur ($100K kredi için)
□ OpenRouter hesabı aç → API key al
□ ElevenLabs hesabı aç (Starter - $5/ay) → API key al
□ Vercel hesabı aç (hosting için)

GOOGLE MAPS API'LERİ AKTİF ET
□ Maps JavaScript API
□ Places API (New)
□ Routes API
□ Geocoding API
```

---

## ÖNERİLEN İLERLEME SIRASI

```
HAFTA 1-2:  FAZ 1 + FAZ 2  → Temel çalışıyor, auth + konum girişi
HAFTA 3-4:  FAZ 3 + FAZ 4  → Sihirbaz + AI plan üretiyor
HAFTA 5:    FAZ 5           → Harita görselleştirme
HAFTA 6:    FAZ 6           → AI chat düzenleme
HAFTA 7:    FAZ 7 + FAZ 8  → Navigasyon + Audio Guide
HAFTA 8:    FAZ 9           → Geçmiş + Hesap
HAFTA 9+:   FAZ 10          → B2B (yeterli kullanıcı sonrası)
Ay 3+:      FAZ 11          → Mobile
```

---

## KRİTİK NOTLAR

1. **Her fazı test et** geçmeden. Bir önceki faz sağlam değilse bir sonrakini inşa etme.
2. **Google Maps maliyeti:** Startup kredisi gelmeden ücretsiz limiti aşma. Geliştirme sırasında kendi konumunu test et.
3. **LLM prompt'larını kaydet** — her plan için hangi prompt kullanıldığını logla, iyileştirme için.
4. **Supabase free tier sınırı:** 500MB DB, 1GB storage. Audio guide ses dosyalarını cache'le (tekrar üretme).
5. **Audio guide cache stratejisi:** Aynı yer için ses dosyası bir kez üretilir, Supabase Storage'da tutulur.
6. **Mobil önce düşün:** Web'i geliştirirken responsive tasarım yap. Mobile geçişi zorlaştırma.
