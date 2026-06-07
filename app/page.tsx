"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";
import Dashboard from "./components/Dashboard";
import BottomNav from "./components/BottomNav";
import ChatPage from "./components/ChatPage";
import CalendarPage from "./components/CalendarPage";
import NewsPage from "./components/NewsPage";
import LinksPage from "./components/LinksPage";
import ProfilePage from "./components/ProfilePage";
import CoursesPage from "./components/CoursePage";
import SchedulePage from "./components/SchedulePage";
import InstrumentsPage from "./components/InstrumentsPage";
import AdminPanel from "./components/AdminPanel";
import FilesPage from "./components/FilesPage";
import BookingPage from "./components/BookingPage";
import LoginPage from "./components/LoginPage";
import { useAuth } from "./hooks/useAuth";
import { useProfile } from "./hooks/useProfile";

// Types
export type PageType = 
  | "dashboard" 
  | "chat" 
  | "calendar" 
  | "admin" 
  | "profile" 
  | "courses" 
  | "schedule" 
  | "instruments" 
  | "news" 
  | "links" 
  | "files" 
  | "booking";

export default function Home() {
  const { user, loading: authLoading, login, logout, register } = useAuth();
  const { profile, loading: profileLoading } = useProfile(user?.email);
  
  const [activePage, setActivePage] = useState<PageType>("dashboard");

  const isAdmin = 
    profile?.role === "admin" ||
    ["l.c.petersen2@gmail.com", "kartmann@musikschulebadsoden.de", "info@musikschulebadsoden.de", "kopp_m@musikschulebadsoden.de"].includes(user?.email || "");

  // Loading State
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B1E3F] via-[#0D2247] to-[#0B1E3F] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00D9FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Lade Bad Sodify Music...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <LoginPage onLogin={login} onRegister={register} />;
  }

  // Logged in - Main App
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0B1E3F] via-[#0D2247] to-[#0B1E3F] text-white p-4 sm:p-6 pb-28 relative">
      {/* Background Glow */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#00D9FF]/5 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-[#00D9FF]/5 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header - NUR EINMAL! */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-[#0F2A52]/60 backdrop-blur-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#00D9FF]/20 flex items-center justify-center">
                <span className="text-2xl">🎵</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#00D9FF]">WILLKOMMEN ZURÜCK</p>
                <h2 className="text-xl font-bold text-white">Bad Sodify Music</h2>
                <p className="text-white/60 text-sm">Freie Musikschule in Bad Soden e.V.</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all active:scale-95"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Pages */}
        {activePage === "dashboard" && (
          <Dashboard
            user={user}
            profile={profile}
            logout={logout}
            setActivePage={setActivePage}
            isAdmin={isAdmin}
          />
        )}

        {activePage === "chat" && <ChatPage user={user} />}
        {activePage === "calendar" && <CalendarPage user={user} />}
        {activePage === "admin" && isAdmin && <AdminPanel />}
        {activePage === "profile" && <ProfilePage user={user} profile={profile} />}
        {activePage === "courses" && <CoursesPage />}
        {activePage === "schedule" && <SchedulePage user={user} />}
        {activePage === "instruments" && <InstrumentsPage />}
        {activePage === "news" && <NewsPage />}
        {activePage === "links" && <LinksPage />}
        {activePage === "files" && <FilesPage userRole={profile?.role || "student"} />}
        {activePage === "booking" && <BookingPage user={user} />}
      </div>

      <BottomNav activePage={activePage} setActivePage={setActivePage} />
    </main>
  );
}