import React from "react";
import { Reply, Edit, Trash2, Smile, MoreHorizontal } from "lucide-react";

interface MessageActionsProps {
  show: boolean;
  isOwnMessage: boolean;
  onReply: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onReaction: () => void;
  showReactionPicker: boolean;
  onReactionSelect: (emoji: string) => void;
}

const COMMON_EMOJIS = ["👍", "👎", "❤️", "😄", "😮", "😢", "🎉", "🚀"];

export const MessageActions: React.FC<MessageActionsProps> = ({
  show,
  isOwnMessage,
  onReply,
  onEdit,
  onDelete,
  onReaction,
  showReactionPicker,
  onReactionSelect,
}) => {
  if (!show) return null;

  return (
    <div className="absolute right-4 top-0 z-10">
      <div className="flex items-center space-x-1 bg-neutral-800 border border-neutral-600 rounded-lg p-1 shadow-lg">
        <button
          onClick={onReaction}
          className="p-1.5 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white transition-colors"
          title="Add reaction"
        >
          <Smile className="w-4 h-4" />
        </button>

        <button
          onClick={onReply}
          className="p-1.5 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white transition-colors"
          title="Reply"
        >
          <Reply className="w-4 h-4" />
        </button>

        {isOwnMessage && onEdit && (
          <button
            onClick={onEdit}
            className="p-1.5 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
        )}

        {isOwnMessage && onDelete && (
          <button
            onClick={onDelete}
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

      {/* Reaction picker */}
      {showReactionPicker && (
        <div className="absolute top-full right-0 mt-2 bg-neutral-800 border border-neutral-600 rounded-lg p-2 shadow-lg z-20">
          <div className="grid grid-cols-4 gap-1">
            {COMMON_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onReactionSelect(emoji)}
                className="p-2 hover:bg-neutral-700 rounded text-lg transition-colors"
                title={`React with ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
