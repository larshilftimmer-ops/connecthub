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
    { title: "Kurse", description: "Musikkurse ansehen", icon: "🎵", page: "courses" },
    { title: "Stundenplan", description: "Unterricht & Termine", icon: "📅", page: "schedule" },
    { title: "Instrumente", description: "Infos & Räume", icon: "🎹", page: "instruments" },
    { title: "Dateien", description: "Dateien & Downloads", icon: "📁", page: "files" },
  ];

  return (
    <section className="relative space-y-8 bg-gradient-to-br from-[#0B1E3F] via-[#0F2A52] to-[#123456] min-h-screen p-4 sm:p-8 -m-4 sm:-m-8 overflow-hidden">
      
      {/* Animierte Musiknoten im Hintergrund */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] text-[#00D9FF]/10 text-6xl animate-pulse">♪</div>
        <div className="absolute top-[60%] right-[8%] text-[#00D9FF]/10 text-8xl animate-pulse delay-300">♫</div>
        <div className="absolute top-[30%] right-[20%] text-[#00D9FF]/5 text-7xl animate-pulse delay-700">♩</div>
        <div className="absolute bottom-[15%] left-[15%] text-[#00D9FF]/10 text-5xl animate-pulse delay-500">♬</div>
      </div>

      {/* Header Card mit Schimmer-Effekt */}
      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00D9FF]/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        
        <div className="relative flex items-center gap-5">
          <div className="relative">
            <div className="absolute inset-0 bg-[#00D9FF] blur-xl opacity-50 rounded-2xl"></div>
            <img
              src="/icon-192.png"
              alt="Logo"
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shadow-lg ring-2 ring-[#00D9FF]/50"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#00D9FF] tracking-wider uppercase">
              Willkommen zurück
            </p>

            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Freie Musikschule
            </h2>

            <p className="text-white/70 mt-1">
              Bad Soden e.V.
            </p>
          </div>
        </div>
      </div>

      {/* Cards Grid mit mehr Effekt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card) => (
          <button
            key={card.page}
            onClick={() => setActivePage(card.page)}
            className="group relative bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 backdrop-blur-xl transition-all duration-300 border border-white/20 hover:border-[#00D9FF]/60 shadow-lg hover:shadow-2xl hover:shadow-[#00D9FF]/20 p-6 rounded-3xl text-left min-h-[160px] flex flex-col justify-between hover:scale-[1.02] hover:-translate-y-1"
          >
            {/* Gradient Border Glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#00D9FF]/0 via-[#00D9FF]/0 to-[#00D9FF]/0 group-hover:from-[#00D9FF]/20 group-hover:via-transparent group-hover:to-transparent transition-all duration-500 pointer-events-none"></div>
            
            <div className="relative">
              <div className="text-4xl mb-4 bg-gradient-to-br from-[#00D9FF]/20 to-[#00D9FF]/5 w-fit p-4 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-[#00D9FF]/10">
                {card.icon}
              </div>

              <h3 className="font-bold text-xl text-white tracking-tight">
                {card.title}
              </h3>

              <p className="text-white/60 text-sm mt-1.5">
                {card.description}
              </p>
            </div>

            <div className="relative flex items-center gap-2 text-[#00D9FF] text-sm font-semibold mt-4">
              <span>Öffnen</span>
              <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
            </div>
          </button>
        ))}

        {isAdmin && (
          <button
            onClick={() => setActivePage("admin")}
            className="group relative bg-gradient-to-br from-[#7a1f1f] via-[#8a2424] to-[#651919] hover:from-[#8a2a2a] hover:to-[#7a1f1f] transition-all duration-300 text-white shadow-xl hover:shadow-2xl hover:shadow-[#7a1f1f]/40 p-6 rounded-3xl text-left min-h-[160px] flex flex-col justify-between sm:col-span-2 lg:col-span-1 border border-white/10 hover:scale-[1.02] hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
            
            <div className="relative">
              <div className="text-4xl mb-4 bg-white/10 backdrop-blur w-fit p-4 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                🛠️
              </div>

              <h3 className="font-bold text-xl tracking-tight">
                Admin Panel
              </h3>

              <p className="text-white/80 text-sm mt-1.5">
                Verwaltung öffnen
              </p>
            </div>

            <div className="relative flex items-center gap-2 text-white text-sm font-semibold mt-4">
              <span>Öffnen</span>
              <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
            </div>
          </button>
        )}
      </div>

      {/* Footer mit mehr Glas-Effekt */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#0099CC] flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wider">
              Eingeloggt als
            </p>

            <p className="font-semibold text-white break-all">
              {user?.email}
            </p>

            {isAdmin && (
              <span className="inline-flex items-center gap-1.5 bg-[#d8a928]/20 text-[#d8a928] text-xs font-semibold mt-2 px-3 py-1 rounded-full border border-[#d8a928]/30">
                <span className="w-1.5 h-1.5 bg-[#d8a928] rounded-full animate-pulse"></span>
                Administrator
              </span>
            )}
          </div>
        </div>

        <button
          onClick={logout}
          className="group bg-white/10 hover:bg-red-500/20 border border-white/20 hover:border-red-500/50 transition-all duration-300 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
        >
          <span>Logout</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>
    </section>
  );
}