"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabase";

type Props = {
  userRole: string;
};

export default function FilesPage({ userRole }: Props) {
  const [files, setFiles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadFiles();
  }, [userRole]);

  async function loadFiles() {
    let folders = ["all", userRole];

    if (userRole === "admin") {
      folders = ["all", "student", "teacher", "parent"];
    }

    const allFiles: any[] = [];

    for (const folder of folders) {
      const { data } = await supabase.storage
       .from("files")
       .list(`uploads/${folder}`);

      if (data) {
        data.forEach((file) => {
          allFiles.push({
           ...file,
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

  function getFileIcon(fileName: string) {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext || '')) return '📄';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return '🖼️';
    if (['doc', 'docx'].includes(ext || '')) return '📝';
    if (['xls', 'xlsx'].includes(ext || '')) return '📊';
    if (['zip', 'rar'].includes(ext || '')) return '📦';
    if (['mp3', 'wav'].includes(ext || '')) return '🎵';
    if (['mp4', 'mov'].includes(ext || '')) return '🎬';
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

  return (
    <div className="w-full h-[calc(100vh-7rem)] bg-gradient-to-br from-[#0B1E3F] via-[#0D2247] to-[#0B1E3F] rounded-2xl overflow-hidden flex flex-col relative">
      
      {/* Animated Background Glow */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-[#00D9FF]/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-[#00D9FF]/5 rounded-full blur-3xl animate-pulse delay-1000" />
      
      {/* Header */}
      <div className="bg-[#0F2A52]/80 backdrop-blur-xl border-b border-white/10 px-4 py-4 relative z-10">
        <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <span className="text-[#00D9FF]">📁</span> Dateien & Downloads
        </h2>
        <p className="text-sm text-white/40">
          {files.length} {files.length === 1? 'Datei' : 'Dateien'} verfügbar
        </p>
      </div>

      {/* Search Bar */}
      <div className="p-3 relative z-10">
        <div className="bg-[#0F2A52]/60 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">🔍</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Dateien durchsuchen..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white outline-none focus:bg-white/10 focus:border-[#00D9FF] focus:shadow-[0_0_20px_rgba(0,217,255,0.2)] placeholder:text-white/30 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Files List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2 relative z-10">
        {filteredFiles.length === 0? (
          <div className="bg-[#0F2A52]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <div className="text-5xl mb-3 opacity-20">📂</div>
            <p className="text-white/40 text-sm">
              {searchTerm? 'Keine Dateien gefunden.' : 'Keine Dateien verfügbar.'}
            </p>
          </div>
        ) : (
          filteredFiles.map((file) => (
            <div
              key={`${file.folder}-${file.name}`}
              className="bg-[#0F2A52]/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 active:scale-[0.98] transition-all duration-200 hover:border-[#00D9FF]/30 hover:shadow-[0_0_30px_rgba(0,217,255,0.15)] group shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#00D9FF]/10 flex items-center justify-center text-2xl shrink-0 group-hover:bg-[#00D9FF]/20 group-hover:shadow-[0_0_20px_rgba(0,217,255,0.3)] transition-all">
                  {getFileIcon(file.name)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm mb-1 truncate">
                    {file.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-white/40">{formatFileSize(file.metadata?.size || 0)}</span>
                    <span className="text-white/20">•</span>
                    <span className="px-2 py-0.5 rounded bg-[#00D9FF]/20 text-[#00D9FF] font-semibold capitalize">
                      {file.folder}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => downloadFile(file.name, file.folder)}
                  className="bg-[#00D9FF] hover:bg-[#00D9FF]/90 text-[#0B1E3F] px-4 py-2.5 rounded-xl font-bold text-sm active:scale-95 transition-all shadow-[0_0_30px_rgba(0,217,255,0.3)] hover:shadow-[0_0_40px_rgba(0,217,255,0.5)] shrink-0 flex items-center gap-1.5"
                >
                  <span>⬇️</span>
                  <span className="hidden sm:inline">Download</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Info */}
      <div className="bg-[#0F2A52]/80 backdrop-blur-xl border-t border-white/10 p-4 relative z-10">
        <div className="bg-[#00D9FF]/10 border border-[#00D9FF]/30 rounded-xl p-3 flex items-start gap-2">
          <span className="text-[#00D9FF] text-lg">ℹ️</span>
          <div className="flex-1">
            <p className="text-xs text-white/80 leading-relaxed">
              <span className="font-semibold text-white">Rolle: {userRole}</span> Du siehst alle Dateien für deine Rolle + öffentliche Dateien.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}