"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../hooks/useAuth";

type FileItem = {
  name: string;
  folder: string;
  path: string;
  size?: number;
  shared_by?: string;
  shared_with_me?: boolean;
  shared_count?: number;
};

type ChatUser = {
  email: string;
  name?: string;
};

type Props = {
  userRole?: string;
};

export default function FilesPage({ userRole = "guest" }: Props) {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showShareModal, setShowShareModal] = useState<FileItem | null>(null);
  const [searchUser, setSearchUser] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sharedUsers, setSharedUsers] = useState<string[]>([]);

  const isAdmin = userRole === "admin" || [
    'l.c.petersen2@gmail.com', 
    'kartmann@musikschulebadsoden.de', 
    'info@musikschulebadsoden.de', 
    'kopp_m@musikschulebadsoden.de'
  ].includes(user?.email || "");

  useEffect(() => {
    if (user?.email) {
      loadFiles();
      loadUsers();
    }
  }, [user?.email, userRole]);

  async function loadFiles() {
    if (!user?.email) return;

    const allFiles: FileItem[] = [];

    // 1. Eigene Uploads laden - aus eigenem Ordner
    const myFolder = userRole;
    const { data: myFiles } = await supabase.storage
     .from("files")
     .list(`uploads/${myFolder}`);

    if (myFiles) {
      myFiles.forEach((file) => {
        allFiles.push({
          ...file,
          folder: myFolder,
          path: `uploads/${myFolder}/${file.name}`,
          shared_by: user.email,
        });
      });
    }

    // 2. Mit mir geteilte Dateien laden - DSGVO: Nur was explizit geteilt wurde
    const { data: shares } = await supabase
     .from("file_shares")
     .select("*")
     .eq("shared_with", user.email);

    if (shares) {
      for (const share of shares) {
        // Check ob Datei noch existiert
        const folderPath = share.file_path.split('/').slice(0, -1).join('/');
        const fileName = share.file_path.split('/').pop();
        
        const { data: fileExists } = await supabase.storage
         .from("files")
         .list(folderPath, { search: fileName });

        if (fileExists && fileExists.length > 0) {
          allFiles.push({
            name: share.file_name,
            folder: folderPath.replace('uploads/', ''),
            path: share.file_path,
            shared_by: share.shared_by,
            shared_with_me: true,
          });
        }
      }
    }

    // 3. Admin sieht alles
    if (isAdmin) {
      const folders = ["all", "student", "teacher", "parent"];
      for (const folder of folders) {
        const { data } = await supabase.storage
         .from("files")
         .list(`uploads/${folder}`);

        if (data) {
          data.forEach((file) => {
            if (!allFiles.find(f => f.path === `uploads/${folder}/${file.name}`)) {
              allFiles.push({
                ...file,
                folder,
                path: `uploads/${folder}/${file.name}`,
              });
            }
          });
        }
      }
    }

    // 4. Share-Counts laden
    for (const file of allFiles) {
      if (!file.shared_with_me) {
        const { count } = await supabase
         .from("file_shares")
         .select("*", { count: 'exact', head: true })
         .eq("file_path", file.path);
        file.shared_count = count || 0;
      }
    }

    setFiles(allFiles);
  }

  async function loadUsers() {
    const { data } = await supabase
     .from('profiles')
     .select('email, name')
     .neq('email', user?.email);
    setChatUsers(data || []);
  }

  async function openShareModal(file: FileItem) {
    setShowShareModal(file);
    
    // Lade wer bereits Zugriff hat
    const { data } = await supabase
     .from("file_shares")
     .select("shared_with")
     .eq("file_path", file.path);

    setSharedUsers(data?.map(d => d.shared_with) || []);
    setSelectedUsers(data?.map(d => d.shared_with) || []);
  }

  async function saveShares() {
    if (!showShareModal || !user?.email) return;

    const file = showShareModal;

    // 1. Entferne User die nicht mehr ausgewählt sind
    const toRemove = sharedUsers.filter(u => !selectedUsers.includes(u));
    if (toRemove.length > 0) {
      await supabase
       .from("file_shares")
       .delete()
       .eq("file_path", file.path)
       .in("shared_with", toRemove);
    }

    // 2. Füge neue User hinzu
    const toAdd = selectedUsers.filter(u => !sharedUsers.includes(u));
    if (toAdd.length > 0) {
      await supabase
       .from("file_shares")
       .insert(
          toAdd.map(email => ({
            file_path: file.path,
            file_name: file.name,
            shared_by: user.email,
            shared_with: email,
          }))
        );
    }

    setShowShareModal(null);
    loadFiles();
  }

  function toggleUserShare(email: string) {
    setSelectedUsers(prev =>
      prev.includes(email)
       ? prev.filter(e => e!== email)
        : [...prev, email]
    );
  }

  function downloadFile(file: FileItem) {
    const { data } = supabase.storage
     .from("files")
     .getPublicUrl(file.path);
    window.open(data.publicUrl, "_blank");
  }

  function getFileIcon(fileName: string) {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext || '')) return '📄';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return '🖼️';
    if (['doc', 'docx'].includes(ext || '')) return '📝';
    if (['xls', 'xlsx'].includes(ext || '')) return '📊';
    if (['zip', 'rar'].includes(ext || '')) return '📦';
    return '📁';
  }

  function formatFileSize(bytes: number) {
    if (!bytes) return '0 KB';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = chatUsers.filter(u =>
    `${u.name} ${u.email}`.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="w-full h-[calc(100vh-7rem)] bg-gradient-to-br from-[#0B1E3F] via-[#0D2247] to-[#0B1E3F] rounded-2xl overflow-hidden flex flex-col relative">
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-[#00D9FF]/5 rounded-full blur-3xl animate-pulse" />

      {/* Header */}
      <div className="bg-[#0F2A52]/80 backdrop-blur-xl border-b border-white/10 px-4 py-4 relative z-10">
        <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <span className="text-[#00D9FF]">📁</span> Meine Dateien
        </h2>
        <p className="text-sm text-white/40">
          {files.length} {files.length === 1? 'Datei' : 'Dateien'} • Nur du + eingeladene Personen sehen sie
        </p>
      </div>

      {/* Search */}
      <div className="p-3 relative z-10">
        <div className="bg-[#0F2A52]/60 backdrop-blur-xl border border-white/10 rounded-xl p-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Dateien suchen..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#00D9FF] placeholder:text-white/30"
          />
        </div>
      </div>

      {/* Files List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2 relative z-10">
        {filteredFiles.length === 0? (
          <div className="bg-[#0F2A52]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-3 opacity-20">📂</div>
            <p className="text-white/40 text-sm">Keine Dateien. Lade welche hoch oder lass dir welche teilen.</p>
          </div>
        ) : (
          filteredFiles.map((file) => (
            <div
              key={file.path}
              className="bg-[#0F2A52]/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:border-[#00D9FF]/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#00D9FF]/10 flex items-center justify-center text-2xl shrink-0">
                  {getFileIcon(file.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm mb-1 truncate">
                    {file.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <span className="text-white/40">{formatFileSize(file.size || 0)}</span>
                    {file.shared_with_me && (
                      <>
                        <span className="text-white/20">•</span>
                        <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 font-semibold">
                          Geteilt von {file.shared_by}
                        </span>
                      </>
                    )}
                    {file.shared_count! > 0 && !file.shared_with_me && (
                      <>
                        <span className="text-white/20">•</span>
                        <span className="px-2 py-0.5 rounded bg-[#00D9FF]/20 text-[#00D9FF] font-semibold">
                          👥 {file.shared_count} {file.shared_count === 1? 'Person' : 'Personen'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  {!file.shared_with_me && (
                    <button
                      onClick={() => openShareModal(file)}
                      className="bg-white/10 hover:bg-[#00D9FF]/20 border border-white/20 hover:border-[#00D9FF]/50 text-white/80 hover:text-[#00D9FF] px-3 py-2.5 rounded-xl font-bold text-sm transition-all"
                      title="Mit Personen teilen"
                    >
                      👥
                    </button>
                  )}
                  <button
                    onClick={() => downloadFile(file)}
                    className="bg-[#00D9FF] hover:bg-[#00D9FF]/90 text-[#0B1E3F] px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-[0_0_30px_rgba(0,217,255,0.3)]"
                  >
                    ⬇️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DSGVO Info */}
      <div className="bg-[#0F2A52]/80 backdrop-blur-xl border-t border-white/10 p-4 relative z-10">
        <div className="bg-[#00D9FF]/10 border border-[#00D9FF]/30 rounded-xl p-3 flex items-start gap-2">
          <span className="text-[#00D9FF] text-lg">🔒</span>
          <div className="flex-1">
            <p className="text-xs text-white/80 leading-relaxed">
              <span className="font-semibold text-white">DSGVO-sicher:</span> Nur du + eingeladene Personen sehen deine Dateien. 
              Klicken = Teilen. Admin kann alles sehen.
            </p>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowShareModal(null)}
        >
          <div
            className="bg-[#0F2A52] border border-white/10 rounded-2xl p-6 w-full max-w-md max-h- overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-[#00D9FF]">👥</span> Datei teilen
            </h3>
            <p className="text-white/60 text-sm mb-4 break-all">
              {showShareModal.name}
            </p>
            <p className="text-[#00D9FF] text-xs mb-3">
              ✓ Anklicken = Person bekommt Zugriff • Nochmal klicken = Zugriff entziehen
            </p>

            <input
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              placeholder="Person suchen..."
              className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-white mb-3 text-sm outline-none focus:border-[#00D9FF] placeholder:text-white/30"
            />

            <div className="max-h-64 overflow-y-auto space-y-1 mb-4">
              {filteredUsers.map(user => (
                <button
                  key={user.email}
                  onClick={() => toggleUserShare(user.email)}
                  className={`w-full px-3 py-2.5 flex items-center gap-3 rounded-lg text-sm transition ${
                    selectedUsers.includes(user.email)
                     ? "bg-[#00D9FF]/20 border-[#00D9FF] text-[#00D9FF]"
                      : "bg-white/5 hover:bg-white/10 text-white"
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selectedUsers.includes(user.email)
                     ? "bg-[#00D9FF] border-[#00D9FF] text-[#0B1E3F]"
                      : "border-white/30"
                  }`}>
                    {selectedUsers.includes(user.email) && "✓"}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{user.name || user.email}</p>
                    <p className="text-xs opacity-60">{user.email}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowShareModal(null)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-xl font-semibold transition"
              >
                Schließen
              </button>
              <button
                onClick={saveShares}
                className="flex-1 bg-[#00D9FF] text-[#0B1E3F] py-2.5 rounded-xl font-semibold transition active:scale-95 shadow-[0_0_30px_rgba(0,217,255,0.3)]"
              >
                Speichern ({selectedUsers.length})
              </button>
            </div>

            <p className="text-white/40 text- mt-3 text-center">
              DSGVO: Es wird gespeichert wer wann mit wem geteilt hat
            </p>
          </div>
        </div>
      )}
    </div>
  );
}