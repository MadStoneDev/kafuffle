// /components/zones/zone-view.tsx
"use client";

import { useState, useEffect } from "react";
import {
  IconSettings,
  IconPin,
  IconPhoto,
  IconUsers,
} from "@tabler/icons-react";
import { Zone } from "@/types";
import { createClient } from "@/utils/supabase/client";

interface ZoneViewProps {
  zoneId: string;
  spaceId: string;
}

export default function ZoneView({ zoneId, spaceId }: ZoneViewProps) {
  const [zone, setZone] = useState<Zone | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadZone();
  }, [zoneId]);

  const loadZone = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("zones")
        .select("*")
        .eq("id", zoneId)
        .single();

      if (error) throw error;

      setZone({
        id: data.id,
        name: data.name,
        description: data.description,
        space_id: data.space_id,
        zone_type: data.zone_type || "chat",
        position: data.position,
        last_message_at: data.last_message_at,
        message_count: data.message_count || 0,
        created_at: data.created_at,
        updated_at: data.updated_at,
        archived_at: data.archived_at,
        created_by: data.created_by,
        settings: data.settings,
      });
    } catch (error) {
      console.error("Failed to load zone:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!zone) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Zone not found</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            Zone Settings
          </h2>
          <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg">
            <IconSettings size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
              {zone.name}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              {zone.description || "No description"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg">
              <div className="text-2xl font-bold text-kafuffle-primary">
                {zone.message_count}
              </div>
              <div className="text-sm text-neutral-500">Messages</div>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg">
              <div className="text-2xl font-bold text-kafuffle-primary">
                {zone.zone_type}
              </div>
              <div className="text-sm text-neutral-500">Zone Type</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
