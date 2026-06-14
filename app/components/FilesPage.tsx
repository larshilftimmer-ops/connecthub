"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../hooks/useAuth";

type FileItem = {
  name: string;
  path: string;
  size?: number;
  shared_by?: string;
  shared_with_me?: boolean;
  shared_users?: string[];
};

type Props = {
  userRole?: string;
};

export default function FilesPage({ userRole = "guest" }: Props) {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sharingFile, setSharingFile] = useState<string | null>(null);
  const [shareEmail, setShareEmail] = useState("");

  const isAdmin = userRole === "admin" || [
    'l.c.petersen2@gmail.com', 
    'kartmann@musikschulebadsoden.de', 
    'info@musikschulebadsoden.de', 
    'kopp_m@musikschulebadsoden.de'
  ].includes(user?.email || "");

  useEffect(() => {
    if (user?.email) loadFiles();
  }, [user?.email, userRole]);

  async function loadFiles() {
    if (!user?.email) return;

    const allFiles: FileItem[] = [];

    // 1. Eigene Dateien
    const { data: myFiles } = await supabase.storage
     .from("files")
     .list(`uploads/${userRole}`);

    if (myFiles) {
      for (const file of myFiles) {
        const path = `uploads/${userRole}/${file.name}`;
        
        // Lade mit wem geteilt
        const { data: shares } = await supabase
         .from("file_shares")
         .select("shared_with")
         .eq("file_path", path);

        allFiles.push({
         ...file,
          path,
          shared_users: shares?.map(s => s.shared_with) || []
        });
      }
    }

    // 2. Mit mir geteilte Dateien
    const { data: shares } = await supabase
     .from("file_shares")
     .select("*")
     .eq("shared_with", user.email);

    if (shares) {
      for (const share of shares) {
        allFiles.push({
          name: share.file_name,
          path: share.file_path,
          shared_by: share.shared_by,
          shared_with_me: true,
        });
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
                path: `uploads/${folder}/${file.name}`,
              });
            }
          });
        }
      }
    }

    setFiles(allFiles);
  }

  async function shareFile(file: FileItem) {
    if (!shareEmail.trim() || !user?.email) return;
    
    // Validierung: Nicht mit sich selbst teilen
    if (shareEmail === user.email) {
      alert("Du kannst nicht mit dir selbst teilen");
      return;
    }

    // Check ob User existiert
    const { data: userExists } = await supabase
     .from('profiles')
     .select('email')
     .eq('email', shareEmail)
     .maybeSingle();

    if (!userExists) {
      alert("User nicht gefunden. Person muss sich erst registrieren.");
      return;
    }

    // Teilen
    const { error } = await supabase
     .from("file_shares")
     .insert({
        file_path: file.path,
        file_name: file.name,
        shared_by: user.email,
        shared_with: shareEmail,
      });

    if (error) {
      if (error.code === '23505') {
        alert("Bereits mit dieser Person geteilt");
      } else {
        alert("Fehler: " + error.message);
      }
    } else {
      setShareEmail("");
      setSharingFile(null);
      loadFiles(); // Refresh
    }
  }

  async function unshareFile(file: FileItem, email: string) {
    if (!confirm(`Zugriff für ${email} entziehen?`)) return;

    await supabase
     .from("file_shares")
     .delete()
     .eq("file_path", file.path)
     .eq("shared_with", email);

    loadFiles();
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
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return '🖼️';
    if (['doc', 'docx'].includes(ext || '')) return '📝';
    return '📁';
  }

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full h-[calc(100vh-7rem)] bg-gradient-to-br from-[#0B1E3F] via-[#0D2247] to-[#0B1E3F] rounded-2xl overflow-hidden flex flex-col">
      
      {/* Header */}
      <div className="bg-[#0F2A52]/80 backdrop-blur-xl border-b border-white/10 px-4 py-4">
        <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <span className="text-[#00D9FF]">📁</span> Dateien teilen
        </h2>
        <p className="text-sm text-white/40">
          Klick auf Teilen → E-Mail eingeben → Enter. Fertig.
        </p>
      </div>

      {/* Search */}
      <div className="p-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Suchen..."
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#00D9FF] placeholder:text-white/30"
        />
      </div>

      {/* Files */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
        {filteredFiles.length === 0? (
          <div className="bg-[#0F2A52]/60 border border-white/10 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-3 opacity-20">📂</div>
            <p className="text-white/40">Keine Dateien</p>
          </div>
        ) : (
          filteredFiles.map((file) => (
            <div
              key={file.path}
              className="bg-[#0F2A52]/60 border border-white/10 rounded-xl p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-[#00D9FF]/10 flex items-center justify-center text-2xl">
                  {getFileIcon(file.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm truncate">
                    {file.name}
                  </h3>
                  {file.shared_with_me && (
                    <p className="text-xs text-green-400">
                      Geteilt von {file.shared_by}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => downloadFile(file)}
                  className="bg-[#00D9FF] text-[#0B1E3F] px-4 py-2.5 rounded-xl font-bold text-sm"
                >
                  ⬇️
                </button>
              </div>

              {/* Teilen-Bereich - nur bei eigenen Dateien */}
              {!file.shared_with_me && (
                <div className="border-t border-white/10 pt-3">
                  {sharingFile === file.path? (
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && shareFile(file)}
                        placeholder="E-Mail eingeben + Enter"
                        autoFocus
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#00D9FF] placeholder:text-white/30"
                      />
                      <button
                        onClick={() => {setSharingFile(null); setShareEmail("");}}
                        className="bg-white/10 text-white px-3 py-2 rounded-lg text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSharingFile(file.path)}
                      className="w-full bg-white/5 hover:bg-[#00D9FF]/20 border border-white/10 hover:border-[#00D9FF]/50 text-white/80 hover:text-[#00D9FF] py-2 rounded-lg text-sm font-semibold transition-all"
                    >
                      👥 Teilen
                    </button>
                  )}

                  {/* Zeige mit wem geteilt */}
                  {file.shared_users && file.shared_users.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-white/40">Geteilt mit:</p>
                      {file.shared_users.map(email => (
                        <div key={email} className="flex items-center justify-between bg-[#00D9FF]/10 px-3 py-1.5 rounded-lg">
                          <span className="text-xs text-[#00D9FF]">{email}</span>
                          <button
                            onClick={() => unshareFile(file, email)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            Entfernen
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* DSGVO Hinweis */}
      <div className="bg-[#0F2A52]/80 border-t border-white/10 p-4">
        <p className="text-xs text-white/60 text-center">
          🔒 DSGVO: Nur du + eingeladene Personen sehen deine Dateien
        </p>
      </div>
    </div>
  );
}