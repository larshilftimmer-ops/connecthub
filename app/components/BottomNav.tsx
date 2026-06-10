"use client";

import { PageType } from "../types";

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
      {/* Glow Effekt */}
      <div className="absolute inset-0 bg-[#00D9FF]/10 rounded-2xl blur-2xl"></div>
      
      {/* Main Bar */}
      <div className="relative bg-[#0F2A52]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] px-1 py-2">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item.id)}
                className="relative flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all duration-200 active:scale-95 group"
              >
                {/* Active Background */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-b from-[#00D9FF]/20 to-transparent rounded-xl"></div>
                )}
                
                {/* Icon */}
                <div
                  className={`relative text-2xl leading-none transition-all duration-200 ${
                    isActive
                      ? "scale-110 drop-shadow-[0_0_12px_rgba(0,217,255,0.8)]"
                      : "opacity-50 group-hover:opacity-100 group-hover:scale-105"
                  }`}
                >
                  {item.icon}
                </div>
                
                {/* Label */}
                <span
                  className={`relative text-[10px] font-bold leading-none transition-all duration-200 ${
                    isActive
                      ? "text-[#00D9FF]"
                      : "text-white/40 group-hover:text-white/70"
                  }`}
                >
                  {item.label}
                </span>
                
                {/* Active Dot */}
                {isActive && (
                  <div className="absolute -bottom-0.5 w-1 h-1 bg-[#00D9FF] rounded-full shadow-[0_0_8px_rgba(0,217,255,1)]"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}