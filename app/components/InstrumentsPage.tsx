"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Falls Next.js App Router

type Instrument = {
  id: number;
  icon: string;
  name: string;
  benefits: string[];
  sizes?: string;
};

export default function InstrumentsPage() {
  const router = useRouter(); // Für Next.js
  
  const [instruments] = useState<Instrument[]>([
    {
      id: 1,
      icon: "🪈",
      name: "Blockflöte",
      benefits: [
        "Perfekter Einstieg für Kinder ab 5 Jahren",
        "Fördert Atmung & Feinmotorik spielerisch",
        "Günstig & leicht zu transportieren"
      ],
    },
    {
      id: 2,
      icon: "🎸",
      name: "E-Bass",
      benefits: [
        "Fundament jeder Band - ohne Bass kein Groove",
        "Schnelle Erfolgserlebnisse für Anfänger",
        "Gefragt in allen Musikrichtungen"
      ],
    },
    {
      id: 3,
      icon: "🎸",
      name: "E-Gitarre",
      benefits: [
        "Rock, Pop, Metal - alles möglich",
        "Coole Effekte & Sounds entdecken",
        "Solo oder Rhythmus - du entscheidest"
      ],
    },
    {
      id: 4,
      icon: "👶",
      name: "EMP - Elementare Musikpädagogik",
      benefits: [
        "Musik erleben für Kinder 1-6 Jahre",
        "Rhythmus, Bewegung & erste Instrumente",
        "Fördert soziale & sprachliche Entwicklung"
      ],
    },
    {
      id: 5,
      icon: "👥",
      name: "Jugendensemble",
      benefits: [
        "Gemeinsam musizieren statt alleine üben",
        "Auftritte & Bühnenerfahrung sammeln",
        "Freunde finden mit gleicher Leidenschaft"
      ],
    },
    {
      id: 6,
      icon: "🎤",
      name: "Gesang",
      benefits: [
        "Entdecke deine eigene Stimme",
        "Atemtechnik für Alltag & Bühne",
        "Selbstbewusstsein durch Ausdruck"
      ],
    },
    {
      id: 7,
      icon: "🎸",
      name: "Gitarre",
      benefits: [
        "Lagerfeuer-Klassiker bis Konzertbühne",
        "Begleitung für Gesang in Wochen lernbar",
        "Überall spielbar - kein Strom nötig"
      ],
      sizes: "Verschiedene Größen für Kinder & Erwachsene verfügbar",
    },
    {
      id: 8,
      icon: "🪉",
      name: "Harfe",
      benefits: [
        "Engelsgleiche Klänge verzaubern jeden",
        "Fördert Koordination beider Hände",
        "Seltenes Instrument - du bist besonders"
      ],
    },
    {
      id: 9,
      icon: "📯",
      name: "Horn",
      benefits: [
        "Warmer, voller Klang im Orchester",
        "Stärkt Lungenvolumen enorm",
        "Gesuchte Musiker in jedem Ensemble"
      ],
    },
    {
      id: 10,
      icon: "🎪",
      name: "Instrumentenkarussell",
      benefits: [
        "Teste 6 Instrumente in 6 Monaten",
        "Finde DEIN Instrument ohne Fehlkauf",
        "Ideal für unentschlossene Kinder 6-10 Jahre"
      ],
    },
    {
      id: 11,
      icon: "🎼",
      name: "Klarinette",
      benefits: [
        "Vielseitig: Klassik, Jazz, Klezmer",
        "Sanfter Einstieg ins Holzbläser-Spiel",
        "Leiser übbar als Blechbläser"
      ],
    },
    {
      id: 12,
      icon: "🎹",
      name: "Klavier",
      benefits: [
        "Siehst alle Töne - verstehst Musik sofort",
        "Solo-Instrument & Begleitung zugleich",
        "Beste Grundlage für alle anderen Instrumente"
      ],
    },
    {
      id: 13,
      icon: "🎻",
      name: "Kontrabass",
      benefits: [
        "Tiefster Sound - du bist das Fundament",
        "Gefragt in Orchester, Jazz, Band",
        "Beeindruckend groß - beeindruckender Klang"
      ],
      sizes: "Verschiedene Größen für Kinder & Erwachsene verfügbar",
    },
    {
      id: 14,
      icon: "🎵",
      name: "Oboe",
      benefits: [
        "Charakteristischer Klang - unverwechselbar",
        "Gibt den Ton im Orchester an",
        "Kleine Gruppen - viel Einzelaufmerksamkeit"
      ],
    },
    {
      id: 15,
      icon: "🪈",
      name: "Querflöte",
      benefits: [
        "Silbriger, leichter Klang wie Vogelgesang",
        "Ohne Blatt - nur Atem & Technik",
        "Elegant & handlich für unterwegs"
      ],
    },
    {
      id: 16,
      icon: "🎷",
      name: "Saxophon",
      benefits: [
        "Coolster Sound in Jazz, Pop, Funk",
        "Ausdrucksstark wie die menschliche Stimme",
        "Schnell coole Licks lernbar"
      ],
    },
    {
      id: 17,
      icon: "🥁",
      name: "Schlagzeug & Perkussion",
      benefits: [
        "Du gibst den Beat vor - alle folgen dir",
        "Stress abbauen durch Power",
        "Koordination auf neuem Level"
      ],
    },
    {
      id: 18,
      icon: "🎺",
      name: "Trompete",
      benefits: [
        "Strahlend & durchsetzungsstark",
        "Fanfaren bis Jazz-Soli alles drin",
        "Starke Lippenmuskulatur = starke Ausstrahlung"
      ],
    },
    {
      id: 19,
      icon: "🎸",
      name: "Ukulele",
      benefits: [
        "In 30min den ersten Song spielen",
        "Fröhlicher Hawaii-Sound macht gute Laune",
        "Klein, günstig, überall dabei"
      ],
    },
    {
      id: 20,
      icon: "🎻",
      name: "Viola - Bratsche",
      benefits: [
        "Wärmer & dunkler als Geige - einzigartig",
        "Das Herzstück im Streichquartett",
        "Weniger Konkurrenz als Geiger"
      ],
    },
    {
      id: 21,
      icon: "🎻",
      name: "Violine - Geige",
      benefits: [
        "Königin der Instrumente seit 500 Jahren",
        "Von Klassik bis Irish Folk alles möglich",
        "Schult Gehör & Intonation perfekt"
      ],
      sizes: "Verschiedene Größen für Kinder & Erwachsene verfügbar",
    },
    {
      id: 22,
      icon: "🎻",
      name: "Violoncello",
      benefits: [
        "Klang wie die menschliche Stimme",
        "Sitzend spielen - entspannte Haltung",
        "Tiefe Töne gehen unter die Haut"
      ],
      sizes: "Verschiedene Größen für Kinder & Erwachsene verfügbar",
    },
  ]);

  const goToBooking = () => {
    router.push('/booking'); // Next.js App Router
    // Oder für Pages Router: window.location.href = '/booking';
  };

  return (
    <div className="w-full min-h-[calc(100vh-7rem)] bg-gradient-to-br from-[#0B1E3F] via-[#0D2247] to-[#0B1E3F] rounded-2xl overflow-hidden flex flex-col relative">

      {/* Animated Background Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00D9FF]/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#00D9FF]/5 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Header */}
      <div className="bg-[#0F2A52]/80 backdrop-blur-xl border-b border-white/10 px-4 py-4 relative z-10">
        <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <span className="text-[#00D9FF]">🎼</span> Unsere Instrumente
        </h2>
        <p className="text-sm text-white/40">
          Freie Musikschule Bad Soden e.V.
        </p>
      </div>

      {/* Einleitung */}
      <div className="p-3 relative z-10">
        <div className="bg-[#0F2A52]/60 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <h3 className="text-white font-bold text-base mb-2 flex items-center gap-2">
            <span className="text-[#00D9FF]">👋</span> Willkommen in der Welt der Musik
          </h3>
          <p className="text-sm text-white/70 leading-relaxed">
            Hier findest du alle Instrumente, die du bei uns in der freien Musikschule Bad Soden e.V. lernen kannst. 
            Jedes Instrument hat seinen eigenen Charakter und besondere Stärken. 
            Entdecke welches zu dir passt und starte deine musikalische Reise mit einer kostenlosen Probestunde.
          </p>
        </div>
      </div>

      {/* Instruments Grid */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-3 relative z-10">
        {instruments.map((instrument) => (
          <div
            key={instrument.id}
            className="bg-[#0F2A52]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:border-[#00D9FF]/30 hover:shadow-[0_0_30px_rgba(0,217,255,0.15)] transition-all duration-200 group shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-14 h-14 rounded-xl bg-[#00D9FF]/10 flex items-center justify-center text-3xl shrink-0 group-hover:bg-[#00D9FF]/20 group-hover:shadow-[0_0_20px_rgba(0,217,255,0.3)] transition-all">
                {instrument.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-base mb-1">
                  {instrument.name}
                </h3>
                {instrument.sizes && (
                  <p className="text-xs text-[#00D9FF]/80">{instrument.sizes}</p>
                )}
              </div>
            </div>

            {/* Vorteile Liste */}
            <div className="space-y-2">
              {instrument.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-white/5 rounded-lg p-2.5 border border-white/5">
                  <span className="text-[#00D9FF] text-sm mt-0.5 shrink-0">✓</span>
                  <p className="text-sm text-white/80 leading-snug">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA Button - STICKY */}
      <div className="bg-[#0F2A52]/80 backdrop-blur-xl border-t border-white/10 p-4 relative z-10">
        <button
          onClick={goToBooking}
          className="w-full bg-[#00D9FF] hover:bg-[#00D9FF]/90 text-[#0B1E3F] font-bold py-4 rounded-xl active:scale-95 transition-all shadow-[0_0_40px_rgba(0,217,255,0.4)] hover:shadow-[0_0_50px_rgba(0,217,255,0.6)] flex items-center justify-center gap-2 text-base"
        >
          <span className="text-xl">📅</span>
          <span>Jetzt Probestunde buchen</span>
        </button>
        <p className="text-xs text-white/40 text-center mt-2">
          Kostenlos & unverbindlich • Instrumente zum Ausprobieren vor Ort
        </p>
      </div>
    </div>
  );
}