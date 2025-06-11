import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus,
  Smile,
  Paperclip,
  Send,
  Hash,
  AtSign,
  Reply,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";

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
        <div className="flex items-center justify-center my-4">
          <div className="flex-1 h-px bg-gray-600"></div>
          <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm mx-4">
            {formatDate(messageDate)}
          </span>
          <div className="flex-1 h-px bg-gray-600"></div>
        </div>
      )}

      <div
        className={`group px-4 py-1 hover:bg-gray-800/50 ${
          isFirstInGroup ? "mt-4" : ""
        }`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Reply indicator */}
        {replyToMessage && isFirstInGroup && (
          <div className="flex items-center text-xs text-gray-400 mb-1 ml-10">
            <Reply className="w-3 h-3 mr-1" />
            <span className="hover:underline cursor-pointer">
              Replying to {replyToUser?.username || "Unknown User"}
            </span>
            <span className="ml-2 text-gray-500 truncate max-w-xs">
              {replyToMessage.content}
            </span>
          </div>
        )}

        <div className="flex">
          {/* Avatar (only show for first message in group) */}
          <div className="w-10 mr-3 flex-shrink-0">
            {isFirstInGroup && (
              <div className="relative">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-kafuffle-primary flex items-center justify-center text-white font-semibold">
                    {user?.username?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}

                {user?.status && (
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-800 ${
                      user.status === "online"
                        ? "bg-green-500"
                        : user.status === "away"
                          ? "bg-yellow-500"
                          : user.status === "busy"
                            ? "bg-red-500"
                            : "bg-gray-500"
                    }`}
                  />
                )}
              </div>
            )}
          </div>

          {/* Message content */}
          <div className="flex-1 min-w-0">
            {isFirstInGroup && (
              <div className="flex items-baseline gap-2 mb-1">
                <span
                  className={`font-medium ${getUserColor(message.user_id)}`}
                >
                  {user?.username || "Unknown User"}
                </span>
                {user?.roles && user.roles.length > 0 && (
                  <span className="text-xs bg-kafuffle-primary/20 text-kafuffle-primary px-1 rounded">
                    {user.roles[0]}
                  </span>
                )}
                <span className="text-xs text-gray-400">
                  {formatTime(message.created_at)}
                </span>
                {message.edited_at && (
                  <span className="text-xs text-gray-500">(edited)</span>
                )}
              </div>
            )}

            <div className="text-gray-200 text-sm leading-relaxed">
              {message.content}
            </div>
          </div>

          {/* Message actions */}
          {showActions && (
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onReply(message)}
                className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
                title="Reply"
              >
                <Reply className="w-4 h-4" />
              </button>

              {isOwnMessage && onEdit && (
                <button
                  onClick={() => onEdit(message)}
                  className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}

              {isOwnMessage && onDelete && (
                <button
                  onClick={() => onDelete(message)}
                  className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white">
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
}> = ({
  value,
  onChange,
  onSend,
  onKeyPress,
  placeholder,
  replyTo,
  onCancelReply,
  disabled,
}) => {
  return (
    <div className="p-4">
      {/* Reply preview */}
      {replyTo && (
        <div className="mb-2 p-2 bg-gray-700 rounded-t-lg border-l-4 border-kafuffle-primary">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-300">
              Replying to <span className="font-medium">@user</span>
            </div>
            <button
              onClick={onCancelReply}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="text-sm text-gray-400 truncate">
            {replyTo.content}
          </div>
        </div>
      )}

      {/* Input area */}
      <div
        className={`flex items-end space-x-3 bg-gray-700 rounded-lg p-3 ${
          replyTo ? "rounded-t-none" : ""
        }`}
      >
        <button className="text-gray-400 hover:text-white p-1 rounded">
          <Plus className="w-5 h-5" />
        </button>

        <div className="flex-1">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none text-sm"
            rows={1}
            style={{ maxHeight: "200px" }}
          />
        </div>

        <div className="flex items-center space-x-2">
          <button className="text-gray-400 hover:text-white p-1 rounded">
            <Paperclip className="w-5 h-5" />
          </button>
          <button className="text-gray-400 hover:text-white p-1 rounded">
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
        return <Hash className="w-5 h-5 text-gray-400 mr-2" />;
      case "dm":
      case "group":
        return <AtSign className="w-5 h-5 text-gray-400 mr-2" />;
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
        className={`flex items-center justify-center h-full bg-gray-900 ${className}`}
      >
        <div className="text-gray-400">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-gray-900 ${className}`}>
      {/* Welcome message for empty channels */}
      {messages.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              {getContextIcon()}
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Welcome to #{context.name}!
            </h3>
            <p className="text-gray-400">
              {context.type === "channel"
                ? "This is the start of the conversation in this channel."
                : "This is the beginning of your direct message history."}
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto" ref={messagesContainerRef}>
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
      />
    </div>
  );
};

export default EnhancedChat;
