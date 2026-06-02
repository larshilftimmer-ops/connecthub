"use client";

export default function LinksPage() {
  const links = [
    {
      title: "Musikschule Website",
      description: "Offizielle Website der Musikschule",
      icon: "🎵",
      href: "https://www.musikschulebadsoden.de",
      gradient: "from-[#00D9FF] to-[#0099FF]",
      glow: "shadow-[0_0_30px_rgba(0,217,255,0.4)]",
    },
    {
      title: "Instagram",
      description: "Aktuelle Beiträge & Fotos",
      icon: "📸",
      href: "https://www.instagram.com/musikschulebadsoden/",
      gradient: "from-pink-500 to-orange-400",
      glow: "shadow-[0_0_30px_rgba(236,72,153,0.4)]",
    },
    {
      title: "YouTube",
      description: "Videos & Konzerte",
      icon: "▶️",
      href: "https://www.youtube.com",
      gradient: "from-red-500 to-red-600",
      glow: "shadow-[0_0_30px_rgba(239,68,68,0.4)]",
    },
    {
      title: "Lexware Login",
      description: "Verwaltungsbereich öffnen",
      icon: "💼",
      href: "https://app.lexware.de",
      gradient: "from-emerald-500 to-green-600",
      glow: "shadow-[0_0_30px_rgba(16,185,129,0.4)]",
    },
    {
      title: "edTime Login",
      description: "Stunden & Zeiten verwalten",
      icon: "🕒",
      href: "https://app.edtime.de/login",
      gradient: "from-blue-500 to-cyan-500",
      glow: "shadow-[0_0_30px_rgba(59,130,246,0.4)]",
    },
  ];

  return (
    <div className="w-full h-[calc(100vh-7rem)] bg-gradient-to-br from-[#0B1E3F] via-[#0D2247] to-[#0B1E3F] rounded-2xl overflow-hidden flex flex-col relative">
      
      {/* Animated Background Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00D9FF]/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00D9FF]/5 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00D9FF]/3 rounded-full blur-3xl animate-pulse delay-500" />
      
      {/* Header */}
      <div className="bg-[#0F2A52]/80 backdrop-blur-xl border-b border-white/10 px-4 py-5 relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D9FF] to-[#0099FF] flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(0,217,255,0.5)]">
            🔗
          </div>
          <div>
            <p className="text-xs font-bold text-[#00D9FF] mb-0.5">
              Musikschule Bad Soden
            </p>
            <h2 className="text-2xl font-bold text-white">
              Wichtige Links
            </h2>
          </div>
        </div>
        <p className="text-sm text-white/40">
          Schnellzugriffe & wichtige Plattformen
        </p>
      </div>

      {/* Links Grid */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 relative z-10">
        {links.map((link, index) => (
          <a
            key={link.title}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-[#0F2A52]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 active:scale-[0.98] transition-all duration-300 hover:border-white/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] group shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${link.gradient} flex items-center justify-center text-3xl shadow-lg flex-shrink-0 group-hover:scale-110 group-hover:${link.glow} transition-all duration-300`}
              >
                {link.icon}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-white mb-1 break-words group-hover:text-[#00D9FF] transition-colors">
                  {link.title}
                </h3>

                <p className="text-white/50 text-sm break-words">
                  {link.description}
                </p>
              </div>

              <div className="text-[#00D9FF] text-2xl flex-shrink-0 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300">
                →
              </div>
            </div>

            {/* Hover Glow Line */}
            <div className={`h-1 w-0 group-hover:w-full bg-gradient-to-r ${link.gradient} rounded-full mt-3 transition-all duration-500 opacity-0 group-hover:opacity-100`} />
          </a>
        ))}
      </div>

      {/* Bottom Info */}
      <div className="bg-[#0F2A52]/80 backdrop-blur-xl border-t border-white/10 p-4 relative z-10">
        <div className="bg-[#00D9FF]/10 border border-[#00D9FF]/30 rounded-xl p-3 flex items-start gap-2">
          <span className="text-[#00D9FF] text-lg">⚡</span>
          <div className="flex-1">
            <p className="text-xs text-white/80 leading-relaxed">
              <span className="font-semibold text-white">Tipp:</span> Alle Links öffnen sich in einem neuen Tab. Für Lexware & edTime benötigst du deine Zugangsdaten.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}