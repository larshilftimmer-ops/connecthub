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

    const daysInMonth = new Date(
      year,
      month + 1,
      0
    ).getDate();

    const startOffset =
      (firstDay.getDay() + 6) % 7;

    const days: Array<number | null> = [];

    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  }, [calendarMonth]);

  useEffect(() => {
    checkUser();
    loadGroups();
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

  async function checkUser() {
    const { data } = await supabase.auth.getUser();

    setUser(data.user);

    const { data: profileData } = await supabase
  .from("profiles")
  .select("*")
  .eq("email", data.user?.email)
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
    
      alert("Registrierung erfolgreich.");
    }
  }

  async function login() {
    const { error } =
      await supabase.auth.signInWithPassword({
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

    const { error } = await supabase
      .from("chat_groups")
      .insert([
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
    const confirmDelete = confirm(
      "Gruppe wirklich löschen?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("chat_groups")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Gruppe konnte nicht gelöscht werden.");
      return;
    }

    alert("Gruppe gelöscht.");
    loadGroups();
  }

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

    const { error } = await supabase
      .from("messages")
      .insert([
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

    const { error } = await supabase
      .from("events")
      .insert([
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

    if (data) setEvents(data);
  }

  async function loadNews() {
    try {
      const response = await fetch("/api/news");
  
      const data = await response.json();
  
      setNews(data);
    } catch {
      alert(
        "Musikschul-News konnten nicht geladen werden."
      );
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

    const month = String(
      calendarMonth.getMonth() + 1
    ).padStart(2, "0");

    const date = String(day).padStart(2, "0");

    return `${year}-${month}-${date}`;
  }

  function getEventsForDay(day: number) {
    const dateString = getDateString(day);

    return events.filter(
      (event) => event.event_date === dateString
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="bg-zinc-900 p-8 rounded-2xl w-full max-w-md">
          <h1 className="text-5xl font-bold mb-2">
            ConnectHub
          </h1>

          <p className="text-gray-400 mb-8">
            Login & Registrierung
          </p>

          <input
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full p-4 rounded-xl bg-zinc-800 mb-4"
          />

          <input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full p-4 rounded-xl bg-zinc-800 mb-6"
          />

          <button
            onClick={login}
            className="w-full bg-blue-600 p-4 rounded-xl mb-4"
          >
            Einloggen
          </button>

          <select
  value={registerRole}
  onChange={(e) => setRegisterRole(e.target.value)}
  className="w-full p-4 rounded-xl bg-zinc-800 mb-4"
>
  <option value="student">Schüler</option>
  <option value="teacher">Lehrer</option>
  <option value="parent">Eltern</option>
</select>

<input
  type="text"
  placeholder="Name"
  value={registerName}
  onChange={(e) => setRegisterName(e.target.value)}
  className="w-full bg-zinc-800 p-4 rounded-xl mb-4"
/>

<input
  type="text"
  placeholder="Telefon"
  value={registerPhone}
  onChange={(e) => setRegisterPhone(e.target.value)}
  className="w-full bg-zinc-800 p-4 rounded-xl mb-4"
/>

<input
  type="text"
  placeholder="Instrument"
  value={registerInstrument}
  onChange={(e) => setRegisterInstrument(e.target.value)}
  className="w-full bg-zinc-800 p-4 rounded-xl mb-4"
/>

          <button
            onClick={register}
            className="w-full bg-green-600 p-4 rounded-xl"
          >
            Registrieren
          </button>
        </div>
      </main>
    );
  }

  return (
    
    <main className="min-h-screen bg-black text-white p-6 pb-28">

      <p className="text-sm text-gray-400 mb-4">
  Rolle: {profile?.role}
</p>

      <div className="max-w-7xl mx-auto">
      {activePage === "dashboard" && (
  <Dashboard
    user={user}
    logout={logout}
    setActivePage={setActivePage}
    isAdmin={isAdmin}
  />
)}

<BottomNav setActivePage={setActivePage} />

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

{activePage === "admin" && isAdmin && (
  <AdminPanel />
)}

{activePage === "profile" && (
  <ProfilePage user={user} />
)}

{activePage === "courses" && (
  <CoursesPage />
)}

{activePage === "Schedule" && (
  <SchedulePage />
)}

{activePage === "instruments" && (
  <InstrumentsPage />
)}

{activePage === "news" && (
  <NewsPage news={news} />
)}
{activePage === "links" && (
  <LinksPage />
)}
{activePage === "files" && (
  <FilesPage userRole={profile?.role || "student"} />
)}

  </div>
  </main>
  );
  }