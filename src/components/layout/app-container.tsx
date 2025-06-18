// /components/layout/app-container.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { initializeUserData } from "@/app/actions/message-actions";
import { ensureUserProfile } from "@/app/actions/profile-actions";

import MainWindow from "@/components/layout/main-window";
import NavigateSidebar from "@/components/layout/navigate-sidebar";
import ContextSidebar from "@/components/layout/context-sidebar";
import HomePage from "@/components/layout/landing-page";

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
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationComplete, setInitializationComplete] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        // Reset state when user logs out
        selectSpace(null);
        setCurrentView("spaces");
      }
    });

    return () => subscription.unsubscribe();
  }, [selectSpace]);

  // Initialize new user data
  useEffect(() => {
    const initializeNewUser = async () => {
      if (!isLoaded || !isAuthenticated || initializationComplete) return;

      try {
        setIsInitializing(true);

        // First, ensure user has a profile (creates with random username if needed)
        const profileResult = await ensureUserProfile();
        if (!profileResult.success) {
          console.error("Failed to ensure user profile:", profileResult.error);
          return;
        }

        // Check if user has any spaces
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: spaces } = await supabase
          .from("space_members")
          .select("space_id")
          .eq("user_id", user.id)
          .limit(1);

        // If no spaces, initialize with default data
        if (!spaces || spaces.length === 0) {
          console.log("New user detected, initializing default data...");
          const result = await initializeUserData();

          if (result.success) {
            console.log("User data initialized successfully");
            // Force a refresh of the spaces list
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else {
            console.error("Failed to initialize user data:", result.error);
          }
        }

        setInitializationComplete(true);
      } catch (error) {
        console.error("Initialization error:", error);
        setInitializationComplete(true);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeNewUser();
  }, [isLoaded, isAuthenticated, initializationComplete]);

  // Store current user when app loads
  useEffect(() => {
    if (isLoaded && isAuthenticated) {
      storeCurrentUser();
    }
  }, [isLoaded, isAuthenticated, storeCurrentUser]);

  // Show loading until auth and state are loaded
  if (authLoading || (isAuthenticated && (!isLoaded || isInitializing))) {
    return (
      <main className="p-3 flex gap-3 h-screen bg-black">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-white text-lg">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {isInitializing ? "Setting up your workspace..." : "Loading..."}
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
        isAuthenticated={isAuthenticated}
      />

      {/* Main Content - HomePage when not authenticated, MainWindow when authenticated */}
      {isAuthenticated ? (
        <MainWindow
          selectedSpaceId={selectedSpaceId}
          selectedZoneId={selectedZoneId}
          currentView={currentView}
          onViewChange={setCurrentView}
          onSelectSpace={selectSpace}
          onSelectZone={selectZone}
        />
      ) : (
        <HomePage />
      )}

      {/* Context (Discover/Focus) Sidebar - only show when authenticated and viewing spaces */}
      {isAuthenticated && currentView === "spaces" && (
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
