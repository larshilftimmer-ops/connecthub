"use client";

import { PageType } from "../../types";

type Props = {
  activePage: PageType;
  setActivePage: (page: PageType) => void;
};

export default function BottomNav({ activePage, setActivePage }: Props) {
  const navItems = [
    { id: "dashboard" as PageType, icon: "🏠", label: "Home" },
    { id: "chat" as PageType, icon: "💬", label: "Chat" },
    { id: "calendar" as PageType, icon: "📅", label: "Kalender" },
    { id: "news" as PageType, icon: "📰", label: "News" },
    { id: "links" as PageType, icon: "🔗", label: "Links" },
  ];

  const handleClick = (page: PageType) => {
    setActivePage(page);
  };

  return (
    <div className="fixed bottom-3 left-3 right-3 z-50">
      <div className="absolute inset-0 bg-gradient-to-r from-[#00D9FF]/20 via-[#0099CC]/20 to-[#00D9FF]/20 rounded-3xl blur-xl"></div>
      
      <div className="relative bg-[#0B1E3F]/80 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl px-2 py-2.5 flex justify-around items-center">
        
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className="relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all duration-300 active:scale-90 group"
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#00D9FF]/20 to-[#0099CC]/10 rounded-2xl blur-sm"></div>
              )}
              
              <div
                className={`relative text-xl transition-all duration-300 ${
                  isActive
                  ? "scale-110 drop-shadow-[0_0_8px_rgba(0,217,255,0.6)]"
                    : "opacity-60 group-hover:opacity-100 group-hover:scale-105"
                }`}
              >
                {item.icon}
              </div>
              
              <span
                className={`relative text- font-semibold transition-all duration-300 ${
                  isActive
                  ? "text-[#00D9FF]"
                    : "text-white/50 group-hover:text-white/80"
                }`}
              >
                {item.label}
              </span>
              
              {isActive && (
                <div className="absolute -bottom-0.5 w-1 h-1 bg-[#00D9FF] rounded-full shadow-[0_0_6px_rgba(0,217,255,0.8)]"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}