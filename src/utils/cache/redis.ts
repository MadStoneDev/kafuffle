// /utils/cache/redis.ts
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Cache keys
const CACHE_KEYS = {
  zoneMessages: (zoneId: string) => `zone:${zoneId}:messages`,
  userSpaces: (userId: string) => `user:${userId}:spaces`,
  spaceZones: (spaceId: string) => `space:${spaceId}:zones`,
  userPresence: (userId: string) => `presence:${userId}`,
} as const;

// Cache durations (in seconds)
const CACHE_TTL = {
  messages: 300, // 5 minutes
  spaces: 600, // 10 minutes
  zones: 600, // 10 minutes
  presence: 30, // 30 seconds
} as const;

// Message caching with write-through pattern
export async function getCachedMessages(zoneId: string) {
  try {
    const cached = await redis.get(CACHE_KEYS.zoneMessages(zoneId));
    return cached ? JSON.parse(cached as string) : null;
  } catch (error) {
    console.error("Redis get error:", error);
    return null;
  }
}

export async function setCachedMessages(zoneId: string, messages: any[]) {
  try {
    await redis.setex(
      CACHE_KEYS.zoneMessages(zoneId),
      CACHE_TTL.messages,
      JSON.stringify(messages),
    );
  } catch (error) {
    console.error("Redis set error:", error);
  }
}

export async function addMessageToCache(zoneId: string, message: any) {
  try {
    // Get current cached messages
    const cached = await getCachedMessages(zoneId);
    if (cached) {
      // Add new message and keep only latest 50
      const updatedMessages = [...cached, message].slice(-50);
      await setCachedMessages(zoneId, updatedMessages);
    }
  } catch (error) {
    console.error("Redis add message error:", error);
  }
}

// User spaces caching
export async function getCachedUserSpaces(userId: string) {
  try {
    const cached = await redis.get(CACHE_KEYS.userSpaces(userId));
    return cached ? JSON.parse(cached as string) : null;
  } catch (error) {
    console.error("Redis get spaces error:", error);
    return null;
  }
}

export async function setCachedUserSpaces(userId: string, spaces: any[]) {
  try {
    await redis.setex(
      CACHE_KEYS.userSpaces(userId),
      CACHE_TTL.spaces,
      JSON.stringify(spaces),
    );
  } catch (error) {
    console.error("Redis set spaces error:", error);
  }
}

// Zone caching
export async function getCachedSpaceZones(spaceId: string) {
  try {
    const cached = await redis.get(CACHE_KEYS.spaceZones(spaceId));
    return cached ? JSON.parse(cached as string) : null;
  } catch (error) {
    console.error("Redis get zones error:", error);
    return null;
  }
}

export async function setCachedSpaceZones(spaceId: string, zones: any[]) {
  try {
    await redis.setex(
      CACHE_KEYS.spaceZones(spaceId),
      CACHE_TTL.zones,
      JSON.stringify(zones),
    );
  } catch (error) {
    console.error("Redis set zones error:", error);
  }
}

// User presence caching
export async function setUserPresence(userId: string, presence: any) {
  try {
    await redis.setex(
      CACHE_KEYS.userPresence(userId),
      CACHE_TTL.presence,
      JSON.stringify(presence),
    );
  } catch (error) {
    console.error("Redis set presence error:", error);
  }
}

export async function getUserPresence(userId: string) {
  try {
    const cached = await redis.get(CACHE_KEYS.userPresence(userId));
    return cached ? JSON.parse(cached as string) : null;
  } catch (error) {
    console.error("Redis get presence error:", error);
    return null;
  }
}

// Cache invalidation helpers
export async function invalidateZoneCache(zoneId: string) {
  try {
    await redis.del(CACHE_KEYS.zoneMessages(zoneId));
  } catch (error) {
    console.error("Redis invalidate zone error:", error);
  }
}

export async function invalidateUserSpacesCache(userId: string) {
  try {
    await redis.del(CACHE_KEYS.userSpaces(userId));
  } catch (error) {
    console.error("Redis invalidate user spaces error:", error);
  }
}

// Cached data fetching with fallback to database
import {
  getZoneMessages,
  getUserSpaces,
  getSpaceZones,
} from "@/utils/database/queries";

export async function getMessagesWithCache(zoneId: string) {
  // Try cache first
  let messages = await getCachedMessages(zoneId);

  if (!messages) {
    // Fallback to database
    messages = await getZoneMessages(zoneId);

    // Cache the result
    if (messages.length > 0) {
      await setCachedMessages(zoneId, messages);
    }
  }

  return messages;
}

export async function getUserSpacesWithCache(userId: string) {
  // Try cache first
  let spaces = await getCachedUserSpaces(userId);

  if (!spaces) {
    // Fallback to database
    spaces = await getUserSpaces(userId);

    // Cache the result
    if (spaces.length > 0) {
      await setCachedUserSpaces(userId, spaces);
    }
  }

  return spaces;
}

export async function getSpaceZonesWithCache(spaceId: string) {
  // Try cache first
  let zones = await getCachedSpaceZones(spaceId);

  if (!zones) {
    // Fallback to database
    zones = await getSpaceZones(spaceId);

    // Cache the result
    if (zones.length > 0) {
      await setCachedSpaceZones(spaceId, zones);
    }
  }

  return zones;
}
