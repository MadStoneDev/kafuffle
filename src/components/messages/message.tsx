// /components/messages/message.tsx
import { useState } from "react";
import {
  IconFile,
  IconPhoto,
  IconDownload,
  IconTrash,
  IconEdit,
  IconMusic,
  IconVideo,
  IconFileText,
} from "@tabler/icons-react";
import {
  getRelativeTime,
  getAvatarInitials,
} from "@/utils/general/space-utils";

interface MessageProps {
  message: {
    id: string;
    content: string;
    sender_id: string;
    sender_username: string;
    created_at: string;
    updated_at: string | null;
    deleted_at?: string | null; // Added for deleted messages
    message_type: "text" | "image" | "file" | "audio" | "video" | "system";
    profiles?: {
      username: string;
      display_name: string | null;
      avatar_url: string | null;
    };
    media_files?: Array<{
      id: string;
      filename: string;
      file_type: string;
      file_size: number;
      url: string;
    }>;
  };
  currentUserId: string;
  currentUserRole?: "owner" | "admin" | "moderator" | "member"; // Made optional for backward compatibility
  messageAuthorRole?: "owner" | "admin" | "moderator" | "member"; // Made optional for backward compatibility
  isGrouped?: boolean; // New prop for message grouping
  showTimestamp?: boolean; // Whether to show timestamp (for grouped messages)
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
}

export default function Message({
  message,
  currentUserId,
  currentUserRole = "member",
  messageAuthorRole = "member",
  isGrouped = false,
  showTimestamp = true,
  onEdit,
  onDelete,
}: MessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showActions, setShowActions] = useState(false);

  const isOwnMessage = message.sender_id === currentUserId;
  const isSystemMessage = message.message_type === "system";
  const isDeletedMessage = !!message.deleted_at;
  const displayName = message.profiles?.display_name || message.sender_username;
  const username = message.profiles?.username || message.sender_username;

  // Permission checking functions
  const canEditMessage = () => {
    // ONLY the author can edit their own messages - PRIVACY FIRST!
    return isOwnMessage && !isDeletedMessage;
  };

  const canDeleteMessage = () => {
    // Always allow deleting own messages
    if (isOwnMessage && !isDeletedMessage) return true;

    // Don't allow deleting already deleted messages
    if (isDeletedMessage) return false;

    // Role hierarchy for deleting others' messages
    switch (currentUserRole) {
      case "owner":
        return true; // Owner can delete anyone's messages
      case "admin":
        return messageAuthorRole !== "owner"; // Admin can't delete owner's messages
      case "moderator":
        return !["owner", "admin"].includes(messageAuthorRole); // Mod can't delete admin/owner messages
      case "member":
        return false; // Members can only delete own (handled above)
      default:
        return false;
    }
  };

  const handleSaveEdit = () => {
    if (editContent.trim() !== message.content && onEdit) {
      onEdit(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getFileIcon = (fileType: string, fileName: string) => {
    if (fileType.startsWith("image/")) {
      return <IconPhoto size={20} className="text-blue-500" />;
    } else if (fileType.startsWith("audio/")) {
      return <IconMusic size={20} className="text-green-500" />;
    } else if (fileType.startsWith("video/")) {
      return <IconVideo size={20} className="text-purple-500" />;
    } else if (fileType.includes("pdf") || fileName.endsWith(".pdf")) {
      return <IconFileText size={20} className="text-red-500" />;
    } else {
      return <IconFile size={20} className="text-neutral-500" />;
    }
  };

  const renderMediaContent = () => {
    if (!message.media_files || message.media_files.length === 0) return null;

    return (
      <div className="mt-2 space-y-2">
        {message.media_files.map((file) => {
          const isImage = file.file_type.startsWith("image/");
          const isVideo = file.file_type.startsWith("video/");
          const isAudio = file.file_type.startsWith("audio/");
          const isGif = file.file_type === "image/gif";

          if (isImage) {
            return (
              <div key={file.id} className="relative max-w-sm">
                <img
                  src={file.url}
                  alt={file.filename}
                  className={`rounded-lg max-w-full h-auto ${isGif ? "border-2 border-yellow-400" : ""}`}
                  style={{ maxHeight: "300px" }}
                />
                {isGif && (
                  <div className="absolute top-2 left-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-semibold">
                    GIF
                  </div>
                )}
                <div className="mt-1 text-xs text-neutral-500 truncate">
                  {file.filename} • {formatFileSize(file.file_size)}
                </div>
              </div>
            );
          }

          if (isVideo) {
            return (
              <div key={file.id} className="max-w-sm">
                <video
                  controls
                  className="rounded-lg max-w-full h-auto"
                  style={{ maxHeight: "300px" }}
                >
                  <source src={file.url} type={file.file_type} />
                  Your browser does not support the video tag.
                </video>
                <div className="mt-1 text-xs text-neutral-500 truncate">
                  {file.filename} • {formatFileSize(file.file_size)}
                </div>
              </div>
            );
          }

          if (isAudio) {
            return (
              <div
                key={file.id}
                className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3 max-w-sm"
              >
                <div className="flex items-center gap-3 mb-2">
                  <IconMusic size={24} className="text-green-500" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {file.filename}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {formatFileSize(file.file_size)}
                    </div>
                  </div>
                </div>
                <audio controls className="w-full">
                  <source src={file.url} type={file.file_type} />
                  Your browser does not support the audio tag.
                </audio>
              </div>
            );
          }

          // Generic file
          return (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg max-w-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              {getFileIcon(file.file_type, file.filename)}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {file.filename}
                </div>
                <div className="text-xs text-neutral-500">
                  {formatFileSize(file.file_size)}
                </div>
              </div>
              <a
                href={file.url}
                download={file.filename}
                className="p-2 hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded-full transition-colors"
              >
                <IconDownload size={16} />
              </a>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTextContent = () => {
    // Enhanced emoji rendering - convert common emoji codes
    const enhanceEmojis = (text: string) => {
      return text
        .replace(/:smile:/g, "😊")
        .replace(/:heart:/g, "❤️")
        .replace(/:thumbsup:/g, "👍")
        .replace(/:fire:/g, "🔥")
        .replace(/:rocket:/g, "🚀")
        .replace(/:wave:/g, "👋")
        .replace(/:tada:/g, "🎉");
    };

    if (isEditing) {
      return (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-sm resize-none"
            rows={3}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              className="px-3 py-1 bg-kafuffle-primary text-white text-xs rounded hover:opacity-80"
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="px-3 py-1 bg-neutral-200 dark:bg-neutral-700 text-xs rounded hover:opacity-80"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    const enhancedContent = enhanceEmojis(message.content);

    return (
      <div
        className={`text-sm text-neutral-700 dark:text-neutral-300 ${
          isOwnMessage
            ? "bg-kafuffle-primary text-white px-3 py-2 rounded-lg inline-block max-w-xs"
            : ""
        }`}
      >
        {enhancedContent}
      </div>
    );
  };

  // System message rendering
  if (isSystemMessage) {
    return (
      <div className="flex justify-center py-2">
        <div className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-kafuffle-primary rounded-full"></div>
          {message.content}
        </div>
      </div>
    );
  }

  // Deleted message rendering - PRIVACY PROTECTED
  if (isDeletedMessage) {
    return (
      <div
        className={`group flex gap-3 transition-colors ${
          isGrouped ? "px-4 py-1" : "px-4 py-3"
        }`}
      >
        {/* Avatar or spacer */}
        {!isGrouped ? (
          <div className="w-8 h-8 bg-neutral-300 dark:bg-neutral-600 rounded-full flex items-center justify-center">
            <IconTrash size={14} className="text-neutral-500" />
          </div>
        ) : (
          <div className="w-8 flex-shrink-0"></div>
        )}

        {/* Deleted message content */}
        <div className="flex-1 min-w-0">
          {!isGrouped && showTimestamp && (
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-medium text-sm text-neutral-500 dark:text-neutral-400">
                {displayName}
              </span>
              <span className="text-xs text-neutral-400">
                {getRelativeTime(message.created_at)}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 italic text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-3 py-2 rounded-lg">
            <IconTrash size={16} />
            <span className="text-sm">This message has been deleted</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group flex gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors ${
        isGrouped ? "px-4 py-1" : "px-4 py-3"
      } ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar - only show if not grouped */}
      {!isGrouped && (
        <div className="flex-shrink-0">
          {message.profiles?.avatar_url ? (
            <img
              src={message.profiles.avatar_url}
              alt={displayName}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 bg-kafuffle-primary rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {getAvatarInitials(displayName)}
            </div>
          )}
        </div>
      )}

      {/* Spacer for grouped messages */}
      {isGrouped && <div className="w-8 flex-shrink-0"></div>}

      {/* Message Content */}
      <div className={`flex-1 min-w-0 ${isOwnMessage ? "text-right" : ""}`}>
        {/* Header - only show if not grouped */}
        {!isGrouped && (
          <div
            className={`flex items-baseline gap-2 mb-1 ${isOwnMessage ? "justify-end" : ""}`}
          >
            <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
              {displayName}
            </span>
            {username !== displayName && (
              <span className="text-xs text-neutral-500">@{username}</span>
            )}
            {showTimestamp && (
              <span className="text-xs text-neutral-400">
                {getRelativeTime(message.created_at)}
              </span>
            )}
            {message.updated_at && (
              <span className="text-xs text-neutral-400">(edited)</span>
            )}
          </div>
        )}

        {/* Timestamp for grouped messages (on hover) */}
        {isGrouped && showTimestamp && (
          <div
            className={`text-xs text-neutral-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity ${
              isOwnMessage ? "text-right" : ""
            }`}
          >
            {getRelativeTime(message.created_at)}
            {message.updated_at && <span className="ml-1">(edited)</span>}
          </div>
        )}

        {/* Message Text Content */}
        {message.content && renderTextContent()}

        {/* Media Content */}
        {renderMediaContent()}
      </div>

      {/* Message Actions - Based on Privacy-First Permissions */}
      {showActions && !isEditing && !isDeletedMessage && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {canEditMessage() && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              title="Edit message"
            >
              <IconEdit size={14} />
            </button>
          )}
          {canDeleteMessage() && onDelete && (
            <button
              onClick={() => onDelete(message.id)}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-neutral-500 hover:text-red-600 dark:hover:text-red-400"
              title={
                isOwnMessage
                  ? "Delete message"
                  : "Delete message (as moderator)"
              }
            >
              <IconTrash size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
