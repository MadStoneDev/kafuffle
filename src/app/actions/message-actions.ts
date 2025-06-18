// /app/actions/message-actions.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { addMessageToCache, invalidateZoneCache } from "@/utils/cache/redis";

export async function createSpace(name: string, description?: string) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Create space
    const { data: space, error: spaceError } = await supabase
      .from("spaces")
      .insert({
        name,
        description: description || null,
        created_by: user.id,
        is_public: false,
        member_count: 1,
      })
      .select()
      .single();

    if (spaceError) throw spaceError;

    // Add user as space member
    const { error: memberError } = await supabase.from("space_members").insert({
      space_id: space.id,
      user_id: user.id,
      role: "owner",
      joined_at: new Date().toISOString(),
    });

    if (memberError) throw memberError;

    // Create default zones
    const defaultZones = [
      { name: "general", description: "General discussion", zone_type: "chat" },
      {
        name: "random",
        description: "Random conversations",
        zone_type: "chat",
      },
      { name: "tasks", description: "Project tasks", zone_type: "flow" },
    ];

    const { data: zones, error: zonesError } = await supabase
      .from("zones")
      .insert(
        defaultZones.map((zone, index) => ({
          ...zone,
          space_id: space.id,
          created_by: user.id,
          position: index,
        })),
      )
      .select();

    if (zonesError) throw zonesError;

    // Create welcome message
    const { error: messageError } = await supabase.from("messages").insert({
      content: `🎉 Welcome to ${name}! This is your new space for collaboration.`,
      sender_id: user.id,
      sender_username:
        user.user_metadata?.username || user.email?.split("@")[0] || "system",
      space_id: space.id,
      zone_id: zones[0].id,
      message_type: "system",
    });

    if (messageError) throw messageError;

    return { success: true, space, zones };
  } catch (error: any) {
    console.error("Failed to create space:", error);
    return { success: false, error: error.message };
  }
}

export async function createZone(
  spaceId: string,
  name: string,
  description: string,
  zoneType: "chat" | "flow" | "calendar" = "chat",
) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Check if user is a member of the space
    const { data: membership } = await supabase
      .from("space_members")
      .select("role")
      .eq("space_id", spaceId)
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return {
        success: false,
        error: "Not authorized to create zones in this space",
      };
    }

    // Get the next position
    const { data: lastZone } = await supabase
      .from("zones")
      .select("position")
      .eq("space_id", spaceId)
      .order("position", { ascending: false })
      .limit(1)
      .single();

    const position = (lastZone?.position || 0) + 1;

    // Create zone
    const { data: zone, error: zoneError } = await supabase
      .from("zones")
      .insert({
        name,
        description,
        zone_type: zoneType,
        space_id: spaceId,
        created_by: user.id,
        position,
      })
      .select()
      .single();

    if (zoneError) throw zoneError;

    return { success: true, zone };
  } catch (error: any) {
    console.error("Failed to create zone:", error);
    return { success: false, error: error.message };
  }
}

export async function sendMessage(
  spaceId: string,
  zoneId: string,
  content: string,
  messageType: "text" | "system" = "text",
) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Check if user is a member of the space
    const { data: membership } = await supabase
      .from("space_members")
      .select("role")
      .eq("space_id", spaceId)
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return {
        success: false,
        error: "Not authorized to send messages in this space",
      };
    }

    const now = new Date().toISOString();

    // Create message
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        content,
        sender_id: user.id,
        sender_username:
          user.user_metadata?.username ||
          user.email?.split("@")[0] ||
          "unknown",
        space_id: spaceId,
        zone_id: zoneId,
        message_type: messageType,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      })
      .select(
        `
        *,
        profiles:sender_id(username, display_name, avatar_url)
      `,
      )
      .single();

    if (messageError) throw messageError;

    // Update zone's last_message_at and increment message_count
    const { error: updateError } = await supabase
      .from("zones")
      .update({
        last_message_at: now,
        updated_at: now,
      })
      .eq("id", zoneId);

    if (updateError) {
      console.warn("Failed to update zone stats:", updateError);
    }

    // Update space's last_activity_at
    const { error: spaceUpdateError } = await supabase
      .from("spaces")
      .update({
        last_activity_at: now,
        updated_at: now,
      })
      .eq("id", spaceId);

    if (spaceUpdateError) {
      console.warn("Failed to update space activity:", spaceUpdateError);
    }

    // Update cache
    try {
      await addMessageToCache(zoneId, message);
    } catch (cacheError) {
      console.warn("Failed to update cache:", cacheError);
    }

    return { success: true, message };
  } catch (error: any) {
    console.error("Failed to send message:", error);
    return { success: false, error: error.message };
  }
}

export async function editMessage(messageId: string, newContent: string) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // PRIVACY FIRST: Check if user owns the message - ONLY authors can edit
    const { data: message } = await supabase
      .from("messages")
      .select("sender_id, zone_id, deleted_at")
      .eq("id", messageId)
      .single();

    if (!message) {
      return { success: false, error: "Message not found" };
    }

    if (message.deleted_at) {
      return { success: false, error: "Cannot edit deleted messages" };
    }

    if (message.sender_id !== user.id) {
      return { success: false, error: "You can only edit your own messages" };
    }

    // Update message
    const { error: updateError } = await supabase
      .from("messages")
      .update({
        content: newContent,
        updated_at: new Date().toISOString(),
      })
      .eq("id", messageId);

    if (updateError) throw updateError;

    // Invalidate cache
    try {
      await invalidateZoneCache(message.zone_id);
    } catch (cacheError) {
      console.warn("Failed to invalidate cache:", cacheError);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Failed to edit message:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteMessage(messageId: string) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Get message and sender info for permission checking
    const { data: messageData } = await supabase
      .from("messages")
      .select(
        `
        sender_id, 
        zone_id, 
        space_id,
        deleted_at,
        profiles:sender_id(id)
      `,
      )
      .eq("id", messageId)
      .single();

    if (!messageData) {
      return { success: false, error: "Message not found" };
    }

    if (messageData.deleted_at) {
      return { success: false, error: "Message already deleted" };
    }

    // Get current user's role in the space
    const { data: membership } = await supabase
      .from("space_members")
      .select("role")
      .eq("space_id", messageData.space_id)
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return {
        success: false,
        error: "Not authorized to delete messages in this space",
      };
    }

    // Get message author's role
    const { data: authorMembership } = await supabase
      .from("space_members")
      .select("role")
      .eq("space_id", messageData.space_id)
      .eq("user_id", messageData.sender_id)
      .single();

    const currentUserRole = membership.role;
    const messageAuthorRole = authorMembership?.role || "member";

    // Permission checking - Privacy First System
    const canDelete = () => {
      // Always allow deleting own messages
      if (messageData.sender_id === user.id) return true;

      // Role hierarchy for deleting others' messages
      switch (currentUserRole) {
        case "owner":
          return true; // Owner can delete anyone's messages
        case "admin":
          return messageAuthorRole !== "owner"; // Admin can't delete owner's messages
        case "moderator":
          return !["owner", "admin"].includes(messageAuthorRole); // Mod can't delete admin/owner messages
        case "member":
          return false; // Members can only delete own (handled above)
        default:
          return false;
      }
    };

    if (!canDelete()) {
      return { success: false, error: "Not authorized to delete this message" };
    }

    // Soft delete for privacy protection - content becomes inaccessible
    const { error: deleteError } = await supabase
      .from("messages")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", messageId);

    if (deleteError) throw deleteError;

    // Invalidate cache
    try {
      await invalidateZoneCache(messageData.zone_id);
    } catch (cacheError) {
      console.warn("Failed to invalidate cache:", cacheError);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete message:", error);
    return { success: false, error: error.message };
  }
}

export async function initializeUserData() {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Check if user already has spaces
    const { data: existingSpaces } = await supabase
      .from("space_members")
      .select("space_id")
      .eq("user_id", user.id)
      .limit(1);

    if (existingSpaces && existingSpaces.length > 0) {
      return { success: true, message: "User already has data", error: null };
    }

    const now = new Date().toISOString();

    // Create initial space with proper timestamps
    const spaceResult = await createSpace(
      "Getting Started",
      "Your first space to explore Kafuffle's features",
    );

    if (!spaceResult.success) {
      return spaceResult;
    }

    // Update the space with proper last_activity_at
    await supabase
      .from("spaces")
      .update({
        last_activity_at: now,
        updated_at: now,
      })
      .eq("id", spaceResult.space.id);

    // Send additional welcome messages if zones exist
    if (spaceResult.zones && spaceResult.zones.length > 0) {
      const generalZone = spaceResult.zones[0];

      await sendMessage(
        spaceResult.space.id,
        generalZone.id,
        "💬 This is a chat zone where you can have conversations with your team.",
        "system",
      );

      await sendMessage(
        spaceResult.space.id,
        generalZone.id,
        "📋 Switch to the 'tasks' zone to see Kanban-style project management.",
        "system",
      );

      await sendMessage(
        spaceResult.space.id,
        generalZone.id,
        "🚀 Create new spaces for different projects or teams using the sidebar!",
        "system",
      );
    }

    return {
      success: true,
      message: "Initial data created successfully",
      error: null,
    };
  } catch (error: any) {
    console.error("Failed to initialize user data:", error);
    return { success: false, error: error.message };
  }
}
