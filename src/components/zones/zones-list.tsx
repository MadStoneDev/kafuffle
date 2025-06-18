// /components/zones/zones-list.tsx
"use client";

import { useEffect, useState } from "react";
import { IconMessage, IconTable } from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/client";
import { getSpaceZonesWithCache } from "@/utils/cache/redis";

interface ZonesListProps {
  selectedSpaceId: string | null;
  selectedZoneId: string | null;
  onSelectZone: (selectedZoneId: string | null) => void;
}

interface Zone {
  id: string;
  name: string;
  description: string | null;
  zone_type: "chat" | "flow" | "calendar";
  last_message_at: string | null;
  message_count: number;
  position: number;
}

export default function ZonesList({
  selectedSpaceId,
  selectedZoneId,
  onSelectZone,
}: ZonesListProps) {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedSpaceId) {
      loadZones(selectedSpaceId);
    } else {
      setZones([]);
    }
  }, [selectedSpaceId]);

  const loadZones = async (spaceId: string) => {
    setLoading(true);
    try {
      // Try cache first, fallback to database
      let zonesData: Zone[];
      try {
        zonesData = await getSpaceZonesWithCache(spaceId);
      } catch (cacheError) {
        console.warn(
          "Cache failed, falling back to direct DB query:",
          cacheError,
        );

        // Direct database query as fallback
        const supabase = createClient();
        const { data, error } = await supabase
          .from("zones")
          .select("*")
          .eq("space_id", spaceId)
          .eq("archived_at", null)
          .order("position", { ascending: true });

        if (error) throw error;
        zonesData = data || [];
      }

      setZones(zonesData);

      // Auto-select first zone if none selected
      if (zonesData.length > 0 && !selectedZoneId) {
        onSelectZone(zonesData[0].id);
      }
    } catch (error) {
      console.error("Failed to load zones:", error);
    } finally {
      setLoading(false);
    }
  };

  const getZoneIcon = (zoneType: string) => {
    switch (zoneType) {
      case "flow":
        return <IconTable size={20} />;
      case "calendar":
        return <IconTable size={20} />; // TODO: Add calendar icon
      default:
        return <IconMessage size={20} />;
    }
  };

  const getZoneTypeLabel = (zoneType: string) => {
    switch (zoneType) {
      case "flow":
        return "Flow";
      case "calendar":
        return "Calendar";
      default:
        return "Chat";
    }
  };

  if (loading) {
    return (
      <section className="py-2 flex flex-col items-center justify-center w-full h-32">
        <div className="flex items-center gap-2 text-neutral-50/70">
          <div className="w-3 h-3 border-2 border-neutral-50/50 border-t-neutral-50 rounded-full animate-spin"></div>
          Loading zones...
        </div>
      </section>
    );
  }

  if (zones.length === 0) {
    return (
      <section className="py-4 flex flex-col items-center justify-center w-full text-center">
        <p className="text-neutral-50/70 text-sm mb-2">
          No zones in this space
        </p>
        <button
          className="text-xs px-3 py-1 bg-neutral-50/20 rounded-full hover:bg-neutral-50/30 transition-colors"
          onClick={() => {
            // TODO: Implement create zone functionality
            console.log("Create zone clicked");
          }}
        >
          Create Zone
        </button>
      </section>
    );
  }

  return (
    <section className="py-2 flex flex-col items-start gap-1 w-full">
      {zones.map((zone) => (
        <div
          key={zone.id}
          onClick={() => onSelectZone(zone.id)}
          className={`px-4 py-2 relative flex items-center gap-2 cursor-pointer hover:bg-neutral-900/20 w-full overflow-hidden transition-all duration-200 rounded-lg ${
            selectedZoneId === zone.id ? "bg-neutral-900/30" : ""
          }`}
        >
          {selectedZoneId === zone.id && (
            <div className="absolute left-0 -translate-x-1/2 w-2 h-2 rounded-full bg-neutral-50" />
          )}

          {getZoneIcon(zone.zone_type)}

          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{zone.name}</div>
            {zone.description && (
              <div className="text-xs text-neutral-50/70 truncate">
                {zone.description}
              </div>
            )}
          </div>

          <div className="text-xs text-neutral-50/50">
            {getZoneTypeLabel(zone.zone_type)}
          </div>

          {zone.message_count > 0 && (
            <div className="text-xs bg-neutral-900/30 px-1.5 py-0.5 rounded-full">
              {zone.message_count}
            </div>
          )}
        </div>
      ))}

      {/* Create new zone option */}
      <div className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-neutral-900/20 w-full transition-all duration-200 rounded-lg mt-2 border-t border-neutral-50/20">
        <IconMessage size={16} className="text-neutral-50/50" />
        <span className="text-sm text-neutral-50/70">Create Zone</span>
      </div>
    </section>
  );
}
