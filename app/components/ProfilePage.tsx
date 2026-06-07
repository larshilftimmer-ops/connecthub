"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../supabase";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [instrument, setInstrument] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (user?.email) {
      loadProfile();
    }
  }, [user]);

  async function loadProfile() {
    if (!user?.email) return;
    
    const { data } = await supabase
   .from("profiles")
   .select("*")
   .eq("email", user.email)
   .single();

    if (data) {
      setName(data.name || "");
      setPhone(data.phone || "");
      setInstrument(data.instrument || "");
    }
  }

  async function saveProfile() {
    if (!user?.email) return;
    setLoading(true);
    setMessage(null);
    
    const { error } = await supabase
   .from("profiles")
   .update({
        name,
        phone,
        instrument,
      })
   .eq("email", user.email);

    setLoading(false);

    if (error) {
      setMessage({ type: 'error', text: 'Profil konnte nicht gespeichert werden.' });
      return;
    }

    setMessage({ type: 'success', text: 'Profil erfolgreich gespeichert!' });
    setTimeout(() => setMessage(null), 3000);
  }

  async function changePassword() {
    if (!newPassword.trim()) {
      setMessage({ type: 'error', text: 'Bitte neues Passwort eingeben.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (error) {
      setMessage({ type: 'error', text: 'Passwort konnte nicht geändert werden.' });
      return;
    }

    setNewPassword("");
    setMessage({ type: 'success', text: 'Passwort erfolgreich geändert!' });
    setTimeout(() => setMessage(null), 3000);
  }

  if (!user) {
    return (
      <div className="w-full h-[calc(100vh-7rem)] bg-[#0B1E3F] rounded-2xl flex items-center justify-center">
        <div className="text-white/40">Nicht eingeloggt</div>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-7rem)] bg-gradient-to-br from-[#0B1E3F] via-[#0D2247] to-[#0B1E3F] rounded-2xl overflow-hidden flex flex-col relative">
      
      {/* Animated Background Glow */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-[#00D9FF]/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-[#00D9FF]/5 rounded-full blur-3xl animate-pulse delay-1000" />
      
      {/* Header */}
      <div className="bg-[#0F2A52]/80 backdrop-blur-xl border-b border-white/10 px-4 py-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00D9FF] to-[#0099FF] flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(0,217,255,0.5)]">
            👤
          </div>
          <div>
            <p className="text-xs font-bold text-[#00D9FF] mb-0.5">
              Musikschule Bad Soden
            </p>
            <h2 className="text-2xl font-bold text-white">
              Profil bearbeiten
            </h2>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 relative z-10">
        
        {/* Message Toast */}
        {message && (
          <div className={`${message.type === 'success'? 'bg-[#00D9FF]/10 border-[#00D9FF]/30' : 'bg-red-500/10 border-red-500/30'} backdrop-blur-xl border rounded-xl p-3 flex items-start gap-2 animate-in slide-in-from-top`}>
            <span className={`${message.type === 'success'? 'text-[#00D9FF]' : 'text-red-400'} text-lg`}>
              {message.type === 'success'? '✓' : '⚠️'}
            </span>
            <p className="text-sm text-white/80 flex-1">
              {message.text}
            </p>
          </div>
        )}

        {/* Profil Info Card */}
        <div className="bg-[#0F2A52]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            <span className="text-[#00D9FF]">📝</span> Persönliche Daten
          </h3>
          
          <div className="space-y-3">
            {/* Name */}
            <div>
              <label className="text-xs text-white/50 mb-1.5 block font-medium">Name</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">👤</span>
                <input
                  placeholder="Dein Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:bg-white/10 focus:border-[#00D9FF] focus:shadow-[0_0_20px_rgba(0,217,255,0.2)] placeholder:text-white/30 transition-all"
                />
              </div>
            </div>

            {/* Telefon */}
            <div>
              <label className="text-xs text-white/50 mb-1.5 block font-medium">Telefon</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">📱</span>
                <input
                  placeholder="Deine Telefonnummer"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:bg-white/10 focus:border-[#00D9FF] focus:shadow-[0_0_20px_rgba(0,217,255,0.2)] placeholder:text-white/30 transition-all"
                />
              </div>
            </div>

            {/* Instrument */}
            <div>
              <label className="text-xs text-white/50 mb-1.5 block font-medium">Instrument</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">🎵</span>
                <input
                  placeholder="Dein Instrument"
                  value={instrument}
                  onChange={(e) => setInstrument(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:bg-white/10 focus:border-[#00D9FF] focus:shadow-[0_0_20px_rgba(0,217,255,0.2)] placeholder:text-white/30 transition-all"
                />
              </div>
            </div>

            {/* Email Disabled */}
            <div>
              <label className="text-xs text-white/50 mb-1.5 block font-medium">E-Mail</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">✉️</span>
                <input
                  value={user.email}
                  disabled
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white/40 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <button
            onClick={saveProfile}
            disabled={loading}
            className="w-full mt-4 bg-[#00D9FF] hover:bg-[#00D9FF]/90 disabled:bg-white/10 disabled:text-white/40 text-[#0B1E3F] py-3.5 rounded-xl font-bold text-sm active:scale-95 transition-all shadow-[0_0_30px_rgba(0,217,255,0.3)] hover:shadow-[0_0_40px_rgba(0,217,255,0.5)] disabled:shadow-none flex items-center justify-center gap-2"
          >
            {loading? (
              <>
                <span className="animate-spin">⏳</span> Speichern...
              </>
            ) : (
              <>
                <span>💾</span> Profil speichern
              </>
            )}
          </button>
        </div>

        {/* Passwort Card */}
        <div className="bg-[#0F2A52]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            <span className="text-[#00D9FF]">🔐</span> Passwort ändern
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs text-white/50 mb-1.5 block font-medium">Neues Passwort</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">🔑</span>
                <input
                  type="password"
                  placeholder="Mindestens 6 Zeichen"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:bg-white/10 focus:border-[#00D9FF] focus:shadow-[0_0_20px_rgba(0,217,255,0.2)] placeholder:text-white/30 transition-all"
                />
              </div>
            </div>

            <button
              onClick={changePassword}
              disabled={loading ||!newPassword.trim()}
              className="w-full bg-red-500/20 hover:bg-red-500/30 disabled:bg-white/5 disabled:text-white/30 border border-red-500/30 hover:border-red-500/50 text-red-400 py-3.5 rounded-xl font-bold text-sm active:scale-95 transition-all hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] disabled:shadow-none flex items-center justify-center gap-2"
            >
              <span>🔄</span> Passwort ändern
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-[#00D9FF]/10 border border-[#00D9FF]/30 rounded-xl p-3 flex items-start gap-2">
          <span className="text-[#00D9FF] text-lg">ℹ️</span>
          <p className="text-xs text-white/80 leading-relaxed flex-1">
            <span className="font-semibold text-white">Hinweis:</span> Deine E-Mail-Adresse kann nicht geändert werden. Bei Problemen kontaktiere den Admin.
          </p>
        </div>
      </div>
    </div>
  );
}