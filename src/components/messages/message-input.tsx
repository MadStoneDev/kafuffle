// /components/messages/message-input.tsx
"use client";

import { useState, useRef, KeyboardEvent, useEffect } from "react";
import {
  IconSend,
  IconPaperclip,
  IconX,
  IconPhoto,
  IconFile,
  IconMoodSmile,
  IconGif,
  IconSearch,
} from "@tabler/icons-react";

import { IGif } from "@giphy/js-types";
import { Grid } from "@giphy/react-components";
import { GiphyFetch } from "@giphy/js-fetch-api";

interface MessageInputProps {
  onSendMessage: (
    content: string,
    files?: File[],
    gifUrl?: string,
  ) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

// Popular emojis for quick access
const POPULAR_EMOJIS = [
  "😀",
  "😂",
  "🤣",
  "😊",
  "😍",
  "🥰",
  "😘",
  "😎",
  "🤔",
  "😴",
  "👍",
  "👎",
  "👏",
  "🙌",
  "👋",
  "🤝",
  "💪",
  "🔥",
  "💯",
  "⭐",
  "❤️",
  "💙",
  "💚",
  "💛",
  "💜",
  "🧡",
  "🖤",
  "🤍",
  "💖",
  "💕",
  "🎉",
  "🎊",
  "🥳",
  "🎈",
  "🎁",
  "🍕",
  "🍔",
  "🍟",
  "☕",
  "🍺",
];

// Emoji categories for better organization
const EMOJI_CATEGORIES = {
  "Smileys & People": [
    "😀",
    "😂",
    "🤣",
    "😊",
    "😍",
    "🥰",
    "😘",
    "😎",
    "🤔",
    "😴",
    "🥺",
    "😭",
    "🤤",
  ],
  Gestures: [
    "👍",
    "👎",
    "👏",
    "🙌",
    "👋",
    "🤝",
    "💪",
    "🤞",
    "✌️",
    "🤟",
    "🤘",
    "👌",
    "👈",
  ],
  "Hearts & Love": [
    "❤️",
    "💙",
    "💚",
    "💛",
    "💜",
    "🧡",
    "🖤",
    "🤍",
    "💖",
    "💕",
    "💘",
    "💝",
    "💗",
  ],
  Celebration: [
    "🎉",
    "🎊",
    "🥳",
    "🎈",
    "🎁",
    "🏆",
    "🎯",
    "🎪",
    "🎭",
    "🎨",
    "🎵",
    "🎶",
    "🎤",
  ],
  "Food & Drink": [
    "🍕",
    "🍔",
    "🍟",
    "☕",
    "🍺",
    "🍷",
    "🥂",
    "🍰",
    "🎂",
    "🍪",
    "🍎",
    "🍌",
    "🥑",
  ],
  Objects: [
    "🔥",
    "💯",
    "⭐",
    "✨",
    "💎",
    "🏠",
    "🚗",
    "✈️",
    "🎮",
    "📱",
    "💻",
    "📚",
    "⚽",
  ],
};

export default function MessageInput({
  onSendMessage,
  disabled = false,
  placeholder = "Type a message...",
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState("");
  const [gifSearch, setGifSearch] = useState("");
  const [selectedEmojiCategory, setSelectedEmojiCategory] =
    useState<string>("Smileys & People");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const gifPickerRef = useRef<HTMLDivElement>(null);

  // Initialize Giphy SDK
  const giphyFetch = new GiphyFetch(process.env.NEXT_PUBLIC_GIPHY_API_KEY!);

  // GIF fetch functions for the Grid component
  const fetchTrendingGifs = (offset: number) =>
    giphyFetch.trending({ offset, limit: 10, rating: "pg-13" });

  const fetchSearchGifs = (offset: number) =>
    giphyFetch.search(gifSearch, { offset, limit: 10, rating: "pg-13" });

  // Close pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
      if (
        gifPickerRef.current &&
        !gifPickerRef.current.contains(event.target as Node)
      ) {
        setShowGifPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newMessage = message.slice(0, start) + emoji + message.slice(end);
      setMessage(newMessage);

      // Move cursor after the emoji
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    }
  };

  const handleGifClick = async (
    gif: IGif,
    e: React.SyntheticEvent<HTMLElement, Event>,
  ) => {
    e.preventDefault();

    // Send the GIF as a message
    setIsSending(true);
    try {
      // Get the best quality URL for the GIF
      const gifUrl = gif.images.original.url;

      await onSendMessage(
        "", // No text content for GIF messages
        undefined, // No files
        gifUrl, // Pass the GIF URL
      );

      setShowGifPicker(false);
    } catch (error) {
      console.error("Failed to send GIF:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    setAttachedFiles((prev) => [...prev, ...validFiles].slice(0, 5));

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

  // Filter emojis based on search and category
  const getFilteredEmojis = () => {
    const categoryEmojis =
      EMOJI_CATEGORIES[
        selectedEmojiCategory as keyof typeof EMOJI_CATEGORIES
      ] || POPULAR_EMOJIS;

    if (!emojiSearch) return categoryEmojis;

    // Simple search - could be enhanced with emoji names/keywords
    return categoryEmojis.filter((emoji) => emoji.includes(emojiSearch));
  };

  return (
    <div className="border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 relative">
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="absolute bottom-full left-3 mb-2 w-80 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-50"
        >
          {/* Search Bar */}
          <div className="p-3 border-b border-neutral-200 dark:border-neutral-700">
            <div className="relative">
              <IconSearch
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                placeholder="Search emojis..."
                value={emojiSearch}
                onChange={(e) => setEmojiSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-kafuffle-primary"
              />
            </div>
          </div>

          {/* Categories */}
          {!emojiSearch && (
            <div className="p-2 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex gap-1 overflow-x-auto">
                {Object.keys(EMOJI_CATEGORIES).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedEmojiCategory(category)}
                    className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                      selectedEmojiCategory === category
                        ? "bg-kafuffle-primary text-white"
                        : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Emoji Grid */}
          <div className="p-3 max-h-60 overflow-y-auto">
            <div className="grid grid-cols-8 gap-2">
              {getFilteredEmojis().map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => insertEmoji(emoji)}
                  className="text-2xl hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded p-1 transition-colors"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GIF Picker */}
      {showGifPicker && (
        <div
          ref={gifPickerRef}
          className="absolute bottom-full left-3 mb-2 w-96 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-50"
        >
          {/* Search Bar */}
          <div className="p-3 border-b border-neutral-200 dark:border-neutral-700">
            <div className="relative">
              <IconSearch
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                placeholder="Search GIFs..."
                value={gifSearch}
                onChange={(e) => setGifSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-kafuffle-primary"
              />
            </div>
          </div>

          {/* GIF Grid */}
          <div className="max-h-80 overflow-y-auto">
            <div className="p-3">
              {process.env.NEXT_PUBLIC_GIPHY_API_KEY ? (
                <Grid
                  width={360}
                  columns={2}
                  gutter={8}
                  fetchGifs={gifSearch ? fetchSearchGifs : fetchTrendingGifs}
                  onGifClick={handleGifClick}
                  key={gifSearch} // Re-render when search changes
                />
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <p className="text-sm">GIF search requires a Giphy API key</p>
                  <p className="text-xs mt-1">
                    Add NEXT_PUBLIC_GIPHY_API_KEY to your .env
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Attribution */}
          <div className="p-2 text-xs text-neutral-500 text-center border-t border-neutral-200 dark:border-neutral-700">
            Powered by <span className="font-semibold">GIPHY</span>
          </div>
        </div>
      )}

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
        <div className="flex items-center gap-2">
          {/* File Attachment Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isSending}
            className="flex-shrink-0 p-2 text-neutral-500 hover:text-kafuffle-primary hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IconPaperclip size={20} />
          </button>

          {/* Emoji Button */}
          <button
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowGifPicker(false);
            }}
            disabled={disabled || isSending}
            className={`flex-shrink-0 p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              showEmojiPicker
                ? "text-kafuffle-primary bg-kafuffle-primary/10"
                : "text-neutral-500 hover:text-kafuffle-primary hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            <IconMoodSmile size={20} />
          </button>

          {/* GIF Button */}
          <button
            onClick={() => {
              setShowGifPicker(!showGifPicker);
              setShowEmojiPicker(false);
            }}
            disabled={disabled || isSending}
            className={`flex-shrink-0 p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              showGifPicker
                ? "text-kafuffle-primary bg-kafuffle-primary/10"
                : "text-neutral-500 hover:text-kafuffle-primary hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            <IconGif size={20} />
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
