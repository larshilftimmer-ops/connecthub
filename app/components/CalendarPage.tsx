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
      <section className="bg-zinc-900 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Mein Kalender</h2>
  
          <div className="flex gap-2">
            <button onClick={() => changeMonth(-1)} className="bg-zinc-800 px-4 py-2 rounded-xl">
              ←
            </button>
  
            <button onClick={() => setCalendarMonth(new Date())} className="bg-blue-600 px-4 py-2 rounded-xl">
              Heute
            </button>
  
            <button onClick={() => changeMonth(1)} className="bg-zinc-800 px-4 py-2 rounded-xl">
              →
            </button>
          </div>
        </div>
  
        <h3 className="text-2xl font-bold mb-6 capitalize">{monthName}</h3>
  
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
              return <div key={index} className="min-h-24 bg-zinc-800 rounded-xl" />;
            }
  
            const dayEvents = getEventsForDay(day);
            const dateString = getDateString(day);
  
            return (
              <button
                key={dateString}
                onClick={() => setEventDate(dateString)}
                className="min-h-24 bg-zinc-800 rounded-xl p-2 text-left hover:bg-zinc-700"
              >
                <p className="font-bold mb-2">{day}</p>
  
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div key={event.id} className="bg-blue-600 text-xs px-2 py-1 rounded truncate">
                      {event.event_time} {event.title}
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
  
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-zinc-800 p-4 rounded-2xl">
            <h3 className="text-xl font-bold mb-4">Termin hinzufügen</h3>
  
            <input
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Titel"
              className="w-full p-4 rounded-xl bg-zinc-700 mb-4"
            />
  
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full p-4 rounded-xl bg-zinc-700 mb-4"
            />
  
            <input
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              className="w-full p-4 rounded-xl bg-zinc-700 mb-4"
            />
  
            <textarea
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              placeholder="Beschreibung"
              className="w-full p-4 rounded-xl bg-zinc-700 mb-4 min-h-28"
            />
  
            <button onClick={createEvent} className="w-full bg-green-600 p-4 rounded-xl">
              Termin hinzufügen
            </button>
          </div>
  
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="bg-zinc-800 p-4 rounded-xl">
                <h3 className="text-xl font-bold">{event.title}</h3>
                <p className="text-gray-400 mb-2">
                  {event.event_date} • {event.event_time}
                </p>
                <p>{event.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }