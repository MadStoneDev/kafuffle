// /components/zones/zone-settings.tsx
"use client";

import { useState } from "react";
import { IconDeviceFloppy, IconTrash, IconArchive } from "@tabler/icons-react";

interface ZoneSettingsProps {
  zoneId: string;
  zoneName: string;
  zoneDescription?: string;
  onUpdate: (data: { name: string; description: string }) => void;
  onDelete: () => void;
  onArchive: () => void;
}

export default function ZoneSettings({
  zoneId,
  zoneName,
  zoneDescription = "",
  onUpdate,
  onDelete,
  onArchive,
}: ZoneSettingsProps) {
  const [name, setName] = useState(zoneName);
  const [description, setDescription] = useState(zoneDescription);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate({ name, description });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
        Zone Settings
      </h2>

      <div className="space-y-6">
        {/* Basic Settings */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Basic Information
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Zone Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-kafuffle-primary focus:border-transparent"
                placeholder="Enter zone name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-kafuffle-primary focus:border-transparent resize-none"
                placeholder="Describe what this zone is for"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-kafuffle-primary text-white rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              <IconDeviceFloppy size={16} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-red-200 dark:border-red-900">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
            Danger Zone
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
              <div>
                <h4 className="font-medium text-neutral-900 dark:text-white">
                  Archive Zone
                </h4>
                <p className="text-sm text-neutral-500">
                  Hide this zone but keep all messages
                </p>
              </div>
              <button
                onClick={onArchive}
                className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:opacity-80 transition-opacity"
              >
                <IconArchive size={16} />
                Archive
              </button>
            </div>

            <div className="flex items-center justify-between p-3 border border-red-200 dark:border-red-700 rounded-lg">
              <div>
                <h4 className="font-medium text-red-600 dark:text-red-400">
                  Delete Zone
                </h4>
                <p className="text-sm text-neutral-500">
                  Permanently delete this zone and all messages
                </p>
              </div>
              <button
                onClick={onDelete}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:opacity-80 transition-opacity"
              >
                <IconTrash size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
