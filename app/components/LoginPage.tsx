"use client";

import { useState } from "react";

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string, data: any) => Promise<void>;
}

export default function LoginPage({ onLogin, onRegister }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  
  const [registerRole, setRegisterRole] = useState("student");
  const [registerName, setRegisterName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerInstrument, setRegisterInstrument] = useState("");
  const [dsgvoAccepted, setDsgvoAccepted] = useState(false); // DSGVO
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError("Bitte E-Mail und Passwort eingeben");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message || "Login fehlgeschlagen. Prüfe deine Daten.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    // Validierung - IDIOTENSICHER
    if (!email.trim()) {
      setError("Bitte E-Mail eingeben");
      return;
    }
    if (!email.includes("@")) {
      setError("Bitte gültige E-Mail eingeben");
      return;
    }
    if (!password.trim()) {
      setError("Bitte Passwort eingeben");
      return;
    }
    if (password.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen lang sein");
      return;
    }
    if (!registerName.trim()) {
      setError("Bitte Name eingeben");
      return;
    }
    if (!dsgvoAccepted) {
      setError("Bitte Datenschutz akzeptieren");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await onRegister(email, password, {
        role: registerRole,
        name: registerName,
        phone: registerPhone,
        instrument: registerInstrument,
        dsgvo_accepted: true,
        dsgvo_date: new Date().toISOString(), // DSGVO Nachweis
      });
      setSuccess("Registrierung erfolgreich! Bitte E-Mail bestätigen und dann einloggen.");
      setIsLogin(true);
      // Formular zurücksetzen
      setEmail("");
      setPassword("");
      setRegisterName("");
      setRegisterPhone("");
      setRegisterInstrument("");
      setDsgvoAccepted(false);
    } catch (err: any) {
      setError(err.message || "Registrierung fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0B1E3F] via-[#0D2247] to-[#0B1E3F] text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00D9FF]/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00D9FF]/5 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="w-full max-w-md bg-[#0F2A52]/60 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10 p-6 sm:p-8 relative z-10">
        
        {/* LOGO STATT EMOJI */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <img
              src="/logo-musikschule.png"
              alt="Freie Musikschule in Bad Soden e.V."
              className="h-16 w-auto object-contain"
            />
          </div>
          <p className="text-sm font-semibold text-[#00D9FF] mb-2">
            Freie Musikschule in Bad Soden e.V.
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Bad Sodify Music
          </h1>
          <p className="text-white/60">{isLogin ? "Login" : "Registrierung"}</p>
        </div>

        {/* Error / Success Messages */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-sm">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-200 text-sm">
            ✓ {success}
          </div>
        )}

        <input
          type="email"
          placeholder="E-Mail *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 rounded-xl bg-white/5 border border-white/10 mb-4 outline-none focus:ring-2 focus:ring-[#00D9FF] focus:bg-white/10 text-white placeholder:text-white/30 transition-all"
        />

        <input
          type="password"
          placeholder="Passwort * (min. 8 Zeichen)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 rounded-xl bg-white/5 border border-white/10 mb-4 outline-none focus:ring-2 focus:ring-[#00D9FF] focus:bg-white/10 text-white placeholder:text-white/30 transition-all"
        />

        {isLogin ? (
          <>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-[#00D9FF] hover:bg-[#00D9FF]/90 transition text-[#0B1E3F] font-bold p-4 rounded-xl mb-4 shadow-[0_0_30px_rgba(0,217,255,0.3)] hover:shadow-[0_0_40px_rgba(0,217,255,0.5)] active:scale-95 disabled:opacity-50"
            >
              {loading ? "Lädt..." : "Einloggen"}
            </button>

            <button
              onClick={() => {setIsLogin(false); setError(""); setSuccess("");}}
              className="w-full bg-white/10 hover:bg-white/15 border border-[#00D9FF]/30 hover:border-[#00D9FF]/50 transition text-white font-semibold p-4 rounded-xl active:scale-95"
            >
              Neu registrieren
            </button>
          </>
        ) : (
          <>
            <select
              value={registerRole}
              onChange={(e) => setRegisterRole(e.target.value)}
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 mb-4 outline-none focus:ring-2 focus:ring-[#00D9FF] focus:bg-white/10 text-white transition-all"
            >
              <option value="student" className="bg-[#0F2A52]">Schüler</option>
              <option value="teacher" className="bg-[#0F2A52]">Lehrer</option>
              <option value="parent" className="bg-[#0F2A52]">Eltern</option>
            </select>

            <input
              type="text"
              placeholder="Name *"
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 mb-4 outline-none focus:ring-2 focus:ring-[#00D9FF] focus:bg-white/10 text-white placeholder:text-white/30 transition-all"
            />

            <input
              type="tel"
              placeholder="Telefon (optional)"
              value={registerPhone}
              onChange={(e) => setRegisterPhone(e.target.value)}
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 mb-4 outline-none focus:ring-2 focus:ring-[#00D9FF] focus:bg-white/10 text-white placeholder:text-white/30 transition-all"
            />

            <input
              type="text"
              placeholder="Instrument (optional)"
              value={registerInstrument}
              onChange={(e) => setRegisterInstrument(e.target.value)}
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 mb-4 outline-none focus:ring-2 focus:ring-[#00D9FF] focus:bg-white/10 text-white placeholder:text-white/30 transition-all"
            />

            {/* DSGVO CHECKBOX - PFLICHT */}
            <div className="mb-4 bg-white/5 rounded-xl p-4 border border-white/10">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dsgvoAccepted}
                  onChange={(e) => setDsgvoAccepted(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-white/30 bg-white/5 text-[#00D9FF] focus:ring-2 focus:ring-[#00D9FF] cursor-pointer"
                />
                <span className="text-sm text-white/80 leading-relaxed">
                  Ich stimme der <span className="text-[#00D9FF] font-semibold">Datenschutzerklärung</span> zu. 
                  Meine Daten werden nur für die Nutzung der App gespeichert. *
                </span>
              </label>
            </div>

            <button
              onClick={handleRegister}
              disabled={loading || !dsgvoAccepted}
              className="w-full bg-[#00D9FF] hover:bg-[#00D9FF]/90 transition text-[#0B1E3F] font-bold p-4 rounded-xl mb-4 shadow-[0_0_30px_rgba(0,217,255,0.3)] hover:shadow-[0_0_40px_rgba(0,217,255,0.5)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Lädt..." : "Registrieren"}
            </button>

            <button
              onClick={() => {setIsLogin(true); setError(""); setSuccess("");}}
              className="w-full bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 transition text-white font-semibold p-4 rounded-xl active:scale-95"
            >
              Zurück zum Login
            </button>
          </>
        )}

        <p className="text-xs text-white/40 text-center mt-4">
          * Pflichtfeld
        </p>
      </div>
    </main>
  );
}