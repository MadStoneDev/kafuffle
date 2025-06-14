import React, { useState, useEffect, useRef } from "react";

import { Send, Hash, AtSign, X } from "lucide-react";

import { MessageItem } from "./message-item";
import type { Message, User, ChatContext } from "@/types";

interface ChatProps {
  context: ChatContext;
  currentUserId: string;
  messages: Message[];
  users: Map<string, User>;
  onSendMessage: (content: string, replyTo?: string) => Promise<void>;
  onEditMessage?: (messageId: string, content: string) => Promise<void>;
  onDeleteMessage?: (messageId: string) => Promise<void>;
  className?: string;
}

export const Chat: React.FC<ChatProps> = ({
  context,
  currentUserId,
  messages,
  users,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  className = "",
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [newMessage]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);

      if (editingMessage) {
        await onEditMessage?.(editingMessage.id, newMessage.trim());
        setEditingMessage(null);
      } else {
        await onSendMessage(newMessage.trim(), replyTo?.id);
      }

      setNewMessage("");
      setReplyTo(null);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReply = (message: Message) => {
    setReplyTo(message);
    textareaRef.current?.focus();
  };

  const handleEdit = (message: Message) => {
    setEditingMessage(message);
    setNewMessage(message.content);
    textareaRef.current?.focus();
  };

  const handleDelete = async (message: Message) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      await onDeleteMessage?.(message.id);
    }
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setNewMessage("");
  };

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

    return {
      message,
      user: users.get(message.user_id) || null,
      isFirstInGroup,
      showDateSeparator,
      messageDate: currentDate,
    };
  });

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

  const getPlaceholder = () => {
    if (editingMessage) return "Edit your message...";

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

  return (
    <div className={`flex flex-col h-full bg-neutral-900 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-neutral-700">
        <div className="flex items-center">
          {getContextIcon()}
          <h2 className="text-lg font-semibold text-white">{context.name}</h2>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
                {getContextIcon()}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Welcome to {context.name}!
              </h3>
              <p className="text-neutral-400">
                {context.type === "channel"
                  ? "This is the start of the conversation in this channel."
                  : "This is the beginning of your conversation."}
              </p>
            </div>
          </div>
        ) : (
          <>
            {processedMessages.map(
              ({
                message,
                user,
                isFirstInGroup,
                showDateSeparator,
                messageDate,
              }) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  currentUserId={currentUserId}
                  isFirstInGroup={isFirstInGroup}
                  showDateSeparator={showDateSeparator}
                  messageDate={messageDate}
                  onReply={handleReply}
                  onEdit={onEditMessage ? handleEdit : undefined}
                  onDelete={onDeleteMessage ? handleDelete : undefined}
                />
              ),
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4">
        {/* Reply preview */}
        {replyTo && (
          <div className="mb-2">
            <div className="py-2 px-3 bg-kafuffle-primary/20 border-l-3 border-kafuffle-primary text-sm text-neutral-50 rounded">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium">
                  Replying to {replyTo.user?.username || "Unknown User"}
                  <span className="text-xs text-neutral-300 font-normal">
                    {replyTo.content.substring(0, 50)}
                    {replyTo.content.length > 50 ? "..." : ""}
                  </span>
                </div>
                <button
                  onClick={cancelReply}
                  className="text-neutral-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit preview */}
        {editingMessage && (
          <div className="mb-2">
            <div className="py-2 px-3 bg-yellow-500/20 border-l-3 border-yellow-500 text-sm text-neutral-50 rounded">
              <div className="flex items-center justify-between">
                <span className="font-medium">Editing message</span>
                <button
                  onClick={cancelEdit}
                  className="text-neutral-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex items-end space-x-3 bg-neutral-800 rounded-lg border border-neutral-700 p-3">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={getPlaceholder()}
              disabled={sending}
              className="w-full bg-transparent text-white placeholder-neutral-500 resize-none focus:outline-none text-sm"
              rows={1}
              style={{ maxHeight: "200px" }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="bg-kafuffle-primary hover:bg-kafuffle-primary/80 disabled:bg-kafuffle-primary/50 text-white p-2 rounded-full transition-colors disabled:cursor-not-allowed"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
