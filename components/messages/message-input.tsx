// /components/messages/message-input.tsx
"use client";

import { useState, useRef } from "react";
import {
  IconCirclePlus,
  IconMoodWink,
  IconSend,
  IconPhoto,
  IconMusic,
  IconVideo,
  IconFile,
} from "@tabler/icons-react";
import EmojiPicker from "emoji-picker-react";
import { users } from "@/lib/dummy-data/users";

interface MessageInputProps {
  zoneName: string;
  onSendMessage: (content: string) => void;
}

export default function MessageInput({
  zoneName,
  onSendMessage,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionPosition, setMentionPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Filter users for mentions
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(mentionQuery.toLowerCase()),
  );

  const handleEmojiClick = (emojiData: { emoji: string }) => {
    const emoji = emojiData.emoji;
    insertAtCursor(emoji);
    setShowEmojiPicker(false);
  };

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newMessage = message.slice(0, start) + text + message.slice(end);
      setMessage(newMessage);

      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + text.length;
        textarea.focus();
      }, 0);
    } else {
      setMessage((prev) => prev + text);
    }
  };

  const handleFormatting = (type: "bold" | "italic") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = message.slice(start, end);
    const marker = type === "bold" ? "**" : "*";

    let newText;
    if (selectedText) {
      // Wrap selected text
      newText = `${marker}${selectedText}${marker}`;
    } else {
      // Insert markers with cursor in between
      newText = `${marker}${marker}`;
    }

    const newMessage = message.slice(0, start) + newText + message.slice(end);
    setMessage(newMessage);

    setTimeout(() => {
      if (selectedText) {
        // Select the formatted text
        textarea.selectionStart = start;
        textarea.selectionEnd = start + newText.length;
      } else {
        // Place cursor between markers
        textarea.selectionStart = textarea.selectionEnd = start + marker.length;
      }
      textarea.focus();
    }, 0);
  };

  const handleMentionClick = (user: { id: string; username: string }) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const beforeMention = message.slice(0, mentionPosition - 1);
    const afterMention = message.slice(textarea.selectionStart);
    const mentionText = `@${user.username} `;

    const newMessage = beforeMention + mentionText + afterMention;
    setMessage(newMessage);
    setShowMentions(false);
    setMentionQuery("");

    setTimeout(() => {
      const newCursorPos = beforeMention.length + mentionText.length;
      textarea.selectionStart = textarea.selectionEnd = newCursorPos;
      textarea.focus();
    }, 0);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle mentions dropdown navigation
    if (showMentions) {
      if (e.key === "Escape") {
        setShowMentions(false);
        setMentionQuery("");
        return;
      }
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        // TODO: Add arrow key navigation for mentions
        return;
      }
      if (e.key === "Enter" && filteredUsers.length > 0) {
        e.preventDefault();
        handleMentionClick(filteredUsers[0]);
        return;
      }
    }

    // Handle send message
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
      return;
    }

    // Handle formatting shortcuts
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "b") {
        e.preventDefault();
        handleFormatting("bold");
        return;
      }
      if (e.key === "i") {
        e.preventDefault();
        handleFormatting("italic");
        return;
      }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value;
    setMessage(newMessage);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";

    // Handle mention detection
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = newMessage.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setShowMentions(true);
      setMentionQuery(mentionMatch[1]);
      setMentionPosition(cursorPos - mentionMatch[1].length);
    } else {
      setShowMentions(false);
      setMentionQuery("");
    }
  };

  const handleAttachmentClick = () => {
    setShowAttachments(!showAttachments);
  };

  return (
    <div className={`p-2 relative`}>
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className={`absolute bottom-16 right-4 z-50`}>
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width={300}
            height={400}
            searchDisabled={false}
            skinTonesDisabled={false}
            previewConfig={{
              showPreview: false,
            }}
          />
        </div>
      )}

      {/* Mentions Dropdown */}
      {showMentions && filteredUsers.length > 0 && (
        <div
          className={`absolute bottom-16 left-4 z-50 bg-background border border-foreground/20 rounded-lg shadow-lg p-1 min-w-[250px] max-h-[200px] overflow-y-auto`}
        >
          {filteredUsers.slice(0, 8).map((user) => (
            <button
              key={user.id}
              onClick={() => handleMentionClick(user)}
              className={`w-full text-left px-3 py-2 hover:bg-foreground/10 rounded-md flex items-center gap-2`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs`}
              >
                {user.username[0].toUpperCase()}
              </div>
              <span>{user.username}</span>
            </button>
          ))}
        </div>
      )}

      {/* Attachment Menu */}
      {showAttachments && (
        <div
          className={`absolute bottom-16 left-4 z-50 bg-background border border-foreground/20 rounded-lg shadow-lg p-2 min-w-[200px]`}
        >
          <div className={`space-y-1`}>
            <button
              onClick={() => console.log("Upload image")}
              className={`w-full text-left px-3 py-2 hover:bg-foreground/10 rounded-md flex items-center gap-2 transition-all duration-300 ease-in-out`}
            >
              <IconPhoto size={16} />
              Upload Image
              <span className={`text-xs opacity-50 ml-auto`}>
                PNG, JPG, GIF
              </span>
            </button>

            <button
              onClick={() => console.log("Upload audio")}
              className={`w-full text-left px-3 py-2 hover:bg-foreground/10 rounded-md flex items-center gap-2 transition-all duration-300 ease-in-out`}
            >
              <IconMusic size={16} />
              Upload Audio
              <span className={`text-xs opacity-50 ml-auto`}>
                MP3, WAV, M4A
              </span>
            </button>

            <button
              onClick={() => console.log("Upload video")}
              className={`w-full text-left px-3 py-2 hover:bg-foreground/10 rounded-md flex items-center gap-2 transition-all duration-300 ease-in-out`}
            >
              <IconVideo size={16} />
              Upload Video
              <span className={`text-xs opacity-50 ml-auto`}>
                MP4, MOV, AVI
              </span>
            </button>

            <button
              onClick={() => console.log("Upload document")}
              className={`w-full text-left px-3 py-2 hover:bg-foreground/10 rounded-md flex items-center gap-2 transition-all duration-300 ease-in-out`}
            >
              <IconFile size={16} />
              Upload Document
              <span className={`text-xs opacity-50 ml-auto`}>
                PDF, DOC, TXT
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Overlay to close dropdowns */}
      {(showEmojiPicker || showAttachments || showMentions) && (
        <div
          className={`fixed inset-0 z-40`}
          onClick={() => {
            setShowEmojiPicker(false);
            setShowAttachments(false);
            setShowMentions(false);
          }}
        />
      )}

      {/* Formatting Toolbar */}
      {/*<div className={`flex items-center gap-1 mb-2 px-2`}>*/}
      {/*  <button*/}
      {/*    onClick={() => handleFormatting("bold")}*/}
      {/*    className={`p-1 rounded hover:bg-foreground/10 opacity-70 hover:opacity-100 transition-all"*/}
      {/*    title="Bold (Ctrl+B)"*/}
      {/*  >*/}
      {/*    <IconBold size={16} />*/}
      {/*  </button>*/}
      {/*  <button*/}
      {/*    onClick={() => handleFormatting("italic")}*/}
      {/*    className={`p-1 rounded hover:bg-foreground/10 opacity-70 hover:opacity-100 transition-all"*/}
      {/*    title="Italic (Ctrl+I)"*/}
      {/*  >*/}
      {/*    <IconItalic size={16} />*/}
      {/*  </button>*/}
      {/*  <div className={`text-xs opacity-50 ml-2`}>*/}
      {/*    **bold** *italic* @mention*/}
      {/*  </div>*/}
      {/*</div>*/}

      {/* Input Container */}
      <div
        className={`px-1 flex items-center gap-2 w-full rounded-2xl border border-foreground/20 dark:border-neutral-700 bg-foreground/5 text-sm font-light overflow-hidden transition-all duration-300 ease-in-out`}
      >
        {/* Attachment Button */}
        <button
          onClick={handleAttachmentClick}
          className={`p-1 opacity-50 hover:opacity-100 transition-all duration-300 ease-in-out`}
        >
          <IconCirclePlus />
        </button>

        {/* Text Input */}
        <div className={`flex-1 py-2`}>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={`Type a message in #${zoneName}...`}
            className={`w-full bg-transparent outline-none resize-none min-h-[24px] max-h-[120px] leading-6`}
            rows={1}
          />
        </div>

        {/* Right Actions */}
        <div
          className={`flex items-center gap-1 transition-all duration-300 ease-in-out`}
        >
          {/* Emoji Button */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`opacity-50 hover:opacity-100 transition-all duration-300 ease-in-out p-1`}
          >
            <IconMoodWink />
          </button>

          {/* Send Button - only show when there's content */}
          {message.trim() && (
            <button
              onClick={handleSendMessage}
              className={`text-kafuffle hover:text-kafuffle/70 transition-all duration-300 ease-in-out p-1`}
            >
              <IconSend size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Helper Text */}
      <div className={`text-xs opacity-50 mt-1 px-2`}>
        Press Enter to send, Shift+Enter for new line • Ctrl+B for bold, Ctrl+I
        for italic • @ to mention
      </div>
    </div>
  );
}
