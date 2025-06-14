// types/index.ts
export interface User {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  status: "online" | "away" | "busy" | "offline";
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  workspace_id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  sections: Section[];
  members: ProjectMember[];
}

export interface Section {
  id: string;
  name: string;
  project_id: string;
  position: number;
  created_at: string;
  channels: Channel[];
  collapsed?: boolean;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  type: "text" | "voice";
  project_id: string;
  section_id: string;
  position: number;
  created_at: string;
  unread_count?: number;
}

export interface Message {
  id: string;
  content: string;
  user_id: string;
  channel_id?: string;
  conversation_id?: string;
  reply_to?: string;
  created_at: string;
  updated_at: string;
  edited_at?: string;
  user?: User;
  reply_to_message?: Message;
}

export interface Conversation {
  id: string;
  name?: string;
  type: "dm" | "group";
  created_by: string;
  created_at: string;
  updated_at: string;
  participants: User[];
  last_message?: Message;
  unread_count?: number;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  joined_at: string;
  user: User;
}

// UI State Types
export interface AppState {
  currentUser: User;
  workspaces: Workspace[];
  projects: Project[];
  conversations: Conversation[];
  currentWorkspace?: Workspace;
  currentProject?: Project;
  currentChannel?: Channel;
  currentConversation?: Conversation;
  currentView: "chat" | "settings";
}

export interface ChatContext {
  id: string;
  name: string;
  type: "channel" | "dm" | "group";
}
