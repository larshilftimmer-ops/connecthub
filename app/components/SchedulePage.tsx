export default function SchedulePage() {
    return (
      <section className="bg-zinc-900 rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-4">
          Stundenplan
        </h2>
  
        <p className="text-gray-400 mb-6">
          Hier werden später Unterrichtszeiten und Termine angezeigt.
        </p>
  
        <div className="space-y-4">
          <div className="bg-zinc-800 p-4 rounded-xl">
            Montag · 15:00 · Klavier
          </div>
  
          <div className="bg-zinc-800 p-4 rounded-xl">
            Mittwoch · 17:30 · Gitarre
          </div>
  
          <div className="bg-zinc-800 p-4 rounded-xl">
            Freitag · 16:00 · Gesang
          </div>
        </div>
      </section>
    );
  }