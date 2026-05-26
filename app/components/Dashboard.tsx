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
    {
      title: "Profil",
      description: "Daten bearbeiten",
      icon: "👤",
      page: "profile",
    },
    {
      title: "Kurse",
      description: "Musikkurse ansehen",
      icon: "🎵",
      page: "courses",
    },
    {
      title: "Stundenplan",
      description: "Unterricht & Termine",
      icon: "📅",
      page: "schedule",
    },
    {
      title: "Instrumente",
      description: "Infos & Räume",
      icon: "🎹",
      page: "instruments",
    },
    {
      title: "Dateien",
      description: "Dateien & Downloads",
      icon: "📁",
      page: "files",
    },
  ];

  return (
    <section className="space-y-8">
      <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <img
            src="/icon-192.png"
            alt="Logo"
            className="w-16 h-16 rounded-2xl shadow-sm"
          />

          <div>
            <p className="text-sm font-semibold text-[#d8a928]">
              Willkommen zurück
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-[#7a1f1f]">
              Freie Musikschule
            </h2>

            <p className="text-zinc-500">
              Bad Soden e.V.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <button
            key={card.page}
            onClick={() => setActivePage(card.page)}
            className="bg-white hover:bg-[#fffaf0] transition border border-zinc-200 shadow-sm p-5 rounded-3xl text-left min-h-[150px] flex flex-col justify-between"
          >
            <div>
              <div className="text-4xl mb-4">
                {card.icon}
              </div>

              <h3 className="font-bold text-lg text-zinc-900">
                {card.title}
              </h3>

              <p className="text-zinc-500 text-sm mt-1">
                {card.description}
              </p>
            </div>

            <p className="text-[#7a1f1f] text-sm font-semibold mt-4">
              Öffnen →
            </p>
          </button>
        ))}

        {isAdmin && (
          <button
            onClick={() => setActivePage("admin")}
            className="bg-[#7a1f1f] hover:bg-[#651919] transition text-white shadow-sm p-5 rounded-3xl text-left min-h-[150px] flex flex-col justify-between sm:col-span-2 lg:col-span-1"
          >
            <div>
              <div className="text-4xl mb-4">
                🛠️
              </div>

              <h3 className="font-bold text-lg">
                Admin Panel
              </h3>

              <p className="text-white/75 text-sm mt-1">
                Verwaltung öffnen
              </p>
            </div>

            <p className="text-white text-sm font-semibold mt-4">
              Öffnen →
            </p>
          </button>
        )}
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">
            Eingeloggt als
          </p>

          <p className="font-semibold text-zinc-900 break-all">
            {user?.email}
          </p>

          {isAdmin && (
            <p className="text-[#7a1f1f] text-sm font-semibold mt-1">
              Administrator
            </p>
          )}
        </div>

        <button
          onClick={logout}
          className="bg-zinc-900 hover:bg-zinc-800 transition text-white px-5 py-3 rounded-xl font-semibold"
        >
          Logout
        </button>
      </div>
    </section>
  );
}