// hooks/use-messages.ts
import { useState, useEffect, useCallback } from "react";
import { DatabaseService } from "@/lib/database";
import type { Message } from "@/types";

export const useMessages = (channelId?: string, conversationId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    if (!channelId && !conversationId) return;

    try {
      setLoading(true);
      setError(null);

      const fetchedMessages = channelId
        ? await DatabaseService.getChannelMessages(channelId)
        : await DatabaseService.getConversationMessages(conversationId!);

      setMessages(fetchedMessages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [channelId, conversationId]);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const updateMessage = useCallback(
    (messageId: string, updates: Partial<Message>) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg,
        ),
      );
    },
    [],
  );

  const removeMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!channelId && !conversationId) return;

    const subscription = channelId
      ? DatabaseService.subscribeToChannelMessages(channelId, (payload) => {
          // Handle new message
          if (payload.eventType === "INSERT") {
            // Fetch complete message data
            DatabaseService.getChannelMessages(channelId, 1).then(
              ([newMessage]) => {
                if (newMessage) addMessage(newMessage);
              },
            );
          }
        })
      : DatabaseService.subscribeToConversationMessages(
          conversationId!,
          (payload) => {
            if (payload.eventType === "INSERT") {
              DatabaseService.getConversationMessages(conversationId!, 1).then(
                ([newMessage]) => {
                  if (newMessage) addMessage(newMessage);
                },
              );
            }
          },
        );

    return () => {
      subscription?.unsubscribe();
    };
  }, [channelId, conversationId, addMessage]);

  return {
    messages,
    loading,
    error,
    addMessage,
    updateMessage,
    removeMessage,
    reload: loadMessages,
  };
};
