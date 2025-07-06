// /components/spaces/spaces-list.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  IconPlus,
  IconUsers,
  IconClock,
  IconAlertCircle,
  IconChevronRight,
  IconHash,
  IconLock,
  IconWorld,
  IconDots,
} from "@tabler/icons-react";

interface Space {
  id: string;
  name: string | null;
  description: string | null;
  created_by: string;
  created_at: string | null;
  member_count: number | null;
  last_activity_at: string | null;
  is_public: boolean | null;
  avatar_url: string | null;
}

interface SpacesListProps {
  onSelectSpace: (spaceId: string | null) => void;
}

export default function SpacesList({ onSelectSpace }: SpacesListProps) {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadSpaces();
  }, []);

  const loadSpaces = async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();

      // Get current user
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) {
        console.error("Auth error:", userError);
        throw new Error(`Authentication failed: ${userError.message}`);
      }

      if (!currentUser) {
        throw new Error("No authenticated user found");
      }

      setUser(currentUser);
      console.log("Loading spaces for user:", currentUser.email);

      // Try the complex query first
      const { data: membershipData, error: membershipError } = await supabase
        .from("space_members")
        .select(
          `
          space_id,
          spaces!inner(
            id,
            name,
            description,
            created_by,
            created_at,
            member_count,
            last_activity_at,
            is_public,
            archived_at,
            avatar_url
          )
        `,
        )
        .eq("user_id", currentUser.id);

      if (membershipError) {
        console.error("Membership query error:", membershipError);

        // Fallback: try a simpler approach
        console.log("Trying fallback query...");

        const { data: memberIds, error: memberIdsError } = await supabase
          .from("space_members")
          .select("space_id")
          .eq("user_id", currentUser.id);

        if (memberIdsError) {
          throw new Error(
            `Failed to get memberships: ${memberIdsError.message}`,
          );
        }

        if (!memberIds || memberIds.length === 0) {
          console.log("User has no space memberships");
          setSpaces([]);
          return;
        }

        const spaceIds = memberIds.map((m) => m.space_id);
        const { data: spacesData, error: spacesError } = await supabase
          .from("spaces")
          .select("*")
          .in("id", spaceIds)
          .is("archived_at", null);

        if (spacesError) {
          throw new Error(`Failed to get spaces: ${spacesError.message}`);
        }

        setSpaces(spacesData || []);
        return;
      }

      // Process the successful complex query
      const spacesData =
        membershipData
          ?.map((membership: any) => membership.spaces)
          .filter((space: any) => space && !space.archived_at) || [];

      console.log("Loaded spaces:", spacesData);
      setSpaces(spacesData);
    } catch (error: any) {
      console.error("Failed to load spaces:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createNewSpace = async () => {
    try {
      const response = await fetch("/api/spaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "New Space",
          description: "A fresh space for collaboration",
        }),
      });

      const result = await response.json();

      if (result.success) {
        await loadSpaces();
        onSelectSpace(result.space.id);
      } else {
        console.error("Failed to create space:", result.error);
        setError(`Failed to create space: ${result.error}`);
      }
    } catch (error: any) {
      console.error("Error creating space:", error);
      setError(`Error creating space: ${error.message}`);
    }
  };

  const formatLastActivity = (dateString: string | null) => {
    if (!dateString) return "No recent activity";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString();
  };

  const getSpaceInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getSpaceAvatar = (space: Space) => {
    if (space.avatar_url) {
      return (
        <img
          src={space.avatar_url}
          alt={space.name || "Space"}
          className="w-12 h-12 rounded-xl object-cover"
        />
      );
    }

    return (
      <div className="w-12 h-12 rounded-xl bg-kafuffle-primary flex items-center justify-center text-white font-bold text-sm">
        {getSpaceInitials(space.name)}
      </div>
    );
  };

  return (
    <div className="flex-grow bg-neutral-50 dark:bg-neutral-800/80 rounded-4xl h-full flex flex-col">
      {/* Header */}
      <header className="p-6 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              Your Spaces
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
              {user?.email && `Welcome back, ${user.email.split("@")[0]}`}
            </p>
          </div>
          <button
            onClick={createNewSpace}
            className="flex items-center gap-2 px-4 py-2 bg-kafuffle-primary text-white rounded-lg hover:opacity-80 transition-opacity"
          >
            <IconPlus size={18} />
            New Space
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2 text-neutral-500">
              <div className="w-5 h-5 border-2 border-neutral-300 border-t-kafuffle-primary rounded-full animate-spin"></div>
              Loading your spaces...
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full p-6">
            <div className="text-center max-w-md">
              <IconAlertCircle
                size={48}
                className="text-red-500 mx-auto mb-4"
              />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-50 mb-2">
                Something went wrong
              </h3>
              <p className="text-red-500 mb-4 text-sm">{error}</p>
              <div className="space-y-2">
                <button
                  onClick={loadSpaces}
                  className="block w-full px-4 py-2 bg-kafuffle-primary text-white rounded-lg hover:opacity-80 transition-opacity"
                >
                  Try Again
                </button>
                <button
                  onClick={createNewSpace}
                  className="block w-full px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                >
                  Create Your First Space
                </button>
              </div>
            </div>
          </div>
        ) : spaces.length === 0 ? (
          <div className="flex items-center justify-center h-full p-6">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-kafuffle-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconUsers size={32} className="text-kafuffle-primary" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-50 mb-2">
                No spaces yet
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                Create your first space to start collaborating with your team.
              </p>
              <button
                onClick={createNewSpace}
                className="px-6 py-3 bg-kafuffle-primary text-white rounded-lg hover:opacity-80 transition-opacity font-medium"
              >
                Create Your First Space
              </button>
            </div>
          </div>
        ) : (
          <div className={`overflow-y-auto h-full`}>
            <div className="space-y-1">
              {spaces.map((space) => (
                <div
                  key={space.id}
                  onClick={() => onSelectSpace(space.id)}
                  className="group flex items-center gap-4 p-4 rounded-xl hover:bg-white dark:hover:bg-neutral-900 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 transition-all cursor-pointer"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">{getSpaceAvatar(space)}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 group-hover:text-kafuffle-primary transition-colors truncate">
                        {space.name || "Unnamed Space"}
                      </h3>
                      <div className="flex items-center gap-1">
                        {space.is_public ? (
                          <IconWorld
                            size={16}
                            className="text-green-500"
                            title="Public space"
                          />
                        ) : (
                          <IconLock
                            size={16}
                            className="text-neutral-400"
                            title="Private space"
                          />
                        )}
                      </div>
                    </div>

                    {space.description && (
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-2 line-clamp-1">
                        {space.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                      <div className="flex items-center gap-1">
                        <IconUsers size={14} />
                        <span>
                          {space.member_count || 0}{" "}
                          {space.member_count === 1 ? "member" : "members"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IconClock size={14} />
                        <span>
                          {formatLastActivity(space.last_activity_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Add space menu/options
                        console.log("Space options for:", space.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-all"
                    >
                      <IconDots size={16} className="text-neutral-500" />
                    </button>
                    <IconChevronRight
                      size={20}
                      className="text-neutral-400 group-hover:text-kafuffle-primary transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
