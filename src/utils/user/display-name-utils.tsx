// /utils/user/display-name-utils.ts
import { createClient } from "@/utils/supabase/client";

/**
 * Generate a random username for new users
 */
export function generateRandomUsername(): string {
  const adjectives = [
    "Noble",
    "Valiant",
    "Chivalrous",
    "Legendary",
    "Heroic",
    "Gallant",
    "Majestic",
    "Divine",
    "Immortal",
    "Mighty",
    "Courageous",
    "Righteous",
    "Sacred",
    "Enchanted",
    "Mystical",
    "Epic",
    "Glorious",
    "Honorable",
    "Virtuous",
    "Fearless",
    "Loyal",
    "Steadfast",
    "Radiant",
    "Celestial",
    "Fabled",
    "Mythical",
    "Resplendent",
    "Triumphant",
    "Invincible",
    "Blessed",
    "Ethereal",
    "Magnificent",
    "Sovereign",
    "Dauntless",
    "Illustrious",
    "Stalwart",
    "Venerable",
    "Luminous",
    "Indomitable",
    "Pristine",
    "Hallowed",
    "Transcendent",
    "Regal",
    "Omnipotent",
    "Incorruptible",
    "Timeless",
    "Exalted",
    "Boundless",
    "Sublime",
    "Immaculate",
  ];

  const nouns = [
    "panda",
    "eagle",
    "lion",
    "wolf",
    "bear",
    "fox",
    "deer",
    "owl",
    "star",
    "moon",
    "sun",
    "wave",
    "tree",
    "rock",
    "wind",
    "fire",
    "falcon",
    "raven",
    "phoenix",
    "dragon",
    "unicorn",
    "tiger",
    "whale",
    "dolphin",
  ];

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 9999) + 1000; // 4 digit number

  return `${adjective}_${noun}_${number}`;
}

/**
 * Generate a safe fallback username that doesn't expose user data
 */
export function generateSafeFallbackUsername(): string {
  const randomPart = Math.random().toString(36).substring(2, 8); // Random 6 chars
  const timestamp = Date.now().toString().slice(-4); // Last 4 digits of timestamp
  return `user_${randomPart}_${timestamp}`;
}

/**
 * Create a profile for a new user with random username
 */
export async function createUserProfile(userId: string, email: string) {
  const supabase = createClient();

  let username = generateRandomUsername();
  let attempts = 0;
  const maxAttempts = 10;

  // Ensure username is unique
  while (attempts < maxAttempts) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single();

    if (!existing) break; // Username is available

    username = generateRandomUsername();
    attempts++;
  }

  // Safe fallback that doesn't expose user data
  if (attempts >= maxAttempts) {
    username = generateSafeFallbackUsername();
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      username,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create profile:", error);
    throw error;
  }

  return data;
}

/**
 * Get display name for a user in a specific space context
 * Uses the hierarchy: space-specific name > global display name > username
 */
export async function getDisplayName(
  userId: string,
  spaceId?: string,
): Promise<string> {
  const supabase = createClient();

  try {
    // If we have a space context, check for space-specific display name first
    if (spaceId) {
      const { data: spaceDisplayName } = await supabase
        .from("display_names")
        .select("display_name")
        .eq("user_id", userId)
        .eq("space_id", spaceId)
        .single();

      if (spaceDisplayName?.display_name) {
        return spaceDisplayName.display_name;
      }
    }

    // Fallback to profile display name or username
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, username")
      .eq("id", userId)
      .single();

    if (!profile) {
      return "Unknown User";
    }

    return profile.display_name || profile.username;
  } catch (error) {
    console.error("Failed to get display name:", error);
    return "Unknown User";
  }
}

/**
 * Get user profile with privacy-aware display names
 * Shows space-specific names only for shared spaces
 */
export async function getUserProfileWithDisplayNames(
  targetUserId: string,
  currentUserId: string,
): Promise<{
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  space_display_names: Array<{
    space_id: string;
    space_name: string;
    display_name: string;
  }>;
} | null> {
  const supabase = createClient();

  try {
    // Get basic profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username, display_name, avatar_url, bio")
      .eq("id", targetUserId)
      .single();

    if (profileError || !profile) {
      return null;
    }

    // Get current user's spaces
    const { data: currentUserSpaces } = await supabase
      .from("space_members")
      .select("space_id")
      .eq("user_id", currentUserId);

    // Get target user's spaces
    const { data: targetUserSpaces } = await supabase
      .from("space_members")
      .select("space_id")
      .eq("user_id", targetUserId);

    if (!currentUserSpaces || !targetUserSpaces) {
      return {
        username: profile.username,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        space_display_names: [],
      };
    }

    // Find shared spaces (intersection)
    const currentUserSpaceIds = currentUserSpaces.map((s) => s.space_id);
    const targetUserSpaceIds = targetUserSpaces.map((s) => s.space_id);
    const sharedSpaceIds = currentUserSpaceIds.filter((id) =>
      targetUserSpaceIds.includes(id),
    );

    const spaceDisplayNames = [];

    if (sharedSpaceIds.length > 0) {
      // Get space names for shared spaces
      const { data: spaces } = await supabase
        .from("spaces")
        .select("id, name")
        .in("id", sharedSpaceIds);

      // Get space-specific display names for shared spaces only
      const { data: displayNames } = await supabase
        .from("display_names")
        .select("space_id, display_name")
        .eq("user_id", targetUserId)
        .in("space_id", sharedSpaceIds);

      for (const displayName of displayNames || []) {
        const space = spaces?.find((s) => s.id === displayName.space_id);
        if (space?.name) {
          spaceDisplayNames.push({
            space_id: displayName.space_id,
            space_name: space.name,
            display_name: displayName.display_name,
          });
        }
      }
    }

    return {
      username: profile.username,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      space_display_names: spaceDisplayNames,
    };
  } catch (error) {
    console.error("Failed to get user profile:", error);
    return null;
  }
}

/**
 * Set space-specific display name for current user
 */
export async function setSpaceDisplayName(
  spaceId: string,
  displayName: string,
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase.from("display_names").upsert({
    user_id: user.id,
    space_id: spaceId,
    display_name: displayName,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw error;
  }
}

/**
 * Remove space-specific display name (revert to global/username)
 */
export async function removeSpaceDisplayName(spaceId: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase
    .from("display_names")
    .delete()
    .eq("user_id", user.id)
    .eq("space_id", spaceId);

  if (error) {
    throw error;
  }
}
