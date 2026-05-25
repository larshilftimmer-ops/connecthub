export default function LinksPage() {
    return (
      <section className="bg-zinc-900 rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-4">
          Wichtige Links
        </h2>
  
        <div className="space-y-4">
  
          <a
            href="https://www.musikschulebadsoden.de"
            target="_blank"
            className="block bg-zinc-800 p-4 rounded-xl"
          >
            🎵 Musikschule Website
          </a>
  
          <a
            href="https://www.instagram.com/musikschulebadsoden/"
            target="_blank"
            className="block bg-zinc-800 p-4 rounded-xl"
          >
            📸 Instagram
          </a>
  
          <a
            href="https://www.youtube.com"
            target="_blank"
            className="block bg-zinc-800 p-4 rounded-xl"
          >
            ▶️ YouTube
          </a>

          <a
  href="https://app.lexware.de"
  target="_blank"
  className="block bg-zinc-800 p-4 rounded-xl"
>
  💼 Lexware Login öffnen
</a>

<a
  href="https://app.edtime.de/login"
  target="_blank"
  className="block bg-zinc-800 p-4 rounded-xl"
>
  🕒 edTime Login öffnen
</a>

        </div>
      </section>
    );
  }