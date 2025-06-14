import { createClient } from "@/utils/supabase/client";
import type { EnhancedMessage, EnhancedUser } from "@/types";

export interface TypingIndicator {
  user_id: string;
  username: string;
  channel_id?: string;
  conversation_id?: string;
  timestamp: number;
}

export interface PresenceUpdate {
  user_id: string;
  status: "online" | "away" | "busy" | "offline";
  last_seen?: string;
  custom_status?: string;
}

export interface RealtimeEvent {
  type: "message" | "typing" | "presence" | "user_join" | "user_leave";
  data: any;
  timestamp: number;
}

class RealtimeManager {
  private supabase = createClient();
  private channels = new Map<string, any>();
  private typingTimers = new Map<string, NodeJS.Timeout>();
  private presenceHeartbeat?: NodeJS.Timeout;

  // Event handlers
  private messageHandlers = new Set<(message: EnhancedMessage) => void>();
  private typingHandlers = new Set<(typing: TypingIndicator[]) => void>();
  private presenceHandlers = new Set<(presence: PresenceUpdate[]) => void>();
  private userActivityHandlers = new Set<
    (event: { type: "join" | "leave"; user: EnhancedUser }) => void
  >();

  constructor() {
    this.startPresenceHeartbeat();
  }

  // Channel subscription management
  subscribeToChannel(channelId: string) {
    if (this.channels.has(channelId)) {
      return this.channels.get(channelId);
    }

    const channel = this.supabase
      .channel(`channel:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => this.handleNewMessage(payload.new as any),
      )
      .on("broadcast", { event: "typing" }, (payload) =>
        this.handleTypingEvent(payload.payload as TypingIndicator),
      )
      .on("presence", { event: "sync" }, () => {
        const presenceState = channel.presenceState();
        this.handlePresenceSync(presenceState);
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        this.handlePresenceJoin(key, newPresences);
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        this.handlePresenceLeave(key, leftPresences);
      })
      .subscribe();

    this.channels.set(channelId, channel);
    return channel;
  }

  subscribeToConversation(conversationId: string) {
    if (this.channels.has(`conversation:${conversationId}`)) {
      return this.channels.get(`conversation:${conversationId}`);
    }

    const channel = this.supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => this.handleNewMessage(payload.new as any),
      )
      .on("broadcast", { event: "typing" }, (payload) =>
        this.handleTypingEvent(payload.payload as TypingIndicator),
      )
      .subscribe();

    this.channels.set(`conversation:${conversationId}`, channel);
    return channel;
  }

  // Unsubscribe from channels
  unsubscribeFromChannel(channelId: string) {
    const channel = this.channels.get(channelId);
    if (channel) {
      this.supabase.removeChannel(channel);
      this.channels.delete(channelId);
    }
  }

  unsubscribeFromConversation(conversationId: string) {
    const key = `conversation:${conversationId}`;
    const channel = this.channels.get(key);
    if (channel) {
      this.supabase.removeChannel(channel);
      this.channels.delete(key);
    }
  }

  // Message handling
  private async handleNewMessage(messageData: any) {
    try {
      // Fetch complete message with user data
      const { data: message, error } = await this.supabase
        .from("messages")
        .select(
          `
          *,
          profiles(*),
          reply_to_message:messages!reply_to(
            *,
            profiles(*)
          )
        `,
        )
        .eq("id", messageData.id)
        .single();

      if (error) throw error;

      const enhancedMessage: EnhancedMessage = {
        ...message,
        user: message.profiles,
        reply_to_message: message.reply_to_message
          ? {
              ...message.reply_to_message,
              user: message.reply_to_message.profiles,
            }
          : undefined,
        reactions: [], // TODO: Load reactions
        attachments: [], // TODO: Load attachments
      };

      this.messageHandlers.forEach((handler) => handler(enhancedMessage));
    } catch (error) {
      console.error("Error handling new message:", error);
    }
  }

  // Typing indicators
  sendTypingIndicator(channelId?: string, conversationId?: string) {
    const channel = channelId
      ? this.channels.get(channelId)
      : this.channels.get(`conversation:${conversationId}`);

    if (!channel) return;

    const typingData: TypingIndicator = {
      user_id: "current_user_id", // This would come from auth context
      username: "current_username",
      channel_id: channelId,
      conversation_id: conversationId,
      timestamp: Date.now(),
    };

    channel.send({
      type: "broadcast",
      event: "typing",
      payload: typingData,
    });

    // Auto-clear typing indicator after 3 seconds
    const key = channelId || conversationId || "";
    if (this.typingTimers.has(key)) {
      clearTimeout(this.typingTimers.get(key));
    }

    const timer = setTimeout(() => {
      this.stopTypingIndicator(channelId, conversationId);
    }, 3000);

    this.typingTimers.set(key, timer);
  }

  stopTypingIndicator(channelId?: string, conversationId?: string) {
    const channel = channelId
      ? this.channels.get(channelId)
      : this.channels.get(`conversation:${conversationId}`);

    if (!channel) return;

    channel.send({
      type: "broadcast",
      event: "typing_stop",
      payload: {
        user_id: "current_user_id",
        channel_id: channelId,
        conversation_id: conversationId,
      },
    });

    const key = channelId || conversationId || "";
    if (this.typingTimers.has(key)) {
      clearTimeout(this.typingTimers.get(key));
      this.typingTimers.delete(key);
    }
  }

  private handleTypingEvent(typing: TypingIndicator) {
    // Group typing indicators by channel/conversation
    const typingMap = new Map<string, TypingIndicator[]>();

    // Add current typing indicator
    const key = typing.channel_id || typing.conversation_id || "";
    const existing = typingMap.get(key) || [];

    // Remove old indicators from same user
    const filtered = existing.filter((t) => t.user_id !== typing.user_id);

    // Add new indicator if not a stop event
    if (typing.timestamp > Date.now() - 5000) {
      // Only keep recent typing
      filtered.push(typing);
    }

    typingMap.set(key, filtered);

    // Notify handlers
    this.typingHandlers.forEach((handler) =>
      handler(Array.from(typingMap.values()).flat()),
    );
  }

  // Presence management
  private startPresenceHeartbeat() {
    this.presenceHeartbeat = setInterval(() => {
      this.updatePresence("online");
    }, 30000); // Update every 30 seconds
  }

  async updatePresence(
    status: "online" | "away" | "busy" | "offline",
    customStatus?: string,
  ) {
    try {
      const { error } = await this.supabase.from("user_presence").upsert({
        user_id: "current_user_id", // This would come from auth context
        status,
        custom_status: customStatus,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Broadcast presence update to all subscribed channels
      this.channels.forEach((channel) => {
        channel.track({
          user_id: "current_user_id",
          status,
          custom_status: customStatus,
          online_at: new Date().toISOString(),
        });
      });
    } catch (error) {
      console.error("Error updating presence:", error);
    }
  }

  private handlePresenceSync(presenceState: any) {
    const presenceUpdates: PresenceUpdate[] = [];

    Object.keys(presenceState).forEach((key) => {
      const presence = presenceState[key][0]; // Take first presence for each user
      presenceUpdates.push({
        user_id: presence.user_id,
        status: presence.status,
        last_seen: presence.online_at,
        custom_status: presence.custom_status,
      });
    });

    this.presenceHandlers.forEach((handler) => handler(presenceUpdates));
  }

  private handlePresenceJoin(key: string, newPresences: any[]) {
    newPresences.forEach((presence) => {
      this.userActivityHandlers.forEach((handler) =>
        handler({
          type: "join",
          user: {
            id: presence.user_id,
            username: presence.username || "",
            status: presence.status,
          } as EnhancedUser,
        }),
      );
    });
  }

  private handlePresenceLeave(key: string, leftPresences: any[]) {
    leftPresences.forEach((presence) => {
      this.userActivityHandlers.forEach((handler) =>
        handler({
          type: "leave",
          user: {
            id: presence.user_id,
            username: presence.username || "",
            status: "offline",
          } as EnhancedUser,
        }),
      );
    });
  }

  // Event handler registration
  onMessage(handler: (message: EnhancedMessage) => void) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onTyping(handler: (typing: TypingIndicator[]) => void) {
    this.typingHandlers.add(handler);
    return () => this.typingHandlers.delete(handler);
  }

  onPresence(handler: (presence: PresenceUpdate[]) => void) {
    this.presenceHandlers.add(handler);
    return () => this.presenceHandlers.delete(handler);
  }

  onUserActivity(
    handler: (event: { type: "join" | "leave"; user: EnhancedUser }) => void,
  ) {
    this.userActivityHandlers.add(handler);
    return () => this.userActivityHandlers.delete(handler);
  }

  // Cleanup
  destroy() {
    // Clear all timers
    this.typingTimers.forEach((timer) => clearTimeout(timer));
    this.typingTimers.clear();

    if (this.presenceHeartbeat) {
      clearInterval(this.presenceHeartbeat);
    }

    // Unsubscribe from all channels
    this.channels.forEach((channel) => {
      this.supabase.removeChannel(channel);
    });
    this.channels.clear();

    // Clear all handlers
    this.messageHandlers.clear();
    this.typingHandlers.clear();
    this.presenceHandlers.clear();
    this.userActivityHandlers.clear();
  }
}

// Singleton instance
export const realtimeManager = new RealtimeManager();

// React hooks for real-time features
import { useEffect, useState } from "react";

export const useRealtimeMessages = (
  channelId?: string,
  conversationId?: string,
) => {
  const [messages, setMessages] = useState<EnhancedMessage[]>([]);

  useEffect(() => {
    if (channelId) {
      realtimeManager.subscribeToChannel(channelId);
    } else if (conversationId) {
      realtimeManager.subscribeToConversation(conversationId);
    }

    const unsubscribe = realtimeManager.onMessage((message) => {
      if (
        (channelId && message.channel_id === channelId) ||
        (conversationId && message.conversation_id === conversationId)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      unsubscribe();
      if (channelId) {
        realtimeManager.unsubscribeFromChannel(channelId);
      } else if (conversationId) {
        realtimeManager.unsubscribeFromConversation(conversationId);
      }
    };
  }, [channelId, conversationId]);

  return messages;
};

export const useTypingIndicators = (
  channelId?: string,
  conversationId?: string,
) => {
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);

  useEffect(() => {
    const unsubscribe = realtimeManager.onTyping((typing) => {
      // Filter for current channel/conversation
      const relevant = typing.filter(
        (t) =>
          (channelId && t.channel_id === channelId) ||
          (conversationId && t.conversation_id === conversationId),
      );
      setTypingUsers(relevant);
    });

    return unsubscribe;
  }, [channelId, conversationId]);

  const startTyping = () => {
    realtimeManager.sendTypingIndicator(channelId, conversationId);
  };

  const stopTyping = () => {
    realtimeManager.stopTypingIndicator(channelId, conversationId);
  };

  return { typingUsers, startTyping, stopTyping };
};

export const usePresence = () => {
  const [presenceMap, setPresenceMap] = useState<Map<string, PresenceUpdate>>(
    new Map(),
  );

  useEffect(() => {
    const unsubscribe = realtimeManager.onPresence((presenceUpdates) => {
      setPresenceMap((prev) => {
        const newMap = new Map(prev);
        presenceUpdates.forEach((update) => {
          newMap.set(update.user_id, update);
        });
        return newMap;
      });
    });

    return unsubscribe;
  }, []);

  const updateStatus = (
    status: "online" | "away" | "busy" | "offline",
    customStatus?: string,
  ) => {
    realtimeManager.updatePresence(status, customStatus);
  };

  return { presenceMap, updateStatus };
};

export const useUserActivity = () => {
  const [activities, setActivities] = useState<
    Array<{ type: "join" | "leave"; user: EnhancedUser; timestamp: number }>
  >([]);

  useEffect(() => {
    const unsubscribe = realtimeManager.onUserActivity((event) => {
      setActivities((prev) => [
        ...prev.slice(-49), // Keep last 50 activities
        { ...event, timestamp: Date.now() },
      ]);
    });

    return unsubscribe;
  }, []);

  return activities;
};
