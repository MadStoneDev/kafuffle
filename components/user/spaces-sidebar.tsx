"use client";

import {
  IconChevronLeft,
  IconSettings,
  IconUserFilled,
} from "@tabler/icons-react";

import ServerNavigation from "@/components/user/server-navigation";
import { useState } from "react";

export default function SpacesSidebar() {
  // States
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <aside className={`relative py-4 transition-all duration-300 ease-in-out`}>
      <button
        className={`absolute right-0 ${
          isExpanded ? "" : "translate-x-full"
        } top-1/2 z-50 transition-all duration-300 ease-in-out`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <IconChevronLeft
          className={`${
            isExpanded ? "" : "rotate-180"
          } transition-all duration-300 ease-in-out`}
        />
      </button>

      <div
        className={`flex flex-col justify-between items-center gap-2 ${
          isExpanded ? "max-w-[3.75rem]" : "max-w-0"
        } h-full overflow-hidden transition-all duration-300 ease-in-out`}
      >
        <ServerNavigation />

        <section className={`flex flex-col items-center gap-4`}>
          <button>
            <IconUserFilled className={`text-ravenci-primary`} size={22} />
          </button>

          <button>
            <IconSettings className={`text-ravenci-primary`} size={24} />
          </button>
        </section>
      </div>
    </aside>
  );
}
