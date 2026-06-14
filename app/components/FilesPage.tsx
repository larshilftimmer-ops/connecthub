"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../hooks/useAuth";

type FileItem = {
  name: string;
  path: string;
  size?: number;
  shared_by?: string;
  shared_with_me?: boolean;
  shared_users?: { email: string; name?: string }[];
  created_at?: string;
};

type ChatUser = {
  email: string;
  name?: string;
};

type Props = {
  userRole?: string;
};

const MAX_FILE_SIZE = 10 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

export default function FilesPage({ userRole = "guest" }: Props) {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sharingFile, setSharingFile] = useState<string | null>(null);
  const [searchUser, setSearchUser] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showDSGVOConsent, setShowDSGVOConsent] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function loadUsers() {
    const { data } = await supabase
     .from('profiles')
     .select('email, name')
     .neq('email', user?.email)
     .order('name');
    setChatUsers(data || []);
  }

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
        
        const { data: shares } = await supabase
         .from("file_shares")
         .select("shared_with")
         .eq("file_path", path);

        const sharedEmails = shares?.map(s => s.shared_with) || [];
        
        const sharedUsers = await Promise.all(
          sharedEmails.map(async (email) => {
            const { data } = await supabase
             .from('profiles')
             .select('name')
             .eq('email', email)
             .maybeSingle();
            return { email, name: data?.name };
          })
        );

        allFiles.push({
         ...file,
          path,
          shared_users: sharedUsers,
          created_at: file.created_at
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
          created_at: share.created_at
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
                created_at: file.created_at
              });
            }
          });
        }
      }
    }

    setFiles(allFiles.sort((a, b) => 
      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    ));
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // DSGVO: Datei-Typ Check
    if (!ALLOWED_TYPES.includes(file.type)) {
      setMessage({ type: 'error', text: 'Dateityp nicht erlaubt. Nur PDF, Bilder und Dokumente.' });
      setTimeout(() => setMessage(null), 4000);
      return;
    }

    // DSGVO: Größen-Limit
    if (file.size > MAX_FILE_SIZE) {
      setMessage({ type: 'error', text: 'Datei zu groß. Maximum: 10MB.' });
      setTimeout(() => setMessage(null), 4000);
      return;
    }

    setSelectedFile(file);
    setShowDSGVOConsent(true);
  }

  async function uploadFile() {
    if (!selectedFile ||!user?.email) return;

    setUploading(true);
    setUploadProgress(0);
    setShowDSGVOConsent(false);

    const fileName = `${Date.now()}_${selectedFile.name}`;
    const filePath = `uploads/${userRole}/${fileName}`;

    const { error } = await supabase.storage
     .from("files")
     .upload(filePath, selectedFile, {
        cacheControl: '3600',
        upsert: false
      });

    setUploading(false);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (error) {
      setMessage({ type: 'error', text: 'Upload fehlgeschlagen: ' + error.message });
    } else {
      setMessage({ type: 'success', text: 'Datei erfolgreich hochgeladen!' });
      loadFiles();
    }
    setTimeout(() => setMessage(null), 3000);
  }

  async function deleteFile(file: FileItem) {
    if (!confirm(`Datei "${file.name}" wirklich löschen?`)) return;

    // 1. Aus Storage löschen
    const { error: storageError } = await supabase.storage
     .from("files")
     .remove([file.path]);

    if (storageError) {
      setMessage({ type: 'error', text: 'Löschen fehlgeschlagen.' });
      return;
    }

    // 2. Shares löschen
    await supabase
     .from("file_shares")
     .delete()
     .eq("file_path", file.path);

    setMessage({ type: 'success', text: 'Datei gelöscht.' });
    loadFiles();
    setTimeout(() => setMessage(null), 3000);
  }

  async function shareWithUser(file: FileItem, userEmail: string) {
    if (!user?.email || userEmail === user.email) return;

    const { error } = await supabase
     .from("file_shares")
     .insert({
        file_path: file.path,
        file_name: file.name,
        shared_by: user.email,
        shared_with: userEmail,
      });

    if (error) {
      if (error.code === '23505') {
        setMessage({ type: 'error', text: 'Bereits mit dieser Person geteilt' });
      } else {
        setMessage({ type: 'error', text: 'Fehler: ' + error.message });
      }
    } else {
      setMessage({ type: 'success', text: 'Datei geteilt!' });
      loadFiles();
    }
    setTimeout(() => setMessage(null), 3000);
  }

  async function unshareFile(file: FileItem, email: string) {
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
    window.open(data.publicUrl, "_blank", "noopener,noreferrer");
  }

  function getFileIcon(fileName: string) {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext || '')) return '📄';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return '🖼️';
    if (['doc', 'docx'].includes(ext || '')) return '📝';
    return '📁';
  }

  function formatFileSize(bytes?: number) {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = chatUsers.filter(u =>
    `${u.name} ${u.email}`.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="w-full h-[calc(100vh-7rem)] bg-gradient-to-br from-[#0B1E3F] via-[#0D2247] to-[#0B1E3F] rounded-2xl overflow-hidden flex flex-col">
      
      {/* Header */}
      <div className="bg-[#0F2A52]/80 backdrop-blur-xl border-b border-white/10 px-4 py-3">
        <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <span className="text-[#00D9FF]">📁</span> Dateien verwalten
        </h2>
        <p className="text-xs text-white/40">
          Hochladen, teilen & verwalten - DSGVO-konform
        </p>
      </div>

      {/* Message Toast */}
      {message && (
        <div className={`mx-3 mt-3 ${message.type === 'success'? 'bg-[#00D9FF]/10 border-[#00D9FF]/30' : 'bg-red-500/10 border-red-500/30'} border rounded-xl p-3 flex items-start gap-2 animate-in slide-in-from-top`}>
          <span className={`${message.type === 'success'? 'text-[#00D9FF]' : 'text-red-400'} text-lg`}>
            {message.type === 'success'? '✓' : '⚠️'}
          </span>
          <p className="text-sm text-white/80 flex-1">{message.text}</p>
        </div>
      )}

      {/* Upload Area + Search */}
      <div className="p-3 space-y-2">
        {/* Upload Button */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.txt"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full bg-[#00D9FF] hover:bg-[#00D9FF]/90 disabled:bg-white/10 disabled:text-white/40 text-[#0B1E3F] py-3 rounded-xl font-bold text-sm active:scale-95 transition-all shadow-[0_0_20px_rgba(0,217,255,0.3)] flex items-center justify-center gap-2"
        >
          {uploading? (
            <><span className="animate-spin">⏳</span> Lädt hoch... {uploadProgress}%</>
          ) : (
            <><span>⬆️</span> Datei hochladen</>
          )}
        </button>

        {/* Search */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Dateien suchen..."
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#00D9FF] placeholder:text-white/30 text-sm"
        />
      </div>

      {/* Files */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
        {filteredFiles.length === 0? (
          <div className="bg-[#0F2A52]/60 border border-white/10 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-3 opacity-20">📂</div>
            <p className="text-white/40 text-sm">Keine Dateien vorhanden</p>
            <p className="text-white/30 text-xs mt-1">Lade deine erste Datei hoch</p>
          </div>
        ) : (
          filteredFiles.map((file) => (
            <div
              key={file.path}
              className="bg-[#0F2A52]/60 border border-white/10 rounded-xl p-3"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[#00D9FF]/10 flex items-center justify-center text-xl">
                  {getFileIcon(file.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm truncate">
                    {file.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    {file.size && <span>{formatFileSize(file.size)}</span>}
                    {file.shared_with_me && (
                      <span className="text-green-400">• Von: {file.shared_by}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => downloadFile(file)}
                    className="bg-[#00D9FF] text-[#0B1E3F] p-2 rounded-lg font-bold text-sm"
                    title="Herunterladen"
                  >
                    ⬇️
                  </button>
                  {!file.shared_with_me && (
                    <button
                      onClick={() => deleteFile(file)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg font-bold text-sm"
                      title="Löschen"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>

              {/* Teilen-Bereich */}
              {!file.shared_with_me && (
                <div className="border-t border-white/10 pt-2">
                  {sharingFile === file.path? (
                    <div>
                      <input
                        type="text"
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                        placeholder="Person suchen..."
                        autoFocus
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm mb-2 outline-none focus:border-[#00D9FF] placeholder:text-white/30"
                      />
                      <div className="max-h-32 overflow-y-auto space-y-1 mb-2">
                        {filteredUsers.map(u => {
                          const isShared = file.shared_users?.some(s => s.email === u.email);
                          return (
                            <button
                              key={u.email}
                              onClick={() => isShared? unshareFile(file, u.email) : shareWithUser(file, u.email)}
                              className={`w-full px-2 py-1.5 flex items-center gap-2 rounded-lg text-xs transition ${
                                isShared
                                 ? "bg-[#00D9FF]/20 text-[#00D9FF] border border-[#00D9FF]/50"
                                  : "bg-white/5 hover:bg-white/10 text-white"
                              }`}
                            >
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#0099CC] flex items-center justify-center text-[#0B1E3F] text-xs font-bold">
                                {u.name?.[0] || u.email[0].toUpperCase()}
                              </div>
                              <div className="flex-1 text-left truncate">
                                <p className="font-medium">{u.name || u.email}</p>
                              </div>
                              {isShared && <span className="text-xs">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => {setSharingFile(null); setSearchUser("");}}
                        className="w-full bg-white/5 text-white py-1.5 rounded-lg text-xs"
                      >
                        Schließen
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSharingFile(file.path)}
                      className="w-full bg-white/5 hover:bg-[#00D9FF]/20 border border-white/10 hover:border-[#00D9FF]/50 text-white/80 hover:text-[#00D9FF] py-1.5 rounded-lg text-xs font-semibold transition-all"
                    >
                      👥 Teilen ({file.shared_users?.length || 0})
                    </button>
                  )}

                  {file.shared_users && file.shared_users.length > 0 && sharingFile!== file.path && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {file.shared_users.map(u => (
                        <div key={u.email} className="bg-[#00D9FF]/10 px-2 py-0.5 rounded flex items-center gap-1">
                          <span className="text-xs text-[#00D9FF]">{u.name || u.email}</span>
                          <button
                            onClick={() => unshareFile(file, u.email)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            ✕
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

      {/* DSGVO Footer */}
      <div className="bg-[#0F2A52]/80 border-t border-white/10 p-3">
        <div className="bg-[#00D9FF]/10 border border-[#00D9FF]/30 rounded-lg p-2 flex items-start gap-2">
          <span className="text-[#00D9FF] text-sm">🔒</span>
          <p className="text-xs text-white/70 leading-relaxed flex-1">
            <span className="font-semibold text-white">DSGVO:</span> Dateien sind verschlüsselt. Nur eingeladene Personen haben Zugriff. Du kannst jederzeit löschen.
          </p>
        </div>
      </div>

      {/* DSGVO Consent Modal */}
      {showDSGVOConsent && selectedFile && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F2A52] border border-[#00D9FF]/30 rounded-2xl p-6 max-w-md w-full shadow-[0_0_60px_rgba(0,217,255,0.3)]">
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#00D9FF]">🛡️</span> Datenschutz-Hinweis
            </h3>
            <div className="text-sm text-white/80 space-y-2 mb-4">
              <p><strong>Datei:</strong> {selectedFile.name}</p>
              <p><strong>Größe:</strong> {formatFileSize(selectedFile.size)}</p>
              <div className="bg-[#00D9FF]/10 border border-[#00D9FF]/30 rounded-lg p-3 mt-3">
                <p className="text-xs leading-relaxed">
                  <strong>DSGVO Art. 13:</strong> Mit dem Upload wird diese Datei verschlüsselt auf unseren Servern in Deutschland gespeichert. Nur du und Personen, mit denen du explizit teilst, können zugreifen. Du kannst die Datei jederzeit löschen (Art. 17).
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowDSGVOConsent(false);
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-medium text-sm"
              >
                Abbrechen
              </button>
              <button
                onClick={uploadFile}
                className="flex-1 bg-[#00D9FF] hover:bg-[#00D9FF]/90 text-[#0B1E3F] py-3 rounded-xl font-bold text-sm"
              >
                Zustimmen & Hochladen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}