// /components/spaces/space-view.tsx
"use client";

import { useEffect, useState } from "react";
import {
  IconChevronLeft,
  IconUsers,
  IconSettings,
  IconHash,
  IconTable,
  IconCalendar,
} from "@tabler/icons-react";

import { Space, Zone } from "@/types";
import { createClient } from "@/utils/supabase/client";

import FlowView from "@/components/flows/flow-view";
import SpaceCalendar from "@/components/spaces/space-calendar";
import MessagesContainer from "@/components/messages/messages-container";

interface SpaceViewProps {
  spaceId: string;
  onSelectSpace: (space: string | null) => void;
  selectedZoneId: string;
  onSelectZone: (selectedZoneId: string) => void;
}

export default function SpaceView({
  spaceId,
  onSelectSpace,
  selectedZoneId,
  onSelectZone,
}: SpaceViewProps) {
  const [space, setSpace] = useState<Space | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (spaceId) {
      loadSpaceData();
    }
  }, [spaceId]);

  const loadSpaceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();

      // Load space details - FIXED: Removed zone_type from query
      const { data: spaceData, error: spaceError } = await supabase
        .from("spaces")
        .select(
          `
          *,
          space_members(user_id),
          zones(
            id,
            name,
            description,
            position,
            last_message_at,
            message_count,
            created_at,
            updated_at,
            archived_at,
            created_by,
            settings
          )
        `,
        )
        .eq("id", spaceId)
        .single();

      if (spaceError) {
        console.error("Space query error:", spaceError);
        throw spaceError;
      }

      // Transform to Space type
      const transformedSpace: Space = {
        id: spaceData.id,
        name: spaceData.name,
        description: spaceData.description,
        participants: spaceData.space_members.map((m: any) => m.user_id),
        last_activity_at: spaceData.last_activity_at,
        lastActivity: spaceData.last_activity_at,
        created_at: spaceData.created_at,
        updated_at: spaceData.updated_at,
        is_public: spaceData.is_public,
        member_count: spaceData.member_count,
        created_by: spaceData.created_by,
        archived_at: spaceData.archived_at,
        avatar_url: spaceData.avatar_url,
        settings: spaceData.settings,
      };

      // Transform zones - FIXED: Use name-based zone_type detection
      const transformedZones: Zone[] = (spaceData.zones || [])
        .filter((zone: any) => !zone.archived_at) // Filter out archived zones
        .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
        .map((zone: any) => {
          // Determine zone type based on name or settings
          let zoneType: "chat" | "flow" | "calendar" = "chat";
          if (
            zone.name.toLowerCase().includes("task") ||
            zone.name.toLowerCase().includes("flow")
          ) {
            zoneType = "flow";
          } else if (
            zone.name.toLowerCase().includes("calendar") ||
            zone.name.toLowerCase().includes("event")
          ) {
            zoneType = "calendar";
          }

          return {
            id: zone.id,
            name: zone.name,
            description: zone.description,
            space_id: spaceId,
            zone_type: zoneType,
            position: zone.position || 0,
            last_message_at: zone.last_message_at,
            message_count: zone.message_count || 0,
            created_at: zone.created_at,
            updated_at: zone.updated_at,
            archived_at: zone.archived_at,
            created_by: zone.created_by,
            settings: zone.settings,
          };
        });

      console.log("Loaded space:", transformedSpace);
      console.log("Loaded zones:", transformedZones);

      setSpace(transformedSpace);
      setZones(transformedZones);

      // Auto-select first zone if none selected or selected zone doesn't exist
      if (transformedZones.length > 0) {
        const selectedZoneExists = transformedZones.find(
          (z) => z.id === selectedZoneId,
        );
        if (!selectedZoneExists) {
          onSelectZone(transformedZones[0].id);
        }
      }
    } catch (error: any) {
      console.error("Failed to load space data:", error);
      setError(`Failed to load space: ${error.message}`);
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
            Loading space...
          </div>
        </div>
      </div>
    );
  }

  if (error || !space) {
    return (
      <div className="flex-grow p-6 bg-neutral-50 dark:bg-neutral-800/80 rounded-4xl h-full">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-kafuffle-primary mb-4">
              {error || "Space not found"}
            </p>
            <button
              onClick={() => onSelectSpace(null)}
              className="px-4 py-2 bg-kafuffle-primary text-white rounded-lg hover:opacity-80 transition-opacity"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Find the current zone
  const currentZone = zones.find((z) => z.id === selectedZoneId);

  const getZoneIcon = (zoneType: string | undefined) => {
    switch (zoneType) {
      case "flow":
        return <IconTable size={20} />;
      case "calendar":
        return <IconCalendar size={20} />;
      default:
        return <IconHash size={20} />;
    }
  };

  // Render zone content based on type
  const renderZoneContent = () => {
    if (!currentZone) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium text-neutral-600 dark:text-neutral-400 mb-2">
              No zone selected
            </h3>
            <p className="text-neutral-500 dark:text-neutral-500">
              Select a zone from the sidebar to start
            </p>
          </div>
        </div>
      );
    }

    switch (currentZone.zone_type) {
      case "flow":
        return <FlowView spaceId={spaceId} zoneId={selectedZoneId} />;
      case "calendar":
        return <SpaceCalendar spaceId={spaceId} zoneId={selectedZoneId} />;
      default:
        return <MessagesContainer spaceId={spaceId} zoneId={selectedZoneId} />;
    }
  };

  return (
    <div className="flex-grow bg-neutral-50 dark:bg-neutral-800/80 rounded-4xl h-full flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectSpace(null)}
            className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <IconChevronLeft size={20} />
          </button>

          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
              {space.name || "Unnamed Space"}
            </h1>
            {space.description && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {space.description}
              </p>
            )}
          </div>
        </div>

        {/* Zone indicator and actions */}
        <div className="flex items-center gap-3">
          {currentZone && (
            <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700">
              {getZoneIcon(currentZone.zone_type)}
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {currentZone.name}
              </span>
            </div>
          )}

          <button className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors">
            <IconUsers size={20} />
          </button>

          <button className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors">
            <IconSettings size={20} />
          </button>
        </div>
      </header>

      {/* Zone Content */}
      <div className="flex-1 flex flex-col min-h-0">{renderZoneContent()}</div>
    </div>
  );
}
