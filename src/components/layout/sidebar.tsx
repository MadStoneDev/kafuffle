// components/layout/Sidebar.tsx
import React, { useState } from "react";
import {
  Hash,
  Volume2,
  Plus,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Settings,
  User,
} from "lucide-react";

import type { User, Project, Channel, Conversation } from "@/types";

interface SidebarProps {
  currentUser: User;
  projects: Project[];
  conversations: Conversation[];
  currentProject?: Project;
  currentChannel?: Channel;
  currentConversation?: Conversation;
  onProjectSelect: (project: Project) => void;
  onChannelSelect: (channel: Channel) => void;
  onConversationSelect: (conversation: Conversation) => void;
  onCreateProject: () => void;
  onCreateChannel: (sectionId: string) => void;
  view: "projects" | "dms";
  onViewChange: (view: "projects" | "dms") => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  projects,
  conversations,
  currentProject,
  currentChannel,
  currentConversation,
  onProjectSelect,
  onChannelSelect,
  onConversationSelect,
  onCreateProject,
  onCreateChannel,
  view,
  onViewChange,
}) => {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(),
  );

  const toggleSection = (sectionId: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId);
    } else {
      newCollapsed.add(sectionId);
    }
    setCollapsedSections(newCollapsed);
  };

  const ProjectIcon: React.FC<{ project: Project; isActive: boolean }> = ({
    project,
    isActive,
  }) => (
    <div className="px-3 relative group mb-2">
      <div
        className={`cursor-pointer w-10 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
          isActive
            ? "bg-kafuffle-primary text-white"
            : "bg-neutral-700/60 text-neutral-400 hover:bg-kafuffle-primary hover:text-white"
        }`}
        onClick={() => onProjectSelect(project)}
      >
        <span className="font-semibold">
          {project.name.charAt(0).toUpperCase()}
        </span>
      </div>

      {isActive && (
        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-[3px] h-[90%] bg-neutral-100 rounded-r-full" />
      )}

      <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-black text-white text-sm py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
        {project.name}
      </div>
    </div>
  );

  const ChannelItem: React.FC<{ channel: Channel; isActive: boolean }> = ({
    channel,
    isActive,
  }) => (
    <div
      className={`flex items-center px-2 py-2 mx-2 rounded-lg cursor-pointer group relative transition-all duration-200 ${
        isActive
          ? "bg-neutral-600/50 text-white"
          : "text-neutral-400 hover:bg-neutral-600/30 hover:text-neutral-200"
      }`}
      onClick={() => onChannelSelect(channel)}
    >
      {channel.type === "text" ? (
        <Hash className="w-4 h-4 mr-2 flex-shrink-0" />
      ) : (
        <Volume2 className="w-4 h-4 mr-2 flex-shrink-0" />
      )}
      <span className="truncate text-sm">{channel.name}</span>

      {channel.unread_count && channel.unread_count > 0 && (
        <div className="ml-auto bg-kafuffle-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {channel.unread_count > 99 ? "99+" : channel.unread_count}
        </div>
      )}
    </div>
  );

  const ConversationItem: React.FC<{
    conversation: Conversation;
    isActive: boolean;
  }> = ({ conversation, isActive }) => {
    const displayName =
      conversation.type === "dm"
        ? conversation.participants[0]?.username || "Unknown"
        : conversation.name || `Group (${conversation.participants.length})`;

    const status =
      conversation.type === "dm" ? conversation.participants[0]?.status : null;

    return (
      <div
        className={`flex items-center px-2 py-2 mx-2 rounded-lg cursor-pointer group relative transition-all duration-200 ${
          isActive
            ? "bg-neutral-600/50 text-white"
            : "text-neutral-300 hover:bg-neutral-600/30 hover:text-neutral-200"
        }`}
        onClick={() => onConversationSelect(conversation)}
      >
        <div className="relative mr-3">
          <div className="w-8 h-8 rounded-full bg-kafuffle-primary flex items-center justify-center text-white text-sm font-semibold">
            {displayName.charAt(0).toUpperCase()}
          </div>

          {status && (
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-neutral-800 ${
                status === "online"
                  ? "bg-green-500"
                  : status === "away"
                    ? "bg-yellow-500"
                    : status === "busy"
                      ? "bg-red-500"
                      : "bg-neutral-500"
              }`}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{displayName}</div>
          {conversation.last_message && (
            <div className="text-xs text-neutral-400 truncate">
              {conversation.last_message.content}
            </div>
          )}
        </div>

        {conversation.unread_count && conversation.unread_count > 0 && (
          <div className="ml-2 bg-kafuffle-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {conversation.unread_count > 99 ? "99+" : conversation.unread_count}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen bg-neutral-800 text-white flex">
      {/* Project/DM Toggle Sidebar */}
      <div className="bg-neutral-900 flex flex-col items-center py-3 w-16">
        {/* DM Button */}
        <div className="px-3 relative group mb-2">
          <div
            className={`w-10 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 ${
              view === "dms"
                ? "bg-kafuffle-primary text-white"
                : "bg-neutral-700 text-neutral-300 hover:bg-kafuffle-primary hover:text-white"
            }`}
            onClick={() => onViewChange("dms")}
          >
            <MessageSquare className="w-5 h-5" />
          </div>

          {view === "dms" && (
            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-[3px] h-[90%] bg-neutral-100 rounded-r-full" />
          )}
        </div>

        <div className="w-8 h-0.5 bg-neutral-700 mb-2" />

        {/* Projects */}
        {projects.map((project) => (
          <ProjectIcon
            key={project.id}
            project={project}
            isActive={view === "projects" && currentProject?.id === project.id}
          />
        ))}

        {/* Add Project */}
        <div className="relative group">
          <div
            className="w-10 h-8 rounded-xl hover:bg-kafuffle-primary flex items-center justify-center cursor-pointer transition-all duration-200 text-neutral-400 hover:text-white"
            onClick={onCreateProject}
          >
            <Plus className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Content Sidebar */}
      <div className="w-60 bg-neutral-800 flex flex-col">
        {view === "projects" && currentProject ? (
          <>
            {/* Project Header */}
            <div className="h-12 border-b border-neutral-700 flex items-center px-4 shadow-md">
              <h2 className="font-semibold truncate">{currentProject.name}</h2>
            </div>

            {/* Channels */}
            <div className="py-2 flex-1 overflow-y-auto">
              {currentProject.sections.map((section) => (
                <div key={section.id} className="mb-2">
                  <div
                    className="flex items-center px-2 py-1 text-xs text-neutral-400 cursor-pointer hover:text-neutral-300 group"
                    onClick={() => toggleSection(section.id)}
                  >
                    {collapsedSections.has(section.id) ? (
                      <ChevronRight className="w-3 h-3 mr-1" />
                    ) : (
                      <ChevronDown className="w-3 h-3 mr-1" />
                    )}
                    <span className="font-semibold uppercase tracking-wide">
                      {section.name}
                    </span>
                    <Plus
                      className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateChannel(section.id);
                      }}
                    />
                  </div>

                  {!collapsedSections.has(section.id) && (
                    <div className="space-y-1">
                      {section.channels.map((channel) => (
                        <ChannelItem
                          key={channel.id}
                          channel={channel}
                          isActive={currentChannel?.id === channel.id}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* DMs Header */}
            <div className="h-12 border-b border-neutral-700 flex items-center px-4">
              <h2 className="font-semibold">Direct Messages</h2>
            </div>

            {/* DMs List */}
            <div className="flex-1 overflow-y-auto py-2">
              {conversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={currentConversation?.id === conversation.id}
                />
              ))}

              {conversations.length === 0 && (
                <div className="text-center py-8 text-neutral-500">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* User Panel */}
        <div className="h-14 bg-neutral-900 flex items-center px-3 border-t border-neutral-700">
          <div className="relative mr-3">
            <div className="w-8 h-8 rounded-full bg-kafuffle-primary flex items-center justify-center text-white text-sm font-semibold">
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-neutral-900 ${
                currentUser.status === "online"
                  ? "bg-green-500"
                  : currentUser.status === "away"
                    ? "bg-yellow-500"
                    : currentUser.status === "busy"
                      ? "bg-red-500"
                      : "bg-neutral-500"
              }`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {currentUser.username}
            </div>
            <div className="text-xs text-neutral-400 capitalize">
              {currentUser.status}
            </div>
          </div>

          <button className="p-2 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
