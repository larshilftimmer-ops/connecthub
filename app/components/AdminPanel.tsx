"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function AdminPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [activeAdminTab, setActiveAdminTab] = useState("users");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const { data } = await supabase
      .from("profiles")
      .select("email, role, name, phone, instrument")
      .order("email", { ascending: true });

    if (data) {
        console.log(data);
      setUsers(data);
    }
  }

  return (
    <section className="bg-zinc-900 rounded-2xl p-6">
      <h2 className="text-2xl font-bold mb-4">
        Admin Panel
      </h2>

      <p className="text-gray-400 mb-6">
        Verwaltungsbereich der Musikschule.
      </p>

      <input
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  placeholder="Benutzer suchen..."
  className="w-full p-4 rounded-xl bg-zinc-800 mb-6"
/>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setActiveAdminTab("users")}
          className="bg-zinc-800 p-5 rounded-2xl text-left"
        >
          👥 Benutzer
        </button>

        <button className="bg-zinc-800 p-5 rounded-2xl text-left">
          🎵 Kurse
        </button>

        <button className="bg-zinc-800 p-5 rounded-2xl text-left">
          📅 Stundenplan
        </button>

        <button className="bg-zinc-800 p-5 rounded-2xl text-left">
          📰 News
        </button>
      </div>

      {activeAdminTab === "users" && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">
            Benutzerverwaltung
          </h3>
          <p className="text-gray-400 mb-4">
            Gefundene Benutzer: {users.length}
            </p>

          <div className="space-y-3">
          {users
  .filter((user) =>
    user.email.toLowerCase().includes(search.toLowerCase())
  )
  .map((user) => (
              <div
                key={user.email}
                className="bg-zinc-800 p-4 rounded-xl"
              >
                <p className="font-bold">
                  {user.email}
                </p>

                <p className="text-gray-400">
                  Rolle: {user.role || "schueler"}
                </p>

                <p className="text-gray-400">
                Name: {user.name || "-"}
                </p>

                <p className="text-gray-400">
                Telefon: {user.phone || "-"}
                </p>

                <p className="text-gray-400">
                Instrument: {user.instrument || "-"}
                </p>
                
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}