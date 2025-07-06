// /components/layout/main-window.tsx (updated with debug support)
import { JSX } from "react";
import { View } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

import SpaceView from "@/components/spaces/space-view";
import SpacesList from "@/components/spaces/spaces-list";
import Notifications from "@/components/account/notifications";
import Profile from "@/components/account/profile";
import AboutPage from "@/components/layout/about-page";
import HelpPage from "@/components/layout/help-page";
import HomePage from "@/components/layout/landing-page";
import DebugConsole from "@/components/debug/debug-console";

interface MainWindowProps {
  isAuthenticated?: boolean;
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
  isAuthenticated = false,
  selectedSpaceId = null,
  selectedZoneId,
  currentView = "spaces",
  onViewChange,
  onSelectSpace,
  onSelectZone,
}: MainWindowProps): JSX.Element {
  // Debug console should only show on spaces view when authenticated
  const shouldShowDebug = isAuthenticated && currentView === "spaces";

  if (currentView === "about") {
    return <AboutPage onViewChange={onViewChange} />;
  }

  if (currentView === "help") {
    return <HelpPage onViewChange={onViewChange} />;
  }

  if (!isAuthenticated) {
    return <HomePage onViewChange={onViewChange} />;
  }

  const renderCurrentView = () => {
    // Handle account-related views
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

    if (currentView === "profile") {
      return (
        <motion.div
          key="profile"
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          className={`h-full`}
        >
          <Profile onViewChange={onViewChange} />
        </motion.div>
      );
    }

    // Handle space-related views
    if (!selectedSpaceId) {
      return (
        <motion.div
          key="spaces-list"
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          className={`h-full relative`}
        >
          <SpacesList onSelectSpace={onSelectSpace} />
          {/* Debug console for spaces list */}
          {shouldShowDebug && (
            <DebugConsole
              spaceId={selectedSpaceId}
              zoneId={selectedZoneId}
              context="spaces-list"
            />
          )}
        </motion.div>
      );
    } else {
      return (
        <motion.div
          key={`space-${selectedSpaceId}-${selectedZoneId || "default"}`}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          className={`h-full relative`}
        >
          <SpaceView
            spaceId={selectedSpaceId}
            onSelectSpace={onSelectSpace}
            selectedZoneId={selectedZoneId || ""}
            onSelectZone={onSelectZone}
          />
          {/* Debug console for space view */}
          {shouldShowDebug && (
            <DebugConsole
              spaceId={selectedSpaceId}
              zoneId={selectedZoneId}
              context="space-view"
            />
          )}
        </motion.div>
      );
    }
  };

  return (
    <div className={`flex-grow overflow-x-auto`}>
      <AnimatePresence mode="wait">{renderCurrentView()}</AnimatePresence>
    </div>
  );
}
