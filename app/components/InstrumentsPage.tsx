"use client";

export default function InstrumentsPage() {
  const instruments = [
    {
      id: 1,
      icon: "🎹",
      name: "Klavier",
      description: "Konzertflügel & Digitalpianos",
      rooms: "Raum A1, A2",
      available: 4,
      category: "Tasten",
    },
    {
      id: 2,
      icon: "🎺",
      name: "Blasinstrumente",
      description: "Trompete, Saxophon, Klarinette",
      rooms: "Raum B1, B2",
      available: 8,
      category: "Bläser",
    },
    {
      id: 3,
      icon: "🎸",
      name: "Gitarre",
      description: "Akustik, E-Gitarre & Bass",
      rooms: "Raum C1, C2",
      available: 6,
      category: "Saiten",
    },
    {
      id: 4,
      icon: "🥁",
      name: "Schlagzeug",
      description: "Akustik & E-Drum Sets",
      rooms: "Raum D1",
      available: 3,
      category: "Percussion",
    },
    {
      id: 5,
      icon: "🎻",
      name: "Streicher",
      description: "Geige, Bratsche, Cello",
      rooms: "Raum E1, E2",
      available: 5,
      category: "Streicher",
    },
    {
      id: 6,
      icon: "🎤",
      name: "Gesang",
      description: "Stimmbildung & Mikrofontechnik",
      rooms: "Raum F1",
      available: 2,
      category: "Vokal",
    },
  ];

  const totalInstruments = instruments.reduce((sum, i) => sum + i.available, 0);

  return (
    <div className="w-full h-[calc(100vh-7rem)] bg-gradient-to-br from-[#0B1E3F] via-[#0D2247] to-[#0B1E3F] rounded-2xl overflow-hidden flex flex-col relative">
      
      {/* Animated Background Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00D9FF]/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#00D9FF]/5 rounded-full blur-3xl animate-pulse delay-1000" />
      
      {/* Header */}
      <div className="bg-[#0F2A52]/80 backdrop-blur-xl border-b border-white/10 px-4 py-4 relative z-10">
        <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <span className="text-[#00D9FF]">🎼</span> Instrumente
        </h2>
        <p className="text-sm text-white/40">
          Informationen zu Instrumenten, Räumen und Ausstattung
        </p>
      </div>

      {/* Stats Cards */}
      <div className="p-3 grid grid-cols-2 gap-3 relative z-10">
        <div className="bg-[#0F2A52]/60 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <p className="text-2xl font-bold text-[#00D9FF]">{instruments.length}</p>
          <p className="text-xs text-white/40 mt-1 font-semibold">Kategorien</p>
        </div>
        <div className="bg-[#0F2A52]/60 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <p className="text-2xl font-bold text-[#00D9FF]">{totalInstruments}</p>
          <p className="text-xs text-white/40 mt-1 font-semibold">Verfügbar</p>
        </div>
      </div>

      {/* Instruments Grid */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-3 relative z-10">
        {instruments.map((instrument) => (
          <div
            key={instrument.id}
            className="bg-[#0F2A52]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 active:scale-[0.98] transition-all duration-200 hover:border-[#00D9FF]/30 hover:shadow-[0_0_30px_rgba(0,217,255,0.15)] group shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-14 h-14 rounded-xl bg-[#00D9FF]/10 flex items-center justify-center text-3xl shrink-0 group-hover:bg-[#00D9FF]/20 group-hover:shadow-[0_0_20px_rgba(0,217,255,0.3)] transition-all">
                {instrument.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-white text-base">
                    {instrument.name}
                  </h3>
                  <div className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#00D9FF]/20 text-[#00D9FF] shrink-0">
                    {instrument.available} Stück
                  </div>
                </div>
                <p className="text-sm text-white/60 mb-2">{instrument.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                <p className="text-xs text-white/40 mb-0.5">Kategorie</p>
                <p className="text-sm text-white font-semibold">{instrument.category}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                <p className="text-xs text-white/40 mb-0.5">Räume</p>
                <p className="text-sm text-white font-semibold">{instrument.rooms}</p>
              </div>
            </div>

            <button className="w-full mt-3 bg-[#00D9FF]/10 hover:bg-[#00D9FF]/20 border border-[#00D9FF]/30 hover:border-[#00D9FF]/50 text-[#00D9FF] font-semibold py-2.5 rounded-xl text-sm active:scale-95 transition-all hover:shadow-[0_0_20px_rgba(0,217,255,0.3)]">
              Details ansehen
            </button>
          </div>
        ))}
      </div>

      {/* Bottom Info */}
      <div className="bg-[#0F2A52]/80 backdrop-blur-xl border-t border-white/10 p-4 relative z-10">
        <div className="bg-[#00D9FF]/10 border border-[#00D9FF]/30 rounded-xl p-3 flex items-start gap-2">
          <span className="text-[#00D9FF] text-lg">💡</span>
          <div className="flex-1">
            <p className="text-xs text-white/80 leading-relaxed">
              <span className="font-semibold text-white">Tipp:</span> Alle Instrumente können für den Unterricht kostenlos genutzt werden. Reservierung über den Kalender.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}