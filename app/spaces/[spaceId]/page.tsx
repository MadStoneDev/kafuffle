"use client";

import { use, useEffect, useRef, useState } from "react";
import {
  IconChevronDown,
  IconChevronLeft,
  IconCirclePlus,
  IconHash,
  IconMoodWink,
  IconSettings,
} from "@tabler/icons-react";

import Message from "@/components/messages/message";
import processMessages from "@/lib/messages/handle-messages";

import { users } from "@/lib/dummy-data/users";
import { messages } from "@/lib/dummy-data/messages";
import { spaces } from "@/lib/dummy-data/spaces";
import { zones } from "@/lib/dummy-data/zones";
import { categories } from "@/lib/dummy-data/categories";

export default function SpacesPage({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}) {
  // Hooks
  const { spaceId } = use(params);

  const space = spaces.find((space) => space.id === spaceId);
  const zonesInSpace = zones.filter((zone) => zone.space_id === spaceId);

  const groupedZones = categories
    .filter((category) => category.space_id === spaceId) // Only categories for this space
    .sort((a, b) => a.position - b.position) // Sort by position
    .map((category) => ({
      ...category,
      zones: zonesInSpace
        .filter((zone) => zone.category_id === category.id)
        .sort((a, b) => a.position - b.position), // Sort zones by position within category
    }));

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
                {space?.name}
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
        className={`absolute lg:relative right-0 lg:right-auto top-0 lg:top-auto bottom-0 lg:bottom-auto flex items-center ${
          sidebarExpanded ? "z-50" : "z-40"
        }`}
      >
        <div
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className={`lg:hidden ${
            sidebarExpanded ? "" : "pointer-events-none opacity-0"
          } fixed top-0 right-0 bottom-0 left-0 bg-background/70 z-40 transition-all duration-300 ease-in-out`}
        />

        <div
          className={`lg:hidden opacity-50 hover:opacity-100 z-50 transition-all duration-300 ease-in-out`}
        >
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className={`bg-foreground rounded-l-full`}
          >
            <IconChevronLeft
              className={`${
                sidebarExpanded ? "rotate-180" : ""
              } text-kafuffle transition-all duration-300 ease-in-out`}
            />
          </button>
        </div>
        <div
          className={`w-[275px] ${
            sidebarExpanded
              ? "max-w-[275px] border-foreground/20"
              : "max-w-0 border-transparent"
          } lg:max-w-[275px] h-full bg-background lg:rounded-3xl border lg:border-foreground/20 overflow-hidden transition-all duration-300 ease-in-out`}
        >
          {/* Server Header */}
          <div className={`w-full h-[175px] bg-foreground`}></div>

          {/* Zones List */}
          <div className={`p-3 flex flex-col gap-3 overflow-y-auto`}>
            {groupedZones.map((category) => (
              <div key={category.id} className={`pb-6 flex flex-col gap-2`}>
                <h3 className={`flex items-center gap-2 text-sm`}>
                  <span>{category.name}</span>
                  <button>
                    <IconChevronDown className={``} size={16} />
                  </button>
                </h3>

                {category.zones.map((zone) => (
                  <article
                    key={zone.id}
                    className={`p-1 pr-2 flex justify-between items-center gap-2 hover:bg-foreground/10 rounded-xl`}
                  >
                    <div className={`flex items-center gap-2`}>
                      <IconHash size={20} />
                      <span>{zone.name}</span>
                    </div>
                    <IconSettings size={20} />
                  </article>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
