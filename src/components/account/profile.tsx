// /components/account/profile.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { View } from "@/types";
import {
  IconCamera,
  IconDeviceFloppy,
  IconEdit,
  IconX,
} from "@tabler/icons-react";

import { createClient } from "@/utils/supabase/client";

interface ProfileProps {
  onViewChange: (view: View) => void;
}

interface UserProfile {
  id: string;
  username: string;
  display_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  status?: "online" | "away" | "busy" | "offline" | null;
}

export default function Profile({ onViewChange }: ProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editForm, setEditForm] = useState({
    display_name: "",
    bio: "",
    status: "online" as UserProfile["status"],
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setEditForm({
        display_name: data.display_name || "",
        bio: data.bio || "",
        status: data.status || "online",
      });
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: editForm.display_name || null,
          bio: editForm.bio || null,
          status: editForm.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) throw error;

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              display_name: editForm.display_name || null,
              bio: editForm.bio || null,
              status: editForm.status,
            }
          : null,
      );

      setEditing(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      alert("File size must be less than 5MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      const supabase = createClient();

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${profile.id}/avatar.${fileExt}`;

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : null));
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      alert("Failed to upload avatar. Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const getAvatarInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "busy":
        return "bg-red-500";
      default:
        return "bg-neutral-400";
    }
  };

  if (loading) {
    return (
      <div className="flex-grow p-6 bg-neutral-50 dark:bg-neutral-800/80 rounded-4xl h-full">
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center gap-2 text-neutral-500">
            <div className="w-4 h-4 border-2 border-neutral-300 border-t-kafuffle-primary rounded-full animate-spin"></div>
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-grow p-6 bg-neutral-50 dark:bg-neutral-800/80 rounded-4xl h-full">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-kafuffle-primary mb-4">Profile not found</p>
            <button
              onClick={() => onViewChange("spaces")}
              className="px-4 py-2 bg-kafuffle-primary text-white rounded-lg hover:opacity-80 transition-opacity"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow p-6 bg-neutral-50 dark:bg-neutral-800/80 rounded-4xl h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            Your Profile
          </h1>
          <p className="text-sm text-neutral-400 dark:text-neutral-500">
            Manage your personal information and settings
          </p>
        </header>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-700">
          {/* Avatar Section */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full bg-kafuffle-primary text-white flex items-center justify-center text-2xl font-bold overflow-hidden">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getAvatarInitials(profile.display_name || profile.username)
                )}
              </div>

              {/* Status indicator */}
              <div
                className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-2 border-white ${getStatusColor(profile.status || "offline")}`}
              ></div>

              {/* Upload button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
              >
                {uploadingAvatar ? (
                  <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <IconCamera size={16} />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mt-4">
              @{profile.username}
            </h2>
          </div>

          {/* Profile Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                Display Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={editForm.display_name}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      display_name: e.target.value,
                    }))
                  }
                  placeholder="Your display name"
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-kafuffle-primary focus:border-transparent"
                />
              ) : (
                <p className="text-neutral-600 dark:text-neutral-400 py-3">
                  {profile.display_name || "No display name set"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                Bio
              </label>
              {editing ? (
                <textarea
                  value={editForm.bio}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  placeholder="Tell people about yourself..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-kafuffle-primary focus:border-transparent resize-none"
                />
              ) : (
                <p className="text-neutral-600 dark:text-neutral-400 py-3 whitespace-pre-wrap">
                  {profile.bio || "No bio set"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                Status
              </label>
              {editing ? (
                <select
                  value={editForm.status || "online"}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      status: e.target.value as UserProfile["status"],
                    }))
                  }
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-kafuffle-primary focus:border-transparent"
                >
                  <option value="online">🟢 Online</option>
                  <option value="away">🟡 Away</option>
                  <option value="busy">🔴 Busy</option>
                  <option value="offline">⚫ Offline</option>
                </select>
              ) : (
                <p className="text-neutral-600 dark:text-neutral-400 py-3">
                  {profile.status === "online" && "🟢 Online"}
                  {profile.status === "away" && "🟡 Away"}
                  {profile.status === "busy" && "🔴 Busy"}
                  {profile.status === "offline" && "⚫ Offline"}
                  {!profile.status && "🟢 Online"}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            {editing ? (
              <>
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-kafuffle-primary hover:opacity-90 text-white rounded-lg font-semibold transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <IconDeviceFloppy size={20} />
                  )}
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setEditForm({
                      display_name: profile.display_name || "",
                      bio: profile.bio || "",
                      status: profile.status || "online",
                    });
                  }}
                  className="px-4 py-3 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <IconX size={20} />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex-1 px-4 py-3 bg-kafuffle-primary hover:opacity-90 text-white rounded-lg font-semibold transition-opacity flex items-center justify-center gap-2"
              >
                <IconEdit size={20} />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => onViewChange("spaces")}
            className="text-kafuffle-primary hover:underline"
          >
            ← Back to Spaces
          </button>
        </div>
      </div>
    </div>
  );
}
