// /app/spaces/[spaceId]/zones/[zoneId]/page.tsx
"use client";

import { use, useEffect, useRef, useState } from "react";
import { IconCirclePlus, IconMoodWink } from "@tabler/icons-react";

import Message from "@/components/messages/message";
import processMessages from "@/lib/messages/handle-messages";

import { users } from "@/lib/dummy-data/users";
import { messages } from "@/lib/dummy-data/messages";
import { spaces } from "@/lib/dummy-data/spaces";
import { zones } from "@/lib/dummy-data/zones";
import { setSpace, setZone } from "@/lib/general/local-storage";
import MessageInput from "@/components/messages/message-input";

export default function ZonePage({
  params,
}: {
  params: Promise<{ spaceId: string; zoneId: string }>;
}) {
  // Hooks
  const { spaceId, zoneId } = use(params);
  const scrollRef = useRef<HTMLDivElement>(null);

  const space = spaces.find((space) => space.id === spaceId);
  const zone = zones.find((zone) => zone.id === zoneId);

  // Filter messages for this zone
  const zoneMessages = messages.filter((message) => message.zoneId === zoneId);

  // States
  const [allMessages, setAllMessages] = useState(processMessages(zoneMessages));

  // Functions
  const handleSendMessage = (content: string) => {
    // TODO: Implement actual message sending
    // For now, just add to local state
    const newMessage = {
      id: `temp-${Date.now()}`,
      authorId: "current-user-id", // You'll need to get this from auth context
      type: "text",
      content: content,
      timestamp: new Date().toISOString(),
      replyToId: null,
      spaceId: spaceId,
      zoneId: zoneId,
    };

    // Add to messages (you'll want to send this to your backend)
    setAllMessages((prev) => [...prev, newMessage]);
    console.log("Sending message:", newMessage);
  };

  useEffect(() => {
    // Update local storage when zone changes
    setSpace(spaceId);
    setZone(zoneId);
  }, [spaceId, zoneId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allMessages]);

  // Error states
  if (!space) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl">Space not found</h2>
          <p className="text-sm opacity-70">This space may not exist</p>
        </div>
      </div>
    );
  }

  if (!zone) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl">Zone not found</h2>
          <p className="text-sm opacity-70">
            This zone may not exist in this space
          </p>
        </div>
      </div>
    );
  }

  // Verify zone belongs to space
  if (zone.space_id !== spaceId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl">Invalid zone</h2>
          <p className="text-sm opacity-70">
            This zone doesn't belong to this space
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Messages Area */}
      <div ref={scrollRef} className="p-3 max-h-full space-y-5 overflow-y-auto">
        {/* Chat Header */}
        <div className="flex justify-center">
          <article className="max-w-sm space-y-2">
            <h2 className="text-2xl text-center">
              Welcome to
              <br />#{zone.name}
            </h2>
            <p className="font-light text-sm text-center">
              {zone.description ||
                "This is the beginning of your conversation."}
            </p>
          </article>
        </div>

        {/* Messages */}
        <div className="flex flex-col gap-3">
          {allMessages.length > 0 ? (
            allMessages.map((message) => (
              <Message
                key={message.id}
                message={message}
                userAvatar={
                  users.find((user) => user.id === message.authorId)?.avatar
                }
                username={
                  users.find((user) => user.id === message.authorId)?.username
                }
              />
            ))
          ) : (
            <div className="text-center py-8 opacity-70">
              <p>No messages in this zone yet.</p>
              <p className="text-sm">Be the first to start the conversation!</p>
            </div>
          )}
        </div>
      </div>

      {/* Message Input */}
      <MessageInput zoneName={zone.name} onSendMessage={handleSendMessage} />
    </>
  );
}
