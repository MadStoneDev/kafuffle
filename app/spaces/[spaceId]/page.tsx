// /app/spaces/[spaceId]/page.tsx
"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zones } from "@/lib/dummy-data/zones";
import { getZone } from "@/lib/general/local-storage";

export default function SpacePage({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}) {
  const { spaceId } = use(params);
  const router = useRouter();

  useEffect(() => {
    // Get zones for this space
    const zonesInSpace = zones.filter((zone) => zone.space_id === spaceId);

    if (zonesInSpace.length === 0) {
      // No zones in this space - could show error or redirect to space creation
      console.warn(`No zones found for space: ${spaceId}`);
      return;
    }

    // Check if we have a saved zone preference
    const savedZoneId = getZone();
    const savedZoneInSpace = zonesInSpace.find(
      (zone) => zone.id === savedZoneId,
    );

    let targetZoneId: string;

    if (savedZoneInSpace) {
      // Use saved zone if it exists in this space
      targetZoneId = savedZoneId;
    } else {
      // Find default zone (lowest position across all zones in space)
      const minPosition = Math.min(
        ...zonesInSpace.map((zone) => zone.position),
      );
      const defaultZone = zonesInSpace.find(
        (zone) => zone.position === minPosition,
      );
      targetZoneId = defaultZone!.id;
    }

    // Redirect to the zone
    router.replace(`/spaces/${spaceId}/zones/${targetZoneId}`);
  }, [spaceId, router]);

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
        <h2 className="text-lg">Loading space...</h2>
        <p className="text-sm opacity-70">Selecting default zone</p>
      </div>
    </div>
  );
}
