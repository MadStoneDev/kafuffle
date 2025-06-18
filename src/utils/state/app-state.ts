// /utils/state/app-state.ts
import { createClient } from "@/utils/supabase/client";

export interface AppState {
  selectedSpaceId: string | null;
  selectedZoneId: string | null;
  lastActiveSpaces: Record<string, string>; // spaceId -> zoneId mapping
}

const STATE_KEY = "kafuffle_app_state";

export async function getAppState(): Promise<AppState> {
  try {
    const stored = localStorage.getItem(STATE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn("Failed to parse stored app state:", error);
  }

  return {
    selectedSpaceId: null,
    selectedZoneId: null,
    lastActiveSpaces: {},
  };
}

export async function saveAppState(state: AppState): Promise<void> {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));

    // Also save to Supabase for cross-device sync
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from("profiles")
        .update({
          settings: {
            ...user.user_metadata?.settings,
            appState: state,
          },
        })
        .eq("id", user.id);
    }
  } catch (error) {
    console.warn("Failed to save app state:", error);
  }
}

export async function getDefaultZoneForSpace(
  spaceId: string,
): Promise<string | null> {
  const supabase = createClient();

  try {
    const { data: zones, error } = await supabase
      .from("zones")
      .select("id")
      .eq("space_id", spaceId)
      .eq("archived_at", null)
      .order("position", { ascending: true })
      .limit(1);

    if (error) throw error;

    return zones?.[0]?.id || null;
  } catch (error) {
    console.error("Failed to get default zone:", error);
    return null;
  }
}

// Hook for managing app state - Simplified
import { useState, useEffect, useCallback } from "react";

export function useAppState() {
  const [state, setState] = useState<AppState>({
    selectedSpaceId: null,
    selectedZoneId: null,
    lastActiveSpaces: {},
  });

  const [isLoaded, setIsLoaded] = useState(false);

  // Load state on mount
  useEffect(() => {
    async function loadState() {
      const loadedState = await getAppState();
      setState(loadedState);
      setIsLoaded(true);
    }
    loadState();
  }, []);

  // Save state whenever it changes (only after initial load)
  useEffect(() => {
    if (isLoaded) {
      saveAppState(state);
    }
  }, [state, isLoaded]);

  const selectSpace = useCallback(
    async (spaceId: string | null) => {
      if (!spaceId) {
        setState((prev) => ({
          ...prev,
          selectedSpaceId: null,
          selectedZoneId: null,
        }));
        return;
      }

      // Check if we have a last active zone for this space
      let zoneId = state.lastActiveSpaces[spaceId];

      // If not, get the default zone
      if (!zoneId) {
        zoneId = await getDefaultZoneForSpace(spaceId);
      }

      setState((prev) => ({
        ...prev,
        selectedSpaceId: spaceId,
        selectedZoneId: zoneId,
      }));
    },
    [state.lastActiveSpaces],
  );

  const selectZone = useCallback((zoneId: string | null) => {
    setState((prev) => {
      const newState = { ...prev, selectedZoneId: zoneId };

      // Update last active zone for current space
      if (prev.selectedSpaceId && zoneId) {
        newState.lastActiveSpaces = {
          ...prev.lastActiveSpaces,
          [prev.selectedSpaceId]: zoneId,
        };
      }

      return newState;
    });
  }, []);

  return {
    ...state,
    isLoaded,
    selectSpace,
    selectZone,
  };
}
