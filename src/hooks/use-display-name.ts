// /hooks/use-display-name.ts
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

/**
 * Hook to get display name for a user in a specific space context
 * Uses the database function get_display_name which handles the hierarchy automatically
 */
export function useDisplayName(userId: string, spaceId?: string) {
  const [displayName, setDisplayName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setDisplayName("");
      setLoading(false);
      return;
    }

    const fetchDisplayName = async () => {
      try {
        const supabase = createClient();

        if (spaceId) {
          // Use the database function that handles the hierarchy
          const { data, error } = await supabase.rpc("get_display_name", {
            p_user_id: userId,
            p_space_id: spaceId,
          });

          if (error) {
            console.error("Error fetching display name:", error);
            // Fallback to username only
            const { data: profile } = await supabase
              .from("profiles")
              .select("username")
              .eq("id", userId)
              .single();

            setDisplayName(profile?.username || "Unknown User");
          } else {
            setDisplayName(data || "Unknown User");
          }
        } else {
          // No space context, just get profile display name or username
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("display_name, username")
            .eq("id", userId)
            .single();

          if (error) {
            console.error("Error fetching profile:", error);
            setDisplayName("Unknown User");
          } else {
            setDisplayName(
              profile?.display_name || profile?.username || "Unknown User",
            );
          }
        }
      } catch (error) {
        console.error("Error in useDisplayName:", error);
        setDisplayName("Unknown User");
      } finally {
        setLoading(false);
      }
    };

    fetchDisplayName();
  }, [userId, spaceId]);

  return { displayName, loading };
}

/**
 * Hook to get multiple display names at once (for performance)
 */
export function useDisplayNames(userIds: string[], spaceId?: string) {
  const [displayNames, setDisplayNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userIds.length) {
      setDisplayNames({});
      setLoading(false);
      return;
    }

    const fetchDisplayNames = async () => {
      try {
        const supabase = createClient();
        const names: Record<string, string> = {};

        if (spaceId) {
          // Get space-specific display names first
          const { data: spaceDisplayNames } = await supabase
            .from("display_names")
            .select("user_id, display_name")
            .eq("space_id", spaceId)
            .in("user_id", userIds);

          // Create a map of space-specific names
          const spaceNameMap: Record<string, string> = {};
          spaceDisplayNames?.forEach((item) => {
            spaceNameMap[item.user_id] = item.display_name;
          });

          // Get profiles for all users
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, display_name, username")
            .in("id", userIds);

          // Apply hierarchy: space-specific > global display > username
          profiles?.forEach((profile) => {
            names[profile.id] =
              spaceNameMap[profile.id] ||
              profile.display_name ||
              profile.username ||
              "Unknown User";
          });
        } else {
          // No space context, just get profile display names
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, display_name, username")
            .in("id", userIds);

          profiles?.forEach((profile) => {
            names[profile.id] =
              profile.display_name || profile.username || "Unknown User";
          });
        }

        setDisplayNames(names);
      } catch (error) {
        console.error("Error in useDisplayNames:", error);
        // Fallback
        const fallbackNames: Record<string, string> = {};
        userIds.forEach((id) => {
          fallbackNames[id] = "Unknown User";
        });
        setDisplayNames(fallbackNames);
      } finally {
        setLoading(false);
      }
    };

    fetchDisplayNames();
  }, [userIds, spaceId]);

  return { displayNames, loading };
}

/**
 * Hook to get user profile information with proper privacy handling
 */
export function useUserProfile(targetUserId: string) {
  const [profile, setProfile] = useState<{
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    space_display_names: Array<{
      space_id: string;
      space_name: string;
      display_name: string;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!targetUserId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const supabase = createClient();

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setProfile(null);
          setLoading(false);
          return;
        }

        // Get basic profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("username, display_name, avatar_url, bio")
          .eq("id", targetUserId)
          .single();

        if (!profileData) {
          setProfile(null);
          setLoading(false);
          return;
        }

        // Get current user's spaces
        const { data: currentUserSpaces } = await supabase
          .from("space_members")
          .select("space_id")
          .eq("user_id", user.id);

        // Get target user's spaces
        const { data: targetUserSpaces } = await supabase
          .from("space_members")
          .select("space_id")
          .eq("user_id", targetUserId);

        const currentSpaceIds = currentUserSpaces?.map((s) => s.space_id) || [];
        const targetSpaceIds = targetUserSpaces?.map((s) => s.space_id) || [];
        const sharedSpaceIds = currentSpaceIds.filter((id) =>
          targetSpaceIds.includes(id),
        );

        // Get space names and display names for shared spaces only
        const spaceDisplayNames: {
          space_id: any;
          space_name: any;
          display_name: any;
        }[] = [];
        if (sharedSpaceIds.length > 0) {
          const { data: spaces } = await supabase
            .from("spaces")
            .select("id, name")
            .in("id", sharedSpaceIds);

          const { data: displayNames } = await supabase
            .from("display_names")
            .select("space_id, display_name")
            .eq("user_id", targetUserId)
            .in("space_id", sharedSpaceIds);

          displayNames?.forEach((dn) => {
            const space = spaces?.find((s) => s.id === dn.space_id);
            if (space) {
              spaceDisplayNames.push({
                space_id: dn.space_id,
                space_name: space.name || "Unnamed Space",
                display_name: dn.display_name,
              });
            }
          });
        }

        setProfile({
          username: profileData.username,
          display_name: profileData.display_name,
          avatar_url: profileData.avatar_url,
          bio: profileData.bio,
          space_display_names: spaceDisplayNames,
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [targetUserId]);

  return { profile, loading };
}
