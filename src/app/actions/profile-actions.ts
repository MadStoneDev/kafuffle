// /app/actions/profile-actions.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { createUserProfile } from "@/utils/user/display-name-utils";

export async function ensureUserProfile() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (existingProfile) {
      return { success: true, profile: existingProfile };
    }

    // Create profile if it doesn't exist
    const newProfile = await createUserProfile(user.id, user.email || "");
    return { success: true, profile: newProfile };
  } catch (error: any) {
    console.error("Failed to ensure user profile:", error);
    return {
      success: false,
      error: error.message || "Failed to create profile",
    };
  }
}

export async function updateProfile(
  username: string, // Required, not nullable
  displayName: string | null,
  bio: string | null,
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Validate username (required)
    if (!username || username.trim().length === 0) {
      return { success: false, error: "Username is required" };
    }

    if (username.length < 3) {
      return {
        success: false,
        error: "Username must be at least 3 characters",
      };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return {
        success: false,
        error:
          "Username can only contain letters, numbers, underscores, and dashes",
      };
    }

    // Check if username is already taken (if different from current)
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    if (existingProfile?.username !== username) {
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .single();

      if (existingUser) {
        return { success: false, error: "Username is already taken" };
      }
    }

    // Validate display name length
    if (displayName && displayName.length > 50) {
      return {
        success: false,
        error: "Display name must be 50 characters or less",
      };
    }

    // Validate bio length
    if (bio && bio.length > 200) {
      return { success: false, error: "Bio must be 200 characters or less" };
    }

    // Update or insert profile
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      username: username, // Required field
      display_name: displayName || null,
      bio: bio || null,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Profile update error:", error);
      return { success: false, error: "Failed to update profile" };
    }

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Profile update error:", error);
    return {
      success: false,
      error: error.message || "Failed to update profile",
    };
  }
}

export async function uploadAvatar(file: File) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Validate file
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "File must be an image" };
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      return { success: false, error: "File size must be less than 5MB" };
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("user-content")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Avatar upload error:", uploadError);
      return { success: false, error: "Failed to upload avatar" };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("user-content").getPublicUrl(filePath);

    // Update profile with new avatar URL
    const { error: updateError } = await supabase.from("profiles").upsert({
      id: user.id,
      avatar_url: publicUrl,
      updated_at: new Date().toISOString(),
    });

    if (updateError) {
      console.error("Profile avatar update error:", updateError);
      return {
        success: false,
        error: "Failed to update profile with new avatar",
      };
    }

    revalidatePath("/");
    return { success: true, avatarUrl: publicUrl };
  } catch (error: any) {
    console.error("Avatar upload error:", error);
    return {
      success: false,
      error: error.message || "Failed to upload avatar",
    };
  }
}

export async function checkUsernameAvailable(username: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { available: false, error: "Not authenticated" };
    }

    // Basic validation
    if (!username || username.length < 3) {
      return {
        available: false,
        error: "Username must be at least 3 characters",
      };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return {
        available: false,
        error:
          "Username can only contain letters, numbers, underscores, and dashes",
      };
    }

    // Check if username exists (excluding current user)
    const { data: existingUser, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .neq("id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned"
      console.error("Username check error:", error);
      return {
        available: false,
        error: "Failed to check username availability",
      };
    }

    const available = !existingUser;
    return { available };
  } catch (error: any) {
    console.error("Username check error:", error);
    return {
      available: false,
      error: error.message || "Failed to check username availability",
    };
  }
}

export async function deleteAvatar() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Get current avatar URL to delete from storage
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();

    // Remove avatar URL from profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Profile avatar removal error:", updateError);
      return { success: false, error: "Failed to remove avatar from profile" };
    }

    // Delete file from storage if it exists and is from our storage
    if (profile?.avatar_url && profile.avatar_url.includes("supabase")) {
      try {
        const urlParts = profile.avatar_url.split("/");
        const filePath = urlParts.slice(-2).join("/"); // Get "avatars/filename.ext"

        await supabase.storage.from("user-content").remove([filePath]);
      } catch (storageError) {
        console.warn(
          "Failed to delete avatar file from storage:",
          storageError,
        );
        // Don't fail the whole operation if storage cleanup fails
      }
    }

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Avatar deletion error:", error);
    return {
      success: false,
      error: error.message || "Failed to delete avatar",
    };
  }
}
