// /components/zones/zone-pinned-messages.tsx
"use client";

import { useState, useEffect } from "react";
import { IconPin, IconX } from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/client";

interface PinnedMessage {
  id: string;
  message_id: string;
  pinned_at: string;
  pinned_by: string;
  message: {
    id: string;
    content: string;
    sender_username: string;
    created_at: string;
    profiles: {
      username: string;
      display_name: string | null;
    };
  };
}

interface ZonePinnedMessagesProps {
  zoneId: string;
}

export default function ZonePinnedMessages({
  zoneId,
}: ZonePinnedMessagesProps) {
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPinnedMessages();
  }, [zoneId]);

  const loadPinnedMessages = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("pinned_messages")
        .select(
          `
          *,
          message:messages(
            id,
            content,
            sender_username,
            created_at,
            profiles:sender_id(username, display_name)
          )
        `,
        )
        .eq("zone_id", zoneId)
        .order("pinned_at", { ascending: false });

      if (error) throw error;
      setPinnedMessages(data || []);
    } catch (error) {
      console.error("Failed to load pinned messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const unpinMessage = async (pinnedMessageId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("pinned_messages")
        .delete()
        .eq("id", pinnedMessageId);

      if (error) throw error;

      setPinnedMessages((prev) =>
        prev.filter((pm) => pm.id !== pinnedMessageId),
      );
    } catch (error) {
      console.error("Failed to unpin message:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <IconPin size={20} className="text-kafuffle-primary" />
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
          Pinned Messages
        </h2>
      </div>

      {pinnedMessages.length === 0 ? (
        <div className="text-center py-12">
          <IconPin size={48} className="text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-600 dark:text-neutral-400">
            No pinned messages
          </h3>
          <p className="text-neutral-500">
            Pin important messages to keep them easily accessible
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pinnedMessages.map((pinnedMessage) => (
            <div
              key={pinnedMessage.id}
              className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {pinnedMessage.message.profiles?.display_name ||
                        pinnedMessage.message.profiles?.username ||
                        pinnedMessage.message.sender_username}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {new Date(
                        pinnedMessage.message.created_at,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    {pinnedMessage.message.content}
                  </p>
                  <div className="mt-2 text-xs text-neutral-500">
                    Pinned{" "}
                    {new Date(pinnedMessage.pinned_at).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => unpinMessage(pinnedMessage.id)}
                  className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
                  title="Unpin message"
                >
                  <IconX size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
