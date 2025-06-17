"use client";

import { useState } from "react";

import MainWindow from "@/components/layout/main-window";
import NavigateSidebar from "@/components/layout/navigate-sidebar";
import ContextSidebar from "@/components/layout/context-sidebar";

import { View } from "@/types";

export default function AppContainer() {
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const [navigateSidebarOpen, setNavigateSidebarOpen] = useState(false);
  const [contextSidebarOpen, setContextSidebarOpen] = useState(false);

  const [currentView, setCurrentView] = useState<View>("spaces");

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
        onSelectSpace={setSelectedSpaceId}
        onSelectZone={setSelectedZoneId}
      />

      {/* Context (Discover/Focus) Sidebar */}
      {currentView === "spaces" && (
        <ContextSidebar
          isOpen={contextSidebarOpen}
          onOpen={setContextSidebarOpen}
          selectedSpaceId={selectedSpaceId}
          selectedZoneId={selectedZoneId}
          onSelectSpace={setSelectedSpaceId}
          onSelectZone={setSelectedZoneId}
          currentView={currentView}
          onViewChange={setCurrentView}
        />
      )}
    </main>
  );
}
