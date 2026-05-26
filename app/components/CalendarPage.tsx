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
    <section className="w-full max-w-full overflow-x-hidden space-y-6 text-zinc-900">
      <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm p-5 sm:p-6">
        <p className="text-sm font-semibold text-[#d8a928] mb-2">
          Termine
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#7a1f1f]">
              Mein Kalender
            </h2>

            <p className="text-zinc-500 mt-1 capitalize">
              {monthName}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
            <button
              onClick={() => changeMonth(-1)}
              className="bg-[#f7f3ea] border border-zinc-200 px-4 py-3 rounded-xl font-semibold"
            >
              ←
            </button>

            <button
              onClick={() => setCalendarMonth(new Date())}
              className="bg-[#7a1f1f] text-white px-4 py-3 rounded-xl font-semibold"
            >
              Heute
            </button>

            <button
              onClick={() => changeMonth(1)}
              className="bg-[#f7f3ea] border border-zinc-200 px-4 py-3 rounded-xl font-semibold"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm p-4 sm:p-6 overflow-hidden">
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs sm:text-sm text-zinc-500 font-semibold">
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
                  className="min-h-16 sm:min-h-24 bg-[#f7f3ea] rounded-xl border border-zinc-100"
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
                className={`min-h-16 sm:min-h-24 rounded-xl p-2 text-left border transition overflow-hidden ${
                  isSelected
                    ? "bg-[#7a1f1f] text-white border-[#7a1f1f]"
                    : "bg-[#f7f3ea] hover:bg-[#fffaf0] border-zinc-100"
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
                          ? "bg-white/20 text-white"
                          : "bg-[#d8a928] text-zinc-900"
                      }`}
                    >
                      {event.event_time} {event.title}
                    </div>
                  ))}
                </div>

                {dayEvents.length > 0 && (
                  <div className="sm:hidden mt-1 w-2 h-2 rounded-full bg-[#d8a928]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm p-5 sm:p-6">
          <h3 className="text-xl font-bold text-[#7a1f1f] mb-4">
            Termin hinzufügen
          </h3>

          <input
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            placeholder="Titel"
            className="w-full p-4 rounded-xl bg-[#f7f3ea] border border-zinc-200 mb-4 outline-none focus:ring-2 focus:ring-[#d8a928]"
          />

          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full p-4 rounded-xl bg-[#f7f3ea] border border-zinc-200 mb-4 outline-none focus:ring-2 focus:ring-[#d8a928]"
          />

          <input
            type="time"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
            className="w-full p-4 rounded-xl bg-[#f7f3ea] border border-zinc-200 mb-4 outline-none focus:ring-2 focus:ring-[#d8a928]"
          />

          <textarea
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
            placeholder="Beschreibung"
            className="w-full p-4 rounded-xl bg-[#f7f3ea] border border-zinc-200 mb-4 min-h-28 outline-none focus:ring-2 focus:ring-[#d8a928]"
          />

          <button
            onClick={createEvent}
            className="w-full bg-[#7a1f1f] hover:bg-[#651919] transition text-white font-semibold p-4 rounded-xl"
          >
            Termin hinzufügen
          </button>
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm p-5 sm:p-6">
          <h3 className="text-xl font-bold text-[#7a1f1f] mb-4">
            Anstehende Termine
          </h3>

          <div className="space-y-3">
            {events.length === 0 ? (
              <p className="text-zinc-500">
                Keine Termine vorhanden.
              </p>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="bg-[#f7f3ea] border border-zinc-200 p-4 rounded-2xl overflow-hidden"
                >
                  <h3 className="text-lg font-bold break-words">
                    {event.title}
                  </h3>

                  <p className="text-zinc-500 text-sm mb-2">
                    {event.event_date} • {event.event_time}
                  </p>

                  {event.description && (
                    <p className="text-zinc-700 break-words">
                      {event.description}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}