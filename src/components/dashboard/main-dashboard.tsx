// components/dashboard/MainDashboard.tsx
import React, { useState, useEffect } from "react";
import { MessageSquare, Settings } from "lucide-react";
import { Sidebar } from "../layout/sidebar";
import { Chat } from "../chat/chat";
import {
  CreateProjectModal,
  CreateChannelModal,
} from "../modals/create-project-modal";
import { DatabaseService } from "@/lib/database";
import type {
  User,
  Project,
  Channel,
  Message,
  Conversation,
  AppState,
  ChatContext,
} from "@/types";

export const MainDashboard: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentUser: {} as User,
    workspaces: [],
    projects: [],
    conversations: [],
    currentView: "chat",
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<Map<string, User>>(new Map());
  const [view, setView] = useState<"projects" | "dms">("projects");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  // Modal states
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");

  // Initialize dashboard
  useEffect(() => {
    initializeDashboard();
  }, []);

  // Subscribe to real-time messages
  useEffect(() => {
    let subscription: any;

    if (state.currentChannel) {
      subscription = DatabaseService.subscribeToChannelMessages(
        state.currentChannel.id,
        handleNewMessage,
      );
    } else if (state.currentConversation) {
      subscription = DatabaseService.subscribeToConversationMessages(
        state.currentConversation.id,
        handleNewMessage,
      );
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [state.currentChannel, state.currentConversation]);

  const initializeDashboard = async () => {
    try {
      setLoading(true);

      // Get current user
      const currentUser = await DatabaseService.getCurrentUser();
      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      // Load user data
      const [workspaces, projects, conversations] = await Promise.all([
        DatabaseService.getUserWorkspaces(currentUser.id),
        DatabaseService.getUserProjects(currentUser.id),
        DatabaseService.getUserConversations(currentUser.id),
      ]);

      // Create users map
      const allUsers = new Set<User>();
      projects.forEach((project) => {
        project.members.forEach((member) => allUsers.add(member.user));
      });
      conversations.forEach((conv) => {
        conv.participants.forEach((user) => allUsers.add(user));
      });
      allUsers.add(currentUser);

      const usersMap = new Map(
        Array.from(allUsers).map((user) => [user.id, user]),
      );

      // Set initial state
      setState({
        currentUser,
        workspaces,
        projects,
        conversations,
        currentProject: projects[0],
        currentChannel: projects[0]?.sections[0]?.channels[0],
        currentView: "chat",
      });

      setUsers(usersMap);

      // Load initial messages
      if (projects[0]?.sections[0]?.channels[0]) {
        loadChannelMessages(projects[0].sections[0].channels[0].id);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to load dashboard",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadChannelMessages = async (channelId: string) => {
    try {
      const channelMessages =
        await DatabaseService.getChannelMessages(channelId);
      setMessages(channelMessages);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const loadConversationMessages = async (conversationId: string) => {
    try {
      const conversationMessages =
        await DatabaseService.getConversationMessages(conversationId);
      setMessages(conversationMessages);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const handleNewMessage = async (payload: any) => {
    // Fetch the complete message with user data
    const { data: messageData } = await DatabaseService.supabase
      .from("messages")
      .select(
        `
        *,
        profiles(*)
      `,
      )
      .eq("id", payload.new.id)
      .single();

    if (messageData) {
      const newMessage: Message = {
        ...messageData,
        user: messageData.profiles,
      };

      setMessages((prev) => [...prev, newMessage]);
    }
  };

  const handleProjectSelect = (project: Project) => {
    setState((prev) => ({
      ...prev,
      currentProject: project,
      currentChannel: project.sections[0]?.channels[0],
      currentConversation: undefined,
    }));

    if (project.sections[0]?.channels[0]) {
      loadChannelMessages(project.sections[0].channels[0].id);
    }
  };

  const handleChannelSelect = (channel: Channel) => {
    setState((prev) => ({
      ...prev,
      currentChannel: channel,
      currentConversation: undefined,
    }));

    loadChannelMessages(channel.id);
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setState((prev) => ({
      ...prev,
      currentConversation: conversation,
      currentChannel: undefined,
    }));

    loadConversationMessages(conversation.id);
  };

  const handleSendMessage = async (content: string, replyTo?: string) => {
    try {
      const messageData = {
        content,
        user_id: state.currentUser.id,
        channel_id: state.currentChannel?.id,
        conversation_id: state.currentConversation?.id,
        reply_to: replyTo,
      };

      await DatabaseService.sendMessage(messageData);
      // Message will be added via real-time subscription
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleEditMessage = async (messageId: string, content: string) => {
    try {
      await DatabaseService.editMessage(messageId, content);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content, edited_at: new Date().toISOString() }
            : msg,
        ),
      );
    } catch (error) {
      console.error("Failed to edit message:", error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await DatabaseService.deleteMessage(messageId);
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const handleCreateProject = () => {
    setShowCreateProject(true);
  };

  const handleCreateChannel = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setShowCreateChannel(true);
  };

  const handleProjectCreated = async () => {
    // Reload projects to show the new one
    const projects = await DatabaseService.getUserProjects(
      state.currentUser.id,
    );
    setState((prev) => ({ ...prev, projects }));
  };

  const handleChannelCreated = async () => {
    // Reload projects to show the new channel
    const projects = await DatabaseService.getUserProjects(
      state.currentUser.id,
    );
    setState((prev) => ({ ...prev, projects }));
  };

  const getCurrentContext = (): ChatContext | null => {
    if (state.currentChannel) {
      return {
        id: state.currentChannel.id,
        name: state.currentChannel.name,
        type: "channel",
      };
    } else if (state.currentConversation) {
      return {
        id: state.currentConversation.id,
        name:
          state.currentConversation.type === "dm"
            ? state.currentConversation.participants[0]?.username || "Unknown"
            : state.currentConversation.name || "Group Chat",
        type: state.currentConversation.type === "dm" ? "dm" : "group",
      };
    }
    return null;
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-kafuffle-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white">Loading Kafuffle...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            ⚠️
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-neutral-400 mb-4">{error}</p>
          <button
            onClick={initializeDashboard}
            className="px-4 py-2 bg-kafuffle-primary hover:bg-kafuffle-primary/80 rounded-lg text-white transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const context = getCurrentContext();

  return (
    <div className="w-full h-screen bg-neutral-900 flex overflow-hidden">
      <Sidebar
        currentUser={state.currentUser}
        projects={state.projects}
        conversations={state.conversations}
        currentProject={state.currentProject}
        currentChannel={state.currentChannel}
        currentConversation={state.currentConversation}
        onProjectSelect={handleProjectSelect}
        onChannelSelect={handleChannelSelect}
        onConversationSelect={handleConversationSelect}
        onCreateProject={handleCreateProject}
        onCreateChannel={handleCreateChannel}
        view={view}
        onViewChange={setView}
      />

      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-12 border-b border-neutral-700 flex items-center justify-between px-4 bg-neutral-800">
          <div className="flex items-center">
            {context ? (
              <h3 className="font-semibold text-white">{context.name}</h3>
            ) : (
              <h3 className="font-semibold text-neutral-400">
                Welcome to Kafuffle
              </h3>
            )}
          </div>

          <button className="p-2 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {context ? (
            <Chat
              context={context}
              currentUserId={state.currentUser.id}
              messages={messages}
              users={users}
              onSendMessage={handleSendMessage}
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
              className="h-full"
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-neutral-900">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">
                  Welcome to Kafuffle
                </h2>
                <p className="text-neutral-400">
                  Select a channel or start a conversation to begin chatting!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateProjectModal
        currentUser={state.currentUser}
        workspaces={state.workspaces}
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        onProjectCreated={handleProjectCreated}
      />

      <CreateChannelModal
        sectionId={selectedSectionId}
        projectId={state.currentProject?.id || ""}
        isOpen={showCreateChannel}
        onClose={() => setShowCreateChannel(false)}
        onChannelCreated={handleChannelCreated}
      />
    </div>
  );
};
