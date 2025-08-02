"use client";

import {
  IconChevronLeft,
  IconSettings,
  IconUserFilled,
} from "@tabler/icons-react";

import { useState } from "react";
import ServerNavigation from "@/components/user/server-navigation";

import { spaces } from "@/lib/dummy-data/spaces";

interface SpacesSidebarProps {
  spaceId: string | undefined;
}

export default function SpacesSidebar({ spaceId }: SpacesSidebarProps) {
  // Constants
  const space = spaces.find((space) => space.id === spaceId);

  // States
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      className={`absolute lg:relative py-4 left-0 top-0 bottom-0 flex items-center transition-all duration-300 ease-in-out ${
        isExpanded ? "z-50" : "z-40"
      }`}
    >
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`lg:hidden ${
          isExpanded ? "" : "pointer-events-none opacity-0"
        } fixed top-0 right-0 bottom-0 left-0 bg-background/70 transition-all duration-300 ease-in-out z-40`}
      />
      <div
        className={`flex flex-col justify-between items-center gap-2 ${
          isExpanded ? "max-w-[3.75rem]" : "max-w-0"
        } lg:max-w-[3.75rem] h-full bg-background overflow-hidden z-50 transition-all duration-300 ease-in-out`}
      >
        <ServerNavigation spaceId={spaceId} />

        <section className={`flex flex-col items-center gap-4`}>
          <button>
            <IconUserFilled className={`text-ravenci-primary`} size={22} />
          </button>

          <button>
            <IconSettings className={`text-ravenci-primary`} size={24} />
          </button>
        </section>
      </div>

      <div
        className={`lg:hidden opacity-35 hover:opacity-100 z-50 transition-all duration-300 ease-in-out`}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`bg-foreground rounded-r-full`}
        >
          <IconChevronLeft
            className={`${
              isExpanded ? "" : "rotate-180"
            } text-kafuffle transition-all duration-300 ease-in-out`}
          />
        </button>
      </div>
    </aside>
  );
}
