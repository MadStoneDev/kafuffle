"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconChevronLeft,
  IconCirclePlus,
  IconMoodWink,
} from "@tabler/icons-react";

import { users } from "@/lib/dummy-data/users";
import { messages } from "@/lib/dummy-data/messages";
import Message from "@/components/messages/message";
import processMessages from "@/lib/messages/handle-messages";

export default function SpacesPage() {
  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);

  // States
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [allMessages, setAllMessages] = useState<any[]>(
    processMessages(messages),
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  return (
    <div
      className={`relative py-4 pr-4 flex items-stretch gap-3 w-full h-screen`}
    >
      {/* Chat */}
      <section
        className={`flex-grow flex flex-col justify-end rounded-3xl border border-foreground/20 overflow-hidden`}
      >
        <div
          ref={scrollRef}
          className={`p-3 max-h-full space-y-5 overflow-y-auto`}
        >
          {/* Chat Header */}
          <div className={`flex justify-center`}>
            <article className={`max-w-sm space-y-2`}>
              <h2 className={`text-2xl text-center`}>
                Welcome to
                <br />
                Name of Server
              </h2>
              <p className={`font-light text-sm text-center`}>
                This is the beginning of your very own server.
              </p>
            </article>
          </div>

          {/* Chat Messages */}
          <div className={`flex flex-col gap-3`}>
            {allMessages.map((message) => (
              <Message
                key={message.id}
                userAvatar={
                  users.find((user) => user.id === message.authorId)?.avatar
                }
                username={
                  users.find((user) => user.id === message.authorId)?.username
                }
                messageType={message.type}
                messageContent={message.content}
                messageTimestamp={message.timestamp}
              />
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className={`p-2 `}>
          <div
            className={`px-2 flex items-center gap-2 w-full rounded-2xl border border-foreground/20 dark:border-neutral-700 bg-foreground/5 text-sm font-light overflow-hidden`}
          >
            <button
              className={`opacity-50 hover:opacity-100 transition-all duration-300 ease-in-out`}
            >
              <IconCirclePlus />
            </button>

            <input
              type="text"
              placeholder="Type a message in #zone-name..."
              className={`flex-1 py-3 bg-transparent`}
            />

            {/* Chat Actions */}
            <section className={`pl-1 flex gap-2 items-center`}>
              <button
                className={`opacity-50 hover:opacity-100 transition-all duration-300 ease-in-out`}
              >
                <IconMoodWink />
              </button>
            </section>
          </div>
        </div>
      </section>

      {/* Zones */}
      <section
        className={`absolute lg:relative right-0 lg:right-auto top-0 lg:top-auto bottom-0 lg:bottom-auto flex items-center ${sidebarExpanded ? "z-50" : "z-40"}`}
      >
        <div
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className={`lg:hidden ${sidebarExpanded ? "" : "pointer-events-none opacity-0"} fixed top-0 right-0 bottom-0 left-0 bg-background/70 z-40 transition-all duration-300 ease-in-out`}
        />

        <div
          className={`lg:hidden opacity-50 hover:opacity-100 z-50 transition-all duration-300 ease-in-out`}
        >
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className={`bg-foreground rounded-l-full`}
          >
            <IconChevronLeft
              className={`${sidebarExpanded ? "rotate-180" : ""} text-kafuffle transition-all duration-300 ease-in-out`}
            />
          </button>
        </div>
        <div
          className={`w-[250px] ${sidebarExpanded ? "max-w-[250px] border-foreground/20" : "max-w-0 border-transparent"} lg:max-w-[250px] h-full bg-background lg:rounded-3xl border lg:border-foreground/20 transition-all duration-300 ease-in-out`}
        ></div>
      </section>
    </div>
  );
}
