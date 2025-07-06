// /components/zones/zone-templates.tsx
"use client";

import { useState, useEffect } from "react";
import { IconTemplate, IconPlus, IconCopy } from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/client";

interface ZoneTemplate {
  id: string;
  name: string;
  description: string;
  emoji: string;
  is_public: boolean;
  created_by: string;
  template_data: {
    zones: Array<{
      name: string;
      description: string;
      zone_type: "chat" | "flow" | "calendar";
      position: number;
    }>;
    welcome_message?: string;
  };
  creator: {
    username: string;
    display_name: string | null;
  };
}

export default function ZoneTemplates() {
  const [templates, setTemplates] = useState<ZoneTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("zone_templates")
        .select(
          `
          *,
          creator:profiles!created_by(username, display_name)
        `,
        )
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Failed to load templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const useTemplate = async (template: ZoneTemplate, spaceId: string) => {
    try {
      const supabase = createClient();

      // Create zones from template
      for (const zoneData of template.template_data.zones) {
        const { error } = await supabase.from("zones").insert({
          ...zoneData,
          space_id: spaceId,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        });

        if (error) throw error;
      }

      alert("Template applied successfully!");
    } catch (error) {
      console.error("Failed to apply template:", error);
      alert("Failed to apply template");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <IconTemplate size={20} className="text-kafuffle-primary" />
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            Zone Templates
          </h2>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-kafuffle-primary text-white rounded-lg hover:opacity-80 transition-opacity"
        >
          <IconPlus size={16} />
          Create Template
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-12">
          <IconTemplate size={48} className="text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-600 dark:text-neutral-400">
            No templates available
          </h3>
          <p className="text-neutral-500">
            Create templates to quickly set up new spaces
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{template.emoji}</span>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white">
                      {template.name}
                    </h3>
                    <p className="text-xs text-neutral-500">
                      by{" "}
                      {template.creator?.display_name ||
                        template.creator?.username}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                {template.description}
              </p>

              <div className="mb-4">
                <h4 className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Includes {template.template_data.zones.length} zones:
                </h4>
                <div className="space-y-1">
                  {template.template_data.zones
                    .slice(0, 3)
                    .map((zone, index) => (
                      <div
                        key={index}
                        className="text-xs text-neutral-500 flex items-center gap-2"
                      >
                        <span>#{zone.name}</span>
                        <span className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-700 rounded text-xs">
                          {zone.zone_type}
                        </span>
                      </div>
                    ))}
                  {template.template_data.zones.length > 3 && (
                    <div className="text-xs text-neutral-400">
                      +{template.template_data.zones.length - 3} more
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  // This would need the current space ID - you'd pass this as a prop
                  const spaceId = prompt("Enter space ID to apply template:");
                  if (spaceId) useTemplate(template, spaceId);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
              >
                <IconCopy size={16} />
                Use Template
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
