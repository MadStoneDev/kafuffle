// utils/permissions.ts
import { createClient } from "@/utils/supabase/server";

export const PERMISSIONS = {
  SEND_MESSAGES: "send_messages",
  READ_MESSAGES: "read_messages",
  MANAGE_MESSAGES: "manage_messages",
  PIN_MESSAGES: "pin_messages",
  EMBED_LINKS: "embed_links",
  ATTACH_FILES: "attach_files",
  CREATE_ZONES: "create_zones",
  MANAGE_ZONES: "manage_zones",
  DELETE_ZONES: "delete_zones",
  MANAGE_MEMBERS: "manage_members",
  KICK_MEMBERS: "kick_members",
  BAN_MEMBERS: "ban_members",
  CREATE_FLOWS: "create_flows",
  MANAGE_FLOWS: "manage_flows",
  CREATE_EVENTS: "create_events",
  MANAGE_EVENTS: "manage_events",
  MANAGE_SPACE: "manage_space",
  MANAGE_PERMISSIONS: "manage_permissions",
  ADMINISTRATOR: "administrator",
} as const;

export async function checkPermission(
  userId: string,
  spaceId: string,
  permission: string,
  zoneId?: string,
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("user_has_permission", {
    p_user_id: userId,
    p_space_id: spaceId,
    p_permission: permission,
    p_zone_id: zoneId || null,
  });

  if (error) {
    console.error("Permission check failed:", error);
    return false;
  }

  return data || false;
}
