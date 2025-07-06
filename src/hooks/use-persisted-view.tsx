import { useState, useEffect } from "react";
import { View } from "@/types";

const STORAGE_KEY = "kafuffle_current_view";
const DEFAULT_VIEW: View = "spaces";

// Valid view values for validation
const VALID_VIEWS: View[] = [
  "spaces",
  "profile",
  "notifications",
  "settings",
  "help",
  "about",
  "members",
];

/**
 * Custom hook for managing the current view with localStorage persistence
 * @param initialView - Optional initial view (defaults to "spaces")
 * @returns [currentView, setCurrentView] tuple
 */
export function usePersistedView(initialView: View = DEFAULT_VIEW) {
  // Initialize with a function to avoid running localStorage on every render
  const [currentView, setCurrentViewState] = useState<View>(() => {
    // Only run this on the initial render
    if (typeof window === "undefined") {
      // SSR - return initial view
      return initialView;
    }

    try {
      const savedView = localStorage.getItem(STORAGE_KEY);

      if (savedView && VALID_VIEWS.includes(savedView as View)) {
        return savedView as View;
      } else {
        // Invalid or missing data, use default
        localStorage.setItem(STORAGE_KEY, DEFAULT_VIEW);
        return DEFAULT_VIEW;
      }
    } catch (error) {
      // localStorage might not be available (SSR, private browsing, etc.)
      console.warn("Failed to load view from localStorage:", error);
      return DEFAULT_VIEW;
    }
  });

  // Custom setter that also updates localStorage
  const setCurrentView = (view: View) => {
    console.log("Setting view to:", view); // Debug log
    try {
      setCurrentViewState(view);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, view);
      }
    } catch (error) {
      // localStorage might not be available
      console.warn("Failed to save view to localStorage:", error);
      setCurrentViewState(view);
    }
  };

  return [currentView, setCurrentView] as const;
}

// Alternative version with additional utilities
export function usePersistedViewWithUtils(initialView: View = DEFAULT_VIEW) {
  const [currentView, setCurrentView] = usePersistedView(initialView);

  // Utility function to reset to default view
  const resetView = () => {
    setCurrentView(DEFAULT_VIEW);
  };

  // Utility function to clear localStorage
  const clearPersistedView = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setCurrentView(DEFAULT_VIEW);
    } catch (error) {
      console.warn("Failed to clear view from localStorage:", error);
    }
  };

  // Check if a view is valid
  const isValidView = (view: string): view is View => {
    return VALID_VIEWS.includes(view as View);
  };

  return {
    currentView,
    setCurrentView,
    resetView,
    clearPersistedView,
    isValidView,
    validViews: VALID_VIEWS,
  } as const;
}
