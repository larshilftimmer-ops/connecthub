"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import { supabase } from "../supabase";

type Event = {
  id: string;
  title: string;
  event_date: string;
  event_time: string;
  description: string;
  user_email: string;
  created_at: string;
  participants?: string[];
};

type ChatUser = {
  email: string;
  name?: string;
};

export default function CalendarPage() {
  const { user } = useAuth();
  const { profile } = useProfile(user?.email);

  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [showEventModal, setShowEventModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState<string | null>(null);

  // Form State
  const [eventTitle, setEventTitle] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchUser, setSearchUser] = useState("");

  const isAdmin =
    profile?.role === "admin" ||
    ["l.c.petersen2@gmail.com", "kartmann@musikschulebadsoden.de", "info@musikschulebadsoden.de", "kopp_m@musikschulebadsoden.de"].includes(user?.email || "");

  const today = new Date().toISOString().split('T')[0];

  // Events + Teilnehmer laden
  useEffect(() => {
    if (!user?.email) return;

    const fetchEvents = async () => {
      // 1. Events holen - RLS filtert automatisch nach DSGVO
      const { data: eventsData, error } = await supabase
       .from('events')
       .select('*')
       .order('event_date', { ascending: true })
       .order('event_time', { ascending: true });

      if (error) return;

      // 2. Teilnehmer für jedes Event laden
      const eventsWithParticipants = await Promise.all(
        (eventsData || []).map(async (event) => {
          const { data: parts } = await supabase
           .from('event_participants')
           .select('user_email')
           .eq('event_id', event.id);

          return {
           ...event,
            participants: parts?.map(p => p.user_email) || []
          };
        })
      );

      setEvents(eventsWithParticipants);
    };

    fetchEvents();

    const channel = supabase
     .channel('events')
     .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, fetchEvents)
     .on('postgres_changes', { event: '*', schema: 'public', table: 'event_participants' }, fetchEvents)
     .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.email]);

  // User-Liste für Teilen laden
  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase
       .from('profiles')
       .select('email, name')
       .neq('email', user?.email);
      setChatUsers(data || []);
    };
    if (user?.email) fetchUsers();
  }, [user?.email]);

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  };

  const getCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay() === 0? 6 : firstDay.getDay() - 1;

    const days: Array<number | null> = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const changeMonth = (amount: number) => {
    const newDate = new Date(calendarMonth);
    newDate.setMonth(newDate.getMonth() + amount);
    setCalendarMonth(newDate);
  };

  const getDateString = (day: number) => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth() + 1;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getEventsForDay = (day: number) => {
    const dateString = getDateString(day);
    return events.filter(e => e.event_date === dateString);
  };

  const openCreateModal = (day: number) => {
    setSelectedDate(getDateString(day));
    setEditingEvent(null);
    setEventTitle("");
    setEventTime("");
    setEventDescription("");
    setSelectedUsers([]);
    setShowEventModal(true);
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setSelectedDate(event.event_date);
    setEventTitle(event.title);
    setEventTime(event.event_time);
    setEventDescription(event.description || "");
    setSelectedUsers(event.participants || []);
    setShowEventModal(true);
  };

  const createOrUpdateEvent = async () => {
    if (!eventTitle.trim() ||!selectedDate ||!eventTime ||!user?.email) return;

    try {
      let eventId = editingEvent?.id;

      if (editingEvent) {
        // Update
        const { error } = await supabase
         .from('events')
         .update({
            title: eventTitle.trim(),
            event_date: selectedDate,
            event_time: eventTime,
            description: eventDescription.trim(),
          })
         .eq('id', editingEvent.id);

        if (error) throw error;
      } else {
        // Create
        const { data, error } = await supabase
         .from('events')
         .insert({
            title: eventTitle.trim(),
            event_date: selectedDate,
            event_time: eventTime,
            description: eventDescription.trim(),
            user_email: user.email,
          })
         .select()
         .single();

        if (error) throw error;
        eventId = data.id;
      }

      // Teilnehmer aktualisieren
      if (eventId) {
        // Alte löschen
        await supabase
         .from('event_participants')
         .delete()
         .eq('event_id', eventId);

        // Neue hinzufügen
        if (selectedUsers.length > 0) {
          await supabase
           .from('event_participants')
           .insert(
              selectedUsers.map(email => ({
                event_id: eventId,
                user_email: email,
                added_by: user.email
              }))
            );
        }
      }

      setShowEventModal(false);
    } catch (err: any) {
      alert("Fehler: " + err.message);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Termin wirklich löschen?\n\nDSGVO: Wird unwiderruflich gelöscht.")) return;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) alert("Fehler: " + error.message);
  };

  const toggleUserShare = (email: string) => {
    setSelectedUsers(prev =>
      prev.includes(email)
       ? prev.filter(e => e!== email)
        : [...prev, email]
    );
  };

  const exportMyData = async () => {
    if (!user?.email) return;
    const { data } = await supabase
     .from('events')
     .select('*, event_participants(user_email)')
     .eq('user_email', user.email);

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meine-termine-${user.email}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const canModifyEvent = (event: Event) => {
    return event.user_email === user?.email || isAdmin;
  };

  const filteredUsers = chatUsers.filter(u =>
    `${u.name} ${u.email}`.toLowerCase().includes(searchUser.toLowerCase())
  );

  const monthName = getMonthName(calendarMonth);
  const calendarDays = getCalendarDays(calendarMonth);

  return (
    <div className="w-full h-[calc(100vh-7rem)] bg-gradient-to-br from-[#0B1E3F] via-[#0D2247] to-[#0B1E3F] rounded-2xl overflow-hidden flex flex-col relative">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00D9FF]/5 rounded-full blur-3xl animate-pulse" />

      {/* Header */}
      <div className="bg-[#0F2A52]/80 backdrop-blur-xl border-b border-white/10 px-4 py-4 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <span className="text-[#00D9FF]">📅</span> Mein Kalender
            </h2>
            <p className="text-sm text-white/40 capitalize font-medium">{monthName}</p>
          </div>

          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => changeMonth(-1)}
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00D9FF]/30 px-4 py-2.5 rounded-xl font-semibold text-white active:scale-95 transition-all"
              >
                ← Zurück
              </button>
              <button
                onClick={() => setCalendarMonth(new Date())}
                className="bg-[#00D9FF] hover:bg-[#00D9FF]/90 text-[#0B1E3F] px-4 py-2.5 rounded-xl font-bold active:scale-95 transition-all shadow-[0_0_30px_rgba(0,217,255,0.3)]"
              >
                Heute
              </button>
              <button
                onClick={() => changeMonth(1)}
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00D9FF]/30 px-4 py-2.5 rounded-xl font-semibold text-white active:scale-95 transition-all"
              >
                Weiter →
              </button>
            </div>
            <button
              onClick={exportMyData}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl font-semibold text-white/70 hover:text-white text-sm"
            >
              📥 Meine Daten exportieren (DSGVO)
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-y-auto p-3 relative z-10">
        <div className="bg-[#0F2A52]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 mb-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <p className="text-white/60 text-xs mb-3 text-center">
            👆 Tag anklicken = Termin erstellen | Termin anklicken = Bearbeiten + Teilen
          </p>

          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 text-center text-xs sm:text-sm text-white/50 font-bold">
            <div>Mo</div><div>Di</div><div>Mi</div><div>Do</div><div>Fr</div><div>Sa</div><div>So</div>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((day, index) => {
              if (!day) return <div key={index} className="min-h-14 sm:min-h-20 bg-white/[0.02] rounded-lg" />;

              const dayEvents = getEventsForDay(day);
              const dateString = getDateString(day);
              const isToday = dateString === today;
              const hasEvents = dayEvents.length > 0;

              return (
                <button
                  key={dateString}
                  onClick={() => openCreateModal(day)}
                  className={`min-h-14 sm:min-h-20 rounded-lg p-1.5 text-left border transition-all duration-200 overflow-hidden active:scale-95 relative ${
                    isToday
                     ? "bg-white/10 hover:bg-white/15 border-[#00D9FF]/50 shadow-[0_0_15px_rgba(0,217,255,0.2)]"
                      : "bg-white/5 hover:bg-white/10 border-white/5 hover:border-[#00D9FF]/30"
                  }`}
                >
                  <p className="font-bold text-sm sm:text-base mb-0.5 text-white">{day}</p>

                  {hasEvents && (
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(event);
                          }}
                          className="text-[10px] px-1.5 py-0.5 rounded truncate font-medium bg-[#00D9FF]/20 text-[#00D9FF] hover:bg-[#00D9FF]/30 cursor-pointer"
                          title={`${event.title} - Klicken zum Bearbeiten`}
                        >
                          {event.event_time} {event.title}
                          {event.participants && event.participants.length > 0 && " 👥"}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] font-bold text-white/40">
                          +{dayEvents.length - 2} mehr
                        </div>
                      )}
                    </div>
                  )}

                  {isToday && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#00D9FF] animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Anstehende Termine Liste */}
        <div className="bg-[#0F2A52]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-[#00D9FF]">📋</span> Anstehende Termine
          </h3>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {events.length === 0? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2 opacity-20">📅</div>
                <p className="text-white/40 text-sm">Keine Termine. Klick auf einen Tag um zu starten.</p>
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#00D9FF]/30 p-3 rounded-xl transition-all group cursor-pointer"
                  onClick={() => openEditModal(event)}
                >
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#00D9FF] mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-white break-words">
                        {event.title}
                      </h3>
                      <p className="text-[#00D9FF] text-xs mb-1 font-medium">
                        {event.event_date} • {event.event_time}
                        {event.participants && event.participants.length > 0 &&
                          ` • 👥 Geteilt mit ${event.participants.length}`
                        }
                      </p>
                      {event.description && (
                        <p className="text-white/60 text-sm break-words mb-2">
                          {event.description}
                        </p>
                      )}
                      {canModifyEvent(event) && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(event);
                            }}
                            className="text-xs bg-white/10 hover:bg-[#00D9FF]/20 border border-white/20 hover:border-[#00D9FF]/50 text-white/80 hover:text-[#00D9FF] px-3 py-1.5 rounded-lg font-semibold transition-all"
                          >
                            ✏️ Bearbeiten/Teilen
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteEvent(event.id);
                            }}
                            className="text-xs bg-white/10 hover:bg-red-500/20 border border-white/20 hover:border-red-500/50 text-white/80 hover:text-red-400 px-3 py-1.5 rounded-lg font-semibold transition-all"
                          >
                            🗑️ Löschen
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal: Termin Erstellen/Bearbeiten */}
      {showEventModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowEventModal(false)}
        >
          <div
            className="bg-[#0F2A52] border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-[#00D9FF]">{editingEvent? "✏️" : "➕"}</span>
              {editingEvent? "Termin bearbeiten" : "Neuer Termin"}
            </h3>
            <p className="text-white/60 text-xs mb-4">
              Datum: {selectedDate} {editingEvent? "" : "• Du kannst Personen einladen"}
            </p>

            <input
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Titel *"
              autoFocus
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white mb-3 outline-none focus:border-[#00D9FF] placeholder:text-white/30"
            />

            <input
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white mb-3 outline-none focus:border-[#00D9FF]"
            />

            <textarea
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              placeholder="Beschreibung (optional)"
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white mb-4 min-h-20 outline-none focus:border-[#00D9FF] placeholder:text-white/30 resize-none"
            />

            {/* Teilnehmer Auswahl */}
            <div className="mb-4">
              <p className="text-white/80 text-sm font-semibold mb-2">
                👥 Mit Personen teilen (optional)
              </p>
              <input
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="Person suchen..."
                className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-white mb-2 text-sm outline-none focus:border-[#00D9FF] placeholder:text-white/30"
              />
              <div className="max-h-32 overflow-y-auto space-y-1">
                {filteredUsers.map(user => (
                  <button
                    key={user.email}
                    onClick={() => toggleUserShare(user.email)}
                    className={`w-full px-3 py-2 flex items-center gap-2 rounded-lg text-sm transition ${
                      selectedUsers.includes(user.email)
                       ? "bg-[#00D9FF]/20 border-[#00D9FF] text-[#00D9FF]"
                        : "bg-white/5 hover:bg-white/10 text-white"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center text-xs ${
                      selectedUsers.includes(user.email)
                       ? "bg-[#00D9FF] border-[#00D9FF] text-[#0B1E3F]"
                        : "border-white/30"
                    }`}>
                      {selectedUsers.includes(user.email) && "✓"}
                    </div>
                    <span className="flex-1 text-left">{user.name || user.email}</span>
                  </button>
                ))}
              </div>
              {selectedUsers.length > 0 && (
                <p className="text-[#00D9FF] text-xs mt-2">
                  ✓ Geteilt mit {selectedUsers.length} Person{selectedUsers.length > 1? "en" : ""}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowEventModal(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-xl font-semibold transition"
              >
                Abbrechen
              </button>
              <button
                onClick={createOrUpdateEvent}
                disabled={!eventTitle.trim() ||!eventTime}
                className="flex-1 bg-[#00D9FF] disabled:opacity-30 text-[#0B1E3F] py-2.5 rounded-xl font-semibold transition active:scale-95 shadow-[0_0_30px_rgba(0,217,255,0.3)]"
              >
                {editingEvent? "Speichern" : "Erstellen"}
              </button>
            </div>

            <p className="text-white/40 text-[10px] mt-3 text-center">
              DSGVO: Nur du + eingeladene Personen sehen diesen Termin
            </p>
          </div>
        </div>
      )}
    </div>
  );
}