import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <main className="min-h-screen" style={{ background: "#0F172A", color: "#F8FAFC" }}>

      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <span
          className="text-xl font-bold tracking-tight"
          style={{ color: "#F59E0B", fontFamily: "Georgia, 'Times New Roman', serif", letterSpacing: "-0.02em" }}
        >
          Where2Go
        </span>
        <div className="flex gap-3">
          <Link href="/login">
            <Button
              variant="ghost"
              className="text-slate-300 hover:text-white hover:bg-white/10 text-sm"
            >
              Giriş Yap
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              className="text-sm font-semibold"
              style={{ background: "#F59E0B", color: "#0F172A" }}
            >
              Ücretsiz Başla
            </Button>
          </Link>
        </div>
      </nav>

      <section className="relative px-6 pt-20 pb-28 max-w-6xl mx-auto text-center overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(245,158,11,0.12) 0%, transparent 70%)",
          }}
        />

        <div className="relative">
          <span
            className="inline-block text-xs font-semibold tracking-widest uppercase mb-6 px-3 py-1 rounded-full border"
            style={{
              color: "#F59E0B",
              borderColor: "rgba(245,158,11,0.35)",
              background: "rgba(245,158,11,0.08)",
            }}
          >
            AI Destekli Gezi Planlama
          </span>

          <h1
            className="text-5xl md:text-7xl font-bold leading-tight mb-6"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              letterSpacing: "-0.03em",
              lineHeight: 1.08,
            }}
          >
            Şehri Keşfet,
            <br />
            <span style={{ color: "#F59E0B" }}>Zamanını</span>
            <br />
            Boşa Harcama
          </h1>

          <p
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: "#94A3B8" }}
          >
            Otelinizin konumundan başlayan, size özel, AI destekli gezi rehberi.
            Turn-by-turn navigasyon ve sesli rehberle her dakikanızı değerlendirin.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="text-base font-bold px-8 py-6 rounded-xl shadow-lg"
                style={{ background: "#F59E0B", color: "#0F172A" }}
              >
                Ücretsiz Başla
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 py-6 rounded-xl"
                style={{
                  borderColor: "rgba(255,255,255,0.2)",
                  color: "#F8FAFC",
                  background: "transparent",
                }}
              >
                Nasıl Çalışır?
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif", letterSpacing: "-0.02em" }}
          >
            Nasıl Çalışır?
          </h2>
          <p style={{ color: "#94A3B8" }} className="text-base max-w-lg mx-auto">
            Üç adımda kişiselleştirilmiş gezi planınız hazır.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "🏨",
              step: "01",
              title: "Otelinizi Girin",
              desc: "Konaklama konumunuzu belirleyin. Rotanız oradan başlar.",
            },
            {
              icon: "🎯",
              step: "02",
              title: "Tercihlerinizi Seçin",
              desc: "Kaç saatiniz var? Müze mi, doğa mı, yemek kültürü mü? Siz seçin.",
            },
            {
              icon: "🗺️",
              step: "03",
              title: "Planınız Hazır",
              desc: "AI rotanızı oluşturur, turn-by-turn navigasyon başlar.",
            },
          ].map((item) => (
            <Card
              key={item.step}
              className="relative overflow-hidden border-0"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <CardContent className="p-8">
                <div
                  className="text-xs font-bold tracking-widest mb-5 block"
                  style={{ color: "rgba(245,158,11,0.5)" }}
                >
                  ADIM {item.step}
                </div>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#94A3B8" }}>
                  {item.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section
        className="px-6 py-24"
        style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif", letterSpacing: "-0.02em" }}
            >
              Neden Where2Go?
            </h2>
            <p style={{ color: "#94A3B8" }} className="text-base max-w-lg mx-auto">
              Diğer uygulamalardan farkımız: zaman kısıtlaması, navigasyon ve sesli rehber tek akışta.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                icon: "🎙️",
                title: "Sesli Rehber",
                desc: "Landmark'lara vardığınızda AI size o yeri anlatır. Kulaklığınızı takın, gerisi kendiliğinden gelir.",
              },
              {
                icon: "⏱️",
                title: "Zaman Optimizasyonu",
                desc: "3 saatiniz varsa 3 saatlik, 8 saatiniz varsa tam gün planınız hazırlanır. Her dakika hesaplanır.",
              },
              {
                icon: "💰",
                title: "Maliyet Tahmini",
                desc: "Müze giriş ücretleri, tahmini yemek masrafı, ulaşım dahil toplam bütçe gösterimi.",
              },
              {
                icon: "✏️",
                title: "Anlık Düzenleme",
                desc: '"Acıktım" veya "Yoruldum" deyin, AI planı anında yeniden düzenlesin.',
              },
            ].map((feat) => (
              <div
                key={feat.title}
                className="flex gap-5 p-6 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: "rgba(245,158,11,0.1)" }}
                >
                  {feat.icon}
                </div>
                <div>
                  <h3
                    className="font-bold text-base mb-1"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    {feat.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#94A3B8" }}>
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-28 text-center max-w-3xl mx-auto">
        <h2
          className="text-3xl md:text-5xl font-bold mb-5"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif", letterSpacing: "-0.02em" }}
        >
          Bir sonraki şehrinizi
          <br />
          <span style={{ color: "#F59E0B" }}>tam zamanında</span> keşfedin.
        </h2>
        <p className="text-base mb-10" style={{ color: "#94A3B8" }}>
          Kayıt olmak ücretsiz. Kredi kartı gerekmez.
        </p>
        <Link href="/signup">
          <Button
            size="lg"
            className="text-base font-bold px-10 py-6 rounded-xl shadow-xl"
            style={{ background: "#F59E0B", color: "#0F172A" }}
          >
            Hemen Ücretsiz Kaydol
          </Button>
        </Link>
      </section>

      <footer
        className="px-6 py-8 text-center text-sm"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)", color: "#475569" }}
      >
        <span style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "#F59E0B", fontWeight: 600 }}>
          Where2Go
        </span>{" "}
        &copy; {new Date().getFullYear()} — AI Destekli Gezi Rehberi
      </footer>
    </main>
  );
}
