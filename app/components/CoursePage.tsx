"use client";

export default function CoursesPage() {
  const courses = [
    {
      id: 1,
      icon: "🎹",
      title: "Klavierunterricht",
      teacher: "L. Petersen",
      level: "Anfänger - Fortgeschritten",
      spots: 3,
      time: "Mo & Mi, 16:00 - 18:00",
    },
    {
      id: 2,
      icon: "🎸",
      title: "Gitarrenunterricht",
      teacher: "M. Schmidt",
      level: "Alle Level",
      spots: 2,
      time: "Di & Do, 17:00 - 19:00",
    },
    {
      id: 3,
      icon: "🥁",
      title: "Schlagzeugunterricht",
      teacher: "T. Weber",
      level: "Fortgeschritten",
      spots: 1,
      time: "Fr, 15:00 - 17:00",
    },
    {
      id: 4,
      icon: "🎤",
      title: "Gesangsunterricht",
      teacher: "S. Müller",
      level: "Anfänger - Profi",
      spots: 5,
      time: "Mo - Fr, nach Vereinbarung",
    },
    {
      id: 5,
      icon: "🎻",
      title: "Geigenunterricht",
      teacher: "A. Fischer",
      level: "Anfänger",
      spots: 4,
      time: "Di & Do, 14:00 - 16:00",
    },
    {
      id: 6,
      icon: "🎷",
      title: "Saxophonunterricht",
      teacher: "J. Klein",
      level: "Alle Level",
      spots: 0,
      time: "Mi, 18:00 - 20:00",
    },
  ];

  const totalSpots = courses.reduce((sum, c) => sum + c.spots, 0);

  return (
    <div className="w-full h-[calc(100vh-7rem)] bg-[#0B1E3F] rounded-2xl overflow-hidden flex flex-col">
      
      {/* Header Blau */}
      <div className="bg-[#0F2A52] border-b border-white/5 px-4 py-4">
        <h2 className="text-xl font-bold text-white mb-1">Kurse</h2>
        <p className="text-sm text-white/40">
          Entdecke unsere Musikunterricht-Angebote
        </p>
      </div>

      {/* Stats Cards */}
      <div className="p-3 grid grid-cols-2 gap-3">
        <div className="bg-[#0F2A52] rounded-xl p-4 border border-white/5">
          <p className="text-2xl font-bold text-[#00D9FF]">{courses.length}</p>
          <p className="text-xs text-white/40 mt-1">Aktive Kurse</p>
        </div>
        <div className="bg-[#0F2A52] rounded-xl p-4 border border-white/5">
          <p className="text-2xl font-bold text-[#00D9FF]">{totalSpots}</p>
          <p className="text-xs text-white/40 mt-1">Freie Plätze</p>
        </div>
      </div>

      {/* Course List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-3">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-[#0F2A52] border border-white/5 rounded-2xl p-4 active:scale-[0.98] transition-transform"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-[#00D9FF]/10 flex items-center justify-center text-2xl shrink-0">
                {course.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-base mb-0.5">
                  {course.title}
                </h3>
                <p className="text-sm text-white/60">{course.teacher}</p>
              </div>
              <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 ${
                course.spots === 0
                  ? "bg-white/10 text-white/40"
                  : "bg-[#00D9FF]/20 text-[#00D9FF]"
              }`}>
                {course.spots === 0 ? "Warteliste" : `${course.spots} Plätze`}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-white/50">
                <span className="text-[#00D9FF]">📊</span>
                <span>{course.level}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/50">
                <span className="text-[#00D9FF]">🕐</span>
                <span>{course.time}</span>
              </div>
            </div>

            <button className="w-full bg-[#00D9FF] hover:bg-[#00D9FF]/90 text-[#0B1E3F] font-bold py-2.5 rounded-xl text-sm active:scale-95 transition">
              Anmelden
            </button>
          </div>
        ))}
      </div>

      {/* Bottom Info */}
      <div className="bg-[#0F2A52] border-t border-white/5 p-4">
        <div className="bg-[#00D9FF]/10 border border-[#00D9FF]/20 rounded-xl p-3 flex items-start gap-2">
          <span className="text-[#00D9FF] text-lg">ℹ️</span>
          <div className="flex-1">
            <p className="text-xs text-white/80 leading-relaxed">
              <span className="font-semibold text-white">Probestunde gratis!</span> Buche jetzt deine kostenlose Probestunde und lerne deinen Lehrer kennen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}