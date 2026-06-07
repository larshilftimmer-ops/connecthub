"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../supabase";

type Schedule = {
  id: string;
  day: string;
  time: string;
  teacher: string;
  room: string;
  course_title: string;
};

export default function SchedulePage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDay, setSelectedDay] = useState("Mo");

  const days = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  useEffect(() => {
    fetchSchedules();
    
    // Realtime Subscription
    const channel = supabase
  .channel('schedules')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, fetchSchedules)
  .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDay]);

  async function fetchSchedules() {
    const { data, error } = await supabase
  .from('schedules')
  .select('*')
  .eq('day', selectedDay)
  .order('time', { ascending: true });
    
    if (!error) setSchedules(data || []);
  }

  return (
    <div className="w-full h-[calc(100vh-7rem)] bg-gradient-to-br from-[#0B1E3F] via-[#0D2247] to-[#0B1E3F] rounded-2xl overflow-hidden flex flex-col relative">
      
      {/* Animated Background Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00D9FF]/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00D9FF]/5 rounded-full blur-3xl animate-pulse delay-1000" />
      
      {/* Header */}
      <div className="bg-[#0F2A52]/80 backdrop-blur-xl border-b border-white/10 px-4 py-4 relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D9FF] to-[#0099FF] flex items-center justify-center text-xl shadow-[0_0_30px_rgba(0,217,255,0.5)]">
            📅
          </div>
          <div>
            <p className="text-xs font-bold text-[#00D9FF] mb-0.5">
              Wochenplan
            </p>
            <h2 className="text-xl font-bold text-white">
              Stundenplan
            </h2>
          </div>
        </div>

        {/* Day Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-xl font-bold text-sm shrink-0 transition-all ${
                selectedDay === day
              ? "bg-[#00D9FF] text-[#0B1E3F] shadow-[0_0_20px_rgba(0,217,255,0.4)]"
                  : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule List */}
      <div className="flex-1 overflow-y-auto p-3 relative z-10">
        {schedules.length === 0? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3 opacity-20">📚</div>
            <p className="text-white/40 text-sm">
              Keine Stunden am {selectedDay}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="bg-[#0F2A52]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-[#00D9FF]/30 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-[#00D9FF]/20 border border-[#00D9FF]/30 rounded-xl px-3 py-2 text-center shrink-0">
                    <p className="text-xs text-white/50 font-medium">Uhrzeit</p>
                    <p className="text-lg font-bold text-[#00D9FF]">{schedule.time}</p>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-white mb-1 break-words">
                      {schedule.course_title}
                    </h3>
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-[#00D9FF]">👤</span>
                        <span className="text-white/60">{schedule.teacher}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-[#00D9FF]">📍</span>
                        <span className="text-white/60">Raum {schedule.room}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-[#0F2A52]/80 backdrop-blur-xl border-t border-white/10 p-4 relative z-10">
        <div className="bg-[#00D9FF]/10 border border-[#00D9FF]/30 rounded-xl p-3 flex items-start gap-2">
          <span className="text-[#00D9FF] text-lg">ℹ️</span>
          <p className="text-xs text-white/80 leading-relaxed flex-1">
            <span className="font-semibold text-white">Hinweis:</span> Änderungen im Stundenplan werden automatisch aktualisiert. Bei Fragen kontaktiere deinen Lehrer.
          </p>
        </div>
      </div>
    </div>
  );
}