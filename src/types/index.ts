export type View =
  | "spaces"
  | "members"
  | "profile"
  | "settings"
  | "notifications"
  | "help"
  | "about";

export interface Space {
  id: string;
  name: string;
  participants: string[];
  lastMessage?: string;
  lastActivity?: string;
  unreadCount?: number;
}
