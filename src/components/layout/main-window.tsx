import { JSX } from "react";
import { View } from "@/types";

import SpaceView from "@/components/spaces/space-view";
import SpacesList from "@/components/spaces/spaces-list";
import Notifications from "@/components/account/notifications";

interface MainWindowProps {
  selectedSpaceId: string | null;
  selectedZoneId: string | null;
  currentView: View;
  onViewChange: (view: View) => void;
  onSelectSpace: (spaceId: string) => void; // Pass the space ID
  onSelectZone: (zoneId: string) => void; // Pass the zone ID
}

export default function MainWindow({
  selectedSpaceId = null,
  selectedZoneId = null,
  currentView = "spaces",
  onViewChange,
  onSelectSpace,
  onSelectZone,
}: MainWindowProps): JSX.Element {
  // Route based on currentView
  // if (currentView === 'profile') return <Profile />
  // if (currentView === 'settings') return <Settings />
  if (currentView === "notifications")
    return <Notifications onViewChange={onViewChange} />;

  // Chat View
  if (!selectedSpaceId) {
    return <SpacesList onSelectSpace={onSelectSpace} />;
  } else {
    selectedZoneId = selectedZoneId ? selectedZoneId : "1";

    return (
      <SpaceView
        spaceId={selectedSpaceId}
        selectedZoneId={selectedZoneId}
        onSelectZone={onSelectZone}
      />
    );
  }
}
