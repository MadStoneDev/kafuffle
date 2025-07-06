// /utils/cache/redis.ts
import { Redis } from "@upstash/redis";
import { createClient } from "@/utils/supabase/client";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Cache functions for spaces
export async function getUserSpacesWithCache(userId: string) {
  const cacheKey = `user:${userId}:spaces`;

  try {
    // Try to get from cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("Cache hit for user spaces");
      return JSON.parse(cached as string);
    }
  } catch (error) {
    console.warn("Redis error, falling back to DB:", error);
  }

  // If not in cache, fetch from database
  console.log("Cache miss, fetching from database");
  const supabase = createClient();

  // Fixed query - using proper filtering
  const { data, error } = await supabase
    .from("spaces")
    .select(
      `
      *,
      space_members!inner(
        user_id,
        role
      ),
      zones(
        id,
        name,
        zone_type,
        last_message_at,
        message_count
      )
    `,
    )
    .eq("space_members.user_id", userId)
    .is("archived_at", null)
    .order("last_activity_at", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("Database query error:", error);
    throw error;
  }

  console.log(`Found ${data?.length || 0} spaces for user`);

  // Cache for 1 hour
  try {
    if (data && data.length > 0) {
      await redis.setex(cacheKey, 3600, JSON.stringify(data));
      console.log("Cached spaces data");
    }
  } catch (error) {
    console.warn("Failed to cache spaces:", error);
  }

  return data || [];
}

// Cache functions for zones
export async function getSpaceZonesWithCache(spaceId: string) {
  const cacheKey = `space:${spaceId}:zones`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached as string);
    }
  } catch (error) {
    console.warn("Redis error, falling back to DB:", error);
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("zones")
    .select("*")
    .eq("space_id", spaceId)
    .is("archived_at", null)
    .order("position", { ascending: true });

  if (error) throw error;

  // Cache for 1 hour
  try {
    await redis.setex(cacheKey, 3600, JSON.stringify(data));
  } catch (error) {
    console.warn("Failed to cache zones:", error);
  }

  return data || [];
}

// Cache functions for messages
export async function getMessagesWithCache(zoneId: string) {
  const cacheKey = `zone:${zoneId}:messages`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached as string);
    }
  } catch (error) {
    console.warn("Redis error, falling back to DB:", error);
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      *,
      profiles:sender_id(username, display_name, avatar_url),
      media_files(*)
    `,
    )
    .eq("zone_id", zoneId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;

  const messages = (data || []).reverse();

  // Cache for 30 minutes
  try {
    await redis.setex(cacheKey, 1800, JSON.stringify(messages));
  } catch (error) {
    console.warn("Failed to cache messages:", error);
  }

  return messages;
}

// Add message to cache
export async function addMessageToCache(zoneId: string, message: any) {
  const cacheKey = `zone:${zoneId}:messages`;

  try {
    const existing = await redis.get(cacheKey);
    if (existing) {
      const messages = JSON.parse(existing as string);
      messages.push(message);
      // Keep only last 50 messages
      const trimmed = messages.slice(-50);
      await redis.setex(cacheKey, 1800, JSON.stringify(trimmed));
    }
  } catch (error) {
    console.warn("Failed to update message cache:", error);
  }
}

// Invalidate zone cache
export async function invalidateZoneCache(zoneId: string) {
  const cacheKey = `zone:${zoneId}:messages`;
  try {
    await redis.del(cacheKey);
  } catch (error) {
    console.warn("Failed to invalidate cache:", error);
  }
}
