// /app/me/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconEdit,
  IconBell,
  IconShield,
  IconPalette,
  IconUser,
  IconMail,
  IconKey,
  IconLogout,
  IconCamera,
  IconCheck,
  IconX,
} from "@tabler/icons-react";

import UserAvatar from "@/components/user/user-avatar";

// Mock user data - replace with actual user context/auth
const currentUser = {
  id: "current-user-id",
  username: "john_doe",
  email: "john.doe@example.com",
  avatar:
    "https://res.cloudinary.com/duhygs5ck/image/upload/f_auto,q_auto/v1740646396/avatar2.jpg",
  displayName: "John Doe",
  bio: "Just another user enjoying conversations in various spaces.",
  joinedAt: "2023-06-15",
  status: "online", // online, away, busy, offline
  settings: {
    notifications: true,
    darkMode: true,
    showStatus: true,
    allowDirectMessages: true,
  },
};

interface SettingToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function SettingToggle({
  label,
  description,
  checked,
  onChange,
}: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <h4 className="font-medium text-sm">{label}</h4>
        <p className="text-xs text-foreground/60 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
          checked ? "bg-kafuffle" : "bg-foreground/20"
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedUser, setEditedUser] = useState({
    displayName: currentUser.displayName,
    username: currentUser.username,
    bio: currentUser.bio,
  });
  const [settings, setSettings] = useState(currentUser.settings);

  const handleSaveProfile = () => {
    // TODO: Implement profile save logic
    console.log("Saving profile:", editedUser);
    setIsEditingProfile(false);
  };

  const handleCancelEdit = () => {
    setEditedUser({
      displayName: currentUser.displayName,
      username: currentUser.username,
      bio: currentUser.bio,
    });
    setIsEditingProfile(false);
  };

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    // TODO: Implement settings save logic
    console.log("Setting changed:", key, value);
  };

  const menuItems = [
    { id: "profile", label: "Profile", icon: IconUser },
    { id: "account", label: "Account", icon: IconMail },
    { id: "notifications", label: "Notifications", icon: IconBell },
    { id: "privacy", label: "Privacy & Safety", icon: IconShield },
    { id: "appearance", label: "Appearance", icon: IconPalette },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "busy":
        return "bg-red-500";
      case "offline":
        return "bg-foreground/30";
      default:
        return "bg-foreground/30";
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4 py-4 bg-background border-b border-foreground/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/spaces"
              className="p-2 hover:bg-foreground/10 rounded-lg transition-all duration-300 ease-in-out"
              title="Back to spaces"
            >
              <IconArrowLeft size={24} className="text-foreground" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="relative">
                <UserAvatar
                  imageSrc={currentUser.avatar}
                  alt={currentUser.displayName}
                  className="scale-75"
                />
                <div
                  className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(
                    currentUser.status,
                  )} border-2 border-background rounded-full`}
                />
              </div>
              <div>
                <h1 className="font-semibold text-lg">
                  {currentUser.displayName}
                </h1>
                <p className="text-sm text-foreground/60">
                  @{currentUser.username}
                </p>
              </div>
            </div>
          </div>

          <button className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors flex items-center gap-2">
            <IconLogout size={16} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex pt-20">
        {/* Sidebar */}
        <div className="w-64 p-4 border-r border-foreground/10 overflow-y-auto">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                  activeSection === item.id
                    ? "bg-kafuffle/20 text-kafuffle"
                    : "hover:bg-foreground/5 text-foreground/80 hover:text-foreground"
                }`}
              >
                <item.icon size={18} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeSection === "profile" && (
            <div className="max-w-2xl space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">My Profile</h2>
                {!isEditingProfile ? (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-kafuffle/10 text-kafuffle hover:bg-kafuffle/20 rounded-lg transition-colors"
                  >
                    <IconEdit size={16} />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 px-4 py-2 bg-kafuffle text-white hover:bg-kafuffle/90 rounded-lg transition-colors"
                    >
                      <IconCheck size={16} />
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-foreground/10 hover:bg-foreground/20 rounded-lg transition-colors"
                    >
                      <IconX size={16} />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Avatar Section */}
              <div className="p-6 bg-foreground/5 rounded-2xl">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <UserAvatar
                      imageSrc={currentUser.avatar}
                      alt={currentUser.displayName}
                      className="scale-150"
                    />
                    {isEditingProfile && (
                      <button className="absolute -bottom-1 -right-1 p-2 bg-kafuffle text-white rounded-full hover:bg-kafuffle/90 transition-colors">
                        <IconCamera size={14} />
                      </button>
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Display Name
                      </label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={editedUser.displayName}
                          onChange={(e) =>
                            setEditedUser((prev) => ({
                              ...prev,
                              displayName: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 bg-background border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-kafuffle"
                        />
                      ) : (
                        <p className="text-lg font-semibold">
                          {currentUser.displayName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Username
                      </label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={editedUser.username}
                          onChange={(e) =>
                            setEditedUser((prev) => ({
                              ...prev,
                              username: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 bg-background border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-kafuffle"
                        />
                      ) : (
                        <p className="text-foreground/80">
                          @{currentUser.username}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div className="p-6 bg-foreground/5 rounded-2xl">
                <label className="block text-sm font-medium mb-3">Bio</label>
                {isEditingProfile ? (
                  <textarea
                    value={editedUser.bio}
                    onChange={(e) =>
                      setEditedUser((prev) => ({
                        ...prev,
                        bio: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-background border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-kafuffle resize-none"
                    rows={3}
                    placeholder="Tell us a bit about yourself..."
                  />
                ) : (
                  <p className="text-foreground/80">{currentUser.bio}</p>
                )}
              </div>

              {/* Member Since */}
              <div className="p-6 bg-foreground/5 rounded-2xl">
                <h3 className="text-sm font-medium mb-2">Member Since</h3>
                <p className="text-foreground/80">
                  {new Date(currentUser.joinedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          )}

          {activeSection === "account" && (
            <div className="max-w-2xl space-y-6">
              <h2 className="text-2xl font-bold">Account Settings</h2>

              <div className="p-6 bg-foreground/5 rounded-2xl space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="email"
                      value={currentUser.email}
                      disabled
                      className="flex-1 px-3 py-2 bg-foreground/10 border border-foreground/20 rounded-lg text-foreground/60 cursor-not-allowed"
                    />
                    <button className="px-4 py-2 bg-kafuffle/10 text-kafuffle hover:bg-kafuffle/20 rounded-lg transition-colors">
                      Change
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Password
                  </label>
                  <button className="flex items-center gap-2 px-4 py-2 bg-kafuffle/10 text-kafuffle hover:bg-kafuffle/20 rounded-lg transition-colors">
                    <IconKey size={16} />
                    Change Password
                  </button>
                </div>
              </div>

              <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl">
                <h3 className="text-lg font-semibold text-red-500 mb-2">
                  Danger Zone
                </h3>
                <p className="text-sm text-foreground/70 mb-4">
                  Once you delete your account, there is no going back. Please
                  be certain.
                </p>
                <button className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="max-w-2xl space-y-6">
              <h2 className="text-2xl font-bold">Notification Settings</h2>

              <div className="p-6 bg-foreground/5 rounded-2xl">
                <h3 className="text-lg font-semibold mb-4">
                  General Notifications
                </h3>
                <div className="space-y-1">
                  <SettingToggle
                    label="Enable Notifications"
                    description="Receive notifications for messages and mentions"
                    checked={settings.notifications}
                    onChange={(checked) =>
                      handleSettingChange("notifications", checked)
                    }
                  />
                  <SettingToggle
                    label="Show Status"
                    description="Let others see when you're online"
                    checked={settings.showStatus}
                    onChange={(checked) =>
                      handleSettingChange("showStatus", checked)
                    }
                  />
                  <SettingToggle
                    label="Allow Direct Messages"
                    description="Allow other users to send you direct messages"
                    checked={settings.allowDirectMessages}
                    onChange={(checked) =>
                      handleSettingChange("allowDirectMessages", checked)
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === "privacy" && (
            <div className="max-w-2xl space-y-6">
              <h2 className="text-2xl font-bold">Privacy & Safety</h2>

              <div className="p-6 bg-foreground/5 rounded-2xl">
                <h3 className="text-lg font-semibold mb-4">Privacy Controls</h3>
                <p className="text-foreground/70 mb-4">
                  Control who can interact with you and see your activity.
                </p>
                <button className="px-4 py-2 bg-kafuffle/10 text-kafuffle hover:bg-kafuffle/20 rounded-lg transition-colors">
                  Manage Blocked Users
                </button>
              </div>
            </div>
          )}

          {activeSection === "appearance" && (
            <div className="max-w-2xl space-y-6">
              <h2 className="text-2xl font-bold">Appearance</h2>

              <div className="p-6 bg-foreground/5 rounded-2xl">
                <h3 className="text-lg font-semibold mb-4">Theme</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-4 bg-background hover:bg-foreground/5 border border-foreground/20 rounded-lg transition-colors">
                    <span>Light Theme</span>
                    <div className="w-4 h-4 border border-foreground/30 rounded-full"></div>
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-background hover:bg-foreground/5 border-2 border-kafuffle rounded-lg transition-colors">
                    <span>Dark Theme</span>
                    <div className="w-4 h-4 bg-kafuffle rounded-full"></div>
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-background hover:bg-foreground/5 border border-foreground/20 rounded-lg transition-colors">
                    <span>System</span>
                    <div className="w-4 h-4 border border-foreground/30 rounded-full"></div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
