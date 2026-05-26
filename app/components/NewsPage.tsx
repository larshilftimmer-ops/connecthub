type Props = {
  news: any[];
};

export default function NewsPage({ news }: Props) {
  return (
    <section className="w-full max-w-full overflow-x-hidden space-y-6 text-zinc-900">
      <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm p-5 sm:p-6">
        <p className="text-sm font-semibold text-[#d8a928] mb-2">
          Musikschule Bad Soden
        </p>

        <h2 className="text-2xl sm:text-3xl font-bold text-[#7a1f1f]">
          News
        </h2>

        <p className="text-zinc-500 mt-2">
          Aktuelles von der Musikschule.
        </p>
      </div>

      <div className="space-y-4">
        {news.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm p-6">
            <p className="text-zinc-500">
              Keine News vorhanden.
            </p>
          </div>
        ) : (
          news.map((item, index) => (
            <article
              key={index}
              className="bg-white border border-zinc-200 rounded-3xl shadow-sm p-5 sm:p-6 overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs font-semibold text-[#d8a928] uppercase tracking-wide mb-2">
                    News
                  </p>

                  <h3 className="text-lg sm:text-xl font-bold text-[#7a1f1f] break-words">
                    {item.title}
                  </h3>
                </div>

                <div className="bg-[#f7f3ea] text-[#7a1f1f] px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                  Musikschule
                </div>
              </div>

              {item.description && (
                <p className="text-zinc-700 leading-7 whitespace-pre-line break-words">
                  {item.description}
                </p>
              )}

              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-5 bg-[#7a1f1f] hover:bg-[#651919] transition text-white px-5 py-3 rounded-xl font-semibold"
                >
                  Mehr erfahren
                </a>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}