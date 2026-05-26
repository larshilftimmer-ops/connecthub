"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabase";

type Props = {
  userRole: string;
};

export default function FilesPage({ userRole }: Props) {
  const [files, setFiles] = useState<any[]>([]);

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

  return (
    <section className="bg-zinc-900 rounded-2xl p-6">
      <h2 className="text-2xl font-bold mb-4">
        Dateien & Downloads
      </h2>

      <div className="space-y-3">
        {files.length === 0 ? (
          <p className="text-gray-400">
            Keine Dateien verfügbar.
          </p>
        ) : (
          files.map((file) => (
            <div
              key={`${file.folder}-${file.name}`}
              className="bg-zinc-800 p-4 rounded-xl flex justify-between items-center"
            >
              <span>{file.name}</span>

              <button
                onClick={() => downloadFile(file.name, file.folder)}
                className="bg-green-600 px-4 py-2 rounded-lg"
              >
                Download
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}