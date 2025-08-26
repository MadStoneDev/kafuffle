// /components/user/space-header.tsx
"use client";

import Link from "next/link";
import {
  IconArrowLeft,
  IconSettings,
  IconDots,
  IconUsers,
  IconBell,
  IconPin,
} from "@tabler/icons-react";
import { spaces } from "@/lib/dummy-data/spaces";
import ServerAvatar from "./server-avatar";

interface SpaceHeaderProps {
  spaceId: string;
}

export default function SpaceHeader({ spaceId }: SpaceHeaderProps) {
  const space = spaces.find((space) => space.id === spaceId);

  if (!space) {
    return null;
  }

  return (
    <header
      className={`px-[3.7rem] py-1 flex items-center justify-between transition-all duration-300 ease-in-out`}
    >
      <div className={`flex items-center gap-1`}>
        <Link
          href={`/spaces`}
          className={`p-1 hover:bg-foreground rounded-lg hover:text-background transition-all duration-300 ease-in-out group`}
          title="Back to spaces"
        >
          <IconArrowLeft size={24} />
        </Link>

        <div className={`flex items-center gap-3`}>
          <ServerAvatar
            imageSrc="https://res.cloudinary.com/duhygs5ck/image/upload/f_auto,q_auto/v1740646396/avatar2.jpg"
            alt={space.name}
            className={`scale-75`}
          />

          <div>
            <h1 className={`font-semibold text-lg`}>{space.name}</h1>
            {space.description && (
              <p className={`hidden md:block text-sm text-foreground/60`}>
                {space.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right: Action buttons */}
      <div className={`flex items-stretch gap-2`}>
        {/* Members count (optional) */}
        <button
          className={`p-1.5 hidden md:flex items-center gap-1 border border-foreground/30 hover:bg-foreground rounded-lg text-foreground hover:text-background transition-all duration-300 ease-in-out`}
          title="View members"
        >
          <IconUsers size={16} />
          <span>12</span>
        </button>

        {/* Pinned Posts */}
        <button
          className={`p-2 hidden md:flex items-center border border-foreground/30 hover:bg-foreground rounded-lg text-foreground hover:text-background transition-all duration-300 ease-in-out`}
          title="Space settings"
        >
          <IconPin size={18} />
        </button>

        {/* Notifications */}
        <button
          className={`p-2 hidden md:flex items-center border border-foreground/30 hover:bg-foreground rounded-lg text-foreground hover:text-background transition-all duration-300 ease-in-out`}
          title="Notifications"
        >
          <IconBell size={18} />
        </button>

        {/* Settings */}
        <button
          className={`p-2 hidden md:flex items-center border border-foreground/30 hover:bg-foreground rounded-lg text-foreground hover:text-background transition-all duration-300 ease-in-out`}
          title="Space settings"
        >
          <IconSettings size={18} />
        </button>

        {/* More options */}
        <button
          className={`p-2 flex items-center border border-foreground/30 hover:bg-foreground rounded-lg text-foreground hover:text-background transition-all duration-300 ease-in-out`}
          title="More options"
        >
          <IconDots size={18} />
        </button>
      </div>
    </header>
  );
}
