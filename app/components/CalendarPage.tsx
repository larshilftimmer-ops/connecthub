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
  return (
    <div className="w-full h-[calc(100vh-7rem)] bg-[#0B1E3F] rounded-2xl overflow-hidden flex flex-col">
      
      {/* Header */}
      <div className="bg-[#0F2A52] border-b border-white/5 px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Mein Kalender</h2>
            <p className="text-sm text-white/40 capitalize">{monthName}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
            <button
              onClick={() => changeMonth(-1)}
              className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl font-semibold text-white active:scale-95 transition"
            >
              ←
            </button>

            <button
              onClick={() => setCalendarMonth(new Date())}
              className="bg-[#00D9FF] hover:bg-[#00D9FF]/90 text-[#0B1E3F] px-4 py-2.5 rounded-xl font-bold active:scale-95 transition"
            >
              Heute
            </button>

            <button
              onClick={() => changeMonth(1)}
              className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl font-semibold text-white active:scale-95 transition"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Kalender Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="bg-[#0F2A52] border border-white/5 rounded-2xl p-3 sm:p-4 mb-3">
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs sm:text-sm text-white/40 font-semibold">
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
                    className="min-h-16 sm:min-h-24 bg-white/5 rounded-xl"
                  />
                );
              }

              const dayEvents = getEventsForDay(day);
              const dateString = getDateString(day);
              const isSelected = eventDate === dateString;

              return (
                <button
                  key={dateString}
                  onClick={() => setEventDate(dateString)}
                  className={`min-h-16 sm:min-h-24 rounded-xl p-2 text-left border transition overflow-hidden active:scale-95 ${
                    isSelected
                      ? "bg-[#00D9FF] text-[#0B1E3F] border-[#00D9FF]"
                      : "bg-white/5 hover:bg-white/10 border-white/5"
                  }`}
                >
                  <p className="font-bold text-sm sm:text-base mb-1">
                    {day}
                  </p>

                  <div className="space-y-1 hidden sm:block">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs px-2 py-1 rounded truncate ${
                          isSelected
                            ? "bg-[#0B1E3F]/20 text-[#0B1E3F]"
                            : "bg-[#00D9FF]/20 text-[#00D9FF]"
                        }`}
                      >
                        {event.event_time} {event.title}
                      </div>
                    ))}
                  </div>

                  {dayEvents.length > 0 && (
                    <div className="sm:hidden mt-1 w-2 h-2 rounded-full bg-[#00D9FF]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Termin hinzufügen & Liste */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="bg-[#0F2A52] border border-white/5 rounded-2xl p-4">
            <h3 className="text-lg font-bold text-white mb-4">
              Termin hinzufügen
            </h3>

            <input
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Titel"
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white mb-3 outline-none focus:bg-white/10 focus:border-[#00D9FF] placeholder:text-white/30"
            />

            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white mb-3 outline-none focus:bg-white/10 focus:border-[#00D9FF]"
            />

            <input
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white mb-3 outline-none focus:bg-white/10 focus:border-[#00D9FF]"
            />

            <textarea
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              placeholder="Beschreibung"
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white mb-3 min-h-24 outline-none focus:bg-white/10 focus:border-[#00D9FF] placeholder:text-white/30 resize-none"
            />

            <button
              onClick={createEvent}
              className="w-full bg-[#00D9FF] hover:bg-[#00D9FF]/90 text-[#0B1E3F] font-bold p-3 rounded-xl active:scale-95 transition"
            >
              Termin hinzufügen
            </button>
          </div>

          <div className="bg-[#0F2A52] border border-white/5 rounded-2xl p-4">
            <h3 className="text-lg font-bold text-white mb-4">
              Anstehende Termine
            </h3>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {events.length === 0 ? (
                <p className="text-white/40 text-sm">
                  Keine Termine vorhanden.
                </p>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white/5 border border-white/5 p-3 rounded-xl"
                  >
                    <h3 className="text-base font-bold text-white break-words">
                      {event.title}
                    </h3>

                    <p className="text-white/50 text-xs mb-2">
                      {event.event_date} • {event.event_time}
                    </p>

                    {event.description && (
                      <p className="text-white/70 text-sm break-words">
                        {event.description}
                      </p>
                    )}
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