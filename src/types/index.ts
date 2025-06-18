// /types/index.ts (updated)
export type View =
  | "spaces"
  | "profile"
  | "notifications"
  | "settings"
  | "help"
  | "about"
  | "members";

export interface Space {
  id: string;
  name: string | null;
  description?: string | null;
  participants: string[];
  last_activity_at?: string | null;
  lastActivity?: string | null; // Alias for compatibility
  created_at: string;
  updated_at: string;
  is_public: boolean;
  member_count: number;
  unreadCount?: number; // Computed field for unread messages
  zones?: Zone[];
  avatar_url?: string | null;
  created_by: string;
  archived_at?: string | null;
  settings?: Record<string, any>;
}

export interface Zone {
  id: string;
  name: string;
  description?: string | null;
  space_id: string;
  zone_type?: "chat" | "flow" | "calendar";
  position: number;
  last_message_at?: string | null;
  message_count?: number;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
  created_by: string;
  settings?: Record<string, any>;
}

export interface Message {
  id: string;
  content: string | null;
  sender_id: string;
  sender_username: string;
  space_id: string;
  zone_id: string;
  message_type: "text" | "system" | "image" | "file" | "audio" | "video";
  created_at: string;
  updated_at?: string;
  edited_at?: string | null;
  deleted_at?: string | null;
  reply_to_id?: string | null;
  metadata?: Record<string, any>;
  profiles?: {
    username: string;
    display_name?: string | null;
    avatar_url?: string | null;
  };
  media_files?: MediaFile[];
}

export interface MediaFile {
  id: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  storage_url: string;
  thumbnail_url?: string | null;
  uploaded_by: string;
  message_id?: string | null;
  dimensions?: Record<string, any>;
  duration?: number | null;
  created_at: string;
}

export interface Profile {
  id: string;
  username: string;
  display_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  status?: "online" | "away" | "busy" | "offline" | null;
  last_seen_at?: string | null;
  created_at: string;
  updated_at: string;
  settings?: {
    theme?: "light" | "dark" | "system";
    notifications?: {
      email: boolean;
      push: boolean;
      mentions: boolean;
      direct_messages: boolean;
    };
    privacy?: {
      show_online_status: boolean;
      allow_direct_messages: boolean;
    };
  };
}

export interface Notification {
  id: string;
  user_id: string;
  type:
    | "message"
    | "mention"
    | "space_invite"
    | "zone_invite"
    | "flow_invite"
    | "system";
  title: string;
  message?: string | null;
  data?: Record<string, any>;
  read_at?: string | null;
  created_at: string;
}

export interface SpaceMember {
  id: string;
  space_id: string;
  user_id: string;
  joined_at?: string | null;
  last_accessed_at?: string | null;
  last_accessed_zone_id?: string | null;
  permission_template_id?: string | null;
}
