type Props = {
  user: any;
  logout: () => void;
  setActivePage: (page: string) => void;
  isAdmin: boolean;
};

export default function Dashboard({
  user,
  logout,
  setActivePage,
  isAdmin,
}: Props) {
  const cards = [
    { title: "Profil", description: "Daten bearbeiten", icon: "👤", page: "profile" },
    { title: "Kurse", description: "Musikkurse", icon: "🎵", page: "courses" },
    { title: "Stundenplan", description: "Termine", icon: "📅", page: "schedule" },
    { title: "Instrumente", description: "Infos & Räume", icon: "🎹", page: "instruments" },
    { title: "Dateien", description: "Downloads", icon: "📁", page: "files" },
    { title: "News", description: "Aktuelles", icon: "📰", page: "news" },
    { title: "Links", description: "Nützliche Links", icon: "🔗", page: "links" },
  ];

  return (
    <div className="w-full h-[calc(100vh-7rem)] bg-gradient-to-br from-[#0B1E3F] via-[#0D2247] to-[#0B1E3F] rounded-2xl overflow-hidden flex flex-col relative">
      
      {/* Animierte Musiknoten im Hintergrund */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] text-[#00D9FF]/10 text-6xl animate-pulse">♪</div>
        <div className="absolute top-[60%] right-[8%] text-[#00D9FF]/10 text-8xl animate-pulse delay-300">♫</div>
        <div className="absolute bottom-[15%] left-[15%] text-[#00D9FF]/10 text-5xl animate-pulse delay-500">♬</div>
      </div>

      {/* Kompakter Header */}
      <div className="bg-[#0F2A52]/80 backdrop-blur-xl border-b border-white/10 px-4 py-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-[#00D9FF] blur-xl opacity-50 rounded-xl"></div>
            <img
              src="/icon-192.png"
              alt="Logo"
              className="relative w-12 h-12 rounded-xl shadow-lg ring-2 ring-[#00D9FF]/50"
            />
          </div>

          <div>
            <p className="text-xs font-semibold text-[#00D9FF] tracking-wider uppercase">
              Willkommen zurück
            </p>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Freie Musikschule
            </h2>
            <p className="text-white/60 text-xs">
              Bad Soden e.V.
            </p>
          </div>
        </div>
      </div>

      {/* Cards Grid - KOMPAKT: 3 Spalten auf Mobile */}
      <div className="flex-1 overflow-y-auto p-3 relative z-10">
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {cards.map((card) => (
            <button
              key={card.page}
              onClick={() => setActivePage(card.page)}
              className="group relative bg-[#0F2A52]/60 backdrop-blur-xl hover:bg-[#0F2A52]/80 transition-all duration-300 border border-white/10 hover:border-[#00D9FF]/50 shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_24px_rgba(0,217,255,0.2)] p-3 rounded-2xl text-left active:scale-95"
            >
              <div className="text-2xl mb-2 bg-[#00D9FF]/10 w-fit p-2.5 rounded-xl group-hover:scale-110 group-hover:bg-[#00D9FF]/20 transition-all duration-300">
                {card.icon}
              </div>

              <h3 className="font-bold text-sm text-white tracking-tight leading-tight">
                {card.title}
              </h3>

              <p className="text-white/50 text-[10px] mt-0.5 leading-tight">
                {card.description}
              </p>
            </button>
          ))}

          {isAdmin && (
            <button
              onClick={() => setActivePage("admin")}
              className="group relative bg-gradient-to-br from-[#7a1f1f] to-[#651919] hover:from-[#8a2a2a] hover:to-[#7a1f1f] transition-all duration-300 text-white shadow-[0_4px_16px_rgba(122,31,0.4)] hover:shadow-[0_8px_24px_rgba(122,31,31,0.6)] p-3 rounded-2xl text-left border border-white/10 active:scale-95"
            >
              <div className="text-2xl mb-2 bg-white/10 backdrop-blur w-fit p-2.5 rounded-xl group-hover:scale-110 transition-all duration-300">
                🛠️
              </div>

              <h3 className="font-bold text-sm tracking-tight leading-tight">
                Admin
              </h3>

              <p className="text-white/70 text-[10px] mt-0.5 leading-tight">
                Verwaltung
              </p>
            </button>
          )}
        </div>
      </div>

      {/* Kompakter Footer */}
      <div className="bg-[#0F2A52]/80 backdrop-blur-xl border-t border-white/10 p-3 relative z-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00D9FF] to-[#0099CC] flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white text-xs truncate">
                {user?.email}
              </p>

              {isAdmin && (
                <span className="inline-flex items-center gap-1 bg-[#d8a928]/20 text-[#d8a928] text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[#d8a928]/30 mt-0.5">
                  <span className="w-1 h-1 bg-[#d8a928] rounded-full animate-pulse"></span>
                  Admin
                </span>
              )}
            </div>
          </div>

          <button
            onClick={logout}
            className="bg-white/10 hover:bg-red-500/20 border border-white/20 hover:border-red-500/50 transition-all duration-300 text-white px-4 py-2 rounded-xl font-semibold text-xs active:scale-95 shrink-0"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}