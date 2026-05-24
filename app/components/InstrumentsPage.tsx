export default function InstrumentsPage() {
    return (
      <section className="bg-zinc-900 rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-4">
          Instrumente
        </h2>
  
        <p className="text-gray-400 mb-6">
          Informationen zu Instrumenten, Räumen und Ausstattung.
        </p>
  
        <div className="space-y-4">
          <div className="bg-zinc-800 p-4 rounded-xl">
            🎹 Klavier
          </div>
  
  <div className="bg-zinc-800 p-4 rounded-xl">
    🎺 Blasinstrumente
  </div>
  
          <div className="bg-zinc-800 p-4 rounded-xl">
            🎸 Gitarre
          </div>
  
          <div className="bg-zinc-800 p-4 rounded-xl">
            🥁 Schlagzeug
          </div>
  
          <div className="bg-zinc-800 p-4 rounded-xl">
            🎻 Streicher
          </div>
        </div>
      </section>
    );
  }