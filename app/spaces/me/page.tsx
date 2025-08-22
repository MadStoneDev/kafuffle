"use client";

import { useState } from "react";
import { IconChevronLeft } from "@tabler/icons-react";

export default function SpacesMePage() {
  // States
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  return (
    <div
      className={`relative py-4 pr-4 flex items-stretch gap-3 w-full h-screen`}
    >
      {/* Chat */}
      <section
        className={`flex-grow flex flex-col justify-end rounded-2xl border border-foreground/20 overflow-hidden`}
      ></section>

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
          } lg:max-w-[275px] h-full bg-background lg:rounded-2xl border lg:border-foreground/20 overflow-hidden transition-all duration-300 ease-in-out`}
        >
          {/* Zones List */}
          <div className={`p-3 flex flex-col gap-3 overflow-y-auto`}></div>
        </div>
      </section>
    </div>
  );
}
