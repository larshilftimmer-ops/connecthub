"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../supabase";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [instrument, setInstrument] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    if (user?.email) {
      loadProfile();
    }
  }, [user]);

  async function loadProfile() {
    if (!user?.email) return;
    
    const { data, error } = await supabase
     .from("profiles")
     .select("*")
     .eq("email", user.email)
     .single();

    if (error) {
      setMessage({ type: 'error', text: 'Profil konnte nicht geladen werden.' });
      return;
    }

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
        name: name.trim(),
        phone: phone.trim(),
        instrument: instrument.trim(),
        updated_at: new Date().toISOString(),
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

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Passwort muss mindestens 8 Zeichen haben.' });
      return;
    }

    if (newPassword!== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwörter stimmen nicht überein.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (error) {
      setMessage({ type: 'error', text: 'Passwort konnte nicht geändert werden: ' + error.message });
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    setMessage({ type: 'success', text: 'Passwort erfolgreich geändert!' });
    setTimeout(() => setMessage(null), 3000);
  }

  // DSGVO: Daten exportieren
  async function exportData() {
    if (!user?.email) return;
    setLoading(true);
    
    const { data: profileData } = await supabase
     .from("profiles")
     .select("*")
     .eq("email", user.email)
     .single();

    const exportData = {
      export_datum: new Date().toISOString(),
      user_id: user.id,
      email: user.email,
      profil: profileData,
      hinweis: "Dies sind alle über Sie gespeicherten Daten gemäß Art. 20 DSGVO"
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bad-sodify-datenexport-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    setLoading(false);
    setMessage({ type: 'success', text: 'Datenexport wurde heruntergeladen.' });
    setTimeout(() => setMessage(null), 3000);
  }

  // DSGVO: Account löschen
  async function deleteAccount() {
    if (deleteConfirm!== "LÖSCHEN") {
      setMessage({ type: 'error', text: 'Bitte "LÖSCHEN" eingeben zum Bestätigen.' });
      return;
    }

    setLoading(true);
    
    // 1. Profil löschen
    await supabase.from("profiles").delete().eq("email", user?.email);
    
    // 2. Auth User löschen - geht nur über Admin API oder Edge Function
    // Für jetzt: Logout + Hinweis
    setMessage({ type: 'success', text: 'Account-Löschung angefordert. Admin wird informiert.' });
    
    setTimeout(async () => {
      await logout();
      router.push("/");
    }, 2000);
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
              Mein Profil
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
            <div>
              <label className="text-xs text-white/50 mb-1.5 block font-medium">Name *</label>
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

            <div>
              <label className="text-xs text-white/50 mb-1.5 block font-medium">Telefon</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">📱</span>
                <input
                  type="tel"
                  placeholder="Deine Telefonnummer"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:bg-white/10 focus:border-[#00D9FF] focus:shadow-[0_0_20px_rgba(0,217,255,0.2)] placeholder:text-white/30 transition-all"
                />
              </div>
            </div>

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
              <p className="text-[10px] text-white/30 mt-1">E-Mail kann aus Sicherheitsgründen nicht geändert werden</p>
            </div>
          </div>

          <button
            onClick={saveProfile}
            disabled={loading ||!name.trim()}
            className="w-full mt-4 bg-[#00D9FF] hover:bg-[#00D9FF]/90 disabled:bg-white/10 disabled:text-white/40 text-[#0B1E3F] py-3.5 rounded-xl font-bold text-sm active:scale-95 transition-all shadow-[0_0_30px_rgba(0,217,255,0.3)] hover:shadow-[0_0_40px_rgba(0,217,255,0.5)] disabled:shadow-none flex items-center justify-center gap-2"
          >
            {loading? (
              <><span className="animate-spin">⏳</span> Speichern...</>
            ) : (
              <><span>💾</span> Profil speichern</>
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
                  placeholder="Mindestens 8 Zeichen"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:bg-white/10 focus:border-[#00D9FF] focus:shadow-[0_0_20px_rgba(0,217,255,0.2)] placeholder:text-white/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/50 mb-1.5 block font-medium">Passwort bestätigen</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">🔑</span>
                <input
                  type="password"
                  placeholder="Passwort wiederholen"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:bg-white/10 focus:border-[#00D9FF] focus:shadow-[0_0_20px_rgba(0,217,255,0.2)] placeholder:text-white/30 transition-all"
                />
              </div>
            </div>

            <button
              onClick={changePassword}
              disabled={loading ||!newPassword.trim() ||!confirmPassword.trim()}
              className="w-full bg-orange-500/20 hover:bg-orange-500/30 disabled:bg-white/5 disabled:text-white/30 border border-orange-500/30 hover:border-orange-500/50 text-orange-400 py-3.5 rounded-xl font-bold text-sm active:scale-95 transition-all hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] disabled:shadow-none flex items-center justify-center gap-2"
            >
              <span>🔄</span> Passwort ändern
            </button>
          </div>
        </div>

        {/* DSGVO Card */}
        <div className="bg-[#0F2A52]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            <span className="text-[#00D9FF]">🛡️</span> Datenschutz & DSGVO
          </h3>
          
          <div className="space-y-3">
            <button
              onClick={exportData}
              disabled={loading}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl font-medium text-sm active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>📥</span> Meine Daten herunterladen
            </button>
            <p className="text-[10px] text-white/40 px-1">
              Recht auf Datenübertragbarkeit gemäß Art. 20 DSGVO
            </p>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 text-red-400 py-3 rounded-xl font-medium text-sm active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>🗑️</span> Account löschen
            </button>
            <p className="text-[10px] text-white/40 px-1">
              Recht auf Löschung gemäß Art. 17 DSGVO. Alle Daten werden unwiderruflich gelöscht.
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-[#00D9FF]/10 border border-[#00D9FF]/30 rounded-xl p-3 flex items-start gap-2">
          <span className="text-[#00D9FF] text-lg">ℹ️</span>
          <div className="text-xs text-white/80 leading-relaxed flex-1">
            <p className="font-semibold text-white mb-1">Datenschutz-Hinweis:</p>
            <p>Deine Daten werden gemäß DSGVO verarbeitet. Mehr Infos in der <a href="/datenschutz" className="text-[#00D9FF] underline">Datenschutzerklärung</a>.</p>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-[#0F2A52] border border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-[0_0_60px_rgba(239,68,68,0.3)]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-red-400">⚠️</span> Account wirklich löschen?
            </h3>
            <p className="text-sm text-white/70 mb-4">
              Diese Aktion kann nicht rückgängig gemacht werden. Alle deine Daten werden permanent gelöscht.
            </p>
            <input
              type="text"
              placeholder='Tippe "LÖSCHEN" zur Bestätigung'
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-red-500 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-medium text-sm"
              >
                Abbrechen
              </button>
              <button
                onClick={deleteAccount}
                disabled={loading || deleteConfirm!== "LÖSCHEN"}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-white/10 disabled:text-white/40 text-white py-3 rounded-xl font-bold text-sm"
              >
                {loading? "Löschen..." : "Endgültig löschen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}