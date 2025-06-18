// /components/messages/message-input.tsx
"use client";

import { useState, useRef, KeyboardEvent } from "react";
import {
  IconSend,
  IconPaperclip,
  IconX,
  IconPhoto,
  IconFile,
} from "@tabler/icons-react";

interface MessageInputProps {
  onSendMessage: (content: string, files?: File[]) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export default function MessageInput({
  onSendMessage,
  disabled = false,
  placeholder = "Type a message...",
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    const content = message.trim();
    if (!content && attachedFiles.length === 0) return;

    setIsSending(true);
    try {
      await onSendMessage(
        content,
        attachedFiles.length > 0 ? attachedFiles : undefined,
      );
      setMessage("");
      setAttachedFiles([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      // Max 10MB per file
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    setAttachedFiles((prev) => [...prev, ...validFiles].slice(0, 5)); // Max 5 files

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <IconPhoto size={16} />;
    }
    return <IconFile size={16} />;
  };

  return (
    <div className="border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
      {/* Attached Files Preview */}
      {attachedFiles.length > 0 && (
        <div className="p-3 border-b border-neutral-200 dark:border-neutral-700">
          <div className="space-y-2">
            {attachedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
              >
                {getFileIcon(file)}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {file.name}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {formatFileSize(file.size)}
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded text-neutral-500 hover:text-red-500"
                >
                  <IconX size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-3">
        <div className="flex items-end gap-2">
          {/* File Attachment Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isSending}
            className="flex-shrink-0 p-2 text-neutral-500 hover:text-kafuffle-primary hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IconPaperclip size={20} />
          </button>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
          />

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isSending}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 resize-none focus:outline-none focus:ring-2 focus:ring-kafuffle-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              rows={1}
              style={{ minHeight: "40px", maxHeight: "120px" }}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSubmit}
            disabled={
              disabled ||
              isSending ||
              (!message.trim() && attachedFiles.length === 0)
            }
            className="flex-shrink-0 p-2 bg-kafuffle-primary text-white rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <IconSend size={20} />
            )}
          </button>
        </div>

        {/* Helper Text */}
        <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}
