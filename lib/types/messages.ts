export interface Message {
  id: string;
  authorId: string;
  type: string;
  content: string;
  media?: MediaItem[];
  embed?: EmbedItem[];
  timestamp: string;
  replyToId: string | null;
  spaceId: string;
  zoneId: string;
}

export interface MediaItem {
  type: "image" | "audio" | "video" | "file" | "gif";
  url: string;
  filename?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface EmbedItem {
  type:
    | "tweet"
    | "youtube"
    | "instagram"
    | "tiktok"
    | "facebook"
    | "link"
    | "spotify";
  url: string;
  title?: string;
  description?: string;
  image?: string;
  metadata?: Record<string, any>;
}
