"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase";

type UserProfile = {
  id: string;
  email: string;
  role: string;
  name?: string;
  phone?: string;
  instrument?: string;
};

type FileItem = {
  name: string;
  folder: string;
};

export default function AdminPanel() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeAdminTab, setActiveAdminTab] = useState("users");
  const [search, setSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [userRole, setUserRole] = useState("student");
  const [uploadTarget, setUploadTarget] = useState("all");
  const [isUploading, setIsUploading] = useState(false);

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      `${user.email} ${user.name || ""} ${user.role || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [users, search]);

  useEffect(() => {
    async function loadCurrentRole() {
      const { data } = await supabase.auth.getUser();

      if (!data.user?.email) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("email", data.user.email)
        .single();

      if (profile?.role) {
        setUserRole(profile.role);
      }
    }

    loadCurrentRole();
  }, []);

  useEffect(() => {
    loadUsers();
    loadFiles();
  }, [userRole]);

  async function loadUsers() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, role, name, phone, instrument")
      .order("email", { ascending: true });

    if (error) {
      alert("Benutzer konnten nicht geladen werden.");
      return;
    }

    if (data) {
      setUsers(data);
    }
  }

  async function loadFiles() {
    let folders = ["all"];

    if (userRole === "admin") {
      folders = ["all", "student", "teacher", "parent"];
    } else {
      folders = ["all", userRole];
    }

    const allFiles: FileItem[] = [];

    for (const folder of folders) {
      const { data } = await supabase.storage
        .from("files")
        .list(`uploads/${folder}`);

      if (data) {
        data.forEach((file) => {
          allFiles.push({
            name: file.name,
            folder,
          });
        });
      }
    }

    setFiles(allFiles);
  }

  function downloadFile(fileName: string, folder: string) {
    const { data } = supabase.storage
      .from("files")
      .getPublicUrl(`uploads/${folder}/${fileName}`);

    window.open(data.publicUrl, "_blank");
  }

  async function deleteFile(fileName: string, folder: string) {
    const confirmDelete = confirm("Datei wirklich löschen?");

    if (!confirmDelete) return;

    const { error } = await supabase.storage
      .from("files")
      .remove([`uploads/${folder}/${fileName}`]);

    if (error) {
      alert("Löschen fehlgeschlagen: " + error.message);
      return;
    }

    alert("Datei gelöscht.");
    loadFiles();
  }

  async function uploadFile() {
    if (!selectedFile) {
      alert("Bitte Datei auswählen.");
      return;
    }

    setIsUploading(true);

    const fileName = `${Date.now()}-${selectedFile.name}`;

    const { error } = await supabase.storage
      .from("files")
      .upload(`uploads/${uploadTarget}/${fileName}`, selectedFile);

    setIsUploading(false);

    if (error) {
      alert("Upload fehlgeschlagen: " + error.message);
      return;
    }

    setSelectedFile(null);
    alert("Datei hochgeladen.");
    loadFiles();
  }

  async function deleteUser(userId: string, email: string) {
    const confirmDelete = confirm(
      `Benutzer ${email} wirklich löschen?`
    );

    if (!confirmDelete) return;

    const res = await fetch("/api/news/delete-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
      }),
    });

    const data = await res.json();

    if (data.error) {
      alert("Benutzer konnte nicht gelöscht werden: " + data.error);
      return;
    }

    alert("Benutzer gelöscht.");
    loadUsers();
  }

  return (
    <section className="space-y-8">
      <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm p-5 sm:p-6">
        <p className="text-sm font-semibold text-[#d8a928] mb-2">
          Verwaltung
        </p>

        <h2 className="text-2xl sm:text-3xl font-bold text-[#7a1f1f]">
          Admin Panel
        </h2>

        <p className="text-zinc-500 mt-2">
          Benutzer, Dateien und Inhalte der Musikschule verwalten.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveAdminTab("users")}
          className={`p-5 rounded-3xl text-left border shadow-sm transition ${
            activeAdminTab === "users"
              ? "bg-[#7a1f1f] text-white border-[#7a1f1f]"
              : "bg-white text-zinc-900 border-zinc-200"
          }`}
        >
          <div className="text-3xl mb-3">👥</div>
          <p className="font-bold">Benutzer</p>
        </button>

        <button
          onClick={() => setActiveAdminTab("files")}
          className={`p-5 rounded-3xl text-left border shadow-sm transition ${
            activeAdminTab === "files"
              ? "bg-[#7a1f1f] text-white border-[#7a1f1f]"
              : "bg-white text-zinc-900 border-zinc-200"
          }`}
        >
          <div className="text-3xl mb-3">📁</div>
          <p className="font-bold">Dateien</p>
        </button>

        <button className="bg-white p-5 rounded-3xl text-left border border-zinc-200 shadow-sm">
          <div className="text-3xl mb-3">🎵</div>
          <p className="font-bold">Kurse</p>
        </button>

        <button className="bg-white p-5 rounded-3xl text-left border border-zinc-200 shadow-sm">
          <div className="text-3xl mb-3">📰</div>
          <p className="font-bold">News</p>
        </button>
      </div>

      {activeAdminTab === "files" && (
        <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm p-5 sm:p-6">
          <h3 className="text-xl font-bold text-[#7a1f1f] mb-4">
            Dateien verwalten
          </h3>

          <div className="bg-[#f7f3ea] border border-zinc-200 p-4 rounded-2xl mb-6">
            <input
              type="file"
              onChange={(e) =>
                setSelectedFile(e.target.files?.[0] || null)
              }
              className="w-full mb-4"
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={uploadTarget}
                onChange={(e) => setUploadTarget(e.target.value)}
                className="bg-white border border-zinc-200 p-3 rounded-xl outline-none"
              >
                <option value="all">Alle</option>
                <option value="student">Schüler</option>
                <option value="teacher">Lehrer</option>
                <option value="parent">Eltern</option>
              </select>

              <button
                onClick={uploadFile}
                disabled={isUploading}
                className="bg-[#7a1f1f] hover:bg-[#651919] disabled:opacity-50 transition text-white font-semibold px-5 py-3 rounded-xl"
              >
                {isUploading ? "Lädt hoch..." : "Datei hochladen"}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {files.length === 0 ? (
              <p className="text-zinc-500">
                Keine Dateien vorhanden.
              </p>
            ) : (
              files.map((file) => (
                <div
                  key={`${file.folder}-${file.name}`}
                  className="bg-[#f7f3ea] border border-zinc-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div>
                    <p className="font-semibold break-all">
                      {file.name}
                    </p>

                    <p className="text-sm text-zinc-500">
                      Ordner: {file.folder}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadFile(file.name, file.folder)}
                      className="bg-zinc-900 text-white px-3 py-2 rounded-xl text-sm"
                    >
                      Download
                    </button>

                    {userRole === "admin" && (
                      <button
                        onClick={() => deleteFile(file.name, file.folder)}
                        className="bg-red-600 text-white px-3 py-2 rounded-xl text-sm"
                      >
                        Löschen
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeAdminTab === "users" && (
        <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm p-5 sm:p-6">
          <h3 className="text-xl font-bold text-[#7a1f1f] mb-4">
            Benutzerverwaltung
          </h3>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Benutzer suchen..."
            className="w-full p-4 rounded-xl bg-[#f7f3ea] border border-zinc-200 mb-6 outline-none focus:ring-2 focus:ring-[#d8a928]"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#f7f3ea] border border-zinc-200 rounded-2xl p-4">
              <p className="text-sm text-zinc-500">Benutzer</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>

            <div className="bg-[#f7f3ea] border border-zinc-200 rounded-2xl p-4">
              <p className="text-sm text-zinc-500">Schüler</p>
              <p className="text-2xl font-bold">
                {users.filter((u) => u.role === "student").length}
              </p>
            </div>

            <div className="bg-[#f7f3ea] border border-zinc-200 rounded-2xl p-4">
              <p className="text-sm text-zinc-500">Lehrer</p>
              <p className="text-2xl font-bold">
                {users.filter((u) => u.role === "teacher").length}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {filteredUsers.length === 0 ? (
              <p className="text-zinc-500">
                Keine Benutzer gefunden.
              </p>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id || user.email}
                  className="bg-[#f7f3ea] border border-zinc-200 p-4 rounded-2xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                >
                  <div>
                    <p className="font-bold break-all">
                      {user.email}
                    </p>

                    <p className="text-sm text-zinc-500">
                      Rolle: {user.role || "-"}
                    </p>

                    <p className="text-sm text-zinc-500">
                      Name: {user.name || "-"}
                    </p>

                    <p className="text-sm text-zinc-500">
                      Telefon: {user.phone || "-"}
                    </p>

                    <p className="text-sm text-zinc-500">
                      Instrument: {user.instrument || "-"}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteUser(user.id, user.email)}
                    className="bg-red-600 hover:bg-red-700 transition text-white px-4 py-2 rounded-xl font-semibold"
                  >
                    Löschen
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </section>
  );
}