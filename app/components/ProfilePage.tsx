"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabase";

type Props = {
  user: any;
};

export default function ProfilePage({ user }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [instrument, setInstrument] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
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
    const { error } = await supabase
      .from("profiles")
      .update({
        name,
        phone,
        instrument,
      })
      .eq("email", user.email);

    if (error) {
      alert("Profil konnte nicht gespeichert werden.");
      return;
    }

    async function changePassword() {
        if (!newPassword.trim()) {
          setNewPassword("");
            alert("Bitte neues Passwort eingeben.");
          return;
        }
      
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
      
        if (error) {
          alert("Passwort konnte nicht geändert werden.");
          return;
        }
      
        setNewPassword("");
        alert("Passwort geändert.");
      }

    alert("Profil gespeichert.");
  }

  return (
    <section className="bg-zinc-900 rounded-2xl p-6">
      <h2 className="text-2xl font-bold mb-4">
        Profil bearbeiten
      </h2>

      <div className="space-y-4">
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-4 rounded-xl bg-zinc-800"
        />

        <input
          placeholder="Telefon"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-4 rounded-xl bg-zinc-800"
        />

        <input
          placeholder="Instrument"
          value={instrument}
          onChange={(e) => setInstrument(e.target.value)}
          className="w-full p-4 rounded-xl bg-zinc-800"
        />

<input
  type="password"
  placeholder="Neues Passwort"
  value={newPassword}
  onChange={(e) =>
    setNewPassword(e.target.value)
  }
  className="w-full p-4 rounded-xl bg-zinc-800"
/>

        <input
          value={user.email}
          disabled
          className="w-full p-4 rounded-xl bg-zinc-800 text-gray-400"
        />

        <button
          onClick={saveProfile}
          className="w-full bg-blue-600 p-4 rounded-xl"
        >
          Profil speichern
        </button>

        <button
  onClick={changePassword}
  className="w-full bg-red-600 p-4 rounded-xl"
>
  Passwort ändern
</button>

      </div>
    </section>
  );
}