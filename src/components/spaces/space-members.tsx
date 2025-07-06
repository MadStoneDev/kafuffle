// /components/spaces/space-members.tsx
"use client";

import { useState, useEffect } from "react";
import {
  IconCrown,
  IconShield,
  IconGavel,
  IconUser,
  IconUserPlus,
  IconDotsVertical,
  IconBan,
  IconUserX,
} from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/client";
import UserSearchModal from "@/components/modals/user-search-modal";

interface SpaceMembersProps {
  spaceId: string;
  onClose?: () => void;
}

interface Member {
  id: string;
  user_id: string;
  role: "owner" | "admin" | "moderator" | "member";
  joined_at: string;
  profile: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    status: "online" | "away" | "busy" | "offline" | null;
  };
}

const ROLE_ICONS = {
  owner: { icon: IconCrown, color: "text-yellow-500" },
  admin: { icon: IconShield, color: "text-blue-500" },
  moderator: { icon: IconGavel, color: "text-purple-500" },
  member: { icon: IconUser, color: "text-neutral-500" },
};

const ROLE_LABELS = {
  owner: "Owner",
  admin: "Admin",
  moderator: "Moderator",
  member: "Member",
};

export default function SpaceMembers({ spaceId, onClose }: SpaceMembersProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] =
    useState<Member["role"]>("member");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  useEffect(() => {
    loadMembers();
    getCurrentUser();
  }, [spaceId]);

  const getCurrentUser = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadMembers = async () => {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("space_members")
        .select(
          `
          *,
          profile:profiles!user_id(
            username,
            display_name,
            avatar_url,
            status
          )
        `,
        )
        .eq("space_id", spaceId)
        .order("joined_at", { ascending: true });

      if (error) throw error;

      const membersData = data as Member[];
      setMembers(membersData);

      // Find current user's role
      const currentMember = membersData.find(
        (m) => m.user_id === currentUserId,
      );
      if (currentMember) {
        setCurrentUserRole(currentMember.role);
      }
    } catch (error) {
      console.error("Failed to load members:", error);
    } finally {
      setLoading(false);
    }
  };

  const canManageRole = (targetRole: Member["role"]) => {
    const roleHierarchy = { owner: 4, admin: 3, moderator: 2, member: 1 };
    return roleHierarchy[currentUserRole] > roleHierarchy[targetRole];
  };

  const updateMemberRole = async (
    memberId: string,
    newRole: Member["role"],
  ) => {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("space_members")
        .update({ role: newRole })
        .eq("id", memberId);

      if (error) throw error;

      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)),
      );
    } catch (error) {
      console.error("Failed to update role:", error);
      alert("Failed to update member role");
    }
  };

  const removeMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("space_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (error) {
      console.error("Failed to remove member:", error);
      alert("Failed to remove member");
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

  const getStatusColor = (status: string | null) => {
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
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-neutral-200 dark:bg-neutral-700 rounded-lg"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Members
            </h2>
            <p className="text-sm text-neutral-500">
              {members.length} member{members.length !== 1 ? "s" : ""}
            </p>
          </div>

          {["owner", "admin"].includes(currentUserRole) && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-kafuffle-primary text-white rounded-lg hover:opacity-80 transition-opacity"
            >
              <IconUserPlus size={16} />
              Add Members
            </button>
          )}
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-2">
            {members.map((member) => {
              const RoleIcon = ROLE_ICONS[member.role].icon;
              const isCurrentUser = member.user_id === currentUserId;

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar with status */}
                    <div className="relative">
                      {member.profile.avatar_url ? (
                        <img
                          src={member.profile.avatar_url}
                          alt={member.profile.username}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-kafuffle-primary rounded-full flex items-center justify-center text-white font-semibold">
                          {getAvatarInitials(
                            member.profile.display_name ||
                              member.profile.username,
                          )}
                        </div>
                      )}
                      <div
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-neutral-900 ${getStatusColor(member.profile.status)}`}
                      />
                    </div>

                    {/* User info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-neutral-900 dark:text-white">
                          {member.profile.display_name ||
                            member.profile.username}
                        </span>
                        {isCurrentUser && (
                          <span className="text-xs bg-neutral-200 dark:bg-neutral-700 px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <span>@{member.profile.username}</span>
                        <span>•</span>
                        <span>
                          Joined{" "}
                          {new Date(member.joined_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Role and actions */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center gap-1 ${ROLE_ICONS[member.role].color}`}
                    >
                      <RoleIcon size={16} />
                      <span className="text-sm font-medium">
                        {ROLE_LABELS[member.role]}
                      </span>
                    </div>

                    {!isCurrentUser && canManageRole(member.role) && (
                      <div className="relative">
                        <button
                          onClick={() =>
                            setShowActionMenu(
                              showActionMenu === member.id ? null : member.id,
                            )
                          }
                          className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
                        >
                          <IconDotsVertical size={16} />
                        </button>

                        {showActionMenu === member.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 z-10">
                            {/* Role options */}
                            {member.role !== "owner" && (
                              <>
                                <div className="px-3 py-1 text-xs font-medium text-neutral-500 uppercase">
                                  Change Role
                                </div>
                                {(
                                  ["admin", "moderator", "member"] as const
                                ).map((role) => {
                                  if (role === member.role) return null;
                                  const Icon = ROLE_ICONS[role].icon;
                                  return (
                                    <button
                                      key={role}
                                      onClick={() => {
                                        updateMemberRole(member.id, role);
                                        setShowActionMenu(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-sm"
                                    >
                                      <Icon
                                        size={16}
                                        className={ROLE_ICONS[role].color}
                                      />
                                      {ROLE_LABELS[role]}
                                    </button>
                                  );
                                })}
                                <div className="border-t border-neutral-200 dark:border-neutral-700 my-1" />
                              </>
                            )}

                            <button
                              onClick={() => {
                                removeMember(member.id);
                                setShowActionMenu(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 text-sm"
                            >
                              <IconUserX size={16} />
                              Remove from Space
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Members Modal */}
      <UserSearchModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        spaceId={spaceId}
        onUserAdded={() => {
          loadMembers();
          setShowAddModal(false);
        }}
      />
    </>
  );
}
