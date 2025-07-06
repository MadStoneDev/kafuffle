// /components/spaces/space-settings.tsx
"use client";

import { useState, useEffect } from "react";
import {
  IconDeviceFloppy,
  IconTrash,
  IconArchive,
  IconLock,
  IconWorld,
  IconX,
} from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface SpaceSettingsProps {
  spaceId: string;
  onClose?: () => void;
}

interface SpaceDetails {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  member_count: number;
  created_by: string;
  avatar_url: string | null;
}

export default function SpaceSettings({
  spaceId,
  onClose,
}: SpaceSettingsProps) {
  const [space, setSpace] = useState<SpaceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_public: false,
  });
  const router = useRouter();

  useEffect(() => {
    loadSpaceDetails();
  }, [spaceId]);

  const loadSpaceDetails = async () => {
    try {
      const supabase = createClient();

      // Get space details
      const { data: spaceData, error: spaceError } = await supabase
        .from("spaces")
        .select("*")
        .eq("id", spaceId)
        .single();

      if (spaceError) throw spaceError;

      setSpace(spaceData);
      setFormData({
        name: spaceData.name || "",
        description: spaceData.description || "",
        is_public: spaceData.is_public || false,
      });

      // Get current user's role
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: memberData } = await supabase
          .from("space_members")
          .select("role")
          .eq("space_id", spaceId)
          .eq("user_id", user.id)
          .single();

        if (memberData) {
          setCurrentUserRole(memberData.role);
        }
      }
    } catch (error) {
      console.error("Failed to load space details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("spaces")
        .update({
          name: formData.name,
          description: formData.description || null,
          is_public: formData.is_public,
          updated_at: new Date().toISOString(),
        })
        .eq("id", spaceId);

      if (error) throw error;

      alert("Space settings updated successfully!");
    } catch (error) {
      console.error("Failed to update space:", error);
      alert("Failed to update space settings");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (
      !confirm(
        "Are you sure you want to archive this space? It can be restored later.",
      )
    ) {
      return;
    }

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("spaces")
        .update({
          archived_at: new Date().toISOString(),
        })
        .eq("id", spaceId);

      if (error) throw error;

      alert("Space archived successfully");
      router.push("/");
    } catch (error) {
      console.error("Failed to archive space:", error);
      alert("Failed to archive space");
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to permanently delete this space? This action cannot be undone.",
      )
    ) {
      return;
    }

    if (
      !confirm(
        "This will delete all messages, zones, and files in this space. Are you absolutely sure?",
      )
    ) {
      return;
    }

    try {
      const supabase = createClient();

      // Delete in order due to foreign keys
      // 1. Delete messages
      await supabase.from("messages").delete().eq("space_id", spaceId);

      // 2. Delete zones
      await supabase.from("zones").delete().eq("space_id", spaceId);

      // 3. Delete space members
      await supabase.from("space_members").delete().eq("space_id", spaceId);

      // 4. Delete the space
      const { error } = await supabase
        .from("spaces")
        .delete()
        .eq("id", spaceId);

      if (error) throw error;

      alert("Space deleted successfully");
      router.push("/");
    } catch (error) {
      console.error("Failed to delete space:", error);
      alert("Failed to delete space");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!space || currentUserRole !== "owner") {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">
          {!space ? "Space not found" : "Only space owners can manage settings"}
        </p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg hover:opacity-80"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Space Settings
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <IconX size={20} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Basic Settings */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Basic Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Space Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-kafuffle-primary focus:border-transparent"
                  placeholder="Enter space name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-kafuffle-primary focus:border-transparent resize-none"
                  placeholder="Describe what this space is for"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Privacy
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      checked={!formData.is_public}
                      onChange={() =>
                        setFormData((prev) => ({ ...prev, is_public: false }))
                      }
                      className="w-4 h-4 text-kafuffle-primary"
                    />
                    <div className="flex items-center gap-2">
                      <IconLock size={16} />
                      <span>Private - Only invited members can join</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.is_public}
                      onChange={() =>
                        setFormData((prev) => ({ ...prev, is_public: true }))
                      }
                      className="w-4 h-4 text-kafuffle-primary"
                    />
                    <div className="flex items-center gap-2">
                      <IconWorld size={16} />
                      <span>Public - Anyone can discover and join</span>
                    </div>
                  </label>
                </div>
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

          {/* Space Info */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Space Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Created</span>
                <span className="text-neutral-900 dark:text-white">
                  {new Date(space.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Members</span>
                <span className="text-neutral-900 dark:text-white">
                  {space.member_count}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Space ID</span>
                <span className="text-neutral-900 dark:text-white font-mono text-xs">
                  {space.id}
                </span>
              </div>
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
                    Archive Space
                  </h4>
                  <p className="text-sm text-neutral-500">
                    Hide this space but keep all data
                  </p>
                </div>
                <button
                  onClick={handleArchive}
                  className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:opacity-80 transition-opacity"
                >
                  <IconArchive size={16} />
                  Archive
                </button>
              </div>

              <div className="flex items-center justify-between p-3 border border-red-200 dark:border-red-700 rounded-lg">
                <div>
                  <h4 className="font-medium text-red-600 dark:text-red-400">
                    Delete Space
                  </h4>
                  <p className="text-sm text-neutral-500">
                    Permanently delete this space and all data
                  </p>
                </div>
                <button
                  onClick={handleDelete}
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
    </div>
  );
}
