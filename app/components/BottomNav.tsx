type Props = {
    setActivePage: (page: string) => void;
  };
  
  export default function BottomNav({
    setActivePage,
  }: Props) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-3 flex justify-around">
  
        <button
          onClick={() => setActivePage("dashboard")}
          className="flex flex-col items-center text-xs text-gray-300 hover:text-white transition"
        >
          🏠
          <span>Home</span>
        </button>
  
        <button
          onClick={() => setActivePage("chat")}
          className="flex flex-col items-center text-sm"
        >
          💬
          <span>Chat</span>
        </button>
  
        <button
          onClick={() => setActivePage("calendar")}
          className="flex flex-col items-center text-sm"
        >
          📅
          <span>Kalender</span>
        </button>
  
        <button
          onClick={() => setActivePage("news")}
          className="flex flex-col items-center text-sm"
        >
          📰
          <span>News</span>
        </button>
  
        <button
          onClick={() => setActivePage("links")}
          className="flex flex-col items-center text-sm"
        >
          🔗
          <span>Links</span>
        </button>
      </div>
    );
  }