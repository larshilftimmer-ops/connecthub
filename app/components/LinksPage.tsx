"use client";

import { useState } from "react";

export default function LinksPage() {
  const [modalLink, setModalLink] = useState<{title: string, url: string} | null>(null);
  const [showDSGVOHinweis, setShowDSGVOHinweis] = useState(true);

  const links = [
    {
      title: "Musikschule Website",
      description: "Offizielle Website",
      icon: "🎵",
      href: "https://www.musikschulebadsoden.de",
      gradient: "from-[#00D9FF] to-[#0099FF]",
      glow: "shadow-[0_0_20px_rgba(0,217,255,0.3)]",
      available: true,
    },
    {
      title: "Instagram",
      description: "Aktuelle Beiträge",
      icon: "📸",
      href: "https://www.instagram.com/musikschulebadsoden/",
      gradient: "from-pink-500 to-orange-400",
      glow: "shadow-[0_0_20px_rgba(236,72,153,0.3)]",
      available: true,
    },
    {
      title: "YouTube",
      description: "Videos & Konzerte",
      icon: "▶️",
      href: "https://www.youtube.com/@musikschulebadsoden",
      gradient: "from-red-500 to-red-600",
      glow: "shadow-[0_0_20px_rgba(239,68,68,0.3)]",
      available: true,
    },
    {
      title: "MSVPlus",
      description: "Verwaltungssystem",
      icon: "📊",
      href: "https://www.msvplus.de/kontakt/",
      gradient: "from-purple-500 to-indigo-600",
      glow: "shadow-[0_0_20px_rgba(139,92,246,0.3)]",
      available: false,
    },
    {
      title: "myLexware Center",
      description: "Buchhaltung & Verwaltung",
      icon: "💼",
      href: "https://app.lexware.de",
      gradient: "from-emerald-500 to-green-600",
      glow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]",
      available: false,
    },
    {
      title: "edTime",
      description: "Stunden & Zeiten",
      icon: "🕒",
      href: "https://app.edtime.de/login",
      gradient: "from-blue-500 to-cyan-500",
      glow: "shadow-[0_0_20px_rgba(59,130,246,0.3)]",
      available: false,
    },
  ];

  function handleLinkClick(link: typeof links[0], e: React.MouseEvent) {
    if (!link.available) {
      e.preventDefault();
      setModalLink({ title: link.title, url: link.href });
      
      // Nach 3 Sekunden automatisch weiterleiten
      setTimeout(() => {
        window.open(link.href, '_blank', 'noopener,noreferrer');
        setModalLink(null);
      }, 3000);
    }
  }

  return (
    <div className="w-full h-[calc(100vh-7rem)] bg-gradient-to-br from-[#0B1E3F] via-[#0D2247] to-[#0B1E3F] rounded-2xl overflow-hidden flex flex-col relative">
      
      {/* Animated Background Glow */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-[#00D9FF]/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-[#00D9FF]/5 rounded-full blur-3xl animate-pulse delay-1000" />
      
      {/* Header - Kompakter */}
      <div className="bg-[#0F2A52]/80 backdrop-blur-xl border-b border-white/10 px-4 py-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00D9FF] to-[#0099FF] flex items-center justify-center text-xl shadow-[0_0_20px_rgba(0,217,255,0.4)]">
            🔗
          </div>
          <div>
            <p className="text-xs font-bold text-[#00D9FF]">
              Musikschule Bad Soden
            </p>
            <h2 className="text-xl font-bold text-white">
              Wichtige Links
            </h2>
          </div>
        </div>
      </div>

      {/* DSGVO Hinweis Banner */}
      {showDSGVOHinweis && (
        <div className="bg-[#00D9FF]/10 border-b border-[#00D9FF]/30 px-3 py-2 relative z-10 flex items-start gap-2">
          <span className="text-[#00D9FF] text-sm">🔒</span>
          <div className="flex-1">
            <p className="text-xs text-white/80 leading-relaxed">
              <span className="font-semibold text-white">Datenschutz:</span> Externe Links öffnen in neuem Tab. Es werden keine Daten an Drittanbieter übertragen, bis du klickst.
            </p>
          </div>
          <button 
            onClick={() => setShowDSGVOHinweis(false)}
            className="text-white/40 hover:text-white/60 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Links Grid - Kompakter */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 relative z-10">
        {links.map((link, index) => (
          <a
            key={link.title}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            onClick={(e) => handleLinkClick(link, e)}
            className="block bg-[#0F2A52]/60 backdrop-blur-xl border border-white/10 rounded-xl p-3 active:scale-[0.98] transition-all duration-200 hover:border-white/20 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] group relative"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* "Bald verfügbar" Badge */}
            {!link.available && (
              <div className="absolute top-2 right-2 bg-orange-500/20 border border-orange-500/40 text-orange-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Bald verfügbar
              </div>
            )}

            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.gradient} flex items-center justify-center text-2xl shadow-lg flex-shrink-0 group-hover:scale-110 group-hover:${link.glow} transition-all duration-300`}
              >
                {link.icon}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-white mb-0.5 break-words group-hover:text-[#00D9FF] transition-colors">
                  {link.title}
                </h3>
                <p className="text-white/50 text-xs break-words">
                  {link.description}
                </p>
              </div>

              <div className="text-[#00D9FF] text-xl flex-shrink-0 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300">
                →
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Bottom Info - Kompakter */}
      <div className="bg-[#0F2A52]/80 backdrop-blur-xl border-t border-white/10 p-3 relative z-10">
        <div className="bg-white/5 border border-white/10 rounded-lg p-2 flex items-start gap-2">
          <span className="text-[#00D9FF] text-sm">💡</span>
          <p className="text-xs text-white/70 leading-relaxed flex-1">
            <span className="font-semibold text-white">Hinweis:</span> Für Lexware, edTime & MSVPlus benötigst du deine Zugangsdaten. Links öffnen extern.
          </p>
        </div>
      </div>

      {/* Modal: Bald verfügbar */}
      {modalLink && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModalLink(null)}>
          <div className="bg-[#0F2A52] border border-[#00D9FF]/30 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_60px_rgba(0,217,255,0.3)] animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-[0_0_30px_rgba(249,115,22,0.4)]">
                🚀
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {modalLink.title}
              </h3>
              <p className="text-sm text-white/70 mb-1">
                Steht in wenigen Tagen zur Verfügung
              </p>
              <p className="text-xs text-white/50 mb-6">
                Du wirst automatisch weitergeleitet...
              </p>
              
              {/* Countdown Animation */}
              <div className="flex items-center justify-center gap-1 mb-4">
                <div className="w-2 h-2 bg-[#00D9FF] rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-[#00D9FF] rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-[#00D9FF] rounded-full animate-bounce delay-200" />
              </div>

              <button
                onClick={() => {
                  window.open(modalLink.url, '_blank', 'noopener,noreferrer');
                  setModalLink(null);
                }}
                className="w-full bg-[#00D9FF] hover:bg-[#00D9FF]/90 text-[#0B1E3F] py-3 rounded-xl font-bold text-sm active:scale-95 transition-all mb-2"
              >
                Jetzt trotzdem öffnen
              </button>
              <button
                onClick={() => setModalLink(null)}
                className="w-full bg-white/5 hover:bg-white/10 text-white/60 py-2 rounded-xl font-medium text-xs"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}