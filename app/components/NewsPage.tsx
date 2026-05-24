ype Props = {
    news: any[];
  };
  
  export default function NewsPage({ news }: Props) {
    return (
      <section className="bg-zinc-900 rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-4">
          News
        </h2>
  
        <p className="text-gray-400 mb-6">
          Aktuelles von der Musikschule.
        </p>
  
        <div className="space-y-4">
          {news.map((item, index) => (
            <div
              key={index}
              className="bg-zinc-800 p-4 rounded-xl"
            >
              <h3 className="font-bold">
                {item.title}
              </h3>
            </div>
          ))}
        </div>
      </section>
    );
  }