// /app/api/spaces/route.ts
import { createClient } from "@/utils/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json();

    // Use the regular client to get the authenticated user
    const supabase = await createClient();

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
    }

    console.log("Creating space for user:", user.id);

    // Use service role client to bypass RLS
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // Create space using service role (bypasses RLS)
    // The handle_space_created trigger will automatically create the space_members record
    const { data: space, error: spaceError } = await serviceSupabase
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

    if (spaceError) {
      console.error("Space creation failed:", spaceError);
      return NextResponse.json(
        { success: false, error: spaceError.message },
        { status: 500 },
      );
    }

    console.log(
      "Space created successfully, trigger handled space_members creation",
    );

    // Create default zones (using service role)
    // In /app/api/spaces/route.ts, update the defaultZones array:
    const defaultZones = [
      { name: "general", description: "General discussion" },
      { name: "random", description: "Random conversations" },
      { name: "tasks", description: "Project tasks" },
    ];

    const { data: zones, error: zonesError } = await serviceSupabase
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

    if (zonesError) {
      console.error("Zone creation failed:", zonesError);
      return NextResponse.json(
        { success: false, error: zonesError.message },
        { status: 500 },
      );
    }

    // Create welcome message (using service role)
    const { error: messageError } = await serviceSupabase
      .from("messages")
      .insert({
        content: `🎉 Welcome to ${name}! This is your new space for collaboration.`,
        sender_id: user.id,
        sender_username:
          user.user_metadata?.username || user.email?.split("@")[0] || "system",
        space_id: space.id,
        zone_id: zones[0].id,
        message_type: "system",
      });

    if (messageError) {
      console.error("Welcome message creation failed:", messageError);
      // Don't fail the entire operation for a welcome message
      console.log("Continuing without welcome message...");
    }

    return NextResponse.json({ success: true, space, zones });
  } catch (error: any) {
    console.error("Failed to create space:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
