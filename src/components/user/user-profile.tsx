import React, { useState, useRef } from "react";
import {
  Camera,
  Save,
  Bell,
  Shield,
  Globe,
  Moon,
  Sun,
  Upload,
  Edit3,
  Settings,
  LogOut,
  Trash2,
} from "lucide-react";
import { UserAvatar } from "./UserAvatar";
import { DatabaseService } from "@/lib/database";
import type { EnhancedUser } from "@/types";

interface UserProfilePageProps {
  user: EnhancedUser;
  onUserUpdate: (user: EnhancedUser) => void;
}

interface ProfileForm {
  username: string;
  full_name: string;
  bio: string;
  timezone: string;
  avatar_url?: string;
}

interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  mention_notifications: boolean;
  dm_notifications: boolean;
  digest_frequency: "never" | "daily" | "weekly";
  quiet_hours_start: string;
  quiet_hours_end: string;
}

interface PrivacySettings {
  profile_visibility: "public" | "team_only" | "private";
  allow_dms_from: "everyone" | "team_only" | "friends_only";
  show_online_status: boolean;
  show_activity: boolean;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  user,
  onUserUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<
    "profile" | "notifications" | "privacy" | "security"
  >("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    username: user.username || "",
    full_name: user.full_name || "",
    bio: "", // This would come from user profile
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    avatar_url: user.avatar_url,
  });

  // Settings state
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>({
      email_notifications: true,
      push_notifications: true,
      mention_notifications: true,
      dm_notifications: true,
      digest_frequency: "daily",
      quiet_hours_start: "22:00",
      quiet_hours_end: "08:00",
    });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profile_visibility: "team_only",
    allow_dms_from: "team_only",
    show_online_status: true,
    show_activity: true,
  });

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      // Upload to storage and get URL
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      const { url } = await response.json();

      setProfileForm({ ...profileForm, avatar_url: url });
    } catch (error) {
      console.error("Avatar upload failed:", error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await DatabaseService.updateUserProfile(user.id, {
        username: profileForm.username,
        full_name: profileForm.full_name,
        avatar_url: profileForm.avatar_url,
        // bio and timezone would be saved to extended profile table
      });

      if (!error) {
        onUserUpdate({
          ...user,
          username: profileForm.username,
          full_name: profileForm.full_name,
          avatar_url: profileForm.avatar_url,
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Profile update failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const statusColors = {
      online: "bg-green-500",
      away: "bg-yellow-500",
      busy: "bg-red-500",
      offline: "bg-gray-500",
    };

    return (
      <div
        className={`w-3 h-3 rounded-full ${
          statusColors[status as keyof typeof statusColors]
        } border-2 border-neutral-800`}
      />
    );
  };

  const TabButton: React.FC<{
    id: string;
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
  }> = ({ id, label, icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
        isActive
          ? "bg-kafuffle-primary text-white"
          : "text-neutral-400 hover:text-white hover:bg-neutral-700"
      }`}
    >
      {icon}
      <span className="ml-2 font-medium">{label}</span>
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-neutral-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Profile Settings
            </h1>
            <p className="text-neutral-400">
              Manage your account settings and preferences
            </p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white transition-colors"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-neutral-800 rounded-lg p-6 mb-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <UserAvatar user={user} size="xl" />
            <div className="absolute bottom-0 right-0">
              <StatusBadge status={user.status || "offline"} />
            </div>
            {isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              >
                {uploadingAvatar ? (
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-xl font-semibold text-white">
                {user.full_name || user.username}
              </h2>
              {user.presence?.custom_status && (
                <span className="text-sm text-neutral-400 bg-neutral-700 px-2 py-1 rounded">
                  {user.presence.custom_status}
                </span>
              )}
            </div>
            <p className="text-neutral-400">@{user.username}</p>
            {user.roles && user.roles.length > 0 && (
              <div className="flex space-x-2 mt-2">
                {user.roles.map((role) => (
                  <span
                    key={role.id}
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: `${role.color}20`,
                      color: role.color,
                    }}
                  >
                    {role.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 mb-6">
        <TabButton
          id="profile"
          label="Profile"
          icon={<Settings className="w-4 h-4" />}
          isActive={activeTab === "profile"}
          onClick={() => setActiveTab("profile")}
        />
        <TabButton
          id="notifications"
          label="Notifications"
          icon={<Bell className="w-4 h-4" />}
          isActive={activeTab === "notifications"}
          onClick={() => setActiveTab("notifications")}
        />
        <TabButton
          id="privacy"
          label="Privacy"
          icon={<Shield className="w-4 h-4" />}
          isActive={activeTab === "privacy"}
          onClick={() => setActiveTab("privacy")}
        />
        <TabButton
          id="security"
          label="Security"
          icon={<Shield className="w-4 h-4" />}
          isActive={activeTab === "security"}
          onClick={() => setActiveTab("security")}
        />
      </div>

      {/* Tab Content */}
      <div className="bg-neutral-800 rounded-lg p-6">
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Profile Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.full_name}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        full_name: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-kafuffle-primary disabled:opacity-50"
                    placeholder="Your display name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={profileForm.username}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        username: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-kafuffle-primary disabled:opacity-50"
                    placeholder="username"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, bio: e.target.value })
                  }
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-kafuffle-primary disabled:opacity-50 resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Timezone
                </label>
                <select
                  value={profileForm.timezone}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, timezone: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-kafuffle-primary disabled:opacity-50"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Australia/Sydney">Sydney</option>
                </select>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-4 pt-4 border-t border-neutral-700">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex items-center px-4 py-2 bg-kafuffle-primary hover:bg-kafuffle-primary/80 rounded-lg text-white transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Notification Preferences
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Email Notifications</p>
                  <p className="text-sm text-neutral-400">
                    Receive notifications via email
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.email_notifications}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        email_notifications: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kafuffle-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Push Notifications</p>
                  <p className="text-sm text-neutral-400">
                    Receive push notifications on your devices
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.push_notifications}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        push_notifications: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kafuffle-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">
                    Mention Notifications
                  </p>
                  <p className="text-sm text-neutral-400">
                    Get notified when someone mentions you
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.mention_notifications}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        mention_notifications: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kafuffle-primary"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Email Digest Frequency
                </label>
                <select
                  value={notificationSettings.digest_frequency}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      digest_frequency: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-kafuffle-primary"
                >
                  <option value="never">Never</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Quiet Hours Start
                  </label>
                  <input
                    type="time"
                    value={notificationSettings.quiet_hours_start}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        quiet_hours_start: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-kafuffle-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Quiet Hours End
                  </label>
                  <input
                    type="time"
                    value={notificationSettings.quiet_hours_end}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        quiet_hours_end: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-kafuffle-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "privacy" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Privacy Settings
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Profile Visibility
                </label>
                <select
                  value={privacySettings.profile_visibility}
                  onChange={(e) =>
                    setPrivacySettings({
                      ...privacySettings,
                      profile_visibility: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-kafuffle-primary"
                >
                  <option value="public">
                    Public - Anyone can see your profile
                  </option>
                  <option value="team_only">
                    Team Only - Only team members can see your profile
                  </option>
                  <option value="private">
                    Private - Only you can see your profile
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Allow Direct Messages From
                </label>
                <select
                  value={privacySettings.allow_dms_from}
                  onChange={(e) =>
                    setPrivacySettings({
                      ...privacySettings,
                      allow_dms_from: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-kafuffle-primary"
                >
                  <option value="everyone">Everyone</option>
                  <option value="team_only">Team Members Only</option>
                  <option value="friends_only">Friends Only</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Show Online Status</p>
                  <p className="text-sm text-neutral-400">
                    Let others see when you're online
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacySettings.show_online_status}
                    onChange={(e) =>
                      setPrivacySettings({
                        ...privacySettings,
                        show_online_status: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kafuffle-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Show Activity</p>
                  <p className="text-sm text-neutral-400">
                    Let others see what you're working on
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacySettings.show_activity}
                    onChange={(e) =>
                      setPrivacySettings({
                        ...privacySettings,
                        show_activity: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kafuffle-primary"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Security & Account
            </h3>

            <div className="space-y-4">
              <div className="bg-neutral-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">
                      Two-Factor Authentication
                    </p>
                    <p className="text-sm text-neutral-400">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-kafuffle-primary hover:bg-kafuffle-primary/80 rounded-lg text-white transition-colors">
                    Enable 2FA
                  </button>
                </div>
              </div>

              <div className="bg-neutral-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Change Password</p>
                    <p className="text-sm text-neutral-400">
                      Update your account password
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-neutral-600 hover:bg-neutral-500 rounded-lg text-white transition-colors">
                    Change Password
                  </button>
                </div>
              </div>

              <div className="bg-neutral-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Download Data</p>
                    <p className="text-sm text-neutral-400">
                      Download a copy of your data
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-neutral-600 hover:bg-neutral-500 rounded-lg text-white transition-colors">
                    <Upload className="w-4 h-4 mr-2 inline" />
                    Download
                  </button>
                </div>
              </div>

              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-400 font-medium">Delete Account</p>
                    <p className="text-sm text-red-400/70">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors">
                    <Trash2 className="w-4 h-4 mr-2 inline" />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
