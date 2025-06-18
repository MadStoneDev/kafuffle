// /components/layout/app-container.tsx
"use client";

import { useEffect, useState } from "react";

import MainWindow from "@/components/layout/main-window";
import NavigateSidebar from "@/components/layout/navigate-sidebar";
import ContextSidebar from "@/components/layout/context-sidebar";

import { View } from "@/types";
import { useAppState } from "@/utils/state/app-state";
import { useMultiAccount } from "@/utils/auth/multi-account";

export default function AppContainer() {
  // Use the custom state management hook
  const { selectedSpaceId, selectedZoneId, isLoaded, selectSpace, selectZone } =
    useAppState();

  const { storeCurrentUser } = useMultiAccount();

  // Local UI state
  const [navigateSidebarOpen, setNavigateSidebarOpen] = useState(false);
  const [contextSidebarOpen, setContextSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>("spaces");

  // Store current user when app loads
  useEffect(() => {
    if (isLoaded) {
      storeCurrentUser();
    }
  }, [isLoaded, storeCurrentUser]);

  // Show loading until state is loaded
  if (!isLoaded) {
    return (
      <main className="p-3 flex gap-3 h-screen bg-black">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-white text-lg">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Loading your spaces...
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`p-3 flex gap-3 h-screen bg-black`}>
      {/* Navigate Sidebar */}
      <NavigateSidebar
        isOpen={navigateSidebarOpen}
        onOpen={setNavigateSidebarOpen}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Main Window */}
      <MainWindow
        selectedSpaceId={selectedSpaceId}
        selectedZoneId={selectedZoneId}
        currentView={currentView}
        onViewChange={setCurrentView}
        onSelectSpace={selectSpace}
        onSelectZone={selectZone}
      />

      {/* Context (Discover/Focus) Sidebar */}
      {currentView === "spaces" && (
        <ContextSidebar
          isOpen={contextSidebarOpen}
          onOpen={setContextSidebarOpen}
          selectedSpaceId={selectedSpaceId}
          selectedZoneId={selectedZoneId}
          onSelectSpace={selectSpace}
          onSelectZone={selectZone}
          currentView={currentView}
          onViewChange={setCurrentView}
        />
      )}
    </main>
  );
}
