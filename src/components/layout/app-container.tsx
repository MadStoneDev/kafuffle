// /components/layout/app-container.tsx
"use client";

import { useEffect, useState, useCallback } from "react";

import { createClient } from "@/utils/supabase/client";
import { initializeUserData } from "@/app/actions/message-actions";
import { ensureUserProfile } from "@/app/actions/profile-actions";

import MainWindow from "@/components/layout/main-window";
import NavigateSidebar from "@/components/layout/navigate-sidebar";
import ContextSidebar from "@/components/layout/context-sidebar";

import { useAppState } from "@/utils/state/app-state";
import { useMultiAccount } from "@/utils/auth/multi-account";
import { usePersistedView } from "@/hooks/use-persisted-view";

import { useReactNativeSwipe } from "@/hooks/use-react-native-swipe";
import { useOutsideClick } from "@/hooks/use-outside-click";

export default function AppContainer() {
  // Use the custom state management hook
  const { selectedSpaceId, selectedZoneId, isLoaded, selectSpace, selectZone } =
    useAppState();

  const { storeCurrentUser } = useMultiAccount();

  // Use persisted view hook instead of local state
  const [currentView, setCurrentView] = usePersistedView();

  // Local UI state
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationComplete, setInitializationComplete] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [navigateSidebarOpen, setNavigateSidebarOpen] = useState(false);
  const [contextSidebarOpen, setContextSidebarOpen] = useState(false);

  // Close both sidebars
  const closeBothSidebars = useCallback(() => {
    setNavigateSidebarOpen(false);
    setContextSidebarOpen(false);
  }, []);

  // Swipe gesture handlers
  const handleOpenLeft = useCallback(() => {
    setNavigateSidebarOpen(true);
    setContextSidebarOpen(false); // Close right when opening left
  }, []);

  const handleOpenRight = useCallback(() => {
    // Only allow right sidebar when authenticated and on spaces view
    if (isAuthenticated && currentView === "spaces") {
      setContextSidebarOpen(true);
      setNavigateSidebarOpen(false); // Close left when opening right
    }
  }, [isAuthenticated, currentView]);

  const handleCloseLeft = useCallback(() => {
    setNavigateSidebarOpen(false);
  }, []);

  const handleCloseRight = useCallback(() => {
    setContextSidebarOpen(false);
  }, []);

  // Hook up React Native-like swipe gestures
  useReactNativeSwipe({
    onOpenLeft: handleOpenLeft,
    onOpenRight: handleOpenRight,
    onCloseLeft: handleCloseLeft,
    onCloseRight: handleCloseRight,
    leftSidebarOpen: navigateSidebarOpen,
    rightSidebarOpen: contextSidebarOpen,
    edgeSize: 30,
    minSwipeDistance: 100,
    maxSwipeTime: 400,
  });

  // Click outside to close - only when sidebars are open
  const outsideClickRef = useOutsideClick(
    closeBothSidebars,
    navigateSidebarOpen || contextSidebarOpen,
  );

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

      // Only reset view on actual SIGN_OUT event, not just missing session
      if (event === "SIGNED_OUT") {
        selectSpace(null);
        setCurrentView("spaces");
      }
    });

    return () => subscription.unsubscribe();
  }, [selectSpace, setCurrentView]); // Add setCurrentView to dependencies

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
    <main ref={outsideClickRef} className="p-3 flex gap-3 h-screen bg-black">
      {/* Navigate Sidebar with overlay */}
      <div
        className={`${navigateSidebarOpen ? "fixed inset-0 z-40 md:relative md:inset-auto md:z-auto" : ""}`}
      >
        {/* Mobile overlay */}
        {navigateSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 md:hidden"
            onClick={() => setNavigateSidebarOpen(false)}
          />
        )}
        <NavigateSidebar
          isOpen={navigateSidebarOpen}
          onOpen={setNavigateSidebarOpen}
          currentView={currentView}
          onViewChange={setCurrentView}
          isAuthenticated={isAuthenticated}
        />
      </div>

      {/* Main Content - MainWindow */}
      <MainWindow
        isAuthenticated={isAuthenticated}
        selectedSpaceId={selectedSpaceId}
        selectedZoneId={selectedZoneId}
        currentView={currentView}
        onViewChange={setCurrentView}
        onSelectSpace={selectSpace}
        onSelectZone={selectZone}
      />

      {/* Context Sidebar with overlay - only show when authenticated and viewing spaces */}
      {isAuthenticated && currentView === "spaces" && (
        <div
          className={`${contextSidebarOpen ? "fixed inset-0 z-40 md:relative md:inset-auto md:z-auto" : ""}`}
        >
          {/* Mobile overlay */}
          {contextSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 md:hidden"
              onClick={() => setContextSidebarOpen(false)}
            />
          )}
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
        </div>
      )}
    </main>
  );
}
