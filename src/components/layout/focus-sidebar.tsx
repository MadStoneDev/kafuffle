// /components/layout/focus-sidebar.tsx
import { useState } from "react";
import {
  IconMessagePlus,
  IconSearch,
  IconTablePlus,
  IconUsers,
} from "@tabler/icons-react";
import { View } from "@/types";
import ZonesList from "@/components/zones/zones-list";
import NewZoneModal from "@/components/modals/new-zone-modal";

interface FocusSidebarProps {
  selectedSpaceId: string | null;
  selectedZoneId: string | null;
  onSelectZone: (selectedZoneId: string | null) => void;
  onViewChange: (view: View) => void;
}

export default function FocusSidebar({
  selectedSpaceId,
  selectedZoneId,
  onSelectZone,
  onViewChange,
}: FocusSidebarProps) {
  const [showCreateZoneModal, setShowCreateZoneModal] = useState(false);

  return (
    <>
      <section className={`px-4 py-4 flex gap-4`}>
        <button
          onClick={() => {
            onViewChange("members");
          }}
          className={`cursor-pointer grid place-content-center w-10 h-10 hover:bg-kafuffle-primary rounded-full hover:text-neutral-50 transition-all duration-500 ease-in-out`}
        >
          <IconUsers />
        </button>

        <button
          onClick={() => {
            setShowCreateZoneModal(true);
          }}
          className={`cursor-pointer grid place-content-center w-10 h-10 hover:bg-kafuffle-primary rounded-full hover:text-neutral-50 transition-all duration-500 ease-in-out`}
        >
          <IconMessagePlus />
        </button>

        <button
          onClick={() => {
            // TODO: Create new flow modal and show
          }}
          className={`cursor-pointer grid place-content-center w-10 h-10 hover:bg-kafuffle-primary rounded-full hover:text-neutral-50 transition-all duration-500 ease-in-out`}
          title="Create new zone"
        >
          <IconTablePlus />
        </button>

        <button
          onClick={() => {
            onViewChange("members");
          }}
          className={`cursor-pointer grid place-content-center w-10 h-10 hover:bg-kafuffle-primary rounded-full hover:text-neutral-50 transition-all duration-500 ease-in-out`}
        >
          <IconSearch />
        </button>
      </section>

      <div className={`w-full h-px bg-neutral-50/30`} />

      <ZonesList
        selectedSpaceId={selectedSpaceId}
        selectedZoneId={selectedZoneId}
        onSelectZone={onSelectZone}
        onCreateZone={() => setShowCreateZoneModal(true)}
      />

      {/* TODO: Flow List should go here */}

      {/* Create Zone Modal */}
      {selectedSpaceId && (
        <NewZoneModal
          isOpen={showCreateZoneModal}
          onClose={() => setShowCreateZoneModal(false)}
          spaceId={selectedSpaceId}
          onZoneCreated={() => {
            // Zones list will automatically refresh via subscription
            setShowCreateZoneModal(false);
          }}
        />
      )}

      {/* TODO: Create Flow Modal should go here */}
    </>
  );
}
