// /app/actions/profile-actions.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import {
  createUserProfile,
  generateSafeFallbackUsername,
} from "@/utils/user/display-name-utils";

export async function ensureUserProfile() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) {
      console.error("Auth error:", userError);
      return { success: false, error: "Authentication failed" };
    }

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    console.log("Checking profile for user:", user.id);

    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle(); // Use maybeSingle() instead of single() to avoid errors when no record exists

    if (fetchError) {
      console.error("Error fetching profile:", fetchError);
      // Continue to try creating profile even if fetch failed
    }

    if (existingProfile) {
      console.log("Profile exists:", existingProfile);
      return { success: true, profile: existingProfile };
    }

    console.log("Profile doesn't exist, creating new profile...");

    // Create profile if it doesn't exist
    try {
      const newProfile = await createUserProfile(user.id, user.email || "");
      console.log("Profile created successfully:", newProfile);
      return { success: true, profile: newProfile };
    } catch (createError) {
      console.error("Failed to create profile:", createError);

      // Try a simpler direct insert as fallback
      console.log("Trying direct insert as fallback...");

      // Generate a safe random fallback username (no user ID exposure!)
      const randomPart = Math.random().toString(36).substring(2, 8);
      const timestamp = Date.now().toString().slice(-4);
      const fallbackUsername = `user_${randomPart}_${timestamp}`;

      const { data: fallbackProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          username: fallbackUsername,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error("Fallback insert failed:", insertError);
        return {
          success: false,
          error: `Profile creation failed: ${insertError.message}`,
        };
      }

      console.log("Fallback profile created:", fallbackProfile);
      return { success: true, profile: fallbackProfile };
    }
  } catch (error: any) {
    console.error("Unexpected error in ensureUserProfile:", error);
    return {
      success: false,
      error: error.message || "Failed to ensure profile",
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

    console.log("Uploading avatar for user:", user.id);
    console.log("File details:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    // Validate file
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "File must be an image" };
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      return { success: false, error: "File size must be less than 5MB" };
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    console.log("Uploading to path:", filePath);

    // Check if bucket exists first
    const { data: buckets, error: bucketError } =
      await supabase.storage.listBuckets();

    if (bucketError) {
      console.error("Error checking buckets:", bucketError);
      return { success: false, error: "Storage service unavailable" };
    }

    const userContentBucket = buckets?.find((b) => b.id === "user-content");
    if (!userContentBucket) {
      console.error("user-content bucket not found");
      return {
        success: false,
        error: "Storage bucket not configured. Please contact support.",
      };
    }

    console.log("Bucket exists:", userContentBucket);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("user-content")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true, // Allow overwriting existing files
      });

    if (uploadError) {
      console.error("Upload error details:", {
        message: uploadError.message,
        error: uploadError,
      });

      // Provide more specific error messages
      if (uploadError.message?.includes("duplicate")) {
        return {
          success: false,
          error: "File already exists. Please try again.",
        };
      }
      if (uploadError.message?.includes("policy")) {
        return {
          success: false,
          error:
            "Permission denied. Storage policies may need to be configured.",
        };
      }
      if (uploadError.message?.includes("size")) {
        return {
          success: false,
          error: "File too large. Please use a smaller image.",
        };
      }

      return { success: false, error: `Upload failed: ${uploadError.message}` };
    }

    console.log("Upload successful:", uploadData);

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("user-content").getPublicUrl(filePath);

    console.log("Public URL:", publicUrl);

    // Verify the URL is accessible
    if (!publicUrl || !publicUrl.includes("user-content")) {
      return { success: false, error: "Failed to generate public URL" };
    }

    // Update profile with new avatar URL
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Profile update error:", updateError);
      return {
        success: false,
        error: "Failed to update profile with new avatar",
      };
    }

    console.log("Profile updated successfully");

    revalidatePath("/");
    return { success: true, avatarUrl: publicUrl };
  } catch (error: any) {
    console.error("Unexpected avatar upload error:", error);
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
