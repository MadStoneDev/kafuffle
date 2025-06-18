// /components/messages/messages-container.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { getMessagesWithCache, addMessageToCache } from "@/utils/cache/redis";
import Message from "@/components/messages/message";
import MessageInput from "@/components/messages/message-input";

interface MessagesContainerProps {
  spaceId: string;
  zoneId: string;
}

interface MessageData {
  id: string;
  content: string;
  sender_id: string;
  sender_username: string;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null; // Added for privacy protection
  message_type: "text" | "image" | "file" | "system";
  profiles?: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  media_files?: Array<{
    id: string;
    filename: string;
    file_type: string;
    file_size: number;
    url: string;
  }>;
}

interface UserRole {
  user_id: string;
  role: "owner" | "admin" | "moderator" | "member";
}

export default function MessagesContainer({
  spaceId,
  zoneId,
}: MessagesContainerProps) {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserRole, setCurrentUserRole] = useState<
    "owner" | "admin" | "moderator" | "member"
  >("member");
  const [spaceMembers, setSpaceMembers] = useState<UserRole[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load initial messages and user permissions
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user and their role in this space
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);

        // Get user's role in this space
        const { data: memberData } = await supabase
          .from("space_members")
          .select("role")
          .eq("space_id", spaceId)
          .eq("user_id", user.id)
          .single();

        if (memberData) {
          setCurrentUserRole(memberData.role);
        }
      }

      // Get all space members and their roles for permission checking
      const { data: membersData } = await supabase
        .from("space_members")
        .select("user_id, role")
        .eq("space_id", spaceId);

      if (membersData) {
        setSpaceMembers(membersData);
      }

      // Try cache first, fallback to database
      let messagesData: MessageData[];
      try {
        messagesData = await getMessagesWithCache(zoneId);
      } catch (cacheError) {
        console.warn(
          "Cache failed, falling back to direct DB query:",
          cacheError,
        );

        // Direct database query as fallback - include deleted messages
        const { data, error: dbError } = await supabase
          .from("messages")
          .select(
            `
            *,
            profiles:sender_id(username, display_name, avatar_url),
            media_files(*)
          `,
          )
          .eq("zone_id", zoneId)
          // Don't filter out deleted messages - we need to show "message deleted"
          .order("created_at", { ascending: false })
          .limit(50);

        if (dbError) throw dbError;
        messagesData = (data || []).reverse();
      }

      setMessages(messagesData);
      setHasMoreMessages(messagesData.length === 50);

      // Scroll to bottom after loading
      setTimeout(scrollToBottom, 100);
    } catch (error: any) {
      console.error("Failed to load messages:", error);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [zoneId, spaceId, supabase]);

  // Load more messages (pagination)
  const loadMoreMessages = async () => {
    if (!hasMoreMessages || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const oldestMessage = messages[0];
      if (!oldestMessage) return;

      const { data, error } = await supabase
        .from("messages")
        .select(
          `
          *,
          profiles:sender_id(username, display_name, avatar_url),
          media_files(*)
        `,
        )
        .eq("zone_id", zoneId)
        .eq("deleted_at", null)
        .lt("created_at", oldestMessage.created_at)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      const newMessages = (data || []).reverse();
      setMessages((prev) => [...newMessages, ...prev]);
      setHasMoreMessages(newMessages.length === 20);
    } catch (error) {
      console.error("Failed to load more messages:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Send new message
  const sendMessage = async (content: string, files?: File[]) => {
    if (!currentUser) return;

    try {
      // Upload files first if any
      let mediaFileIds: string[] = [];

      if (files && files.length > 0) {
        for (const file of files) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

          // Upload to Supabase storage
          const { data: uploadData, error: uploadError } =
            await supabase.storage.from("media-files").upload(fileName, file);

          if (uploadError) throw uploadError;

          // Create media file record
          const { data: mediaFile, error: mediaError } = await supabase
            .from("media_files")
            .insert({
              filename: file.name,
              file_path: uploadData.path,
              file_type: file.type,
              file_size: file.size,
              uploaded_by: currentUser.id,
            })
            .select()
            .single();

          if (mediaError) throw mediaError;
          mediaFileIds.push(mediaFile.id);
        }
      }

      // Create message record
      const { data: messageData, error: messageError } = await supabase
        .from("messages")
        .insert({
          content: content || "",
          sender_id: currentUser.id,
          sender_username:
            currentUser.user_metadata?.username ||
            currentUser.email?.split("@")[0] ||
            "unknown",
          space_id: spaceId,
          zone_id: zoneId,
          message_type: files && files.length > 0 ? "file" : "text",
          media_file_ids: mediaFileIds.length > 0 ? mediaFileIds : null,
        })
        .select(
          `
          *,
          profiles:sender_id(username, display_name, avatar_url),
          media_files(*)
        `,
        )
        .single();

      if (messageError) throw messageError;

      // Add to cache
      try {
        await addMessageToCache(zoneId, messageData);
      } catch (cacheError) {
        console.warn("Failed to update cache:", cacheError);
      }

      // Update local state
      setMessages((prev) => [...prev, messageData]);

      // Scroll to bottom
      setTimeout(scrollToBottom, 100);
    } catch (error: any) {
      console.error("Failed to send message:", error);
      throw new Error("Failed to send message. Please try again.");
    }
  };

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`zone:${zoneId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `zone_id=eq.${zoneId}`,
        },
        async (payload) => {
          // Fetch the complete message with profile data
          const { data, error } = await supabase
            .from("messages")
            .select(
              `
              *,
              profiles:sender_id(username, display_name, avatar_url),
              media_files(*)
            `,
            )
            .eq("id", payload.new.id)
            .single();

          if (!error && data) {
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.find((m) => m.id === data.id)) return prev;
              return [...prev, data];
            });

            // Auto-scroll if user is near bottom
            if (messagesContainerRef.current) {
              const { scrollTop, scrollHeight, clientHeight } =
                messagesContainerRef.current;
              const isNearBottom =
                scrollTop + clientHeight >= scrollHeight - 100;
              if (isNearBottom) {
                setTimeout(scrollToBottom, 100);
              }
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [zoneId, supabase]);

  // Load messages when zone changes
  useEffect(() => {
    if (zoneId) {
      loadMessages();
    }
  }, [zoneId, loadMessages]);

  // Handle message editing
  const handleEditMessage = async (messageId: string, newContent: string) => {
    try {
      const { error } = await supabase
        .from("messages")
        .update({
          content: newContent,
          updated_at: new Date().toISOString(),
        })
        .eq("id", messageId);

      if (error) throw error;

      // Update local state
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                content: newContent,
                updated_at: new Date().toISOString(),
              }
            : msg,
        ),
      );
    } catch (error) {
      console.error("Failed to edit message:", error);
    }
  };

  // Handle message deletion with privacy protection
  const handleDeleteMessage = async (messageId: string) => {
    const messageToDelete = messages.find((m) => m.id === messageId);
    if (!messageToDelete || !currentUser) return;

    const messageAuthor = spaceMembers.find(
      (m) => m.user_id === messageToDelete.sender_id,
    );
    const messageAuthorRole = messageAuthor?.role || "member";

    // Check deletion permissions
    const canDelete = () => {
      // Always allow deleting own messages
      if (messageToDelete.sender_id === currentUser.id) return true;

      // Role hierarchy for deleting others' messages
      switch (currentUserRole) {
        case "owner":
          return true; // Owner can delete anyone's messages
        case "admin":
          return messageAuthorRole !== "owner"; // Admin can't delete owner's messages
        case "moderator":
          return !["owner", "admin"].includes(messageAuthorRole); // Mod can't delete admin/owner messages
        case "member":
          return false; // Members can only delete own (handled above)
        default:
          return false;
      }
    };

    if (!canDelete()) {
      alert("You don't have permission to delete this message.");
      return;
    }

    const isOwnMessage = messageToDelete.sender_id === currentUser.id;
    const confirmMessage = isOwnMessage
      ? "Are you sure you want to delete your message?"
      : "Are you sure you want to delete this message? This action cannot be undone.";

    if (!confirm(confirmMessage)) return;

    try {
      // Soft delete - add deleted_at timestamp for privacy protection
      const { error } = await supabase
        .from("messages")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", messageId);

      if (error) throw error;

      // Update local state to show "message deleted"
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, deleted_at: new Date().toISOString() }
            : msg,
        ),
      );
    } catch (error) {
      console.error("Failed to delete message:", error);
      alert("Failed to delete message. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2 text-neutral-500">
          <div className="w-4 h-4 border-2 border-neutral-300 border-t-kafuffle-primary rounded-full animate-spin"></div>
          Loading messages...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={loadMessages}
            className="px-4 py-2 bg-kafuffle-primary text-white rounded-lg hover:opacity-80 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Messages List */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto"
        style={{ minHeight: 0 }}
      >
        {/* Load More Button */}
        {hasMoreMessages && (
          <div className="text-center py-4">
            <button
              onClick={loadMoreMessages}
              disabled={isLoadingMore}
              className="px-4 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoadingMore ? "Loading..." : "Load older messages"}
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-0">
          {messages.map((message, index) => {
            const prevMessage = index > 0 ? messages[index - 1] : null;
            const nextMessage =
              index < messages.length - 1 ? messages[index + 1] : null;

            // Check if this message should be grouped with the previous one
            const shouldGroup = !!(
              prevMessage &&
              prevMessage.sender_id === message.sender_id &&
              prevMessage.message_type !== "system" &&
              message.message_type !== "system" &&
              !prevMessage.deleted_at && // Don't group with deleted messages
              !message.deleted_at && // Don't group deleted messages
              // Within 5 minutes of previous message
              new Date(message.created_at).getTime() -
                new Date(prevMessage.created_at).getTime() <
                5 * 60 * 1000
            );

            // Check if we should show timestamp (last in group or standalone)
            const showTimestamp =
              !nextMessage ||
              nextMessage.sender_id !== message.sender_id ||
              nextMessage.message_type === "system" ||
              message.message_type === "system" ||
              !!message.deleted_at || // Convert to boolean - Always show timestamp for deleted messages
              !!nextMessage.deleted_at || // Convert to boolean
              new Date(nextMessage.created_at).getTime() -
                new Date(message.created_at).getTime() >=
                5 * 60 * 1000;

            // Get message author's role for permission checking
            const messageAuthor = spaceMembers.find(
              (m) => m.user_id === message.sender_id,
            );
            const messageAuthorRole = messageAuthor?.role || "member";

            return (
              <Message
                key={message.id}
                message={message}
                currentUserId={currentUser?.id || ""}
                currentUserRole={currentUserRole}
                messageAuthorRole={messageAuthorRole}
                isGrouped={shouldGroup}
                showTimestamp={showTimestamp}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMessage}
              />
            );
          })}
        </div>

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <h3 className="text-lg font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                No messages yet
              </h3>
              <p className="text-neutral-500 dark:text-neutral-500">
                Start the conversation by sending the first message!
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={sendMessage}
        disabled={!currentUser}
        placeholder={
          currentUser ? "Type a message..." : "Please log in to send messages"
        }
      />
    </div>
  );
}
