import { Space } from "@/types";
import { IconChevronRight } from "@tabler/icons-react";

import {
  formatParticipants,
  getAvatarInitials,
  getRelativeTime,
  getSpaceDisplayName,
} from "@/utils/general/space-utils";

interface SpaceItemProps {
  space: Space;
  onSelectSpace: (space: string) => void;
}

export default function SpaceItem({ space, onSelectSpace }: SpaceItemProps) {
  return (
    <article
      key={space.id}
      onClick={() => onSelectSpace(space.id)}
      className={`p-4 pr-1 relative group cursor-pointer flex items-center gap-3 hover:bg-white dark:hover:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:shadow-lg hover:border-kafuffle-primary/50 transition-all duration-200 ease-out hover:-translate-y-0.5`}
    >
      {space.unreadCount !== undefined && space.unreadCount > 0 && (
        <div
          className={`absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-kafuffle-primary rounded-full`}
        />
      )}

      {/* Avatar/Icon */}
      <div className={`relative`}>
        <div
          className={`w-10 h-10 bg-gradient-to-br from-kafuffle-primary to-kafuffle-primary/70 rounded-full flex items-center justify-center text-white font-semibold`}
        >
          {space.name
            ? getAvatarInitials(space.name)
            : getAvatarInitials(space.participants[0])}
        </div>
      </div>

      {/* Content */}
      <section className={`flex-grow flex flex-col justify-center min-w-0`}>
        <div className={`flex items-center`}>
          <div>
            <h3
              className={`font-semibold text-neutral-900 dark:text-white truncate`}
            >
              {getSpaceDisplayName(space)}
            </h3>
          </div>
        </div>

        {/* Participants (only show for named groups) */}
        {space.name && (
          <p className={`text-sm text-neutral-400 dark:text-neutral-500`}>
            {formatParticipants(space.participants)}
          </p>
        )}
      </section>

      <section className={`text-xs text-neutral-400/70 dark:text-neutral-600`}>
        <span>{getRelativeTime(space.lastActivity || "")}</span>
      </section>

      {/* Arrow indicator */}
      <div
        className={`text-neutral-300 dark:text-neutral-600 group-hover:text-kafuffle-primary transition-all duration-200`}
      >
        <IconChevronRight />
      </div>
    </article>
  );
}
