export default function CoursesPage() {
    return (
      <section className="bg-zinc-900 rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-4">
          Kurse
        </h2>
  
        <p className="text-gray-400 mb-6">
          Hier werden später die Musikkurse angezeigt.
        </p>
  
        <div className="space-y-4">
          <div className="bg-zinc-800 p-4 rounded-xl">
            🎹 Klavierunterricht
          </div>
  
          <div className="bg-zinc-800 p-4 rounded-xl">
            🎸 Gitarrenunterricht
          </div>
  
          <div className="bg-zinc-800 p-4 rounded-xl">
            🥁 Schlagzeugunterricht
          </div>
  
          <div className="bg-zinc-800 p-4 rounded-xl">
            🎤 Gesangsunterricht
          </div>
        </div>
      </section>
    );
  }