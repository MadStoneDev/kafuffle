// /components/user/zones-sidebar.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  IconChevronDown,
  IconChevronLeft,
  IconHash,
  IconSettings,
  IconPlus,
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

  // Extract current zoneId from pathname
  const currentZoneId = useMemo(() => {
    return pathname.includes("/zones/") ? pathname.split("/zones/")[1] : null;
  }, [pathname]);

  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});

  // Memoize expensive computations
  const { space, groupedZones } = useMemo(() => {
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

    // Initialize all categories as expanded
    const initialExpanded: Record<string, boolean> = {};
    groupedZones.forEach((category) => {
      initialExpanded[category.id] = true;
    });
    setExpandedCategories((prev) => ({ ...initialExpanded, ...prev }));

    return { space, groupedZones };
  }, [spaceId]);

  const handleZoneSelect = (zoneId: string) => {
    setSpace(spaceId);
    setZone(zoneId);
    router.push(`/spaces/${spaceId}/zones/${zoneId}`);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  return (
    <section
      className={`relative flex items-center ${
        sidebarExpanded ? "mr-4" : "mr-0"
      } max-w-[300px] h-full rounded-2xl overflow-hidden transition-all duration-300 ease-out`}
    >
      {/* Mobile Overlay */}
      {sidebarExpanded && (
        <div
          onClick={toggleSidebar}
          className="lg:hidden fixed inset-0 bg-background/70 z-40 transition-opacity duration-300"
        />
      )}

      {/* Toggle Button */}
      <div className="fixed right-0 flex z-50">
        <button
          onClick={toggleSidebar}
          className={`
            group relative bg-background border border-foreground/20 
            hover:border-foreground/40 hover:bg-foreground rounded-l-2xl 
             overflow-hidden transition-all duration-300 ease-out
            ${sidebarExpanded ? "shadow-lg" : "shadow-md hover:shadow-lg"}
          `}
          title={sidebarExpanded ? "Collapse zones" : "Expand zones"}
        >
          <div className="px-2 py-3">
            <IconChevronLeft
              size={20}
              className={`
                text-foreground/60 group-hover:text-kafuffle
                transition-all duration-300 ease-out
                ${sidebarExpanded ? "rotate-180" : "rotate-0"}
              `}
            />

            {/* Subtle hover effect */}
            <div className="absolute inset-0 bg-kafuffle/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </button>
      </div>

      {/* Sidebar Content */}
      <div
        className={`
          relative h-full bg-background border border-foreground/20 rounded-2xl
          shadow-xl overflow-hidden transition-all duration-300 ease-out
          ${
            sidebarExpanded
              ? "w-[280px] opacity-100 translate-x-0"
              : "w-0 opacity-0 translate-x-4 pointer-events-none"
          }
        `}
      >
        {/* Space Header */}
        <div className="relative w-full h-[160px] bg-gradient-to-br from-kafuffle to-kafuffle/80 overflow-hidden">
          {/* Background pattern/texture */}
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />

          {space && (
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h2 className="text-lg font-semibold truncate">{space.name}</h2>
              {space.description && (
                <p className="text-sm opacity-90 line-clamp-2 mt-1">
                  {space.description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Zones List */}
        <div className="flex flex-col h-[calc(100%-160px)]">
          <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
            {groupedZones.map((category) => (
              <div key={category.id} className="space-y-2">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <h3 className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                    {category.name}
                  </h3>
                  <IconChevronDown
                    size={14}
                    className={`
                      text-foreground/50 group-hover:text-foreground/80
                      transition-all duration-200
                      ${
                        expandedCategories[category.id]
                          ? "rotate-0"
                          : "-rotate-90"
                      }
                    `}
                  />
                </button>

                {/* Zones List */}
                <div
                  className={`
                    space-y-1 overflow-hidden transition-all duration-300 ease-out
                    ${
                      expandedCategories[category.id]
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0"
                    }
                  `}
                >
                  {category.zones.map((zone) => (
                    <article
                      key={zone.id}
                      onClick={() => handleZoneSelect(zone.id)}
                      className={`
                        group flex items-center justify-between px-3 py-2.5 rounded-xl
                        cursor-pointer transition-all duration-200 ease-out
                        ${
                          currentZoneId === zone.id
                            ? "bg-kafuffle/20 text-kafuffle border border-kafuffle/30"
                            : "hover:bg-foreground/10 border border-transparent"
                        }
                      `}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <IconHash
                          size={18}
                          className={`
                            flex-shrink-0 transition-colors duration-200
                            ${
                              currentZoneId === zone.id
                                ? "text-kafuffle"
                                : "text-foreground/50 group-hover:text-foreground/80"
                            }
                          `}
                        />
                        <span className="text-sm font-medium truncate">
                          {zone.name}
                        </span>
                      </div>

                      <IconSettings
                        size={16}
                        className={`
                          flex-shrink-0 opacity-0 group-hover:opacity-70
                          hover:opacity-100 transition-all duration-200
                          ${
                            currentZoneId === zone.id
                              ? "text-kafuffle"
                              : "text-foreground/60"
                          }
                        `}
                      />
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Add Zone Button */}
          <div className="p-4 border-t border-foreground/10">
            <button
              className="
                w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl
                text-foreground/60 hover:text-kafuffle
                hover:bg-kafuffle/10 border-2 border-dashed border-foreground/20
                hover:border-kafuffle/40 transition-all duration-200
                group
              "
              title="Add new zone"
            >
              <IconPlus
                size={18}
                className="group-hover:rotate-90 transition-transform duration-200"
              />
              <span className="text-sm font-medium">Add Zone</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
