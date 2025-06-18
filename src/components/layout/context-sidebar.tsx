import { JSX } from "react";
import {
  IconMessage,
  IconMessagePlus,
  IconSearch,
  IconTable,
  IconTablePlus,
  IconUsers,
} from "@tabler/icons-react";
import { View } from "@/types";
import FocusSidebar from "@/components/layout/focus-sidebar";
import DiscoverSidebar from "@/components/layout/discover-sidebar";

interface ContextSidebarProps {
  isOpen: boolean;
  onOpen: (open: boolean) => void;
  selectedSpaceId: string | null;
  selectedZoneId: string | null;
  onSelectSpace: (selectedSpaceId: string | null) => void;
  onSelectZone: (selectedZoneId: string | null) => void;
  currentView: View;
  onViewChange: (view: View) => void;
}

export default function ContextSidebar({
  isOpen = false,
  onOpen,
  selectedSpaceId,
  selectedZoneId,
  onSelectSpace,
  onSelectZone,
  currentView,
  onViewChange,
}: ContextSidebarProps): JSX.Element {
  return (
    <nav
      className={`absolute md:relative ${
        isOpen ? "right-0" : "-right-full md:right-0"
      } top-0 bottom-0 flex flex-col items-center bg-kafuffle-primary rounded-l-4xl shadow-2xl sm:shadow-none shadow-black min-w-52 text-neutral-50 transition-all duration-500 ease-in-out`}
    >
      {selectedSpaceId ? (
        <FocusSidebar
          selectedSpaceId={selectedSpaceId}
          selectedZoneId={selectedZoneId}
          onSelectZone={onSelectZone}
          onViewChange={onViewChange}
        />
      ) : (
        <DiscoverSidebar onViewChange={onViewChange} />
      )}
    </nav>
  );
}
