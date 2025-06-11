"use client";

import React, { useState, useEffect } from "react";
import DiscordLayout from "@/components/dashboard/discord-layout";
import EnhancedChat from "@/components/chat/enhanced-chat";

// Mock data types (in real app, these would come from your database)
interface User {
  id: string;
  username: string;
  avatar_url?: string;
  status: "online" | "away" | "busy" | "offline";
  roles?: string[];
}

interface Channel {
  id: string;
  name: string;
  type: "text" | "voice";
  unread?: number;
}

interface Section {
  id: string;
  name: string;
  collapsed: boolean;
  channels: Channel[];
}

interface Project {
  id: string;
  name: string;
  icon?: string;
  sections: Section[];
}

interface DMConversation {
  id: string;
  type: "dm" | "group";
  name?: string;
  avatar_url?: string;
  users: User[];
  unread?: number;
  lastMessage?: {
    content: string;
    timestamp: string;
  };
}

interface ChatMessage {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  channel_id?: string | null;
  conversation_id?: string | null;
  reply_to?: string | null;
  type?: string | null;
  edited_at?: string | null;
}

// Mock data generator
const generateMockData = () => {
  const users: User[] = [
    { id: "1", username: "john_doe", status: "online", roles: ["Admin"] },
    { id: "2", username: "jane_smith", status: "away", roles: ["Moderator"] },
    { id: "3", username: "bob_wilson", status: "busy" },
    { id: "4", username: "alice_brown", status: "online" },
    { id: "5", username: "charlie_davis", status: "offline" },
  ];

  const projects: Project[] = [
    {
      id: "proj1",
      name: "Kafuffle Team",
      sections: [
        {
          id: "sec1",
          name: "Text Channels",
          collapsed: false,
          channels: [
            { id: "chan1", name: "general", type: "text", unread: 3 },
            { id: "chan2", name: "random", type: "text" },
            { id: "chan3", name: "announcements", type: "text", unread: 1 },
          ],
        },
        {
          id: "sec2",
          name: "Voice Channels",
          collapsed: false,
          channels: [
            { id: "chan4", name: "General Voice", type: "voice" },
            { id: "chan5", name: "Meeting Room", type: "voice" },
          ],
        },
        {
          id: "sec3",
          name: "Development",
          collapsed: true,
          channels: [
            { id: "chan6", name: "frontend", type: "text" },
            { id: "chan7", name: "backend", type: "text" },
            { id: "chan8", name: "design", type: "text" },
          ],
        },
      ],
    },
    {
      id: "proj2",
      name: "Client Project",
      sections: [
        {
          id: "sec4",
          name: "General",
          collapsed: false,
          channels: [
            { id: "chan9", name: "project-chat", type: "text" },
            { id: "chan10", name: "client-feedback", type: "text", unread: 5 },
          ],
        },
      ],
    },
  ];

  const conversations: DMConversation[] = [
    {
      id: "dm1",
      type: "dm",
      users: [users[1]], // jane_smith
      lastMessage: {
        content: "Hey, how's the project going?",
        timestamp: "2025-06-12T10:30:00Z",
      },
      unread: 2,
    },
    {
      id: "dm2",
      type: "dm",
      users: [users[2]], // bob_wilson
      lastMessage: {
        content: "Can you review my PR?",
        timestamp: "2025-06-12T09:15:00Z",
      },
    },
    {
      id: "group1",
      type: "group",
      name: "Design Team",
      users: [users[1], users[3]], // jane and alice
      lastMessage: {
        content: "New mockups are ready!",
        timestamp: "2025-06-12T08:45:00Z",
      },
      unread: 1,
    },
  ];

  const messages: ChatMessage[] = [
    {
      id: "msg1",
      content: "Welcome to the general channel! 🎉",
      created_at: "2025-06-11T09:00:00Z",
      user_id: "1",
      channel_id: "chan1",
    },
    {
      id: "msg2",
      content:
        "Thanks for setting this up! Looking forward to collaborating here.",
      created_at: "2025-06-11T09:05:00Z",
      user_id: "2",
      channel_id: "chan1",
    },
    {
      id: "msg3",
      content: "Hey everyone! 👋",
      created_at: "2025-06-12T08:30:00Z",
      user_id: "3",
      channel_id: "chan1",
    },
    {
      id: "msg4",
      content: "Good morning! Ready for the standup?",
      created_at: "2025-06-12T09:00:00Z",
      user_id: "4",
      channel_id: "chan1",
    },
    {
      id: "msg5",
      content:
        "Absolutely! I've got some updates to share about the new features we've been working on.",
      created_at: "2025-06-12T09:02:00Z",
      user_id: "1",
      channel_id: "chan1",
    },
    {
      id: "msg6",
      content: "Same here. The UI improvements are coming along nicely.",
      created_at: "2025-06-12T09:03:00Z",
      user_id: "2",
      channel_id: "chan1",
    },
  ];

  return { users, projects, conversations, messages };
};

export const DashboardPage: React.FC = () => {
  const [currentUser] = useState<User>({
    id: "1",
    username: "john_doe",
    status: "online",
    roles: ["Admin"],
  });

  const [mockData] = useState(() => generateMockData());
  const [currentView, setCurrentView] = useState<"projects" | "dms">(
    "projects",
  );
  const [currentProject, setCurrentProject] = useState<Project | undefined>(
    mockData.projects[0],
  );
  const [currentChannel, setCurrentChannel] = useState<Channel | undefined>(
    mockData.projects[0].sections[0].channels[0],
  );
  const [currentConversation, setCurrentConversation] = useState<
    DMConversation | undefined
  >();

  // State for messages and users
  const [messages, setMessages] = useState<ChatMessage[]>(mockData.messages);
  const [users] = useState<Map<string, User>>(
    new Map(mockData.users.map((user) => [user.id, user])),
  );

  // Filter messages based on current context
  const filteredMessages = messages.filter((msg) => {
    if (currentView === "projects" && currentChannel) {
      return msg.channel_id === currentChannel.id;
    } else if (currentView === "dms" && currentConversation) {
      return msg.conversation_id === currentConversation.id;
    }
    return false;
  });

  // Handlers
  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project);
    setCurrentChannel(project.sections[0]?.channels[0]);
    setCurrentConversation(undefined);
    setCurrentView("projects");
  };

  const handleChannelSelect = (channel: Channel) => {
    setCurrentChannel(channel);
    setCurrentConversation(undefined);
    setCurrentView("projects");
  };

  const handleConversationSelect = (conversation: DMConversation) => {
    setCurrentConversation(conversation);
    setCurrentChannel(undefined);
    setCurrentView("dms");
  };

  const handleCreateProject = () => {
    // In real app, this would open a modal or navigate to project creation
    console.log("Create new project");
  };

  const handleCreateChannel = (sectionId: string) => {
    // In real app, this would open a modal for channel creation
    console.log("Create new channel in section:", sectionId);
  };

  const handleSendMessage = async (content: string, replyTo?: string) => {
    const newMessage: ChatMessage = {
      id: `msg${Date.now()}`,
      content,
      created_at: new Date().toISOString(),
      user_id: currentUser.id,
      channel_id: currentView === "projects" ? currentChannel?.id : null,
      conversation_id: currentView === "dms" ? currentConversation?.id : null,
      reply_to: replyTo || null,
    };

    setMessages((prev) => [...prev, newMessage]);

    // In real app, you would send this to your database/API
    console.log("Sending message:", newMessage);
  };

  const handleEditMessage = async (messageId: string, content: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, content, edited_at: new Date().toISOString() }
          : msg,
      ),
    );

    // In real app, you would update this in your database
    console.log("Editing message:", messageId, content);
  };

  const handleDeleteMessage = async (messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

    // In real app, you would delete this from your database
    console.log("Deleting message:", messageId);
  };

  // Get current chat context
  const getChatContext = () => {
    if (currentView === "projects" && currentChannel) {
      return {
        id: currentChannel.id,
        name: currentChannel.name,
        type: "channel" as const,
      };
    } else if (currentView === "dms" && currentConversation) {
      return {
        id: currentConversation.id,
        name:
          currentConversation.type === "dm"
            ? currentConversation.users[0]?.username || "Unknown"
            : currentConversation.name || "Group Chat",
        type:
          currentConversation.type === "dm"
            ? ("dm" as const)
            : ("group" as const),
      };
    }
    return null;
  };

  const chatContext = getChatContext();

  return (
    <div className="w-full h-screen bg-gray-900">
      <DiscordLayout
        currentUser={currentUser}
        projects={mockData.projects}
        conversations={mockData.conversations}
        currentProject={currentProject}
        currentChannel={currentChannel}
        currentConversation={currentConversation}
        onProjectSelect={handleProjectSelect}
        onChannelSelect={handleChannelSelect}
        onConversationSelect={handleConversationSelect}
        onCreateProject={handleCreateProject}
        onCreateChannel={handleCreateChannel}
      >
        {chatContext ? (
          <EnhancedChat
            context={chatContext}
            currentUserId={currentUser.id}
            messages={filteredMessages}
            users={users}
            onSendMessage={handleSendMessage}
            onEditMessage={handleEditMessage}
            onDeleteMessage={handleDeleteMessage}
            className="h-full"
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="w-16 h-16 bg-kafuffle-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                K
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Welcome to Kafuffle
              </h2>
              <p className="text-gray-400">
                Select a channel or start a conversation to begin chatting!
              </p>
            </div>
          </div>
        )}
      </DiscordLayout>
    </div>
  );
};

export default DashboardPage;
