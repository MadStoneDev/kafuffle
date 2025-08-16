// /components/messages/file-upload.tsx
"use client";

import { useRef } from "react";

interface FileUploadProps {
  onFileSelect: (
    file: File,
    type: "image" | "audio" | "video" | "document",
  ) => void;
  onClose: () => void;
}

export default function FileUpload({ onFileSelect, onClose }: FileUploadProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "audio" | "video" | "document",
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file, type);
      onClose();
    }
    // Reset input
    event.target.value = "";
  };

  const triggerFileInput = (type: "image" | "audio" | "video" | "document") => {
    switch (type) {
      case "image":
        imageInputRef.current?.click();
        break;
      case "audio":
        audioInputRef.current?.click();
        break;
      case "video":
        videoInputRef.current?.click();
        break;
      case "document":
        documentInputRef.current?.click();
        break;
    }
  };

  return (
    <div className="bg-background border border-foreground/20 rounded-lg shadow-lg p-2 min-w-[200px]">
      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e, "image")}
        className="hidden"
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        onChange={(e) => handleFileChange(e, "audio")}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={(e) => handleFileChange(e, "video")}
        className="hidden"
      />
      <input
        ref={documentInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx"
        onChange={(e) => handleFileChange(e, "document")}
        className="hidden"
      />

      {/* Upload options */}
      <div className="space-y-1">
        <button
          onClick={() => triggerFileInput("image")}
          className="w-full text-left px-3 py-2 hover:bg-foreground/10 rounded-md flex items-center gap-2 transition-colors"
        >
          📷 Upload Image
          <span className="text-xs opacity-50 ml-auto">PNG, JPG, GIF</span>
        </button>

        <button
          onClick={() => triggerFileInput("audio")}
          className="w-full text-left px-3 py-2 hover:bg-foreground/10 rounded-md flex items-center gap-2 transition-colors"
        >
          🎵 Upload Audio
          <span className="text-xs opacity-50 ml-auto">MP3, WAV, M4A</span>
        </button>

        <button
          onClick={() => triggerFileInput("video")}
          className="w-full text-left px-3 py-2 hover:bg-foreground/10 rounded-md flex items-center gap-2 transition-colors"
        >
          🎥 Upload Video
          <span className="text-xs opacity-50 ml-auto">MP4, MOV, AVI</span>
        </button>

        <button
          onClick={() => triggerFileInput("document")}
          className="w-full text-left px-3 py-2 hover:bg-foreground/10 rounded-md flex items-center gap-2 transition-colors"
        >
          📄 Upload Document
          <span className="text-xs opacity-50 ml-auto">PDF, DOC, TXT</span>
        </button>
      </div>
    </div>
  );
}

// Helper function to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Helper function to get file type icon
export function getFileIcon(fileType: string): string {
  if (fileType.startsWith("image/")) return "🖼️";
  if (fileType.startsWith("audio/")) return "🎵";
  if (fileType.startsWith("video/")) return "🎥";
  if (fileType.includes("pdf")) return "📕";
  if (fileType.includes("word") || fileType.includes("document")) return "📘";
  if (fileType.includes("excel") || fileType.includes("spreadsheet"))
    return "📗";
  if (fileType.includes("powerpoint") || fileType.includes("presentation"))
    return "📙";
  return "📄";
}
