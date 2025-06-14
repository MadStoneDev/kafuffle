import React, { useState } from "react";
import { Reply, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import type { Message } from "@/types";

interface MessageItemProps {
  message: Message;
  currentUserId: string;
  isFirstInGroup: boolean;
  showDateSeparator: boolean;
  messageDate: string;
  onReply: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onDelete?: (message: Message) => void;
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
};

const getUserColor = (userId: string) => {
  const colors = [
    "text-red-400",
    "text-blue-400",
    "text-green-400",
    "text-yellow-400",
    "text-purple-400",
    "text-pink-400",
    "text-indigo-400",
    "text-cyan-400",
  ];
  const index =
    userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;
  return colors[index];
};

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  currentUserId,
  isFirstInGroup,
  showDateSeparator,
  messageDate,
  onReply,
  onEdit,
  onDelete,
}) => {
  const [showActions, setShowActions] = useState(false);
  const isOwnMessage = message.user_id === currentUserId;

  return (
    <>
      {showDateSeparator && (
        <div className="mx-4 flex items-center justify-center my-4">
          <div className="flex-1 h-px bg-neutral-700" />
          <span className="mx-2 px-2 py-1 border border-neutral-500 text-neutral-400 rounded-full text-xs">
            {formatDate(messageDate)}
          </span>
          <div className="flex-1 h-px bg-neutral-700" />
        </div>
      )}

      <div
        className={`group py-1 px-4 hover:bg-neutral-800/50 relative ${
          isFirstInGroup ? "mt-4" : "mt-0.5"
        }`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Reply indicator */}
        {message.reply_to_message && isFirstInGroup && (
          <div className="flex items-center text-xs text-neutral-400 mb-1 ml-10">
            <Reply className="w-3 h-3 mr-1" />
            <span className="hover:underline cursor-pointer">
              Replying to{" "}
              {message.reply_to_message.user?.username || "Unknown User"}
            </span>
            <span className="ml-2 text-neutral-500 truncate max-w-xs">
              {message.reply_to_message.content}
            </span>
          </div>
        )}

        <div className="flex">
          {/* Avatar */}
          <div className="w-8 mr-3 flex-shrink-0">
            {isFirstInGroup && (
              <div className="w-8 h-8 rounded-full bg-kafuffle-primary flex items-center justify-center text-white text-sm font-semibold">
                {message.user?.username?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </div>

          {/* Message content */}
          <div className="flex-1 min-w-0">
            {isFirstInGroup && (
              <div className="flex items-baseline gap-2 mb-1">
                <span
                  className={`text-sm font-semibold ${getUserColor(
                    message.user_id,
                  )}`}
                >
                  {message.user?.username || "Unknown User"}
                </span>
                <span className="text-xs text-neutral-500">
                  {formatTime(message.created_at)}
                </span>
                {message.edited_at && (
                  <span className="text-xs text-neutral-500">(edited)</span>
                )}
              </div>
            )}

            <div className="text-sm text-neutral-300 leading-relaxed break-words">
              {message.content}
            </div>
          </div>

          {/* Message actions */}
          {showActions && (
            <div className="absolute right-4 top-0 flex items-center space-x-1 bg-neutral-800 border border-neutral-600 rounded-lg p-1 shadow-lg">
              <button
                onClick={() => onReply(message)}
                className="p-1.5 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white transition-colors"
                title="Reply"
              >
                <Reply className="w-4 h-4" />
              </button>

              {isOwnMessage && onEdit && (
                <button
                  onClick={() => onEdit(message)}
                  className="p-1.5 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}

              {isOwnMessage && onDelete && (
                <button
                  onClick={() => onDelete(message)}
                  className="p-1.5 hover:bg-neutral-700 rounded text-neutral-400 hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button className="p-1.5 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
