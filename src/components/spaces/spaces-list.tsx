import { IconChevronRight, IconCube } from "@tabler/icons-react";
import { Space } from "@/types";
import SpaceItem from "@/components/spaces/space-item";

interface SpacesListProps {
  onSelectSpace: (space: string) => void;
}

export default function SpacesList({ onSelectSpace }: SpacesListProps) {
  const dummySpaces: Space[] = [
    {
      id: "123",
      name: "",
      participants: ["theDarkKnight"],
      lastMessage: "See you tomorrow!",
      lastActivity: "2025-06-17T12:10:40+1000",
      unreadCount: 2,
    },
    {
      id: "321",
      name: "The A-Team",
      participants: ["yukiyo", "cheryl", "avenger44", "georgeRussell"],
      lastMessage: "Let's finalize the project timeline",
      lastActivity: "2025-06-17T11:20:00+1000",
      unreadCount: 0,
    },
    {
      id: "456",
      name: "We Are The Pirates",
      participants: ["pirateKing"],
      lastMessage: "Ahoy! Ready for the adventure?",
      lastActivity: "2025-06-17T08:20:00+1000",
      unreadCount: 1,
    },
    {
      id: "654",
      name: "",
      participants: ["broadwayGirl", "dracula", "drunkenMaster", "letsPrint"],
      lastMessage: "Movie night this Friday?",
      lastActivity: "2025-06-16T10:20:00+1000",
      unreadCount: 0,
    },
  ];

  return (
    <div
      className={`flex-grow p-6 bg-neutral-50 dark:bg-neutral-800/80 rounded-4xl`}
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
            <SpaceItem space={space} onSelectSpace={onSelectSpace} />
          ))}
        </section>

        {/* Empty state for when no spaces */}
        {dummySpaces.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconCube size={30} />
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
