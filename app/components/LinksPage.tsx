export default function LinksPage() {
    return (
      <section className="bg-zinc-900 rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-4">
          Wichtige Links
        </h2>
  
        <div className="space-y-4">
  
          <a
            href="https://www.freie-musikschule-bad-soden.de"
            target="_blank"
            className="block bg-zinc-800 p-4 rounded-xl"
          >
            🎵 Musikschule Website
          </a>
  
          <a
            href="https://www.instagram.com"
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

          <div className="bg-zinc-800 p-4 rounded-xl">
  <h3 className="font-bold mb-3">
    💼 Lexware Login
  </h3>

  <iframe
    src="https://app.lexware.de"
    className="w-full h-[600px] rounded-xl bg-white"
  />
</div>
  
        </div>
      </section>
    );
  }