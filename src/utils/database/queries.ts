// /utils/database/queries.ts
import { createClient } from "@/utils/supabase/client";

export async function getUserSpaces(userId: string) {
  const supabase = createClient();

  const { data: spaces, error } = await supabase
    .from("spaces")
    .select(
      `
      *,
      space_members!inner(user_id),
      zones(
        id,
        name,
        last_message_at,
        message_count
      )
    `,
    )
    .eq("space_members.user_id", userId)
    .is("archived_at", null)
    .order("last_activity_at", { ascending: false, nullsFirst: false });

  if (error) throw error;
  return spaces || [];
}

export async function getSpaceZones(spaceId: string) {
  const supabase = createClient();

  const { data: zones, error } = await supabase
    .from("zones")
    .select("*")
    .eq("space_id", spaceId)
    .is("archived_at", null)
    .order("position", { ascending: true });

  if (error) throw error;
  return zones || [];
}

export async function getZoneMessages(
  zoneId: string,
  limit = 50,
  before?: string,
) {
  const supabase = createClient();

  let query = supabase
    .from("messages")
    .select(
      `
      *,
      profiles:sender_id(username, display_name, avatar_url),
      media_files(*)
    `,
    )
    .eq("zone_id", zoneId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (before) {
    query = query.lt("created_at", before);
  }

  const { data: messages, error } = await query;

  if (error) throw error;
  return messages?.reverse() || []; // Reverse to get chronological order
}
