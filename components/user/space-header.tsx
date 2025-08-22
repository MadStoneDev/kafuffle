// /components/user/space-header.tsx
"use client";

import Link from "next/link";
import {
  IconArrowLeft,
  IconSettings,
  IconDots,
  IconUsers,
  IconNotification,
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
      className={`px-3 sm:px-4 py-4 flex items-center justify-between transition-all duration-300 ease-in-out`}
    >
      <div className={`flex items-center`}>
        <Link
          href={`/spaces`}
          className={`p-2 hover:bg-foreground/10 rounded-lg transition-all duration-300 ease-in-out group`}
          title="Back to spaces"
        >
          <IconArrowLeft
            size={24}
            className={`text-foreground transition-all duration-300 ease-in-out`}
          />
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
      <div className={`flex items-center gap-2`}>
        {/* Members count (optional) */}
        <button
          className={`hidden md:flex items-center gap-2 px-3 py-2 hover:bg-foreground/10 rounded-lg transition-colors text-sm text-foreground/60 hover:text-foreground`}
          title="View members"
        >
          <IconUsers size={16} />
          <span>12</span>
        </button>

        {/* Notifications */}
        <button
          className={`p-2 hidden md:flex hover:bg-foreground/10 rounded-lg transition-colors text-foreground/60 hover:text-foreground`}
          title="Notifications"
        >
          <IconNotification size={18} />
        </button>

        {/* Settings */}
        <button
          className={`p-2 hidden md:flex hover:bg-foreground/10 rounded-lg transition-colors text-foreground/60 hover:text-foreground`}
          title="Space settings"
        >
          <IconSettings size={18} />
        </button>

        {/* More options */}
        <button
          className={`p-2 border hover:bg-foreground/10 rounded-lg transition-colors text-foreground/60 hover:text-foreground`}
          title="More options"
        >
          <IconDots size={18} />
        </button>
      </div>
    </header>
  );
}
