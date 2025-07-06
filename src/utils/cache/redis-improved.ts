// /utils/cache/redis-improved.ts
import { Redis } from "@upstash/redis";
import { Space, Zone, Message } from "@/types";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Cache key patterns
const CACHE_KEYS = {
  userSpaces: (userId: string) => `user:${userId}:spaces`,
  spaceData: (spaceId: string) => `space:${spaceId}:data`,
  spaceZones: (spaceId: string) => `space:${spaceId}:zones`,
  zoneMessages: (zoneId: string) => `zone:${zoneId}:messages`,
  lastMessageId: (zoneId: string) => `zone:${zoneId}:lastMsgId`,
  userPresence: (userId: string) => `presence:${userId}`,
};

// Cache TTLs (in seconds)
const CACHE_TTL = {
  spaces: 3600, // 1 hour
  zones: 3600, // 1 hour
  messages: 1800, // 30 minutes (shorter for messages)
  presence: 300, // 5 minutes
};

// Improved caching functions

/**
 * Get user's spaces with intelligent caching
 */
export async function getUserSpacesWithSmartCache(
  userId: string,
): Promise<Space[]> {
  const cacheKey = CACHE_KEYS.userSpaces(userId);

  try {
    // Try to get from cache
    const cached = await redis.get<Space[]>(cacheKey);
    if (cached) {
      console.log(`Cache hit for user spaces: ${userId}`);
      return cached;
    }
  } catch (error) {
    console.warn("Redis error, falling back to DB:", error);
  }

  // Cache miss - fetch from database
  const { createClient } = await import("@/utils/supabase/server");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("spaces")
    .select(
      `
      *,
      space_members!inner(user_id),
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
    .order("last_activity_at", { ascending: false });

  if (error) throw error;

  const spaces = data || [];

  // Cache the result
  try {
    await redis.setex(cacheKey, CACHE_TTL.spaces, JSON.stringify(spaces));
  } catch (error) {
    console.warn("Failed to cache spaces:", error);
  }

  return spaces;
}

/**
 * Get messages for a zone with pagination and smart caching
 */
export async function getZoneMessagesWithPagination(
  zoneId: string,
  limit: number = 50,
  before?: string,
): Promise<{ messages: Message[]; hasMore: boolean }> {
  const cacheKey = CACHE_KEYS.zoneMessages(zoneId);

  try {
    // For initial load (no before), try cache
    if (!before) {
      const cached = await redis.get<Message[]>(cacheKey);
      if (cached) {
        console.log(`Cache hit for zone messages: ${zoneId}`);
        return {
          messages: cached.slice(0, limit),
          hasMore: cached.length > limit,
        };
      }
    }
  } catch (error) {
    console.warn("Redis error:", error);
  }

  // Fetch from database
  const { createClient } = await import("@/utils/supabase/server");
  const supabase = await createClient();

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
    .order("created_at", { ascending: false })
    .limit(limit + 1); // Fetch one extra to check hasMore

  if (before) {
    query = query.lt("created_at", before);
  }

  const { data, error } = await query;

  if (error) throw error;

  const messages = (data || []).slice(0, limit).reverse();
  const hasMore = (data || []).length > limit;

  // Cache only if it's the initial load
  if (!before && messages.length > 0) {
    try {
      await redis.setex(cacheKey, CACHE_TTL.messages, JSON.stringify(messages));
    } catch (error) {
      console.warn("Failed to cache messages:", error);
    }
  }

  return { messages, hasMore };
}

/**
 * Add a new message and update caches
 */
export async function addMessageToCacheImproved(
  zoneId: string,
  message: Message,
) {
  const cacheKey = CACHE_KEYS.zoneMessages(zoneId);

  try {
    // Get existing messages
    const existing = (await redis.get<Message[]>(cacheKey)) || [];

    // Add new message
    const updated = [...existing, message];

    // Keep only last 100 messages in cache
    const trimmed = updated.slice(-100);

    // Update cache with shorter TTL for active zones
    await redis.setex(cacheKey, CACHE_TTL.messages, JSON.stringify(trimmed));

    // Update last message ID for real-time sync
    await redis.setex(
      CACHE_KEYS.lastMessageId(zoneId),
      CACHE_TTL.messages,
      message.id,
    );
  } catch (error) {
    console.warn("Failed to update message cache:", error);
  }
}

/**
 * Invalidate caches when data changes
 */
export async function invalidateSpaceCache(spaceId: string, userId?: string) {
  try {
    const keys = [
      CACHE_KEYS.spaceData(spaceId),
      CACHE_KEYS.spaceZones(spaceId),
    ];

    if (userId) {
      keys.push(CACHE_KEYS.userSpaces(userId));
    }

    await Promise.all(keys.map((key) => redis.del(key)));
  } catch (error) {
    console.warn("Failed to invalidate cache:", error);
  }
}

/**
 * Update user presence with caching
 */
export async function updateUserPresence(
  userId: string,
  spaceId: string,
  zoneId: string,
) {
  const presenceKey = CACHE_KEYS.userPresence(userId);

  try {
    await redis.setex(
      presenceKey,
      CACHE_TTL.presence,
      JSON.stringify({
        spaceId,
        zoneId,
        lastSeen: new Date().toISOString(),
      }),
    );
  } catch (error) {
    console.warn("Failed to update presence:", error);
  }
}

/**
 * Get active users in a space (from presence data)
 */
export async function getActiveUsersInSpace(
  spaceId: string,
): Promise<string[]> {
  try {
    // This would need to scan all presence keys - consider using Redis sets instead
    // For now, return empty array
    return [];
  } catch (error) {
    console.warn("Failed to get active users:", error);
    return [];
  }
}

/**
 * Warm up cache for a user (prefetch data)
 */
export async function warmUpUserCache(userId: string) {
  try {
    // Prefetch user's spaces
    await getUserSpacesWithSmartCache(userId);

    // Could also prefetch recent messages for active spaces
    // This runs in background, doesn't block
  } catch (error) {
    console.warn("Failed to warm up cache:", error);
  }
}
