"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import Dashboard from "./components/Dashboard";
import BottomNav from "./components/BottomNav";
import ChatPage from "./components/ChatPage";
import CalendarPage from "./components/CalendarPage";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState<any>(null);
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

  const isAdmin = true;

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
      <div className="max-w-7xl mx-auto">
      {activePage === "dashboard" && (
  <Dashboard
    user={user}
    logout={logout}
    setActivePage={setActivePage}
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

{activePage === "news" && (
  <section className="bg-zinc-900 rounded-2xl p-6">
    <h2 className="text-3xl font-bold mb-6">
      Musikschule News
    </h2>

    <div className="space-y-4">
      {news.map((item, index) => (
        <div
          key={index}
          className="bg-zinc-800 p-4 rounded-xl"
        >
          <h3 className="text-xl font-bold">
            {item.title}
          </h3>
        </div>
      ))}
    </div>
  </section>
)}

        {activePage === "links" && (
          <section className="bg-zinc-900 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">
              Externe Links
            </h2>

            <p className="text-gray-400">
              Link-System kommt als Nächstes.
            </p>
          </section>
        )}

   </div>
 </main>
        );
      }