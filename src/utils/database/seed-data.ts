// /utils/database/seed-data.ts
import { createClient } from "@/utils/supabase/server";

export async function seedDatabaseForUser(userId: string) {
  const supabase = await createClient();

  try {
    // Create a default space for the user
    const { data: space, error: spaceError } = await supabase
      .from("spaces")
      .insert({
        name: "General",
        description: "Your first space",
        created_by: userId,
        is_public: false,
        member_count: 1,
      })
      .select()
      .single();

    if (spaceError) throw spaceError;

    // Add user as space member
    await supabase.from("space_members").insert({
      space_id: space.id,
      user_id: userId,
      joined_at: new Date().toISOString(),
    });

    // Create default zones in the space
    const zones = [
      { name: "general", description: "General discussion" },
      { name: "random", description: "Random chat" },
    ];

    const { data: createdZones, error: zonesError } = await supabase
      .from("zones")
      .insert(
        zones.map((zone, index) => ({
          ...zone,
          space_id: space.id,
          created_by: userId,
          position: index,
        })),
      )
      .select();

    if (zonesError) throw zonesError;

    // Create a welcome message
    await supabase.from("messages").insert({
      content: "👋 Welcome to Kafuffle! This is your first space.",
      sender_id: userId,
      sender_username: "system",
      space_id: space.id,
      zone_id: createdZones[0].id,
      message_type: "system",
    });

    return { space, zones: createdZones };
  } catch (error: any) {
    console.error("Failed to seed database:", error);
    throw error;
  }
}
