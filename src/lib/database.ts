// lib/database.ts - Enhanced version
import { createClient } from "@/utils/supabase/client";
import type {
  User,
  Project,
  Channel,
  Message,
  Conversation,
  Workspace,
} from "@/types";

const supabase = createClient();

// Error handling wrapper
const handleDatabaseError = (error: any, operation: string) => {
  console.error(`Database error in ${operation}:`, error);
  return {
    success: false,
    error: {
      message: error.message || `Failed to ${operation}`,
      code: error.code,
      details: error.details,
    },
  };
};

export class DatabaseService {
  // User Management
  static async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) return null;

      let profile; // Change from const to let
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        // If profile doesn't exist, create one
        if (profileError.code === "PGRST116") {
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              username:
                user.email?.split("@")[0] || `user_${user.id.slice(0, 8)}`,
              full_name: user.user_metadata?.full_name,
              avatar_url: user.user_metadata?.avatar_url,
            })
            .select()
            .single();

          if (createError) throw createError;
          profile = newProfile;
        } else {
          throw profileError;
        }
      } else {
        profile = profileData;
      }

      return {
        id: profile.id,
        username: profile.username || "",
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        status: "online",
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      };
    } catch (error) {
      console.error("Error fetching current user:", error);
      return null;
    }
  }

  static async updateUserProfile(
    userId: string,
    updates: {
      username?: string;
      full_name?: string;
      avatar_url?: string;
    },
  ) {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return handleDatabaseError(error, "update user profile");
    }
  }

  // Workspace Management
  static async getUserWorkspaces(userId: string): Promise<Workspace[]> {
    try {
      const { data: workspaces, error } = await supabase
        .from("workspaces")
        .select(
          `
          *,
          workspace_members!inner(
            user_id,
            role
          )
        `,
        )
        .eq("workspace_members.user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return workspaces || [];
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      return [];
    }
  }

  static async createWorkspace(data: {
    name: string;
    slug: string;
    description?: string;
    owner_id: string;
  }) {
    try {
      // Create workspace
      const { data: workspace, error: workspaceError } = await supabase
        .from("workspaces")
        .insert(data)
        .select()
        .single();

      if (workspaceError) throw workspaceError;

      // Add creator as workspace member
      const { error: memberError } = await supabase
        .from("workspace_members")
        .insert({
          workspace_id: workspace.id,
          user_id: data.owner_id,
          role: "owner",
        });

      if (memberError) throw memberError;

      return { success: true, workspace };
    } catch (error) {
      return handleDatabaseError(error, "create workspace");
    }
  }

  // Project Management
  static async getUserProjects(userId: string): Promise<Project[]> {
    try {
      const { data: projects, error } = await supabase
        .from("projects")
        .select(
          `
          *,
          project_members!inner(
            id,
            user_id,
            role,
            joined_at,
            profiles(*)
          ),
          sections(
            *,
            channels(
              *,
              messages(count)
            )
          )
        `,
        )
        .eq("project_members.user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      return (
        projects?.map((project: any) => ({
          ...project,
          members: project.project_members.map((pm: any) => ({
            ...pm,
            user: pm.profiles,
          })),
          sections: project.sections.map((section: any) => ({
            ...section,
            channels:
              section.channels?.map((channel: any) => ({
                ...channel,
                unread_count: channel.messages?.[0]?.count || 0,
              })) || [],
            collapsed: false,
          })),
        })) || []
      );
    } catch (error) {
      console.error("Error fetching projects:", error);
      return [];
    }
  }

  static async createProject(data: {
    name: string;
    description?: string;
    workspace_id: string;
    owner_id: string;
  }) {
    try {
      // Create project
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert(data)
        .select()
        .single();

      if (projectError) throw projectError;

      // Add creator as project member
      const { error: memberError } = await supabase
        .from("project_members")
        .insert({
          project_id: project.id,
          user_id: data.owner_id,
          role: "owner",
        });

      if (memberError) throw memberError;

      // Create default section
      const { data: defaultSection, error: sectionError } = await supabase
        .from("sections")
        .insert({
          name: "General",
          project_id: project.id,
          position: 1,
        })
        .select()
        .single();

      if (sectionError) throw sectionError;

      // Create default channels
      const { error: channelError } = await supabase.from("channels").insert([
        {
          name: "general",
          type: "text",
          project_id: project.id,
          section_id: defaultSection.id,
          position: 1,
        },
        {
          name: "random",
          type: "text",
          project_id: project.id,
          section_id: defaultSection.id,
          position: 2,
        },
      ]);

      if (channelError) throw channelError;

      return { success: true, project };
    } catch (error) {
      return handleDatabaseError(error, "create project");
    }
  }

  static async createProjectFromTemplate(data: {
    name: string;
    description?: string;
    workspace_id: string;
    owner_id: string;
    template: any;
    invite_emails?: string[];
  }) {
    try {
      // Create project
      const projectResult = await this.createProject({
        name: data.name,
        description: data.description,
        workspace_id: data.workspace_id,
        owner_id: data.owner_id,
      });

      if (!projectResult.success) {
        // throw projectResult.error;
      }

      const project = (projectResult as any).project;

      // Remove default section and channels
      await supabase.from("channels").delete().eq("project_id", project.id);
      await supabase.from("sections").delete().eq("project_id", project.id);

      // Create template sections and channels
      for (const [index, section] of data.template.sections.entries()) {
        const { data: newSection, error: sectionError } = await supabase
          .from("sections")
          .insert({
            name: section.name,
            project_id: project.id,
            position: index + 1,
          })
          .select()
          .single();

        if (sectionError) throw sectionError;

        // Create channels for this section
        for (const [channelIndex, channel] of section.channels.entries()) {
          const { error: channelError } = await supabase
            .from("channels")
            .insert({
              name: channel.name,
              type: channel.type,
              description: channel.description,
              project_id: project.id,
              section_id: newSection.id,
              position: channelIndex + 1,
            });

          if (channelError) throw channelError;
        }
      }

      // Send invites if provided
      if (data.invite_emails?.length) {
        // TODO: Implement email invitations
        console.log("TODO: Send invites to:", data.invite_emails);
      }

      return { success: true, project };
    } catch (error) {
      return handleDatabaseError(error, "create project from template");
    }
  }

  // Channel Management
  static async createChannel(data: {
    name: string;
    type: "text" | "voice";
    project_id: string;
    section_id: string;
    description?: string;
  }) {
    try {
      // Get next position
      const { data: channels } = await supabase
        .from("channels")
        .select("position")
        .eq("section_id", data.section_id)
        .order("position", { ascending: false })
        .limit(1);

      const nextPosition = (channels?.[0]?.position || 0) + 1;

      const { data: channel, error } = await supabase
        .from("channels")
        .insert({
          ...data,
          position: nextPosition,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, channel };
    } catch (error) {
      return handleDatabaseError(error, "create channel");
    }
  }

  static async updateChannel(
    channelId: string,
    updates: {
      name?: string;
      description?: string;
    },
  ) {
    try {
      const { error } = await supabase
        .from("channels")
        .update(updates)
        .eq("id", channelId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return handleDatabaseError(error, "update channel");
    }
  }

  static async deleteChannel(channelId: string) {
    try {
      // Delete messages first
      await supabase.from("messages").delete().eq("channel_id", channelId);

      // Delete channel
      const { error } = await supabase
        .from("channels")
        .delete()
        .eq("id", channelId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return handleDatabaseError(error, "delete channel");
    }
  }

  // Message Management
  static async getChannelMessages(
    channelId: string,
    limit: number = 50,
    before?: string,
  ): Promise<Message[]> {
    try {
      let query = supabase
        .from("messages")
        .select(
          `
          *,
          profiles(*),
          reply_to_message:messages!reply_to(
            *,
            profiles(*)
          )
        `,
        )
        .eq("channel_id", channelId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (before) {
        query = query.lt("created_at", before);
      }

      const { data: messages, error } = await query;

      if (error) throw error;

      return (
        messages
          ?.map((msg: any) => ({
            ...msg,
            user: msg.profiles,
            reply_to_message: msg.reply_to_message
              ? {
                  ...msg.reply_to_message,
                  user: msg.reply_to_message.profiles,
                }
              : undefined,
          }))
          .reverse() || []
      );
    } catch (error) {
      console.error("Error fetching messages:", error);
      return [];
    }
  }

  static async getConversationMessages(
    conversationId: string,
    limit: number = 50,
    before?: string,
  ): Promise<Message[]> {
    try {
      let query = supabase
        .from("messages")
        .select(
          `
          *,
          profiles(*)
        `,
        )
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (before) {
        query = query.lt("created_at", before);
      }

      const { data: messages, error } = await query;

      if (error) throw error;

      return (
        messages
          ?.map((msg: any) => ({
            ...msg,
            user: msg.profiles,
          }))
          .reverse() || []
      );
    } catch (error) {
      console.error("Error fetching conversation messages:", error);
      return [];
    }
  }

  static async sendMessage(data: {
    content: string;
    channel_id?: string;
    conversation_id?: string;
    user_id: string;
    reply_to?: string;
  }) {
    try {
      const { data: message, error } = await supabase
        .from("messages")
        .insert(data)
        .select(
          `
          *,
          profiles(*)
        `,
        )
        .single();

      if (error) throw error;

      return {
        success: true,
        message: {
          ...message,
          user: message.profiles,
        },
      };
    } catch (error) {
      return handleDatabaseError(error, "send message");
    }
  }

  static async editMessage(messageId: string, content: string) {
    try {
      const { error } = await supabase
        .from("messages")
        .update({
          content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", messageId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return handleDatabaseError(error, "edit message");
    }
  }

  static async deleteMessage(messageId: string) {
    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return handleDatabaseError(error, "delete message");
    }
  }

  // Conversation Management
  static async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      const { data: conversations, error } = await supabase
        .from("conversations")
        .select(
          `
          *,
          conversation_participants!inner(
            user_id,
            profiles(*)
          ),
          messages(
            *,
            profiles(*)
          )
        `,
        )
        .eq("conversation_participants.user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      return (
        conversations?.map((conv: any) => ({
          ...conv,
          participants: conv.conversation_participants
            .map((cp: any) => cp.profiles)
            .filter((p: any) => p.id !== userId),
          last_message: conv.messages?.[0]
            ? {
                ...conv.messages[0],
                user: conv.messages[0].profiles,
              }
            : undefined,
          unread_count: 0, // TODO: Implement unread logic
        })) || []
      );
    } catch (error) {
      console.error("Error fetching conversations:", error);
      return [];
    }
  }

  static async createConversation(data: {
    type: "dm" | "group";
    name?: string;
    created_by: string;
    participant_ids: string[];
  }) {
    try {
      // Create conversation
      const { data: conversation, error: convError } = await supabase
        .from("conversations")
        .insert({
          type: data.type,
          name: data.name,
          created_by: data.created_by,
        })
        .select()
        .single();

      if (convError) throw convError;

      // Add participants
      const participants = [data.created_by, ...data.participant_ids].map(
        (userId) => ({
          conversation_id: conversation.id,
          user_id: userId,
        }),
      );

      const { error: participantError } = await supabase
        .from("conversation_participants")
        .insert(participants);

      if (participantError) throw participantError;

      return { success: true, conversation };
    } catch (error) {
      return handleDatabaseError(error, "create conversation");
    }
  }

  // Real-time subscriptions
  static subscribeToChannelMessages(
    channelId: string,
    callback: (payload: any) => void,
  ) {
    return supabase
      .channel(`channel:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        callback,
      )
      .subscribe();
  }

  static subscribeToConversationMessages(
    conversationId: string,
    callback: (payload: any) => void,
  ) {
    return supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        callback,
      )
      .subscribe();
  }

  static subscribeToProjectUpdates(
    projectId: string,
    callback: (payload: any) => void,
  ) {
    return supabase
      .channel(`project:${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "channels",
          filter: `project_id=eq.${projectId}`,
        },
        callback,
      )
      .subscribe();
  }

  // Search functionality
  static async searchMessages(
    query: string,
    channelId?: string,
    limit: number = 20,
  ) {
    try {
      let search = supabase
        .from("messages")
        .select(
          `
          *,
          profiles(*),
          channels(name)
        `,
        )
        .textSearch("content", query)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (channelId) {
        search = search.eq("channel_id", channelId);
      }

      const { data: messages, error } = await search;

      if (error) throw error;

      return {
        success: true,
        messages:
          messages?.map((msg: any) => ({
            ...msg,
            user: msg.profiles,
            channel: msg.channels,
          })) || [],
      };
    } catch (error) {
      return handleDatabaseError(error, "search messages");
    }
  }

  // Utility methods
  static async checkUserPermission(
    userId: string,
    projectId: string,
    permission: string,
  ) {
    try {
      const { data: member, error } = await supabase
        .from("project_members")
        .select("role")
        .eq("user_id", userId)
        .eq("project_id", projectId)
        .single();

      if (error) return false;

      // Simple permission check - in real app, this would be more sophisticated
      const permissions = {
        owner: ["read", "write", "delete", "manage", "invite"],
        admin: ["read", "write", "delete", "invite"],
        member: ["read", "write"],
      };

      return (
        permissions[member.role as keyof typeof permissions]?.includes(
          permission,
        ) || false
      );
    } catch (error) {
      console.error("Error checking permissions:", error);
      return false;
    }
  }

  // Health check
  static async healthCheck() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .limit(1);

      return { success: !error, data };
    } catch (error) {
      return { success: false, error };
    }
  }
}
