"use client";

type Props = {
  news?: any[];
};

export default function NewsPage({ news = [] }: Props) {
  function formatDate(dateString: string) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function getTimeAgo(dateString: string) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Heute";
    if (diffDays === 1) return "Gestern";
    if (diffDays < 7) return `vor ${diffDays} Tagen`;
    if (diffDays < 30) return `vor ${Math.floor(diffDays / 7)} Wochen`;
    return `vor ${Math.floor(diffDays / 30)} Monaten`;
  }

  return (
    <div className="w-full h-[calc(100vh-7rem)] bg-gradient-to-br from-[#0B1E3F] via-[#0D2247] to-[#0B1E3F] rounded-2xl overflow-hidden flex flex-col relative">
      
      {/* Animated Background Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00D9FF]/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#00D9FF]/5 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] bg-[#00D9FF]/3 rounded-full blur-3xl animate-pulse delay-700" />
      
      {/* Header */}
      <div className="bg-[#0F2A52]/80 backdrop-blur-xl border-b border-white/10 px-4 py-5 relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D9FF] to-[#0099FF] flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(0,217,255,0.5)]">
            📰
          </div>
          <div>
            <p className="text-xs font-bold text-[#00D9FF] mb-0.5">
              Musikschule Bad Soden
            </p>
            <h2 className="text-2xl font-bold text-white">
              News
            </h2>
          </div>
        </div>
        <p className="text-sm text-white/40">
          Aktuelles von der Musikschule
        </p>
      </div>

      {/* Stats Bar */}
      <div className="px-3 pt-3 relative z-10">
        <div className="bg-[#0F2A52]/60 backdrop-blur-xl border border-white/10 rounded-xl p-3 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00D9FF] animate-pulse" />
            <span className="text-sm text-white/60 font-medium">
              {news.length} {news.length === 1? 'Artikel' : 'Artikel'}
            </span>
          </div>
          <span className="text-xs text-white/40">
            {news.length > 0 && news[0].created_at? getTimeAgo(news[0].created_at) : 'Aktuell'}
          </span>
        </div>
      </div>

      {/* News Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 relative z-10">
        {news.length === 0? (
          <div className="bg-[#0F2A52]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <div className="text-5xl mb-3 opacity-20">📰</div>
            <p className="text-white/40 text-sm">
              Keine News vorhanden.
            </p>
          </div>
        ) : (
          news.map((item, index) => (
            <article
              key={index}
              className="bg-[#0F2A52]/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden active:scale-[0.98] transition-all duration-300 hover:border-[#00D9FF]/30 hover:shadow-[0_8px_32px_rgba(0,217,255,0.15)] group shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Featured Image Placeholder */}
              <div className="h-1 bg-gradient-to-r from-[#00D9FF] to-[#0099FF]" />
              
              <div className="p-5">
                {/* Header mit Badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="px-2.5 py-1 rounded-lg bg-[#00D9FF]/20 text-[#00D9FF] text-xs font-bold uppercase tracking-wide">
                        News
                      </div>
                      {item.created_at && (
                        <span className="text-xs text-white/40">
                          {getTimeAgo(item.created_at)}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-white break-words group-hover:text-[#00D9FF] transition-colors leading-tight">
                      {item.title}
                    </h3>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-[#00D9FF]/10 flex items-center justify-center text-xl shrink-0 group-hover:bg-[#00D9FF]/20 group-hover:shadow-[0_0_20px_rgba(0,217,255,0.3)] transition-all">
                    📢
                  </div>
                </div>

                {/* Description */}
                {item.description && (
                  <p className="text-white/60 leading-relaxed whitespace-pre-line break-words text-sm mb-4">
                    {item.description}
                  </p>
                )}

                {/* Footer mit Link */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/5">
                  {item.created_at && (
                    <span className="text-xs text-white/40">
                      {formatDate(item.created_at)}
                    </span>
                  )}

                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#00D9FF]/10 hover:bg-[#00D9FF]/20 border border-[#00D9FF]/30 hover:border-[#00D9FF]/50 text-[#00D9FF] px-4 py-2 rounded-xl font-semibold text-sm active:scale-95 transition-all hover:shadow-[0_0_20px_rgba(0,217,255,0.3)] group/btn"
                    >
                      <span>Mehr erfahren</span>
                      <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Bottom Info */}
      <div className="bg-[#0F2A52]/80 backdrop-blur-xl border-t border-white/10 p-4 relative z-10">
        <div className="bg-[#00D9FF]/10 border border-[#00D9FF]/30 rounded-xl p-3 flex items-start gap-2">
          <span className="text-[#00D9FF] text-lg">✨</span>
          <div className="flex-1">
            <p className="text-xs text-white/80 leading-relaxed">
              <span className="font-semibold text-white">Bleib informiert:</span> Folge uns auf Instagram für die neuesten Updates!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}