"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";
import { PageType } from "./types";
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

export default function Home() {
  const { user, loading: authLoading, login, logout, register } = useAuth();
  const { profile, loading: profileLoading } = useProfile(user?.email);

  const [activePage, setActivePage] = useState<PageType>("dashboard");

  // CHAT STATES
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [chatUsers, setChatUsers] = useState<any[]>([]);

  const isAdmin =
    profile?.role === "admin" ||
    ["l.c.petersen2@gmail.com", "kartmann@musikschulebadsoden.de", "info@musikschulebadsoden.de", "kopp_m@musikschulebadsoden.de"].includes(user?.email || "");

  // FETCH GROUPS - DSGVO: Nur eigene Chats via RLS
  const fetchGroups = useCallback(async () => {
    if (!user?.email) return;

    const { data, error } = await supabase
     .from("conversations")
     .select(`
        *,
        conversation_members!inner(user_email)
      `)
     .eq("conversation_members.user_email", user.email);

    if (!error) setGroups(data || []);
  }, [user?.email]);

  // FETCH MESSAGES
  const fetchMessages = useCallback(async () => {
    if (!selectedGroup) {
      setMessages([]);
      return;
    }

    const group = groups.find(g => g.name === selectedGroup);
    if (!group) return;

    const { data } = await supabase
     .from("messages")
     .select("*")
     .eq("conversation_id", group.id)
     .order("created_at", { ascending: true });

    setMessages(data || []);
  }, [selectedGroup, groups]);

  // FETCH USERS
  const fetchUsers = useCallback(async () => {
    const { data } = await supabase
     .from("profiles")
     .select("email, name");
    setChatUsers(data || []);
  }, []);

  useEffect(() => {
    if (user?.email) {
      fetchGroups();
      fetchUsers();
    }
  }, [user?.email, fetchGroups, fetchUsers]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!message.trim() ||!selectedGroup ||!user?.email) return;

    const group = groups.find(g => g.name === selectedGroup);
    if (!group) return;

    await supabase.from("messages").insert({
      conversation_id: group.id,
      user_email: user.email,
      content: message.trim()
    });

    setMessage("");
    fetchMessages();
  };

  // DELETE MESSAGE - DSGVO: Löschrecht
  const deleteMessage = async (id: string) => {
    await supabase.from("messages").delete().eq("id", id);
    fetchMessages();
  };

  // DELETE GROUP - DSGVO: Löschrecht
  const deleteGroup = async (id: string) => {
    await supabase.from("conversations").delete().eq("id", id);
    fetchGroups();
    if (groups.find(g => g.id === id)?.name === selectedGroup) {
      setSelectedGroup("");
    }
  };

  // DELETE CHAT - DSGVO: Komplettlöschung
  const deleteChat = async (groupName: string) => {
    const group = groups.find(g => g.name === groupName);
    if (!group) return;

    await supabase.from("messages").delete().eq("conversation_id", group.id);
    await supabase.from("conversation_members").delete().eq("conversation_id", group.id);
    await supabase.from("conversations").delete().eq("id", group.id);

    fetchGroups();
    setSelectedGroup("");
  };

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
        {/* Header */}
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
            setActivePage={(page) => setActivePage(page as PageType)}
            isAdmin={isAdmin}
          />
        )}

        {activePage === "chat" && (
          <ChatPage
            user={user}
            groups={groups}
            selectedGroup={selectedGroup}
            setSelectedGroup={setSelectedGroup}
            isAdmin={isAdmin}
            deleteGroup={deleteGroup}
            newGroup={newGroup}
            setNewGroup={setNewGroup}
            createGroup={() => {}} // Überschrieben in ChatPage
            message={message}
            setMessage={setMessage}
            sendMessage={sendMessage}
            messages={messages}
            chatUsers={chatUsers}
            currentUser={user}
            deleteMessage={deleteMessage}
            deleteChat={deleteChat}
            refreshGroups={fetchGroups}
          />
        )}
        {activePage === "calendar" && <CalendarPage />}
        {activePage === "admin" && isAdmin && <AdminPanel />}
        {activePage === "profile" && <ProfilePage />}
        {activePage === "courses" && <CoursesPage />}
        {activePage === "schedule" && <SchedulePage />}
        {activePage === "instruments" && <InstrumentsPage />}
        {activePage === "news" && <NewsPage />}
        {activePage === "links" && <LinksPage />}
        {activePage === "files" && <FilesPage />}
        {activePage === "booking" && <BookingPage />}
      </div>

      <BottomNav activePage={activePage} setActivePage={setActivePage} />
    </main>
  );
}