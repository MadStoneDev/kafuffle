// /hooks/use-realtime-sync.tsx
"use client";

import { useEffect, useRef, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

import {
  addMessageToCacheImproved,
  invalidateSpaceCache,
  updateUserPresence,
} from "@/utils/cache/redis-improved";

interface UseRealtimeSyncOptions {
  spaceId?: string;
  zoneId?: string;
  userId?: string;
  onNewMessage?: (message: any) => void;
  onPresenceUpdate?: (presence: any) => void;
  onTypingUpdate?: (typing: any) => void;
}

export function useRealtimeSync({
  spaceId,
  zoneId,
  userId,
  onNewMessage,
  onPresenceUpdate,
  onTypingUpdate,
}: UseRealtimeSyncOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  // Handle typing indicators
  const sendTypingIndicator = useCallback(() => {
    if (!channelRef.current || !zoneId || !userId) return;

    channelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: {
        userId,
        zoneId,
        timestamp: new Date().toISOString(),
      },
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to clear typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "stop-typing",
          payload: { userId, zoneId },
        });
      }
    }, 3000);
  }, [userId, zoneId]);

  useEffect(() => {
    if (!spaceId) return;

    // Create channel for space
    const channel = supabase.channel(`space:${spaceId}`, {
      config: {
        broadcast: {
          self: false, // Don't receive own broadcasts
        },
        presence: {
          key: userId || "anonymous",
        },
      },
    });

    channelRef.current = channel;

    // Subscribe to new messages
    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: zoneId ? `zone_id=eq.${zoneId}` : `space_id=eq.${spaceId}`,
        },
        async (payload) => {
          console.log("New message received:", payload);

          // Update cache
          if (payload.new && zoneId) {
            await addMessageToCacheImproved(zoneId, payload.new as any);
          }

          // Notify listener
          onNewMessage?.(payload.new);
        },
      )
      // Subscribe to message updates (edits)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: zoneId ? `zone_id=eq.${zoneId}` : `space_id=eq.${spaceId}`,
        },
        async (payload) => {
          console.log("Message updated:", payload);

          // Invalidate cache for this zone
          if (zoneId) {
            await invalidateSpaceCache(spaceId, userId);
          }

          onNewMessage?.(payload.new);
        },
      )
      // Subscribe to presence
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        console.log("Presence sync:", state);
        onPresenceUpdate?.(state);
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("User joined:", key, newPresences);
        onPresenceUpdate?.({ event: "join", key, newPresences });
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("User left:", key, leftPresences);
        onPresenceUpdate?.({ event: "leave", key, leftPresences });
      })
      // Subscribe to typing indicators
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        console.log("User typing:", payload);
        onTypingUpdate?.({ ...payload, isTyping: true });
      })
      .on("broadcast", { event: "stop-typing" }, ({ payload }) => {
        console.log("User stopped typing:", payload);
        onTypingUpdate?.({ ...payload, isTyping: false });
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          console.log(`Subscribed to space:${spaceId}`);

          // Track presence
          if (userId) {
            await channel.track({
              userId,
              spaceId,
              zoneId,
              online_at: new Date().toISOString(),
            });

            // Update presence in cache
            if (zoneId) {
              await updateUserPresence(userId, spaceId, zoneId);
            }
          }
        }
      });

    // Cleanup
    return () => {
      console.log(`Unsubscribing from space:${spaceId}`);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [spaceId, zoneId, userId, onNewMessage, onPresenceUpdate, onTypingUpdate]);

  return {
    sendTypingIndicator,
  };
}

// Example usage in MessagesContainer:
/*
const { sendTypingIndicator } = useRealtimeSync({
  spaceId,
  zoneId,
  userId: currentUser?.id,
  onNewMessage: (message) => {
    // Add to local state if not already present
    setMessages(prev => {
      const exists = prev.find(m => m.id === message.id);
      if (!exists) {
        return [...prev, message];
      }
      // Update existing message (for edits)
      return prev.map(m => m.id === message.id ? message : m);
    });
  },
  onPresenceUpdate: (presence) => {
    // Update online users list
    console.log("Presence update:", presence);
  },
  onTypingUpdate: (typing) => {
    // Show/hide typing indicators
    console.log("Typing update:", typing);
  },
});

// In the message input, call sendTypingIndicator when user types
*/
