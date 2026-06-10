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
};

export default function CalendarPage() {
  const { user } = useAuth();
  const { profile } = useProfile(user?.email);

  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const isAdmin =
    profile?.role === "admin" ||
    ["l.c.petersen2@gmail.com", "kartmann@musikschulebadsoden.de", "info@musikschulebadsoden.de", "kopp_m@musikschulebadsoden.de"].includes(user?.email || "");

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!user?.email) return;

    const fetchEvents = async () => {
      const { data, error } = await supabase
       .from('events')
       .select('*')
       .order('event_date', { ascending: true })
       .order('event_time', { ascending: true });

      if (!error) setEvents(data || []);
    };

    fetchEvents();

    const channel = supabase
     .channel('events')
     .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, fetchEvents)
     .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

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

  const createEvent = async () => {
    if (!eventTitle.trim() ||!eventDate ||!eventTime ||!user?.email) return;

    const { error } = await supabase.from('events').insert({
      title: eventTitle.trim(),
      event_date: eventDate,
      event_time: eventTime,
      description: eventDescription.trim(),
      user_email: user.email,
    });

    if (!error) {
      setEventTitle("");
      setEventDate("");
      setEventTime("");
      setEventDescription("");
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Termin wirklich löschen?")) return;

    const { error } = await supabase.from('events').delete().eq('id', id);

    if (error) {
      alert("Fehler beim Löschen: " + error.message);
    }
  };

  const startEdit = (event: Event) => {
    setEditingEvent(event);
    setEventTitle(event.title);
    setEventDate(event.event_date);
    setEventTime(event.event_time);
    setEventDescription(event.description || "");
  };

  const updateEvent = async () => {
    if (!editingEvent ||!eventTitle.trim() ||!eventDate ||!eventTime) return;

    const { error } = await supabase
     .from('events')
     .update({
        title: eventTitle.trim(),
        event_date: eventDate,
        event_time: eventTime,
        description: eventDescription.trim(),
      })
     .eq('id', editingEvent.id);

    if (!error) {
      setEditingEvent(null);
      setEventTitle("");
      setEventDate("");
      setEventTime("");
      setEventDescription("");
    } else {
      alert("Fehler beim Speichern: " + error.message);
    }
  };

  const cancelEdit = () => {
    setEditingEvent(null);
    setEventTitle("");
    setEventDate("");
    setEventTime("");
    setEventDescription("");
  };

  const canModifyEvent = (event: Event) => {
    return event.user_email === user?.email || isAdmin;
  };

  const monthName = getMonthName(calendarMonth);
  const calendarDays = getCalendarDays(calendarMonth);

  return (
    <div className="w-full h-[calc(100vh-7rem)] bg-gradient-to-br from-[#0B1E3F] via-[#0D2247] to-[#0B1E3F] rounded-2xl overflow-hidden flex flex-col relative">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00D9FF]/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00D9FF]/5 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="bg-[#0F2A52]/80 backdrop-blur-xl border-b border-white/10 px-4 py-4 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <span className="text-[#00D9FF]">📅</span> Mein Kalender
            </h2>
            <p className="text-sm text-white/40 capitalize font-medium">{monthName}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
            <button
              onClick={() => changeMonth(-1)}
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00D9FF]/30 px-4 py-2.5 rounded-xl font-semibold text-white active:scale-95 transition-all hover:shadow-[0_0_20px_rgba(0,217,255,0.2)]"
            >
              ←
            </button>

            <button
              onClick={() => setCalendarMonth(new Date())}
              className="bg-[#00D9FF] hover:bg-[#00D9FF]/90 text-[#0B1E3F] px-4 py-2.5 rounded-xl font-bold active:scale-95 transition-all shadow-[0_0_30px_rgba(0,217,255,0.3)] hover:shadow-[0_0_40px_rgba(0,217,255,0.5)]"
            >
              Heute
            </button>

            <button
              onClick={() => changeMonth(1)}
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00D9FF]/30 px-4 py-2.5 rounded-xl font-semibold text-white active:scale-95 transition-all hover:shadow-[0_0_20px_rgba(0,217,255,0.2)]"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 relative z-10">
        <div className="bg-[#0F2A52]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 mb-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)] max-w-full">
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 text-center text-xs sm:text-sm text-white/50 font-bold">
            <div>Mo</div>
            <div>Di</div>
            <div>Mi</div>
            <div>Do</div>
            <div>Fr</div>
            <div>Sa</div>
            <div>So</div>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((day, index) => {
              if (!day) {
                return (
                  <div
                    key={index}
                    className="min-h-14 sm:min-h-20 bg-white/[0.02] rounded-lg"
                  />
                );
              }

              const dayEvents = getEventsForDay(day);
              const dateString = getDateString(day);
              const isSelected = eventDate === dateString;
              const isToday = dateString === today;
              const hasEvents = dayEvents.length > 0;

              return (
                <button
                  key={dateString}
                  onClick={() => setEventDate(dateString)}
                  className={`min-h-14 sm:min-h-20 rounded-lg p-1.5 text-left border transition-all duration-200 overflow-hidden active:scale-95 relative group ${
                    isSelected
                     ? "bg-[#00D9FF] text-[#0B1E3F] border-[#00D9FF] shadow-[0_0_20px_rgba(0,217,255,0.4)] scale-105"
                      : isToday
                     ? "bg-white/10 hover:bg-white/15 border-[#00D9FF]/50 shadow-[0_0_15px_rgba(0,217,255,0.2)]"
                      : "bg-white/5 hover:bg-white/10 border-white/5 hover:border-[#00D9FF]/30 hover:shadow-[0_0_15px_rgba(0,217,255,0.1)]"
                  }`}
                >
                  <p className={`font-bold text-sm sm:text-base mb-0.5 ${
                    isSelected? "text-[#0B1E3F]" : "text-white"
                  }`}>
                    {day}
                  </p>

                  <div className="space-y-0.5 hidden sm:block">
                    {dayEvents.slice(0, 1).map((event) => (
                      <div
                        key={event.id}
                        className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium ${
                          isSelected
                           ? "bg-[#0B1E3F]/20 text-[#0B1E3F]"
                            : "bg-[#00D9FF]/20 text-[#00D9FF]"
                        }`}
                      >
                        {event.event_time}
                      </div>
                    ))}
                    {dayEvents.length > 1 && (
                      <div className={`text-[10px] font-bold ${
                        isSelected? "text-[#0B1E3F]/60" : "text-white/40"
                      }`}>
                        +{dayEvents.length - 1}
                      </div>
                    )}
                  </div>

                  {hasEvents && (
                    <div className="sm:hidden absolute bottom-1 right-1 flex gap-0.5">
                      {dayEvents.slice(0, 3).map((_, i) => (
                        <div key={i} className={`w-1 h-1 rounded-full ${
                          isSelected? "bg-[#0B1E3F]" : "bg-[#00D9FF]"
                        }`} />
                      ))}
                    </div>
                  )}

                  {isToday &&!isSelected && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#00D9FF] animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-w-full">
          <div className="bg-[#0F2A52]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-[#00D9FF]">{editingEvent? "✏️" : "➕"}</span>
              {editingEvent? "Termin bearbeiten" : "Termin hinzufügen"}
            </h3>

            <input
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Titel"
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white mb-3 outline-none focus:bg-white/10 focus:border-[#00D9FF] focus:shadow-[0_0_20px_rgba(0,217,255,0.2)] placeholder:text-white/30 transition-all box-border"
            />

            <div className="grid grid-cols-2 gap-2 mb-3">
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="p-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:bg-white/10 focus:border-[#00D9FF] focus:shadow-[0_0_20px_rgba(0,217,255,0.2)] transition-all box-border"
              />

              <input
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="p-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:bg-white/10 focus:border-[#00D9FF] focus:shadow-[0_0_20px_rgba(0,217,255,0.2)] transition-all box-border"
              />
            </div>

            <textarea
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              placeholder="Beschreibung"
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white mb-3 min-h-20 outline-none focus:bg-white/10 focus:border-[#00D9FF] focus:shadow-[0_0_20px_rgba(0,217,255,0.2)] placeholder:text-white/30 resize-none transition-all box-border"
            />

            {editingEvent? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={cancelEdit}
                  className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold p-3 rounded-xl active:scale-95 transition-all"
                >
                  Abbrechen
                </button>
                <button
                  onClick={updateEvent}
                  disabled={!eventTitle.trim() ||!eventDate ||!eventTime}
                  className="w-full bg-[#00D9FF] hover:bg-[#00D9FF]/90 disabled:opacity-30 disabled:cursor-not-allowed text-[#0B1E3F] font-bold p-3 rounded-xl active:scale-95 transition-all shadow-[0_0_30px_rgba(0,217,255,0.3)] hover:shadow-[0_0_40px_rgba(0,217,255,0.5)]"
                >
                  Speichern
                </button>
              </div>
            ) : (
              <button
                onClick={createEvent}
                disabled={!eventTitle.trim() ||!eventDate ||!eventTime}
                className="w-full bg-[#00D9FF] hover:bg-[#00D9FF]/90 disabled:opacity-30 disabled:cursor-not-allowed text-[#0B1E3F] font-bold p-3 rounded-xl active:scale-95 transition-all shadow-[0_0_30px_rgba(0,217,255,0.3)] hover:shadow-[0_0_40px_rgba(0,217,255,0.5)]"
              >
                Termin hinzufügen
              </button>
            )}
          </div>

          <div className="bg-[#0F2A52]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-[#00D9FF]">📋</span> Anstehende Termine
            </h3>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {events.length === 0? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2 opacity-20">📅</div>
                  <p className="text-white/40 text-sm">
                    Keine Termine vorhanden.
                  </p>
                </div>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#00D9FF]/30 p-3 rounded-xl transition-all group"
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#00D9FF] mt-1.5 group-hover:shadow-[0_0_10px_rgba(0,217,255,0.5)] transition-all flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-white break-words">
                          {event.title}
                        </h3>

                        <p className="text-[#00D9FF] text-xs mb-1 font-medium">
                          {event.event_date} • {event.event_time}
                        </p>

                        {event.description && (
                          <p className="text-white/60 text-sm break-words mb-2">
                            {event.description}
                          </p>
                        )}

                        {canModifyEvent(event) && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => startEdit(event)}
                              className="text-xs bg-white/10 hover:bg-[#00D9FF]/20 border border-white/20 hover:border-[#00D9FF]/50 text-white/80 hover:text-[#00D9FF] px-3 py-1.5 rounded-lg font-semibold transition-all active:scale-95"
                            >
                              ✏️ Bearbeiten
                            </button>
                            <button
                              onClick={() => deleteEvent(event.id)}
                              className="text-xs bg-white/10 hover:bg-red-500/20 border border-white/20 hover:border-red-500/50 text-white/80 hover:text-red-400 px-3 py-1.5 rounded-lg font-semibold transition-all active:scale-95"
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
      </div>
    </div>
  );
}