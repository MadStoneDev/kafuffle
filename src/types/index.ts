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
  name: string;
  description?: string;
  participants: string[];
  last_activity_at?: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  member_count: number;
  zones?: Zone[];
}

export interface Zone {
  id: string;
  name: string;
  description?: string;
  space_id: string;
  zone_type: "chat" | "flow" | "calendar";
  position: number;
  last_message_at?: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_username: string;
  space_id: string;
  zone_id: string;
  message_type: "text" | "system" | "image" | "file" | "audio" | "video";
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  profiles?: {
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  media_files?: MediaFile[];
}

export interface MediaFile {
  id: string;
  filename: string;
  file_size: number;
  mime_type: string;
  file_url: string;
  created_at: string;
}

export interface Profile {
  id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
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
