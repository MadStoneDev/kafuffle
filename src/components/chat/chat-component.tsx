"use client";

import { Redis } from "@upstash/redis";
import { createClient } from "@/utils/supabase/client";
import React, { useState, useEffect, useRef, useCallback } from "react";

// Generic types for database abstraction
export interface ChatMessage {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  channel_id: string;
  reply_to?: string | null;
  type?: string | null;
}

export interface ChatUser {
  id: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
}

export interface ChatChannel {
  id: string;
  name: string;
  project_id: string;
  section_id?: string | null;
}

// Generic database interface
export interface ChatDatabase {
  getMessages: (
    channelId: string,
    limit?: number,
    before?: string,
  ) => Promise<ChatMessage[]>;
  getUser: (userId: string) => Promise<ChatUser | null>;
  getChannel: (channelId: string) => Promise<ChatChannel | null>;
  sendMessage: (
    channelId: string,
    content: string,
    userId: string,
  ) => Promise<ChatMessage>;
  subscribeToMessages: (
    channelId: string,
    onMessage: (message: ChatMessage) => void,
  ) => () => void;
}

// Generic cache interface
export interface ChatCache {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, ttl?: number) => Promise<void>;
  del: (key: string) => Promise<void>;
}

// Supabase implementation
export class SupabaseDatabase implements ChatDatabase {
  private supabase: any;

  constructor() {
    this.supabase = createClient();
  }

  async getMessages(
    channelId: string,
    limit = 50,
    before?: string,
  ): Promise<ChatMessage[]> {
    let query = this.supabase
      .from("messages")
      .select("*")
      .eq("channel_id", channelId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt("created_at", before);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data?.reverse() || [];
  }

  async getUser(userId: string): Promise<ChatUser | null> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url")
      .eq("id", userId)
      .single();

    if (error) return null;
    return data;
  }

  async getChannel(channelId: string): Promise<ChatChannel | null> {
    const { data, error } = await this.supabase
      .from("channels")
      .select("id, name, project_id, section_id")
      .eq("id", channelId)
      .single();

    if (error) return null;
    return data;
  }

  async sendMessage(
    channelId: string,
    content: string,
    userId: string,
  ): Promise<ChatMessage> {
    const { data, error } = await this.supabase
      .from("messages")
      .insert({
        channel_id: channelId,
        content,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  subscribeToMessages(
    channelId: string,
    onMessage: (message: ChatMessage) => void,
  ): () => void {
    const subscription = this.supabase
      .channel(`messages:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload: any) => {
          onMessage(payload.new);
        },
      )
      .subscribe();

    return () => {
      this.supabase.removeChannel(subscription);
    };
  }
}

// Upstash Redis implementation
export class UpstashCache implements ChatCache {
  private redis: Redis;

  constructor(redisUrl: string, redisToken: string) {
    this.redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });
  }

  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  async set(key: string, value: string, ttl = 300): Promise<void> {
    await this.redis.set(key, value, { ex: ttl });
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
}

// Chat component props
interface ChatComponentProps {
  channelId: string;
  currentUserId: string;
  database: ChatDatabase;
  cache?: ChatCache;
  className?: string;
  onChannelChange?: (channel: ChatChannel) => void;
}

// Message display component
interface MessageItemProps {
  message: ChatMessage;
  user: ChatUser | null;
  isFirstInGroup: boolean;
  showDateSeparator: boolean;
  messageDate: string;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  user,
  isFirstInGroup,
  showDateSeparator,
  messageDate,
}) => {
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

  return (
    <>
      {showDateSeparator && (
        <div className="flex items-center justify-center my-4">
          <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">
            {formatDate(messageDate)}
          </span>
        </div>
      )}
      <div className="flex flex-col px-4 py-1 hover:bg-gray-800/50">
        {isFirstInGroup && (
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-kafuffle-primary font-medium">
              {user?.username || user?.full_name || "Unknown User"}
            </span>
            <span className="text-xs text-gray-400">
              {formatTime(message.created_at)}
            </span>
          </div>
        )}
        <div className={`text-gray-200 ${isFirstInGroup ? "" : "ml-0"}`}>
          {message.content}
        </div>
      </div>
    </>
  );
};

// Main chat component
export const ChatComponent: React.FC<ChatComponentProps> = ({
  channelId,
  currentUserId,
  database,
  cache,
  className = "",
  onChannelChange,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<Map<string, ChatUser>>(new Map());
  const [channel, setChannel] = useState<ChatChannel | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Cache user data
  const getCachedUser = useCallback(
    async (userId: string): Promise<ChatUser | null> => {
      const cacheKey = `user:${userId}`;

      if (cache) {
        const cached = await cache.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      const user = await database.getUser(userId);

      if (user && cache) {
        await cache.set(cacheKey, JSON.stringify(user), 300); // 5 minutes
      }

      return user;
    },
    [database, cache],
  );

  // Load users for messages
  const loadUsers = useCallback(
    async (messages: ChatMessage[]) => {
      const userIds = [...new Set(messages.map((m) => m.user_id))];
      const newUsers = new Map(users);

      for (const userId of userIds) {
        if (!newUsers.has(userId)) {
          const user = await getCachedUser(userId);
          if (user) {
            newUsers.set(userId, user);
          }
        }
      }

      setUsers(newUsers);
    },
    [users, getCachedUser],
  );

  // Load messages
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedMessages = await database.getMessages(channelId);
      setMessages(fetchedMessages);
      await loadUsers(fetchedMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  }, [channelId, database, loadUsers]);

  // Load channel info
  const loadChannel = useCallback(async () => {
    try {
      const channelData = await database.getChannel(channelId);
      setChannel(channelData);
      if (channelData && onChannelChange) {
        onChannelChange(channelData);
      }
    } catch (error) {
      console.error("Error loading channel:", error);
    }
  }, [channelId, database, onChannelChange]);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      await database.sendMessage(channelId, newMessage.trim(), currentUserId);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  // Handle new message from subscription
  const handleNewMessage = useCallback(
    async (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);

      // Load user if not cached
      if (!users.has(message.user_id)) {
        const user = await getCachedUser(message.user_id);
        if (user) {
          setUsers((prev) => new Map(prev.set(message.user_id, user)));
        }
      }
    },
    [users, getCachedUser],
  );

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initial load
  useEffect(() => {
    loadMessages();
    loadChannel();
  }, [loadMessages, loadChannel]);

  // Subscribe to new messages
  useEffect(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    unsubscribeRef.current = database.subscribeToMessages(
      channelId,
      handleNewMessage,
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [channelId, database, handleNewMessage]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Group messages and determine date separators
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
    <div className={`flex flex-col h-full bg-gray-900 text-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold">#{channel?.name || "Channel"}</h2>
        <button
          onClick={() => window.location.reload()}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
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
              user={user}
              isFirstInGroup={isFirstInGroup}
              showDateSeparator={showDateSeparator}
              messageDate={messageDate}
            />
          ),
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder={`Message #${channel?.name || "general"}`}
            disabled={sending}
            className="flex-1 bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-kafuffle-primary focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            className="bg-kafuffle-primary text-white px-4 py-2 rounded hover:bg-kafuffle-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
