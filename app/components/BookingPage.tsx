"use client";

type Props = {
  user: any;
};

export default function BookingPage({ user }: Props) {
  return (
    <div className="w-full h-[calc(100vh-7rem)] bg-gradient-to-br from-[#0B1E3F] via-[#0D2247] to-[#0B1E3F] rounded-2xl overflow-hidden flex flex-col relative">
      
      <div className="bg-[#0F2A52]/80 backdrop-blur-xl border-b border-white/10 px-4 py-4 relative z-10">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">📅</span>
          Buchungen
        </h2>
        <p className="text-white/60 text-sm mt-1">Probestunde & Termine online buchen</p>
      </div>

      <div className="flex-1 relative z-10 bg-white">
        <iframe
          src="https://anmeldung.musikschulebadsoden.de"
          className="w-full h-full border-0"
          title="Buchungstool"
        />
      </div>
    </div>
  );
}