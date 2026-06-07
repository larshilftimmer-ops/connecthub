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
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError("Bitte E-Mail und Passwort eingeben");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    if (!email.trim() || !password.trim()) {
      setError("Bitte E-Mail und Passwort eingeben");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await onRegister(email, password, {
        role: registerRole,
        name: registerName,
        phone: registerPhone,
        instrument: registerInstrument,
      });
      setError("Registrierung erfolgreich! Bitte E-Mail bestätigen.");
      setIsLogin(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0B1E3F] via-[#0D2247] to-[#0B1E3F] text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00D9FF]/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00D9FF]/5 rounded-full blur-3xl animate-pulse delay-1000" />
      
      {/* Musiknoten */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[10%] text-[#00D9FF]/10 text-6xl animate-pulse">♪</div>
        <div className="absolute top-[65%] right-[12%] text-[#00D9FF]/10 text-8xl animate-pulse delay-300">♫</div>
        <div className="absolute bottom-[20%] left-[20%] text-[#00D9FF]/10 text-5xl animate-pulse delay-700">♬</div>
      </div>

      <div className="w-full max-w-md bg-[#0F2A52]/60 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10 p-6 sm:p-8 relative z-10">
        <div className="mb-8 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00D9FF] to-[#0099FF] flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(0,217,255,0.5)] mx-auto mb-4">
            🎵
          </div>
          <p className="text-sm font-semibold text-[#00D9FF] mb-2">
            Freie Musikschule in Bad Soden e.V.
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Bad Sodify Music
          </h1>
          <p className="text-white/60">{isLogin ? "Login" : "Registrierung"}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-sm">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 rounded-xl bg-white/5 border border-white/10 mb-4 outline-none focus:ring-2 focus:ring-[#00D9FF] focus:bg-white/10 text-white placeholder:text-white/30 transition-all"
        />

        <input
          type="password"
          placeholder="Passwort"
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
              onClick={() => setIsLogin(false)}
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
              placeholder="Name"
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 mb-4 outline-none focus:ring-2 focus:ring-[#00D9FF] focus:bg-white/10 text-white placeholder:text-white/30 transition-all"
            />

            <input
              type="text"
              placeholder="Telefon"
              value={registerPhone}
              onChange={(e) => setRegisterPhone(e.target.value)}
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 mb-4 outline-none focus:ring-2 focus:ring-[#00D9FF] focus:bg-white/10 text-white placeholder:text-white/30 transition-all"
            />

            <input
              type="text"
              placeholder="Instrument"
              value={registerInstrument}
              onChange={(e) => setRegisterInstrument(e.target.value)}
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 mb-4 outline-none focus:ring-2 focus:ring-[#00D9FF] focus:bg-white/10 text-white placeholder:text-white/30 transition-all"
            />

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-[#00D9FF] hover:bg-[#00D9FF]/90 transition text-[#0B1E3F] font-bold p-4 rounded-xl mb-4 shadow-[0_0_30px_rgba(0,217,255,0.3)] hover:shadow-[0_0_40px_rgba(0,217,255,0.5)] active:scale-95 disabled:opacity-50"
            >
              {loading ? "Lädt..." : "Registrieren"}
            </button>

            <button
              onClick={() => setIsLogin(true)}
              className="w-full bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 transition text-white font-semibold p-4 rounded-xl active:scale-95"
            >
              Zurück zum Login
            </button>
          </>
        )}
      </div>
    </main>
  );
}