// /components/zones/zones-list.tsx
"use client";

import { useEffect, useState } from "react";
import { IconMessage, IconTable, IconCalendar } from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/client";

interface ZonesListProps {
  selectedSpaceId: string | null;
  selectedZoneId: string | null;
  onSelectZone: (selectedZoneId: string | null) => void;
  onCreateZone: () => void;
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
  onCreateZone,
}: ZonesListProps) {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedSpaceId) {
      loadZones(selectedSpaceId);
    } else {
      setZones([]);
    }
  }, [selectedSpaceId]);

  const loadZones = async (spaceId: string) => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Direct database query without cache dependency
      const { data, error } = await supabase
        .from("zones")
        .select("*")
        .eq("space_id", spaceId)
        .is("archived_at", null) // Use is() for null check
        .order("position", { ascending: true });

      if (error) {
        console.error("Zone query error:", error);
        throw error;
      }

      // Transform data and add zone_type based on name or settings
      const zonesData: Zone[] = (data || []).map((zone) => {
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
          zone_type: zoneType,
          last_message_at: zone.last_message_at,
          message_count: zone.message_count || 0,
          position: zone.position || 0,
        };
      });

      console.log("Loaded zones for space:", spaceId, zonesData);
      setZones(zonesData);

      // Auto-select first zone if none selected
      if (zonesData.length > 0 && !selectedZoneId) {
        onSelectZone(zonesData[0].id);
      }
    } catch (error: any) {
      console.error("Failed to load zones:", error);
      setError(`Failed to load zones: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getZoneIcon = (zoneType: string) => {
    switch (zoneType) {
      case "flow":
        return <IconTable size={20} />;
      case "calendar":
        return <IconCalendar size={20} />;
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

  if (error) {
    return (
      <section className="py-4 flex flex-col items-center justify-center w-full text-center">
        <p className="text-red-400 text-sm mb-2">Error loading zones</p>
        <p className="text-neutral-50/70 text-xs mb-2">{error}</p>
        <button
          className="text-xs px-3 py-1 bg-neutral-50/20 rounded-full hover:bg-neutral-50/30 transition-colors"
          onClick={() => selectedSpaceId && loadZones(selectedSpaceId)}
        >
          Retry
        </button>
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
          onClick={onCreateZone}
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
    </section>
  );
}
