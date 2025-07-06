// /components/zones/zone-media.tsx
"use client";

import { useState, useEffect } from "react";
import {
  IconPhoto,
  IconFile,
  IconVideo,
  IconMusic,
  IconDownload,
} from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/client";

interface MediaFile {
  id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  storage_url: string;
  thumbnail_url?: string;
  uploaded_by: string;
  created_at: string;
  message_id: string;
  uploader: {
    username: string;
    display_name: string | null;
  };
}

interface ZoneMediaProps {
  zoneId: string;
}

export default function ZoneMedia({ zoneId }: ZoneMediaProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "images" | "videos" | "files">(
    "all",
  );

  useEffect(() => {
    loadMediaFiles();
  }, [zoneId]);

  const loadMediaFiles = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("media_files")
        .select(
          `
          *,
          uploader:profiles!uploaded_by(username, display_name),
          messages!inner(zone_id)
        `,
        )
        .eq("messages.zone_id", zoneId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMediaFiles(data || []);
    } catch (error) {
      console.error("Failed to load media files:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/"))
      return <IconPhoto size={20} className="text-blue-500" />;
    if (mimeType.startsWith("video/"))
      return <IconVideo size={20} className="text-purple-500" />;
    if (mimeType.startsWith("audio/"))
      return <IconMusic size={20} className="text-green-500" />;
    return <IconFile size={20} className="text-neutral-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const filteredFiles = mediaFiles.filter((file) => {
    switch (filter) {
      case "images":
        return file.mime_type.startsWith("image/");
      case "videos":
        return file.mime_type.startsWith("video/");
      case "files":
        return (
          !file.mime_type.startsWith("image/") &&
          !file.mime_type.startsWith("video/")
        );
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
          Media & Files
        </h2>
        <div className="flex gap-2">
          {[
            { key: "all", label: "All" },
            { key: "images", label: "Images" },
            { key: "videos", label: "Videos" },
            { key: "files", label: "Files" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === key
                  ? "bg-kafuffle-primary text-white"
                  : "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <IconPhoto size={48} className="text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-600 dark:text-neutral-400">
            No media files
          </h3>
          <p className="text-neutral-500">
            Files shared in this zone will appear here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                {getFileIcon(file.mime_type)}
                <a
                  href={file.storage_url}
                  download={file.file_name}
                  className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
                  title="Download"
                >
                  <IconDownload size={16} />
                </a>
              </div>

              {file.mime_type.startsWith("image/") && (
                <div className="mb-3">
                  <img
                    src={file.thumbnail_url || file.storage_url}
                    alt={file.file_name}
                    className="w-full h-32 object-cover rounded"
                    loading="lazy"
                  />
                </div>
              )}

              <div>
                <h4 className="font-medium text-neutral-900 dark:text-white truncate">
                  {file.file_name}
                </h4>
                <p className="text-xs text-neutral-500 mt-1">
                  {formatFileSize(file.file_size)} •{" "}
                  {new Date(file.created_at).toLocaleDateString()}
                </p>
                <p className="text-xs text-neutral-500">
                  by {file.uploader?.display_name || file.uploader?.username}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
