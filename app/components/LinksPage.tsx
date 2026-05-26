export default function LinksPage() {
  const links = [
    {
      title: "Musikschule Website",
      description: "Offizielle Website der Musikschule",
      icon: "🎵",
      href: "https://www.musikschulebadsoden.de",
      color: "from-[#d8a928] to-[#e6c14d]",
    },
    {
      title: "Instagram",
      description: "Aktuelle Beiträge & Fotos",
      icon: "📸",
      href: "https://www.instagram.com/musikschulebadsoden/",
      color: "from-pink-500 to-orange-400",
    },
    {
      title: "YouTube",
      description: "Videos & Konzerte",
      icon: "▶️",
      href: "https://www.youtube.com",
      color: "from-red-500 to-red-600",
    },
    {
      title: "Lexware Login",
      description: "Verwaltungsbereich öffnen",
      icon: "💼",
      href: "https://app.lexware.de",
      color: "from-emerald-500 to-green-600",
    },
    {
      title: "edTime Login",
      description: "Stunden & Zeiten verwalten",
      icon: "🕒",
      href: "https://app.edtime.de/login",
      color: "from-blue-500 to-cyan-500",
    },
  ];

  return (
    <section className="w-full max-w-full overflow-x-hidden space-y-6 text-zinc-900">
      <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm p-5 sm:p-6">
        <p className="text-sm font-semibold text-[#d8a928] mb-2">
          Musikschule Bad Soden
        </p>

        <h2 className="text-2xl sm:text-3xl font-bold text-[#7a1f1f]">
          Wichtige Links
        </h2>

        <p className="text-zinc-500 mt-2">
          Schnellzugriffe & wichtige Plattformen.
        </p>
      </div>

      <div className="space-y-4">
        {links.map((link) => (
          <a
            key={link.title}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white border border-zinc-200 rounded-3xl shadow-sm p-5 hover:scale-[1.01] transition overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${link.color} flex items-center justify-center text-2xl shadow-md flex-shrink-0`}
              >
                {link.icon}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-[#7a1f1f] break-words">
                  {link.title}
                </h3>

                <p className="text-zinc-500 text-sm break-words">
                  {link.description}
                </p>
              </div>

              <div className="text-[#7a1f1f] text-2xl flex-shrink-0">
                →
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}