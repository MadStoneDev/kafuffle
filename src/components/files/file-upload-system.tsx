// components/files/FileUploadSystem.tsx
import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  File,
  Image,
  Video,
  Music,
  Archive,
  FileText,
  X,
  Download,
  Eye,
  Share,
  Trash2,
  Paperclip,
  Progress,
  CheckCircle,
  AlertCircle,
  Folder,
} from "lucide-react";

interface FileUpload {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "completed" | "error";
  url?: string;
  error?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnail?: string;
  uploaded_at: string;
  uploaded_by: string;
  message_id?: string;
  channel_id?: string;
}

interface FileUploadSystemProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
  maxFiles?: number;
  channel_id?: string;
  message_id?: string;
}

const FILE_TYPE_ICONS: Record<string, React.ReactNode> = {
  image: <Image className="w-5 h-5" />,
  video: <Video className="w-5 h-5" />,
  audio: <Music className="w-5 h-5" />,
  "application/pdf": <FileText className="w-5 h-5" />,
  "application/zip": <Archive className="w-5 h-5" />,
  "application/x-zip-compressed": <Archive className="w-5 h-5" />,
  text: <FileText className="w-5 h-5" />,
  default: <File className="w-5 h-5" />,
};

const FILE_TYPE_COLORS: Record<string, string> = {
  image: "text-green-400",
  video: "text-blue-400",
  audio: "text-purple-400",
  "application/pdf": "text-red-400",
  "application/zip": "text-yellow-400",
  text: "text-neutral-400",
  default: "text-neutral-400",
};

export const FileUploadSystem: React.FC<FileUploadSystemProps> = ({
  onFilesUploaded,
  maxFileSize = 50 * 1024 * 1024, // 50MB default
  allowedTypes = [],
  maxFiles = 10,
  channel_id,
  message_id,
}) => {
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showUploadArea, setShowUploadArea] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const getFileTypeCategory = useCallback((type: string): string => {
    if (type.startsWith("image/")) return "image";
    if (type.startsWith("video/")) return "video";
    if (type.startsWith("audio/")) return "audio";
    if (type.startsWith("text/")) return "text";
    return type;
  }, []);

  const getFileIcon = useCallback(
    (type: string) => {
      const category = getFileTypeCategory(type);
      return FILE_TYPE_ICONS[category] || FILE_TYPE_ICONS.default;
    },
    [getFileTypeCategory],
  );

  const getFileColor = useCallback(
    (type: string) => {
      const category = getFileTypeCategory(type);
      return FILE_TYPE_COLORS[category] || FILE_TYPE_COLORS.default;
    },
    [getFileTypeCategory],
  );

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }, []);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > maxFileSize) {
        return `File too large. Maximum size is ${formatFileSize(maxFileSize)}`;
      }

      if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        return `File type not allowed. Allowed types: ${allowedTypes.join(
          ", ",
        )}`;
      }

      return null;
    },
    [maxFileSize, allowedTypes, formatFileSize],
  );

  const uploadFile = useCallback(
    async (file: File): Promise<UploadedFile> => {
      const formData = new FormData();
      formData.append("file", file);
      if (channel_id) formData.append("channel_id", channel_id);
      if (message_id) formData.append("message_id", message_id);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return response.json();
    },
    [channel_id, message_id],
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);

      if (fileArray.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        return;
      }

      const validFiles: File[] = [];
      const errors: string[] = [];

      // Validate files
      fileArray.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          errors.push(`${file.name}: ${error}`);
        } else {
          validFiles.push(file);
        }
      });

      if (errors.length > 0) {
        alert(`Upload errors:\n${errors.join("\n")}`);
      }

      if (validFiles.length === 0) return;

      // Create upload entries
      const newUploads: FileUpload[] = validFiles.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        progress: 0,
        status: "uploading",
      }));

      setUploads((prev) => [...prev, ...newUploads]);

      // Upload files
      const uploadPromises = newUploads.map(async (upload) => {
        try {
          // Simulate upload progress (in real implementation, you'd use XMLHttpRequest for progress)
          const progressInterval = setInterval(() => {
            setUploads((prev) =>
              prev.map((u) =>
                u.id === upload.id
                  ? {
                      ...u,
                      progress: Math.min(u.progress + Math.random() * 30, 90),
                    }
                  : u,
              ),
            );
          }, 200);

          const uploadedFile = await uploadFile(upload.file);

          clearInterval(progressInterval);

          setUploads((prev) =>
            prev.map((u) =>
              u.id === upload.id
                ? {
                    ...u,
                    progress: 100,
                    status: "completed",
                    url: uploadedFile.url,
                  }
                : u,
            ),
          );

          return uploadedFile;
        } catch (error) {
          setUploads((prev) =>
            prev.map((u) =>
              u.id === upload.id
                ? {
                    ...u,
                    status: "error",
                    error:
                      error instanceof Error ? error.message : "Upload failed",
                  }
                : u,
            ),
          );
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(
        (result): result is UploadedFile => result !== null,
      );

      if (successfulUploads.length > 0) {
        onFilesUploaded(successfulUploads);
      }

      // Clear completed uploads after a delay
      setTimeout(() => {
        setUploads((prev) => prev.filter((u) => u.status === "uploading"));
      }, 3000);
    },
    [maxFiles, validateFile, uploadFile, onFilesUploaded],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFiles(files);
      }
    },
    [handleFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        handleFiles(files);
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleFiles],
  );

  const removeUpload = useCallback((uploadId: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== uploadId));
  }, []);

  // Global drag and drop
  useEffect(() => {
    const handleGlobalDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    };

    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleGlobalDragLeave = () => {
      setIsDragging(false);
    };

    document.addEventListener("drop", handleGlobalDrop);
    document.addEventListener("dragover", handleGlobalDragOver);
    document.addEventListener("dragleave", handleGlobalDragLeave);

    return () => {
      document.removeEventListener("drop", handleGlobalDrop);
      document.removeEventListener("dragover", handleGlobalDragOver);
      document.removeEventListener("dragleave", handleGlobalDragLeave);
    };
  }, []);

  return (
    <>
      {/* Upload Button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-2 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white transition-colors"
        title="Upload files"
      >
        <Paperclip className="w-5 h-5" />
      </button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileInput}
        className="hidden"
        accept={allowedTypes.length > 0 ? allowedTypes.join(",") : undefined}
      />

      {/* Global Drag Overlay */}
      {isDragging && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div
            ref={dropZoneRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className="w-96 h-64 border-2 border-dashed border-kafuffle-primary bg-neutral-800 rounded-lg flex flex-col items-center justify-center text-white"
          >
            <Upload className="w-12 h-12 text-kafuffle-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Drop files here</h3>
            <p className="text-neutral-400 text-center">
              Upload up to {maxFiles} files, max {formatFileSize(maxFileSize)}{" "}
              each
            </p>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="fixed bottom-4 right-4 w-80 space-y-2 z-40">
          {uploads.map((upload) => (
            <div
              key={upload.id}
              className="bg-neutral-800 border border-neutral-600 rounded-lg p-3 shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div className={getFileColor(upload.file.type)}>
                    {getFileIcon(upload.file.type)}
                  </div>
                  <span className="text-sm text-white truncate">
                    {upload.file.name}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {upload.status === "completed" && (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}
                  {upload.status === "error" && (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                  <button
                    onClick={() => removeUpload(upload.id)}
                    className="text-neutral-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {upload.status === "uploading" && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span>{formatFileSize(upload.file.size)}</span>
                    <span>{Math.round(upload.progress)}%</span>
                  </div>
                  <div className="w-full bg-neutral-600 rounded-full h-1">
                    <div
                      className="bg-kafuffle-primary h-1 rounded-full transition-all duration-300"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {upload.status === "error" && (
                <p className="text-xs text-red-400 mt-1">{upload.error}</p>
              )}

              {upload.status === "completed" && (
                <p className="text-xs text-green-400 mt-1">Upload completed</p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

// File Preview Component
export const FilePreview: React.FC<{
  file: UploadedFile;
  onDownload?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}> = ({ file, onDownload, onDelete, showActions = true }) => {
  const [showPreview, setShowPreview] = useState(false);

  const getFileTypeCategory = (type: string): string => {
    if (type.startsWith("image/")) return "image";
    if (type.startsWith("video/")) return "video";
    if (type.startsWith("audio/")) return "audio";
    if (type.startsWith("text/")) return "text";
    return type;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isPreviewable = (type: string): boolean => {
    return (
      type.startsWith("image/") ||
      type.startsWith("video/") ||
      type === "application/pdf"
    );
  };

  return (
    <>
      <div className="bg-neutral-800 rounded-lg p-3 max-w-sm">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded ${
              FILE_TYPE_COLORS[getFileTypeCategory(file.type)] ||
              FILE_TYPE_COLORS.default
            }`}
          >
            {FILE_TYPE_ICONS[getFileTypeCategory(file.type)] ||
              FILE_TYPE_ICONS.default}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {file.name}
            </p>
            <p className="text-xs text-neutral-400">
              {formatFileSize(file.size)}
            </p>
          </div>

          {showActions && (
            <div className="flex space-x-1">
              {isPreviewable(file.type) && (
                <button
                  onClick={() => setShowPreview(true)}
                  className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={onDownload}
                className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>

              {onDelete && (
                <button
                  onClick={onDelete}
                  className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Thumbnail for images */}
        {file.thumbnail && getFileTypeCategory(file.type) === "image" && (
          <div className="mt-2">
            <img
              src={file.thumbnail}
              alt={file.name}
              className="w-full h-32 object-cover rounded cursor-pointer"
              onClick={() => setShowPreview(true)}
            />
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl max-h-[90vh] bg-neutral-800 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-neutral-700">
              <h3 className="text-lg font-semibold text-white">{file.name}</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4">
              {getFileTypeCategory(file.type) === "image" && (
                <img
                  src={file.url}
                  alt={file.name}
                  className="max-w-full max-h-[70vh] object-contain mx-auto"
                />
              )}

              {getFileTypeCategory(file.type) === "video" && (
                <video
                  src={file.url}
                  controls
                  className="max-w-full max-h-[70vh] mx-auto"
                />
              )}

              {file.type === "application/pdf" && (
                <iframe
                  src={file.url}
                  className="w-full h-[70vh]"
                  title={file.name}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// File Manager Component
export const FileManager: React.FC<{
  files: UploadedFile[];
  onFileDelete: (fileId: string) => void;
  onFileDownload: (file: UploadedFile) => void;
}> = ({ files, onFileDelete, onFileDownload }) => {
  const [sortBy, setSortBy] = useState<"name" | "size" | "date">("date");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFiles = files
    .filter((file) => {
      if (filterType !== "all" && !file.type.startsWith(filterType)) {
        return false;
      }
      if (
        searchTerm &&
        !file.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "size":
          return b.size - a.size;
        case "date":
          return (
            new Date(b.uploaded_at).getTime() -
            new Date(a.uploaded_at).getTime()
          );
        default:
          return 0;
      }
    });

  return (
    <div className="bg-neutral-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">File Manager</h2>
        <div className="flex space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 bg-neutral-700 border border-neutral-600 rounded text-white text-sm focus:outline-none focus:border-kafuffle-primary"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1 bg-neutral-700 border border-neutral-600 rounded text-white text-sm focus:outline-none focus:border-kafuffle-primary"
          >
            <option value="all">All Files</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
            <option value="application">Documents</option>
          </select>
        </div>
      </div>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search files..."
        className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-kafuffle-primary mb-4"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFiles.map((file) => (
          <FilePreview
            key={file.id}
            file={file}
            onDownload={() => onFileDownload(file)}
            onDelete={() => onFileDelete(file.id)}
          />
        ))}
      </div>

      {filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <Folder className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-400">No files found</p>
        </div>
      )}
    </div>
  );
};
