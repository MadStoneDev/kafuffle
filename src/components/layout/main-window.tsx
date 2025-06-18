// /components/layout/main-window.tsx
import { JSX } from "react";
import { View } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

import SpaceView from "@/components/spaces/space-view";
import SpacesList from "@/components/spaces/spaces-list";
import Notifications from "@/components/account/notifications";

interface MainWindowProps {
  selectedSpaceId: string | null;
  selectedZoneId: string | null;
  currentView: View;
  onViewChange: (view: View) => void;
  onSelectSpace: (spaceId: string | null) => void;
  onSelectZone: (zoneId: string) => void;
}

// Animation variants
const pageVariants = {
  initial: {
    opacity: 0,
    x: 300,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    x: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    x: -300,
    scale: 0.98,
  },
};

const pageTransition = {
  type: "tween" as const,
  ease: "anticipate" as const,
  duration: 0.4,
};

export default function MainWindow({
  selectedSpaceId = null,
  selectedZoneId,
  currentView = "spaces",
  onViewChange,
  onSelectSpace,
  onSelectZone,
}: MainWindowProps): JSX.Element {
  const renderCurrentView = () => {
    if (currentView === "notifications") {
      return (
        <motion.div
          key="notifications"
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          className={`h-full`}
        >
          <Notifications onViewChange={onViewChange} />
        </motion.div>
      );
    }

    if (!selectedSpaceId) {
      return (
        <motion.div
          key="spaces-list"
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          className={`h-full`}
        >
          <SpacesList onSelectSpace={onSelectSpace} />
        </motion.div>
      );
    } else {
      // Remove the local reassignment - let useEffect handle the default
      return (
        <motion.div
          key={`space-${selectedSpaceId}-${selectedZoneId || "default"}`}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          className={`h-full`}
        >
          <SpaceView
            spaceId={selectedSpaceId}
            onSelectSpace={onSelectSpace}
            selectedZoneId={selectedZoneId || "1"} // Provide fallback here
            onSelectZone={onSelectZone}
          />
        </motion.div>
      );
    }
  };

  return (
    <div className={`flex-grow`}>
      <AnimatePresence mode="wait">{renderCurrentView()}</AnimatePresence>
    </div>
  );
}
