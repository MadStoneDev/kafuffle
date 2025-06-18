// /components/spaces/spaces-list.tsx
"use client";

import { useEffect, useState } from "react";
import { IconCube } from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/client";
import { getUserSpacesWithCache } from "@/utils/cache/redis";
import { Space } from "@/types";
import SpaceItem from "@/components/spaces/space-item";

interface SpacesListProps {
  onSelectSpace: (space: string | null) => void;
}

// Raw database response interface
interface RawSpace {
  id: string;
  name: string | null;
  description: string | null;
  last_activity_at: string;
  member_count: number;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  created_by: string;
  archived_at: string | null;
  avatar_url: string | null;
  settings: any;
  space_members: Array<{ user_id: string }>;
  zones: Array<{
    id: string;
    name: string;
    last_message_at: string | null;
    message_count: number;
  }>;
}

export default function SpacesList({ onSelectSpace }: SpacesListProps) {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSpaces();
  }, []);

  const loadSpaces = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("User not authenticated");
        return;
      }

      // Try to get from cache first, fallback to database
      let rawSpaces: RawSpace[];
      try {
        rawSpaces = await getUserSpacesWithCache(user.id);
      } catch (cacheError) {
        console.warn(
          "Cache failed, falling back to direct DB query:",
          cacheError,
        );

        // Direct database query as fallback
        const { data, error: dbError } = await supabase
          .from("spaces")
          .select(
            `
            *,
            space_members!inner(user_id),
            zones(
              id,
              name,
              last_message_at,
              message_count
            )
          `,
          )
          .eq("space_members.user_id", user.id)
          .is("archived_at", null)
          .order("last_activity_at", { ascending: false, nullsFirst: false });

        if (dbError) throw dbError;
        rawSpaces = data || [];
      }

      // Transform raw spaces to proper Space type
      const transformedSpaces: Space[] = rawSpaces.map((space) => {
        // Get participant usernames (you might want to cache this)
        const participantIds = space.space_members.map(
          (member) => member.user_id,
        );

        // For now, we'll use user IDs as participants
        // Later you can fetch actual usernames/display names
        const participants = participantIds;

        // Calculate unread count (placeholder - implement based on your read receipts logic)
        const unreadCount = 0; // TODO: Calculate based on user's last read timestamps

        // Transform zones to match Zone interface (with minimal required fields)
        const transformedZones = space.zones.map((zone) => ({
          id: zone.id,
          name: zone.name,
          space_id: space.id, // Add the required space_id
          position: 0, // Placeholder - you might want to add position to your query
          last_message_at: zone.last_message_at,
          message_count: zone.message_count || 0,
          created_at: space.created_at, // Placeholder
          updated_at: space.updated_at, // Placeholder
          created_by: space.created_by, // Placeholder
        }));

        const transformedSpace: Space = {
          id: space.id,
          name: space.name,
          description: space.description,
          participants,
          last_activity_at: space.last_activity_at,
          lastActivity: space.last_activity_at, // Alias for compatibility
          created_at: space.created_at,
          updated_at: space.updated_at,
          is_public: space.is_public,
          member_count: space.member_count,
          created_by: space.created_by,
          archived_at: space.archived_at,
          avatar_url: space.avatar_url,
          settings: space.settings,
          unreadCount,
          zones: transformedZones,
        };

        return transformedSpace;
      });

      setSpaces(transformedSpaces);
    } catch (error: any) {
      console.error("Failed to load spaces:", error);
      setError("Failed to load spaces");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow p-6 bg-neutral-50 dark:bg-neutral-800/80 rounded-4xl h-full">
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center gap-2 text-neutral-500">
            <div className="w-4 h-4 border-2 border-neutral-300 border-t-kafuffle-primary rounded-full animate-spin"></div>
            Loading spaces...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow p-6 bg-neutral-50 dark:bg-neutral-800/80 rounded-4xl h-full">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-kafuffle-primary mb-4">{error}</p>
            <button
              onClick={loadSpaces}
              className="px-4 py-2 bg-kafuffle-primary text-white rounded-lg hover:opacity-80 transition-opacity"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow p-6 bg-neutral-50 dark:bg-neutral-800/80 rounded-4xl h-full">
      <div className="mx-auto">
        <header className="mb-4">
          <h1 className="mb-1 text-xl font-bold text-neutral-900 dark:text-neutral-50">
            Spaces
          </h1>
          <p className="text-sm text-neutral-400 dark:text-neutral-500">
            {spaces.length} active conversation{spaces.length !== 1 ? "s" : ""}
          </p>
        </header>

        <section className="space-y-2">
          {spaces.map((space) => (
            <SpaceItem
              key={space.id}
              space={space}
              onSelectSpace={onSelectSpace}
            />
          ))}
        </section>

        {/* Empty state for when no spaces */}
        {spaces.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconCube size={30} />
            </div>
            <h3 className="text-lg font-medium text-neutral-600">
              No spaces yet
            </h3>
            <p className="text-neutral-400 mb-4">
              Create your first space to start collaborating
            </p>
            <button
              className="px-4 py-2 bg-kafuffle-primary text-white rounded-lg hover:opacity-80 transition-opacity"
              onClick={() => {
                // TODO: Implement create space modal
                console.log("Create space clicked");
              }}
            >
              Create Space
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
