"use client";

type Props = {
  monthName: string;
  calendarDays: Array<number | null>;
  changeMonth: (amount: number) => void;
  setCalendarMonth: (date: Date) => void;
  getDateString: (day: number) => string;
  getEventsForDay: (day: number) => any[];
  setEventDate: (value: string) => void;
  eventTitle: string;
  setEventTitle: (value: string) => void;
  eventDate: string;
  eventTime: string;
  setEventTime: (value: string) => void;
  eventDescription: string;
  setEventDescription: (value: string) => void;
  createEvent: () => void;
  events: any[];
};

export default function CalendarPage({
  monthName,
  calendarDays,
  changeMonth,
  setCalendarMonth,
  getDateString,
  getEventsForDay,
  setEventDate,
  eventTitle,
  setEventTitle,
  eventDate,
  eventTime,
  setEventTime,
  eventDescription,
  setEventDescription,
  createEvent,
  events,
}: Props) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="w-full h-[calc(100vh-7rem)] bg-gradient-to-br from-[#0B1E3F] via-[#0D2247] to-[#0B1E3F] rounded-2xl overflow-hidden flex flex-col relative">
      
      {/* Animated Background Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00D9FF]/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00D9FF]/5 rounded-full blur-3xl animate-pulse delay-1000" />
      
      {/* Header mit Glassmorphism */}
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

      {/* Kalender Grid */}
      <div className="flex-1 overflow-y-auto p-3 relative z-10">
        <div className="bg-[#0F2A52]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 mb-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
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

        {/* Termin hinzufügen & Liste */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="bg-[#0F2A52]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-[#00D9FF]">➕</span> Termin hinzufügen
            </h3>

            <input
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Titel"
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white mb-3 outline-none focus:bg-white/10 focus:border-[#00D9FF] focus:shadow-[0_0_20px_rgba(0,217,255,0.2)] placeholder:text-white/30 transition-all"
            />

            <div className="grid grid-cols-2 gap-2 mb-3">
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="p-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:bg-white/10 focus:border-[#00D9FF] focus:shadow-[0_0_20px_rgba(0,217,255,0.2)] transition-all"
              />

              <input
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="p-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:bg-white/10 focus:border-[#00D9FF] focus:shadow-[0_0_20px_rgba(0,217,255,0.2)] transition-all"
              />
            </div>

            <textarea
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              placeholder="Beschreibung"
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white mb-3 min-h-20 outline-none focus:bg-white/10 focus:border-[#00D9FF] focus:shadow-[0_0_20px_rgba(0,217,255,0.2)] placeholder:text-white/30 resize-none transition-all"
            />

            <button
              onClick={createEvent}
              className="w-full bg-[#00D9FF] hover:bg-[#00D9FF]/90 text-[#0B1E3F] font-bold p-3 rounded-xl active:scale-95 transition-all shadow-[0_0_30px_rgba(0,217,255,0.3)] hover:shadow-[0_0_40px_rgba(0,217,255,0.5)]"
            >
              Termin hinzufügen
            </button>
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
                      <div className="w-2 h-2 rounded-full bg-[#00D9FF] mt-1.5 group-hover:shadow-[0_0_10px_rgba(0,217,255,0.5)] transition-all" />
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-white break-words">
                          {event.title}
                        </h3>

                        <p className="text-[#00D9FF] text-xs mb-1 font-medium">
                          {event.event_date} • {event.event_time}
                        </p>

                        {event.description && (
                          <p className="text-white/60 text-sm break-words">
                            {event.description}
                          </p>
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