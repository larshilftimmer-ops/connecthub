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
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

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
      if (profile?.role) setUserRole(profile.role);
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
    if (error) return alert("Benutzer konnten nicht geladen werden.");
    if (data) setUsers(data);
  }

  async function loadFiles() {
    const folders = userRole === "admin"? ["all", "student", "teacher", "parent"] : ["all", userRole];
    const allFiles: FileItem[] = [];
    for (const folder of folders) {
      const { data } = await supabase.storage.from("files").list(`uploads/${folder}`);
      if (data) data.forEach((file) => allFiles.push({ name: file.name, folder }));
    }
    setFiles(allFiles);
  }

  function downloadFile(fileName: string, folder: string) {
    const { data } = supabase.storage.from("files").getPublicUrl(`uploads/${folder}/${fileName}`);
    window.open(data.publicUrl, "_blank");
  }

  async function deleteFile(fileName: string, folder: string) {
    if (!confirm("Datei wirklich löschen?")) return;
    const { error } = await supabase.storage.from("files").remove([`uploads/${folder}/${fileName}`]);
    if (error) return alert("Löschen fehlgeschlagen: " + error.message);
    alert("Datei gelöscht.");
    loadFiles();
  }

  async function uploadFile() {
    if (!selectedFile) return alert("Bitte Datei auswählen.");
    setIsUploading(true);
    const fileName = `${Date.now()}-${selectedFile.name}`;
    const { error } = await supabase.storage.from("files").upload(`uploads/${uploadTarget}/${fileName}`, selectedFile);
    setIsUploading(false);
    if (error) return alert("Upload fehlgeschlagen: " + error.message);
    setSelectedFile(null);
    alert("Datei hochgeladen.");
    loadFiles();
  }

  async function deleteUser(userId: string, email: string) {
    if (!confirm(`Benutzer ${email} wirklich löschen?`)) return;
    const res = await fetch("/api/news/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (data.error) return alert("Benutzer konnte nicht gelöscht werden: " + data.error);
    alert("Benutzer gelöscht.");
    loadUsers();
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: "bg-[#d8a928]/20 text-[#d8a928] border-[#d8a928]/30",
      teacher: "bg-[#00D9FF]/20 text-[#00D9FF] border-[#00D9FF]/30",
      student: "bg-white/20 text-white border-white/30",
      parent: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    };
    return styles[role as keyof typeof styles] || styles.student;
  };

  return (
    <section className="relative w-full max-w-full overflow-x-hidden bg-gradient-to-br from-[#0B1E3F] via-[#0F2A52] to-[#123456] min-h-screen p-3 sm:p-6 -m-3 sm:-m-6 space-y-4">
      
      {/* Noten Background - weniger auf Mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[5%] left-[5%] text-[#00D9FF]/5 text-4xl sm:text-6xl animate-pulse">♪</div>
        <div className="absolute bottom-[10%] right-[8%] text-[#00D9FF]/5 text-5xl sm:text-8xl animate-pulse delay-300">♫</div>
      </div>

      {/* Header kompakter */}
      <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-5">
        <p className="text-xs sm:text-sm font-semibold text-[#00D9FF] mb-1 uppercase tracking-wider">
          Verwaltung
        </p>
        <h2 className="text-xl sm:text-3xl font-bold text-white tracking-tight">
          Admin Panel
        </h2>
        <p className="text-white/60 mt-1 text-sm sm:text-base">
          Benutzer & Dateien verwalten
        </p>
      </div>

      {/* Tabs kompakter */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <button
          onClick={() => setActiveAdminTab("users")}
          className={`group relative p-3 sm:p-4 rounded-2xl sm:rounded-3xl text-left border shadow-lg transition-all duration-300 active:scale-95 ${
            activeAdminTab === "users"
            ? "bg-gradient-to-br from-[#00D9FF] to-[#0099CC] text-white border-[#00D9FF]/50"
              : "bg-white/10 backdrop-blur-lg text-white border-white/20"
          }`}
        >
          <div className="text-2xl sm:text-3xl mb-1">👥</div>
          <p className="font-bold text-sm sm:text-base">Benutzer</p>
        </button>

        <button
          onClick={() => setActiveAdminTab("files")}
          className={`group relative p-3 sm:p-4 rounded-2xl sm:rounded-3xl text-left border shadow-lg transition-all duration-300 active:scale-95 ${
            activeAdminTab === "files"
            ? "bg-gradient-to-br from-[#00D9FF] to-[#0099CC] text-white border-[#00D9FF]/50"
              : "bg-white/10 backdrop-blur-lg text-white border-white/20"
          }`}
        >
          <div className="text-2xl sm:text-3xl mb-1">📁</div>
          <p className="font-bold text-sm sm:text-base">Dateien</p>
        </button>
      </div>

      {/* Files Tab */}
      {activeAdminTab === "files" && (
        <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-5">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-3">Dateien</h3>

          <div className="bg-white/5 border border-white/10 p-3 rounded-xl mb-4">
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full mb-3 text-xs text-white file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#00D9FF]/20 file:text-[#00D9FF] file:text-xs"
            />

            <div className="flex gap-2">
              <select
                value={uploadTarget}
                onChange={(e) => setUploadTarget(e.target.value)}
                className="flex-1 bg-white/10 border border-white/20 text-white text-sm p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-[#00D9FF] [&>option]:bg-[#0B1E3F]"
              >
                <option value="all">Alle</option>
                <option value="student">Schüler</option>
                <option value="teacher">Lehrer</option>
                <option value="parent">Eltern</option>
              </select>

              <button
                onClick={uploadFile}
                disabled={isUploading}
                className="bg-gradient-to-r from-[#00D9FF] to-[#0099CC] disabled:opacity-50 text-white font-semibold px-4 py-2.5 rounded-lg text-sm shadow-lg active:scale-95"
              >
                {isUploading? "..." : "Upload"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {files.length === 0? (
              <p className="text-white/60 text-sm col-span-full">Keine Dateien vorhanden.</p>
            ) : (
              files.map((file) => (
                <div
                  key={`${file.folder}-${file.name}`}
                  className="bg-white/5 border border-white/10 p-3 rounded-xl active:scale-98 transition"
                >
                  <p className="font-medium text-xs sm:text-sm text-white truncate">
                    {file.name}
                  </p>
                  <span className={`inline-block text-[10px] font-semibold mt-1 px-2 py-0.5 rounded-full border ${getRoleBadge(file.folder)}`}>
                    {file.folder}
                  </span>

                  <div className="grid grid-cols-2 gap-1.5 mt-2">
                    <button
                      onClick={() => downloadFile(file.name, file.folder)}
                      className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-2 py-1.5 rounded-lg text-xs"
                    >
                      ↓
                    </button>
                    {userRole === "admin" && (
                      <button
                        onClick={() => deleteFile(file.name, file.folder)}
                        className="bg-red-500/20 border border-red-500/30 text-red-300 px-2 py-1.5 rounded-lg text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeAdminTab === "users" && (
        <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-5">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-3">Benutzer</h3>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Suchen..."
            className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder:text-white/40 mb-4 outline-none focus:ring-1 focus:ring-[#00D9FF]"
          />

          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
              <p className="text-xs text-white/60">Total</p>
              <p className="text-lg sm:text-xl font-bold text-white">{users.length}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
              <p className="text-xs text-white/60">Schüler</p>
              <p className="text-lg sm:text-xl font-bold text-[#00D9FF]">
                {users.filter((u) => u.role === "student").length}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
              <p className="text-xs text-white/60">Lehrer</p>
              <p className="text-lg sm:text-xl font-bold text-[#d8a928]">
                {users.filter((u) => u.role === "teacher").length}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {filteredUsers.length === 0? (
              <p className="text-white/60 text-sm">Keine Benutzer gefunden.</p>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id || user.email}
                  className="bg-white/5 border border-white/10 p-3 rounded-xl active:scale-98 transition"
                >
                  <div 
                    className="flex items-center gap-2.5 cursor-pointer"
                    onClick={() => setExpandedUser(expandedUser === user.id? null : user.id)}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#0099CC] flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {user.email[0].toUpperCase()}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-white truncate">
                        {user.name || user.email}
                      </p>
                      <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </div>

                    <span className="text-white/40 text-lg">
                      {expandedUser === user.id? "−" : "+"}
                    </span>
                  </div>

                  {expandedUser === user.id && (
                    <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5 text-xs text-white/60">
                      <p>Email: {user.email}</p>
                      <p>Telefon: {user.phone || "-"}</p>
                      <p>Instrument: {user.instrument || "-"}</p>
                      <button
                        onClick={() => deleteUser(user.id, user.email)}
                        className="w-full mt-2 bg-red-500/20 border border-red-500/30 text-red-300 px-3 py-2 rounded-lg text-xs font-semibold"
                      >
                        Löschen
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </section>
  );
}