// /components/modals/user-search-modal.tsx
"use client";

import { useState, useEffect, useCallback } from "react";

import {
  IconX,
  IconSearch,
  IconUserPlus,
  IconCheck,
} from "@tabler/icons-react";

import { debounce } from "@/utils/general/debounce";
import { createClient } from "@/utils/supabase/client";

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceId: string;
  onUserAdded?: () => void;
}

interface UserResult {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  is_member: boolean;
}

export default function UserSearchModal({
  isOpen,
  onClose,
  spaceId,
  onUserAdded,
}: UserSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingUserId, setAddingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Search for users by username or display name
      const { data: users, error: searchError } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .or(`username.ilike.%${term}%,display_name.ilike.%${term}%`)
        .limit(10);

      if (searchError) throw searchError;

      // Check which users are already members
      const { data: members } = await supabase
        .from("space_members")
        .select("user_id")
        .eq("space_id", spaceId)
        .in("user_id", users?.map((u) => u.id) || []);

      const memberIds = new Set(members?.map((m) => m.user_id) || []);

      const results: UserResult[] = (users || []).map((user) => ({
        ...user,
        is_member: memberIds.has(user.id),
      }));

      setSearchResults(results);
    } catch (error: any) {
      console.error("Failed to search users:", error);
      setError("Failed to search users");
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((term: string) => searchUsers(term), 300),
    [spaceId],
  );

  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, debouncedSearch]);

  const addUserToSpace = async (userId: string) => {
    setAddingUserId(userId);
    setError(null);

    try {
      const supabase = createClient();

      // Add user as space member
      const { error: memberError } = await supabase
        .from("space_members")
        .insert({
          space_id: spaceId,
          user_id: userId,
          role: "member",
          joined_at: new Date().toISOString(),
        });

      if (memberError) throw memberError;

      // Update the search results to reflect the new member
      setSearchResults((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, is_member: true } : user,
        ),
      );

      // Notify parent component
      onUserAdded?.();

      // Create a system message in the general zone
      const { data: zones } = await supabase
        .from("zones")
        .select("id")
        .eq("space_id", spaceId)
        .eq("name", "general")
        .limit(1);

      if (zones && zones.length > 0) {
        const { data: newMember } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", userId)
          .single();

        await supabase.from("messages").insert({
          content: `${newMember?.username || "A user"} joined the space`,
          sender_id: userId,
          sender_username: "system",
          space_id: spaceId,
          zone_id: zones[0].id,
          message_type: "system",
        });
      }
    } catch (error: any) {
      console.error("Failed to add user to space:", error);
      setError("Failed to add user to space");
    } finally {
      setAddingUserId(null);
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

  const handleClose = () => {
    setSearchTerm("");
    setSearchResults([]);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            Add Members
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 pb-3">
          <div className="relative">
            <IconSearch
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by username..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-500 focus:ring-2 focus:ring-kafuffle-primary focus:border-transparent"
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>

        {/* Search Results */}
        <div className="px-6 pb-6 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-neutral-300 border-t-kafuffle-primary rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-neutral-500 mt-2">Searching...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              {searchTerm
                ? "No users found"
                : "Start typing to search for users"}
            </div>
          ) : (
            <div className="space-y-2">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.username}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-kafuffle-primary rounded-full flex items-center justify-center text-white font-semibold">
                        {getAvatarInitials(user.display_name || user.username)}
                      </div>
                    )}

                    {/* User Info */}
                    <div>
                      <div className="font-medium text-neutral-900 dark:text-white">
                        {user.display_name || user.username}
                      </div>
                      <div className="text-sm text-neutral-500">
                        @{user.username}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  {user.is_member ? (
                    <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                      <IconCheck size={16} />
                      Member
                    </div>
                  ) : (
                    <button
                      onClick={() => addUserToSpace(user.id)}
                      disabled={addingUserId === user.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-kafuffle-primary text-white text-sm rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
                    >
                      {addingUserId === user.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <IconUserPlus size={16} />
                          Add
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
