import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Smile,
  Paperclip,
  Send,
  Hash,
  AtSign,
  Reply,
  MoreHorizontal,
  Edit,
  Trash2,
  Users,
} from "lucide-react";
import { IconCirclePlusFilled, IconCircleXFilled } from "@tabler/icons-react";
import { formatDate, formatTime } from "@/utils/general";

// Types for the chat component
interface ChatMessage {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  channel_id?: string | null;
  conversation_id?: string | null;
  reply_to?: string | null;
  type?: string | null;
  edited_at?: string | null;
}

interface ChatUser {
  id: string;
  username: string;
  full_name?: string | null;
  avatar_url?: string | null;
  status?: "online" | "away" | "busy" | "offline";
  roles?: string[];
}

interface ChatContext {
  id: string;
  name: string;
  type: "channel" | "dm" | "group";
}

interface EnhancedChatProps {
  context: ChatContext;
  currentUserId: string;
  messages: ChatMessage[];
  users: Map<string, ChatUser>;
  onSendMessage: (content: string, replyTo?: string) => Promise<void>;
  onEditMessage?: (messageId: string, content: string) => Promise<void>;
  onDeleteMessage?: (messageId: string) => Promise<void>;
  onLoadMoreMessages?: () => Promise<void>;
  loading?: boolean;
  hasMoreMessages?: boolean;
  className?: string;
}

const MessageItem: React.FC<{
  message: ChatMessage;
  user: ChatUser | null;
  currentUserId: string;
  isFirstInGroup: boolean;
  showDateSeparator: boolean;
  messageDate: string;
  replyToMessage?: ChatMessage | null;
  replyToUser?: ChatUser | null;
  onReply: (message: ChatMessage) => void;
  onEdit?: (message: ChatMessage) => void;
  onDelete?: (message: ChatMessage) => void;
}> = ({
  message,
  user,
  currentUserId,
  isFirstInGroup,
  showDateSeparator,
  messageDate,
  replyToMessage,
  replyToUser,
  onReply,
  onEdit,
  onDelete,
}) => {
  const [showActions, setShowActions] = useState(false);
  const isOwnMessage = message.user_id === currentUserId;

  const getUserColor = (userId: string) => {
    // Generate consistent color based on user ID
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

  return (
    <>
      {showDateSeparator && (
        <div className={`mx-4 flex items-center justify-center`}>
          <div className={`flex-1 h-px bg-neutral-700`} />
          <span
            className={`mx-2 px-2 pt-0.5 pb-1 border border-neutral-500 text-neutral-400 rounded-full text-xs font-light`}
          >
            {formatDate(messageDate)}
          </span>
          <div className={`flex-1 h-px bg-neutral-700`} />
        </div>
      )}

      <div
        className={`group py-4 px-4 py-1 hover:bg-neutral-800/50 ${
          isFirstInGroup ? "" : ""
        }`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Reply indicator */}
        {replyToMessage && isFirstInGroup && (
          <div className="flex items-center text-xs text-neutral-400 mb-1 ml-10">
            <Reply className="w-3 h-3 mr-1" />
            <span className="hover:underline cursor-pointer">
              Replying to {replyToUser?.username || "Unknown User"}
            </span>
            <span className="ml-2 text-neutral-500 truncate max-w-xs">
              {replyToMessage.content}
            </span>
          </div>
        )}

        <div className="flex">
          {/* Avatar (only show for first message in group) */}
          <div className="w-8 mr-3 flex-shrink-0">
            {isFirstInGroup && (
              <div className="relative">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-kafuffle-primary flex items-center justify-center text-white">
                    {user?.username?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Message content */}
          <div className="flex-1 min-w-0">
            {isFirstInGroup && (
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-xs font-bold ${getUserColor(
                    message.user_id,
                  )}`}
                >
                  {user?.username || "Unknown User"}
                </span>
                {user?.roles && user.roles.length > 0 && (
                  <span
                    className={`px-1 text-xs bg-kafuffle-primary/20 text-kafuffle-primary`}
                  >
                    {user.roles[0]}
                  </span>
                )}
                <span className="text-xs font-light text-neutral-500">
                  {formatTime(message.created_at)}
                </span>
                {message.edited_at && (
                  <span className="text-xs text-neutral-500">(edited)</span>
                )}
              </div>
            )}

            <div
              className={`mt-0.5 text-neutral-300 text-xs font-normal leading-relaxed`}
            >
              {message.content}
            </div>
          </div>

          {/* Message actions */}
          {showActions && (
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onReply(message)}
                className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white"
                title="Reply"
              >
                <Reply className="w-4 h-4" />
              </button>

              {isOwnMessage && onEdit && (
                <button
                  onClick={() => onEdit(message)}
                  className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}

              {isOwnMessage && onDelete && (
                <button
                  onClick={() => onDelete(message)}
                  className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const MessageInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  placeholder: string;
  replyTo?: ChatMessage | null;
  onCancelReply?: () => void;
  disabled?: boolean;
  users: Map<string, ChatUser>; // Add this prop
}> = ({
  value,
  onChange,
  onSend,
  onKeyPress,
  placeholder,
  replyTo,
  onCancelReply,
  disabled,
  users, // Add this prop
}) => {
  // Look up the user being replied to
  const replyToUser = replyTo ? users.get(replyTo.user_id) : null;

  return (
    <div className={`p-4`}>
      {/* Reply preview */}
      {replyTo && (
        <div className={`space-y-2`}>
          <div
            className={`py-1 px-2 flex flex-col bg-kafuffle-primary/30 border-l-[3px] border-kafuffle-primary text-sm text-neutral-50`}
          >
            <div className={`flex items-center gap-2 font-bold`}>
              {replyToUser?.username || "Unknown User"}
              <span className={`text-xs text-neutral-50/60 font-light`}>
                {formatDate(replyTo.created_at)} at{" "}
                {formatTime(replyTo.created_at)}
              </span>
            </div>
            <span className={`font-light truncate`}>{replyTo.content}</span>
          </div>

          <div
            className={`px-2 py-3 flex items-center justify-between bg-neutral-800 rounded-t-lg border border-b-0 border-neutral-700`}
          >
            <div className="text-xs text-neutral-300 font-light">
              Replying to{" "}
              <span className="font-bold">
                {replyToUser?.username || "Unknown User"}
              </span>
            </div>
            <button
              onClick={onCancelReply}
              className="text-neutral-400 hover:text-white"
            >
              <IconCircleXFilled size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Rest of the component stays the same */}
      <div
        className={`p-2 flex items-center space-x-3 bg-neutral-900 rounded-lg border border-neutral-700 ${
          replyTo ? "rounded-t-none" : ""
        }`}
      >
        <button className="text-neutral-400 hover:text-white p-1 rounded">
          <IconCirclePlusFilled size={24} />
        </button>

        <div className="flex-1">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full bg-transparent text-white placeholder-neutral-500 resize-none focus:outline-none text-sm font-light"
            rows={1}
            style={{ maxHeight: "200px" }}
          />
        </div>

        <div className="flex items-center space-x-2">
          <button className="text-neutral-400 hover:text-white p-1 rounded">
            <Paperclip className="w-5 h-5" />
          </button>
          <button className="text-neutral-400 hover:text-white p-1 rounded">
            <Smile className="w-5 h-5" />
          </button>

          {value.trim() && (
            <button
              onClick={onSend}
              disabled={disabled}
              className="bg-kafuffle-primary hover:bg-kafuffle-primary/80 disabled:bg-kafuffle-primary/50 text-white p-2 rounded-full"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const EnhancedChat: React.FC<EnhancedChatProps> = ({
  context,
  currentUserId,
  messages,
  users,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onLoadMoreMessages,
  loading = false,
  hasMoreMessages = false,
  className = "",
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(
    null,
  );
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [newMessage]);

  // Process messages for display
  const processedMessages = messages.map((message, index) => {
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const currentDate = new Date(message.created_at).toDateString();
    const prevDate = prevMessage
      ? new Date(prevMessage.created_at).toDateString()
      : null;

    const isFirstInGroup =
      !prevMessage ||
      prevMessage.user_id !== message.user_id ||
      new Date(message.created_at).getTime() -
        new Date(prevMessage.created_at).getTime() >
        300000; // 5 minutes

    const showDateSeparator = currentDate !== prevDate;

    const replyToMessage = message.reply_to
      ? messages.find((m) => m.id === message.reply_to)
      : null;
    const replyToUser = replyToMessage
      ? users.get(replyToMessage.user_id)
      : null;

    return {
      message,
      user: users.get(message.user_id) || null,
      isFirstInGroup,
      showDateSeparator,
      messageDate: currentDate,
      replyToMessage,
      replyToUser,
    };
  });

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle sending message
  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      await onSendMessage(newMessage.trim(), replyTo?.id);
      setNewMessage("");
      setReplyTo(null);
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle reply
  const handleReply = (message: ChatMessage) => {
    setReplyTo(message);
    textareaRef.current?.focus();
  };

  // Handle edit
  const handleEdit = (message: ChatMessage) => {
    setEditingMessage(message);
    setNewMessage(message.content);
    textareaRef.current?.focus();
  };

  // Auto scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // Get context icon
  const getContextIcon = () => {
    switch (context.type) {
      case "channel":
        return <Hash className="w-5 h-5 text-neutral-400 mr-2" />;
      case "dm":
      case "group":
        return <AtSign className="w-5 h-5 text-neutral-400 mr-2" />;
      default:
        return null;
    }
  };

  // Get placeholder text
  const getPlaceholder = () => {
    switch (context.type) {
      case "channel":
        return `Message #${context.name}`;
      case "dm":
        return `Message @${context.name}`;
      case "group":
        return `Message ${context.name}`;
      default:
        return "Type a message...";
    }
  };

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center h-full bg-neutral-900 ${className}`}
      >
        <div className="text-neutral-400">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-neutral-900 ${className}`}>
      {/* Welcome message for empty channels */}
      {messages.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
              {getContextIcon()}
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Welcome to #{context.name}!
            </h3>
            <p className="text-neutral-400">
              {context.type === "channel"
                ? "This is the start of the conversation in this channel."
                : "This is the beginning of your direct message history."}
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div className={`flex-1 overflow-y-auto`} ref={messagesContainerRef}>
          {/* Load more button */}
          {hasMoreMessages && (
            <div className="text-center p-4">
              <button
                onClick={onLoadMoreMessages}
                className="text-kafuffle-primary hover:underline text-sm"
              >
                Load more messages
              </button>
            </div>
          )}

          {/* Messages list */}
          {processedMessages.map(
            ({
              message,
              user,
              isFirstInGroup,
              showDateSeparator,
              messageDate,
              replyToMessage,
              replyToUser,
            }) => (
              <MessageItem
                key={message.id}
                message={message}
                user={user}
                currentUserId={currentUserId}
                isFirstInGroup={isFirstInGroup}
                showDateSeparator={showDateSeparator}
                messageDate={messageDate}
                replyToMessage={replyToMessage}
                replyToUser={replyToUser}
                onReply={handleReply}
                onEdit={onEditMessage ? handleEdit : undefined}
                onDelete={onDeleteMessage}
              />
            ),
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Message Input */}
      <MessageInput
        value={newMessage}
        onChange={setNewMessage}
        onSend={handleSend}
        onKeyPress={handleKeyPress}
        placeholder={getPlaceholder()}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        disabled={sending}
        users={users} // Add this line
      />
    </div>
  );
};

export default EnhancedChat;
