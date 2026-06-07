"use client";

import { useEffect, useMemo, useState } from "react";
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

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  const [registerRole, setRegisterRole] = useState("student");
  const [registerName, setRegisterName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerInstrument, setRegisterInstrument] = useState("");

  const [activePage, setActivePage] = useState("dashboard");

  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("Aktuelles");
  const [newGroup, setNewGroup] = useState("");

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);

  const [chatUsers, setChatUsers] = useState<any[]>([]);

  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventDescription, setEventDescription] = useState("");

  const [events, setEvents] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);

  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const isAdmin =
    profile?.role === "admin" ||
    user?.email === "l.c.petersen2@gmail.com" ||
    user?.email === "kartmann@musikschulebadsoden.de" ||
    user?.email === "info@musikschulebadsoden.de" ||
    user?.email === "kopp_m@musikschulebadsoden.de";

  const monthName = calendarMonth.toLocaleString("de-DE", {
    month: "long",
    year: "numeric",
  });

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7;

    const days: Array<number | null> = [];

    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    while (days.length % 7!== 0) {
      days.push(null);
    }

    return days;
  }, [calendarMonth]);

  useEffect(() => {
    checkUser();
    loadGroups();
    loadChatUsers();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadMessages();
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user]);

  useEffect(() => {
    loadNews();
  }, []);

  useEffect(() => {
    if (!selectedGroup) return;

    loadMessages();

    const channel = supabase
     .channel("messages-realtime")
     .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          loadMessages();
        }
      )
     .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedGroup]);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();

    setUser(data.user);

    if (!data.user?.email) return;

    const { data: profileData } = await supabase
     .from("profiles")
     .select("*")
     .eq("email", data.user.email)
     .single();

    setProfile(profileData);
  }

  async function register() {
    if (!email.trim()) {
      alert("Bitte E-Mail eingeben.");
      return;
    }

    if (!password.trim()) {
      alert("Bitte Passwort eingeben.");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert("Registrierung fehlgeschlagen.");
    } else {
      await supabase.from("profiles").insert({
        email,
        role: registerRole,
        name: registerName,
        phone: registerPhone,
        instrument: registerInstrument,
      });

      alert("Registrierung erfolgreich. Bitte bestätige deine E-Mail.");
    }
  }

  async function login() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Login fehlgeschlagen.");
    } else {
      await checkUser();
      setActivePage("dashboard");
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  async function loadChatUsers() {
    const { data } = await supabase
     .from("profiles")
     .select("email, name, role")
     .order("email", { ascending: true });

    if (data) {
      setChatUsers(data);
    }
  }

  async function createPrivateChat(otherEmail: string) {
    if (!user?.email) return;

    const emails = [user.email, otherEmail].sort();

    const groupName = `Privat: ${emails[0]} ↔ ${emails[1]}`;

    const exists = groups.find((group) => group.name === groupName);

    if (!exists) {
      await supabase.from("chat_groups").insert({
        name: groupName,
      });

      await loadGroups();
    }

    setSelectedGroup(groupName);
  }

  async function loadGroups() {
    const { data } = await supabase
     .from("chat_groups")
     .select("*")
     .order("created_at", {
        ascending: true,
      });

    if (data) {
      setGroups(data);
    }
  }

  async function createGroup() {
    if (!newGroup.trim()) {
      alert("Bitte Gruppennamen eingeben.");
      return;
    }

    const { error } = await supabase.from("chat_groups").insert([
      {
        name: newGroup.trim(),
      },
    ]);

    if (error) {
      alert("Gruppe konnte nicht erstellt werden.");
      return;
    }

    setNewGroup("");
    loadGroups();
  }

  async function deleteGroup(id: string) {
    const { error } = await supabase.from("chat_groups").delete().eq("id", id);

    if (error) {
      alert("Gruppe konnte nicht gelöscht werden.");
      return;
    }

    loadGroups();
  }

  async function loadMessages() {
    const { data } = await supabase
     .from("messages")
     .select("*")
     .eq("group_name", selectedGroup)
     .order("created_at", {
        ascending: false,
      });

    if (data) {
      setMessages(data);
    }
  }

  async function sendMessage() {
    if (!user) {
      alert("Nicht eingeloggt.");
      return;
    }

    if (!message.trim()) {
      alert("Bitte Nachricht eingeben.");
      return;
    }

    const { error } = await supabase.from("messages").insert([
      {
        user_email: user.email,
        content: message.trim(),
        group_name: selectedGroup,
      },
    ]);

    if (error) {
      alert("Nachricht konnte nicht gesendet werden.");
      return;
    }

    setMessage("");
    loadMessages();
  }

  async function deleteMessage(id: string) {
    const { error } = await supabase.from("messages").delete().eq("id", id);

    if (error) {
      alert("Nachricht konnte nicht gelöscht werden.");
      return;
    }

    loadMessages();
  }

  async function deleteChat(groupName: string) {
    const { error: msgError } = await supabase
     .from("messages")
     .delete()
     .eq("group_name", groupName);

    if (msgError) {
      alert("Nachrichten konnten nicht gelöscht werden.");
      return;
    }

    const { error: groupError } = await supabase
     .from("chat_groups")
     .delete()
     .eq("name", groupName);

    if (groupError) {
      alert("Chat konnte nicht gelöscht werden.");
      return;
    }

    loadGroups();
    setMessages([]);
    setSelectedGroup("");
  }

  async function createEvent() {
    if (!user) {
      alert("Nicht eingeloggt.");
      return;
    }

    if (!eventTitle.trim()) {
      alert("Bitte Titel eingeben.");
      return;
    }

    if (!eventDate) {
      alert("Bitte Datum auswählen.");
      return;
    }

    if (!eventTime) {
      alert("Bitte Uhrzeit auswählen.");
      return;
    }

    const { error } = await supabase.from("events").insert([
      {
        user_email: user.email,
        title: eventTitle,
        event_date: eventDate,
        event_time: eventTime,
        description: eventDescription,
      },
    ]);

    if (error) {
      alert("Termin konnte nicht gespeichert werden.");
      return;
    }

    alert("Termin gespeichert.");

    setEventTitle("");
    setEventDate("");
    setEventTime("");
    setEventDescription("");

    loadEvents();
  }

  async function loadEvents() {
    if (!user) return;

    const { data } = await supabase
     .from("events")
     .select("*")
     .eq("user_email", user.email)
     .order("event_date", { ascending: true });

    if (data) {
      setEvents(data);
    }
  }

  async function loadNews() {
    try {
      const response = await fetch("/api/news");
      const data = await response.json();

      setNews(data);
    } catch {
      alert("Musikschul-News konnten nicht geladen werden.");
    }
  }

  function changeMonth(amount: number) {
    setCalendarMonth(
      new Date(
        calendarMonth.getFullYear(),
        calendarMonth.getMonth() + amount,
        1
      )
    );
  }

  function getDateString(day: number) {
    const year = calendarMonth.getFullYear();
    const month = String(calendarMonth.getMonth() + 1).padStart(2, "0");
    const date = String(day).padStart(2, "0");

    return `${year}-${month}-${date}`;
  }

  function getEventsForDay(day: number) {
    const dateString = getDateString(day);

    return events.filter((event) => event.event_date === dateString);
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#0B1E3F] via-[#0D2247] to-[#0B1E3F] text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        {/* Animated Background Glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00D9FF]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00D9FF]/5 rounded-full blur-3xl animate-pulse delay-1000" />
        
        {/* Musiknoten */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[15%] left-[10%] text-[#00D9FF]/10 text-6xl animate-pulse">♪</div>
          <div className="absolute top-[65%] right-[12%] text-[#00D9FF]/10 text-8xl animate-pulse delay-300">♫</div>
          <div className="absolute bottom-[20%] left-[20%] text-[#00D9FF]/10 text-5xl animate-pulse delay-700">♬</div>
        </div>

        <div className="w-full max-w-md bg-[#0F2A52]/60 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10 p-6 sm:p-8 relative z-10">
          <div className="mb-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00D9FF] to-[#0099FF] flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(0,217,255,0.5)] mx-auto mb-4">
              🎵
            </div>
            <p className="text-sm font-semibold text-[#00D9FF] mb-2">
              Freie Musikschule in Bad Soden e.V.
            </p>

            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
              Bad Sodify
            </h1>

            <p className="text-white/60">Login & Registrierung</p>
          </div>

          <input
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 mb-4 outline-none focus:ring-2 focus:ring-[#00D9FF] focus:bg-white/10 text-white placeholder:text-white/30 transition-all"
          />

          <input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 mb-6 outline-none focus:ring-2 focus:ring-[#00D9FF] focus:bg-white/10 text-white placeholder:text-white/30 transition-all"
          />

          <button
            onClick={login}
            className="w-full bg-[#00D9FF] hover:bg-[#00D9FF]/90 transition text-[#0B1E3F] font-bold p-4 rounded-xl mb-4 shadow-[0_0_30px_rgba(0,217,255,0.3)] hover:shadow-[0_0_40px_rgba(0,217,255,0.5)] active:scale-95"
          >
            Einloggen
          </button>

          <div className="my-6 border-t border-white/10" />

          <p className="text-sm font-semibold text-white/70 mb-4">
            Neu registrieren
          </p>

          <select
            value={registerRole}
            onChange={(e) => setRegisterRole(e.target.value)}
            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 mb-4 outline-none focus:ring-2 focus:ring-[#00D9FF] focus:bg-white/10 text-white transition-all"
          >
            <option value="student" className="bg-[#0F2A52]">Schüler</option>
            <option value="teacher" className="bg-[#0F2A52]">Lehrer</option>
            <option value="parent" className="bg-[#0F2A52]">Eltern</option>
          </select>

          <input
            type="text"
            placeholder="Name"
            value={registerName}
            onChange={(e) => setRegisterName(e.target.value)}
            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 mb-4 outline-none focus:ring-2 focus:ring-[#00D9FF] focus:bg-white/10 text-white placeholder:text-white/30 transition-all"
          />

          <input
            type="text"
            placeholder="Telefon"
            value={registerPhone}
            onChange={(e) => setRegisterPhone(e.target.value)}
            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 mb-4 outline-none focus:ring-2 focus:ring-[#00D9FF] focus:bg-white/10 text-white placeholder:text-white/30 transition-all"
          />

          <input
            type="text"
            placeholder="Instrument"
            value={registerInstrument}
            onChange={(e) => setRegisterInstrument(e.target.value)}
            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 mb-4 outline-none focus:ring-2 focus:ring-[#00D9FF] focus:bg-white/10 text-white placeholder:text-white/30 transition-all"
          />

          <button
            onClick={register}
            className="w-full bg-white/10 hover:bg-white/15 border border-[#00D9FF]/30 hover:border-[#00D9FF]/50 transition text-white font-semibold p-4 rounded-xl active:scale-95"
          >
            Registrieren
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0B1E3F] via-[#0D2247] to-[#0B1E3F] text-white p-4 sm:p-6 pb-28 relative">
      {/* Animated Background Glow */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#00D9FF]/5 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-[#00D9FF]/5 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#00D9FF]">
              Musikschule Bad Soden
            </p>

            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Bad Sodify
            </h1>
          </div>

          <div className="bg-[#0F2A52]/60 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <p className="text-sm text-white/60">Rolle</p>

            <p className="font-semibold capitalize text-[#00D9FF]">
              {profile?.role || "Benutzer"}
            </p>
          </div>
        </div>

        {activePage === "dashboard" && (
          <Dashboard
            user={user}
            logout={logout}
            setActivePage={setActivePage}
            isAdmin={isAdmin}
          />
        )}

        {activePage === "chat" && (
          <ChatPage
            groups={groups}
            selectedGroup={selectedGroup}
            setSelectedGroup={setSelectedGroup}
            isAdmin={isAdmin}
            deleteGroup={deleteGroup}
            newGroup={newGroup}
            setNewGroup={setNewGroup}
            createGroup={createGroup}
            message={message}
            setMessage={setMessage}
            sendMessage={sendMessage}
            messages={messages}
            chatUsers={chatUsers}
            currentUser={user}
            deleteMessage={deleteMessage}
            deleteChat={deleteChat}
          />
        )}

        {activePage === "calendar" && (
          <CalendarPage
            monthName={monthName}
            calendarDays={calendarDays}
            changeMonth={changeMonth}
            setCalendarMonth={setCalendarMonth}
            getDateString={getDateString}
            getEventsForDay={getEventsForDay}
            setEventDate={setEventDate}
            eventTitle={eventTitle}
            setEventTitle={setEventTitle}
            eventDate={eventDate}
            eventTime={eventTime}
            setEventTime={setEventTime}
            eventDescription={eventDescription}
            setEventDescription={setEventDescription}
            createEvent={createEvent}
            events={events}
          />
        )}

        {activePage === "admin" && isAdmin && <AdminPanel />}

        {activePage === "profile" && <ProfilePage user={user} />}

        {activePage === "courses" && <CoursesPage />}

        {activePage === "schedule" && <SchedulePage />}

        {activePage === "instruments" && <InstrumentsPage />}

        {activePage === "news" && <NewsPage news={news} />}

        {activePage === "links" && <LinksPage />}

        {activePage === "files" && <FilesPage userRole={profile?.role || "student"} />}
      </div>

      <BottomNav setActivePage={setActivePage} />
    </main>
  );
}