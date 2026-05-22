"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";

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
        <div className="flex justify-between items-center mb-8">
          <div>
     
          <div className="flex items-center gap-4">
  <img
    src="/icon-192.png"
    alt="Logo"
    className="w-16 h-16 rounded-2xl"
  />

  <div>
    <h1 className="text-3xl font-bold">
      Freie Musikschule
    </h1>

    <p className="text-gray-400">
      Bad Soden e.V.
    </p>
  </div>
</div>

          {activePage === "dashboard" && (
<div className="grid grid-cols-2 gap-4 mt-8">

<button
  onClick={() => setActivePage("profile")}
  className="bg-zinc-900 p-5 rounded-3xl text-left"
>
<div className="text-3xl mb-2">👤</div>
<h3 className="font-bold">Profil</h3>
<p className="text-gray-400 text-sm">Daten bearbeiten</p>
</button>

<button
  onClick={() => setActivePage("courses")}
  className="bg-zinc-900 p-5 rounded-3xl text-left"
>
<div className="text-3xl mb-2">🎵</div>
<h3 className="font-bold">Kurse</h3>
<p className="text-gray-400 text-sm">Musikkurse ansehen</p>
</button>

<button
  onClick={() => setActivePage("schedule")}
  className="bg-zinc-900 p-5 rounded-3xl text-left"
>
<div className="text-3xl mb-2">📅</div>
<h3 className="font-bold">Stundenplan</h3>
<p className="text-gray-400 text-sm">Unterricht & Termine</p>
</button>

<button
  onClick={() => setActivePage("instruments")}
  className="bg-zinc-900 p-5 rounded-3xl text-left"
>
<div className="text-3xl mb-2">🎹</div>
<h3 className="font-bold">Instrumente</h3>
<p className="text-gray-400 text-sm">Infos & Räume</p>
</button>

</div>
)}

            <p className="text-gray-400">
              {user.email}
            </p>

            <p className="text-green-400">
              Rolle: admin
            </p>
            <button
            onClick={logout}
            className="bg-red-600 px-4 py-2 rounded-xl mt-12"
          >
            Logout
          </button>
          </div>

          
        </div>

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

        {activePage === "chat" && (
          <section className="grid md:grid-cols-4 gap-6">
            <div className="bg-zinc-900 p-4 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4">
                Gruppen
              </h2>

              <div className="space-y-2 mb-6">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="flex gap-2"
                  >
                    <button
                      onClick={() =>
                        setSelectedGroup(group.name)
                      }
                      className={`flex-1 p-3 rounded-xl text-left ${
                        selectedGroup === group.name
                          ? "bg-blue-600"
                          : "bg-zinc-800"
                      }`}
                    >
                      {group.name}
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() =>
                          deleteGroup(group.id)
                        }
                        className="bg-red-600 px-3 rounded-xl"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {isAdmin && (
                <div>
                  <input
                    value={newGroup}
                    onChange={(e) =>
                      setNewGroup(
                        e.target.value
                      )
                    }
                    placeholder="Neue Gruppe"
                    className="w-full p-3 rounded-xl bg-zinc-800 mb-3"
                  />

                  <button
                    onClick={createGroup}
                    className="w-full bg-green-600 p-3 rounded-xl"
                  >
                    Gruppe erstellen
                  </button>
                </div>
              )}
            </div>

            <div className="md:col-span-3 bg-zinc-900 p-6 rounded-2xl">
              <h2 className="text-3xl font-bold mb-6">
                {selectedGroup}
              </h2>

              <div className="flex gap-2 mb-6">
                <input
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value)
                  }
                  placeholder="Nachricht schreiben..."
                  className="flex-1 p-4 rounded-xl bg-zinc-800"
                />

                <button
                  onClick={sendMessage}
                  className="bg-blue-600 px-6 rounded-xl"
                >
                  Senden
                </button>
              </div>

              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="bg-zinc-800 p-4 rounded-xl"
                  >
                    <p className="text-sm text-gray-400">
                      {msg.user_email}
                    </p>

                    <p className="text-lg">
                      {msg.content}
                    </p>

                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(
                        msg.created_at
                      ).toLocaleString("de-DE")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activePage === "calendar" && (
          <section className="bg-zinc-900 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">
                Mein Kalender
              </h2>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    changeMonth(-1)
                  }
                  className="bg-zinc-800 px-4 py-2 rounded-xl"
                >
                  ←
                </button>

                <button
                  onClick={() =>
                    setCalendarMonth(new Date())
                  }
                  className="bg-blue-600 px-4 py-2 rounded-xl"
                >
                  Heute
                </button>

                <button
                  onClick={() =>
                    changeMonth(1)
                  }
                  className="bg-zinc-800 px-4 py-2 rounded-xl"
                >
                  →
                </button>
              </div>
            </div>

            <h3 className="text-2xl font-bold mb-6 capitalize">
              {monthName}
            </h3>

            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-gray-400">
              <div>Mo</div>
              <div>Di</div>
              <div>Mi</div>
              <div>Do</div>
              <div>Fr</div>
              <div>Sa</div>
              <div>So</div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-8">
              {calendarDays.map((day, index) => {
                if (!day) {
                  return (
                    <div
                      key={index}
                      className="min-h-24 bg-zinc-800 rounded-xl"
                    />
                  );
                }

                const dayEvents =
                  getEventsForDay(day);

                const dateString =
                  getDateString(day);

                return (
                  <button
                    key={dateString}
                    onClick={() =>
                      setEventDate(dateString)
                    }
                    className="min-h-24 bg-zinc-800 rounded-xl p-2 text-left hover:bg-zinc-700"
                  >
                    <p className="font-bold mb-2">
                      {day}
                    </p>

                    <div className="space-y-1">
                      {dayEvents
                        .slice(0, 2)
                        .map((event) => (
                          <div
                            key={event.id}
                            className="bg-blue-600 text-xs px-2 py-1 rounded truncate"
                          >
                            {event.event_time}{" "}
                            {event.title}
                          </div>
                        ))}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-zinc-800 p-4 rounded-2xl">
                <h3 className="text-xl font-bold mb-4">
                  Termin hinzufügen
                </h3>

                <input
                  value={eventTitle}
                  onChange={(e) =>
                    setEventTitle(
                      e.target.value
                    )
                  }
                  placeholder="Titel"
                  className="w-full p-4 rounded-xl bg-zinc-700 mb-4"
                />

                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) =>
                    setEventDate(
                      e.target.value
                    )
                  }
                  className="w-full p-4 rounded-xl bg-zinc-700 mb-4"
                />

                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) =>
                    setEventTime(
                      e.target.value
                    )
                  }
                  className="w-full p-4 rounded-xl bg-zinc-700 mb-4"
                />

                <textarea
                  value={eventDescription}
                  onChange={(e) =>
                    setEventDescription(
                      e.target.value
                    )
                  }
                  placeholder="Beschreibung"
                  className="w-full p-4 rounded-xl bg-zinc-700 mb-4 min-h-28"
                />

                <button
                  onClick={createEvent}
                  className="w-full bg-green-600 p-4 rounded-xl"
                >
                  Termin hinzufügen
                </button>
              </div>

              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="bg-zinc-800 p-4 rounded-xl"
                  >
                    <h3 className="text-xl font-bold">
                      {event.title}
                    </h3>

                    <p className="text-gray-400 mb-2">
                      {event.event_date} •{" "}
                      {event.event_time}
                    </p>

                    <p>
                      {event.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
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