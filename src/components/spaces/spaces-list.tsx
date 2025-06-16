import {
  IconBorderAll,
  IconBox,
  IconChevronRight,
  IconCircle,
  IconGrid3x3,
  IconLayout,
  IconMessage,
  IconSphere,
} from "@tabler/icons-react";

interface SpacesListProps {
  onSelectSpace: (space: string) => void;
}

interface Space {
  id: string;
  name: string;
  participants: string[];
  lastMessage?: string;
  lastActivity?: string;
  unreadCount?: number;
}

export default function SpacesList({ onSelectSpace }: SpacesListProps) {
  const dummySpaces: Space[] = [
    {
      id: "123",
      name: "",
      participants: ["theDarkKnight"],
      lastMessage: "See you tomorrow!",
      lastActivity: "2m ago",
      unreadCount: 2,
    },
    {
      id: "321",
      name: "The A-Team",
      participants: ["yukiyo", "cheryl", "avenger44", "georgeRussell"],
      lastMessage: "Let's finalize the project timeline",
      lastActivity: "1h ago",
      unreadCount: 0,
    },
    {
      id: "456",
      name: "We Are The Pirates",
      participants: ["pirateKing"],
      lastMessage: "Ahoy! Ready for the adventure?",
      lastActivity: "3h ago",
      unreadCount: 1,
    },
    {
      id: "654",
      name: "",
      participants: ["broadwayGirl", "dracula", "drunkenMaster", "letsPrint"],
      lastMessage: "Movie night this Friday?",
      lastActivity: "1d ago",
      unreadCount: 0,
    },
  ];

  const formatParticipants = (participants: string[], maxShow: number = 3) => {
    if (participants.length <= maxShow) {
      return participants.join(", ");
    }
    const shown = participants.slice(0, maxShow);
    const remaining = participants.length - maxShow;
    return `${shown.join(", ")} +${remaining} more`;
  };

  const getSpaceDisplayName = (space: Space) => {
    if (space.name) return space.name;
    return formatParticipants(space.participants, 2);
  };

  const getAvatarInitials = (name: string) => {
    return name
      .split(/[\s_]+/)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={`flex-grow p-6 bg-neutral-50 dark:bg-neutral-800 rounded-4xl`}
    >
      <div className={`mx-auto`}>
        <header className={`mb-4`}>
          <h1
            className={`mb-1 text-xl font-bold text-neutral-900 dark:text-neutral-50`}
          >
            Spaces
          </h1>
          <p className="text-sm text-neutral-400 dark:text-neutral-500">
            {dummySpaces.length} active conversation
            {dummySpaces.length !== 1 ? "s" : ""}
          </p>
        </header>

        <section className="space-y-2">
          {dummySpaces.map((space) => (
            <article
              key={space.id}
              onClick={() => onSelectSpace(space.id)}
              className={`relative group cursor-pointer hover:bg-white dark:hover:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 hover:shadow-lg hover:border-kafuffle-primary/50 transition-all duration-200 ease-out hover:-translate-y-0.5`}
            >
              {space.unreadCount !== undefined && space.unreadCount > 0 && (
                <div
                  className={`absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-kafuffle-primary rounded-full`}
                />
              )}

              <div className="flex items-center gap-4">
                {/* Avatar/Icon */}
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-kafuffle-primary to-kafuffle-primary/70 rounded-full flex items-center justify-center text-white font-semibold">
                    {space.name
                      ? getAvatarInitials(space.name)
                      : getAvatarInitials(space.participants[0])}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-grow flex flex-col justify-center min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
                        {getSpaceDisplayName(space)}
                      </h3>
                    </div>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {space.lastActivity}
                    </span>
                  </div>

                  {/* Participants (only show for named groups) */}
                  {space.name && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                      {formatParticipants(space.participants)}
                    </p>
                  )}
                </div>

                {/* Arrow indicator */}
                <div
                  className={`text-neutral-400 group-hover:text-kafuffle-primary transition-all duration-200`}
                >
                  <IconChevronRight />
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* Empty state for when no spaces */}
        {dummySpaces.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconBox size={30} />
            </div>
            <h3 className="text-lg font-medium text-neutral-600">
              No spaces yet
            </h3>
            <p className="text-neutral-400">
              Start a conversation by creating your first space
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
