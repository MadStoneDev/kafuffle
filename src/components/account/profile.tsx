// /components/account/profile.tsx
"use client";

import { useState, useEffect } from "react";
import { View } from "@/types";

import { createClient } from "@/utils/supabase/client";

import {
  updateProfile,
  uploadAvatar,
  checkUsernameAvailable,
} from "@/app/actions/profile-actions";

import {
  IconChevronLeft,
  IconCamera,
  IconEdit,
  IconCheck,
  IconX,
} from "@tabler/icons-react";

import { getAvatarInitials } from "@/utils/general/space-utils";

interface ProfileProps {
  onViewChange: (view: View) => void;
}

interface UserProfile {
  id: string;
  email: string;
  username: string; // Required in database
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  status: "online" | "away" | "busy" | "offline" | null;
  last_seen_at: string | null;
}

export default function Profile({ onViewChange }: ProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    display_name: "",
    bio: "",
  });

  // Validation state
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load user profile
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

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Profile load error:", error);
        return;
      }

      const userProfile: UserProfile = {
        id: user.id,
        email: user.email || "",
        username: profileData?.username || `user_${user.id.slice(0, 8)}`, // Provide fallback
        display_name: profileData?.display_name || null,
        avatar_url: profileData?.avatar_url || null,
        bio: profileData?.bio || null,
        status: profileData?.status || null,
        last_seen_at: profileData?.last_seen_at || null,
      };

      setProfile(userProfile);
      setFormData({
        username: userProfile.username,
        display_name: userProfile.display_name || "",
        bio: userProfile.bio || "",
      });
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // Check username availability with debouncing
  useEffect(() => {
    if (!formData.username || formData.username === profile?.username) {
      setUsernameAvailable(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const result = await checkUsernameAvailable(formData.username);
        setUsernameAvailable(result.available);
      } catch (error) {
        console.error("Username check error:", error);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.username, profile?.username]);

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    setUploadingAvatar(true);
    try {
      const result = await uploadAvatar(file);
      if (result.success && result.avatarUrl) {
        setProfile((prev) =>
          prev ? { ...prev, avatar_url: result.avatarUrl } : null,
        );
      } else {
        alert(result.error || "Failed to upload avatar");
      }
    } catch (error) {
      console.error("Avatar upload error:", error);
      alert("Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    // Validate form
    const newErrors: { [key: string]: string } = {};

    // Username is required in database
    if (!formData.username || formData.username.trim().length === 0) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, underscores, and dashes";
    } else if (formData.username !== profile.username && !usernameAvailable) {
      newErrors.username = "Username is not available";
    }

    if (formData.display_name && formData.display_name.length > 50) {
      newErrors.display_name = "Display name must be 50 characters or less";
    }

    if (formData.bio && formData.bio.length > 200) {
      newErrors.bio = "Bio must be 200 characters or less";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);
    try {
      const result = await updateProfile(
        formData.username, // Always required now
        formData.display_name || null,
        formData.bio || null,
      );

      if (result.success) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                username: formData.username,
                display_name: formData.display_name || null,
                bio: formData.bio || null,
              }
            : null,
        );
        setEditing(false);
        setErrors({});
      } else {
        alert(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!profile) return;

    setFormData({
      username: profile.username,
      display_name: profile.display_name || "",
      bio: profile.bio || "",
    });
    setEditing(false);
    setErrors({});
    setUsernameAvailable(null);
  };

  if (loading) {
    return (
      <div className="flex-grow p-6 bg-neutral-50 dark:bg-neutral-800/90 rounded-4xl h-full flex items-center justify-center">
        <div className="text-neutral-600 dark:text-neutral-400">
          Loading profile...
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-grow p-6 bg-neutral-50 dark:bg-neutral-800/90 rounded-4xl h-full flex items-center justify-center">
        <div className="text-neutral-600 dark:text-neutral-400">
          Failed to load profile
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow p-6 bg-neutral-50 dark:bg-neutral-800/90 rounded-4xl h-full">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="mb-6 flex items-center gap-2 text-neutral-900 dark:text-neutral-50">
          <button
            onClick={() => onViewChange("spaces")}
            className="cursor-pointer p-2 hover:bg-kafuffle-primary text-neutral-900 dark:text-neutral-50 hover:text-neutral-50 rounded-full transition-all duration-200"
          >
            <IconChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Profile</h1>
        </header>

        {/* Profile Content */}
        <div className="bg-white dark:bg-neutral-700 rounded-2xl p-8 shadow-sm">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-kafuffle-primary flex items-center justify-center text-white text-2xl font-bold">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getAvatarInitials(
                    profile.display_name || profile.username || profile.email,
                  )
                )}
              </div>

              <label className="absolute -bottom-2 -right-2 bg-kafuffle-primary hover:opacity-90 text-white p-2 rounded-full cursor-pointer transition-opacity shadow-lg">
                <IconCamera size={16} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploadingAvatar}
                />
              </label>

              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            <div className="text-center mt-4">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {profile.display_name || profile.username || "Unnamed User"}
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                {profile.email}
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="space-y-6">
            {/* Edit Button */}
            {!editing && (
              <div className="flex justify-center">
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-kafuffle-primary text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <IconEdit size={16} />
                  Edit Profile
                </button>
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Username
              </label>
              {editing ? (
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-kafuffle-primary focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      placeholder="Enter username"
                    />
                    {checkingUsername && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-kafuffle-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    {!checkingUsername &&
                      formData.username &&
                      formData.username !== profile.username && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {usernameAvailable ? (
                            <IconCheck size={16} className="text-green-500" />
                          ) : (
                            <IconX size={16} className="text-red-500" />
                          )}
                        </div>
                      )}
                  </div>
                  {errors.username && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.username}
                    </p>
                  )}
                  {!errors.username &&
                    formData.username &&
                    formData.username !== profile.username &&
                    usernameAvailable && (
                      <p className="text-green-500 text-sm mt-1">
                        Username is available
                      </p>
                    )}
                </div>
              ) : (
                <p className="text-neutral-900 dark:text-neutral-100 py-2">
                  {profile.username}
                </p>
              )}
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Display Name
              </label>
              {editing ? (
                <div>
                  <input
                    type="text"
                    value={formData.display_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        display_name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-kafuffle-primary focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    placeholder="Enter display name"
                  />
                  {errors.display_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.display_name}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-neutral-900 dark:text-neutral-100 py-2">
                  {profile.display_name || (
                    <span className="text-neutral-500 italic">Not set</span>
                  )}
                </p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Bio
              </label>
              {editing ? (
                <div>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-kafuffle-primary focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 resize-none"
                    placeholder="Tell others about yourself..."
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.bio ? (
                      <p className="text-red-500 text-sm">{errors.bio}</p>
                    ) : (
                      <div />
                    )}
                    <p className="text-sm text-neutral-500">
                      {formData.bio.length}/200
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-neutral-900 dark:text-neutral-100 py-2">
                  {profile.bio || (
                    <span className="text-neutral-500 italic">
                      No bio added
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Save/Cancel Buttons */}
            {editing && (
              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={
                    saving ||
                    checkingUsername ||
                    !formData.username ||
                    (formData.username !== profile.username &&
                      !usernameAvailable)
                  }
                  className="px-4 py-2 bg-kafuffle-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
