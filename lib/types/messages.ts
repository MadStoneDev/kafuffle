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
  metadata?: MediaMetadata;
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
  metadata?: MediaMetadata;
}

export interface MediaMetadata {
  size?: number;
  width?: number;
  height?: number;
  duration?: number;
  mimeType?: string;
}
