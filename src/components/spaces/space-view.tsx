// /components/spaces/space-view.tsx
import { Space } from "@/types";
import { IconChevronLeft } from "@tabler/icons-react";

interface SpaceViewProps {
  spaceId: string;
  onSelectSpace: (space: string | null) => void;
  selectedZoneId: string;
  onSelectZone: (selectedZoneId: string) => void;
}

export default function SpaceView({
  spaceId,
  onSelectSpace,
  selectedZoneId,
  onSelectZone,
}: SpaceViewProps) {
  return (
    <div
      className={`flex-grow p-6 bg-neutral-50 dark:bg-neutral-800/80 rounded-4xl h-full`}
    >
      <div className={`mx-auto`}>
        <header
          className={`mb-4 flex items-center gap-2 text-neutral-900 dark:text-neutral-50`}
        >
          <button
            onClick={() => onSelectSpace(null)}
            className={`cursor-pointer p-1.5 aspect-square hover:bg-neutral-50 rounded-full hover:text-kafuffle-primary transition-all duration-500 ease-in-out`}
          >
            <IconChevronLeft />
          </button>

          <h1 className={`mb-1 text-xl font-bold `}>
            Zone: {spaceId}: {selectedZoneId}
          </h1>
        </header>
      </div>
    </div>
  );
}
