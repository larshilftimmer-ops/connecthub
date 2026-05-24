export default function AdminPanel() {
    return (
      <section className="bg-zinc-900 rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-4">
          Admin Panel
        </h2>
  
        <p className="text-gray-400 mb-6">
          Verwaltungsbereich der Musikschule.
        </p>
  
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-zinc-800 p-5 rounded-2xl text-left">
            👥 Benutzer
          </button>
  
          <button className="bg-zinc-800 p-5 rounded-2xl text-left">
            🎵 Kurse
          </button>
  
          <button className="bg-zinc-800 p-5 rounded-2xl text-left">
            📅 Stundenplan
          </button>
  
          <button className="bg-zinc-800 p-5 rounded-2xl text-left">
            📰 News
          </button>
        </div>
      </section>
    );
  }