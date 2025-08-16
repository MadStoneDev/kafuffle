// /components/user/zones-sidebar.tsx
"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  IconChevronDown,
  IconChevronLeft,
  IconHash,
  IconSettings,
} from "@tabler/icons-react";

import { spaces } from "@/lib/dummy-data/spaces";
import { zones } from "@/lib/dummy-data/zones";
import { categories } from "@/lib/dummy-data/categories";
import { setSpace, setZone } from "@/lib/general/local-storage";

interface ZonesSidebarProps {
  spaceId: string;
}

export default function ZonesSidebar({ spaceId }: ZonesSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Extract current zoneId from pathname if it exists
  const currentZoneId = pathname.includes("/zones/")
    ? pathname.split("/zones/")[1]
    : null;

  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const space = spaces.find((space) => space.id === spaceId);
  const zonesInSpace = zones.filter((zone) => zone.space_id === spaceId);

  const groupedZones = categories
    .filter((category) => category.space_id === spaceId)
    .sort((a, b) => a.position - b.position)
    .map((category) => ({
      ...category,
      zones: zonesInSpace
        .filter((zone) => zone.category_id === category.id)
        .sort((a, b) => a.position - b.position),
    }));

  const handleZoneSelect = (zoneId: string) => {
    // Update local storage
    setSpace(spaceId);
    setZone(zoneId);

    // Navigate to the zone
    router.push(`/spaces/${spaceId}/zones/${zoneId}`);
  };

  return (
    <section
      className={`absolute lg:relative right-0 lg:right-auto top-0 lg:top-auto bottom-0 lg:bottom-auto flex items-center ${
        sidebarExpanded ? "z-50" : "z-40"
      }`}
    >
      {/* Overlay for mobile */}
      <div
        onClick={() => setSidebarExpanded(!sidebarExpanded)}
        className={`lg:hidden ${
          sidebarExpanded ? "" : "pointer-events-none opacity-0"
        } fixed top-0 right-0 bottom-0 left-0 bg-background/70 z-40 transition-all duration-300 ease-in-out`}
      />

      {/* Mobile toggle button */}
      <div className="lg:hidden opacity-50 hover:opacity-100 z-50 transition-all duration-300 ease-in-out">
        <button
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className="bg-foreground rounded-l-full"
        >
          <IconChevronLeft
            className={`${
              sidebarExpanded ? "rotate-180" : ""
            } text-kafuffle transition-all duration-300 ease-in-out`}
          />
        </button>
      </div>

      {/* Sidebar content */}
      <div
        className={`w-[275px] ${
          sidebarExpanded
            ? "max-w-[275px] border-foreground/20"
            : "max-w-0 border-transparent"
        } lg:max-w-[275px] h-full bg-background lg:rounded-3xl border lg:border-foreground/20 overflow-hidden transition-all duration-300 ease-in-out`}
      >
        {/* Space Header */}
        <div className="w-full h-[175px] bg-foreground relative">
          {space && (
            <div className="absolute bottom-4 left-4 text-white">
              <h2 className="text-lg font-semibold">{space.name}</h2>
              <p className="text-sm opacity-80">{space.description}</p>
            </div>
          )}
        </div>

        {/* Zones List */}
        <div className="p-3 flex flex-col gap-3 overflow-y-auto">
          {groupedZones.map((category) => (
            <div key={category.id} className="pb-6 flex flex-col gap-2">
              <h3 className="flex items-center gap-2 text-sm">
                <span>{category.name}</span>
                <button>
                  <IconChevronDown size={16} />
                </button>
              </h3>

              {category.zones.map((zone) => (
                <article
                  key={`${category.id}-${zone.id}`}
                  onClick={() => handleZoneSelect(zone.id)}
                  className={`p-1 pr-2 flex justify-between items-center gap-2 hover:bg-foreground/10 rounded-xl cursor-pointer transition-colors ${
                    currentZoneId === zone.id ? "bg-foreground/20" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <IconHash size={20} />
                    <span>{zone.name}</span>
                  </div>
                  <IconSettings size={20} />
                </article>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
