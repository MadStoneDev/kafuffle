import React, { useState, useEffect } from "react";
import {
  Hash,
  Volume2,
  Plus,
  Settings,
  UserPlus,
  Search,
  Bell,
  Mic,
  Headphones,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Users,
  MessageSquare,
  Phone,
  Video,
  Pin,
  AtSign,
} from "lucide-react";

// Types for the layout (simplified versions)
interface User {
  id: string;
  username: string;
  avatar_url?: string;
  status: "online" | "away" | "busy" | "offline";
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

interface DiscordLayoutProps {
  currentUser: User;
  projects: Project[];
  conversations: DMConversation[];
  currentProject?: Project;
  currentChannel?: Channel;
  currentConversation?: DMConversation;
  onProjectSelect: (project: Project) => void;
  onChannelSelect: (channel: Channel) => void;
  onConversationSelect: (conversation: DMConversation) => void;
  onCreateProject: () => void;
  onCreateChannel: (sectionId: string) => void;
  children: React.ReactNode; // Chat component goes here
}

const ProjectIcon: React.FC<{
  project: Project;
  isActive: boolean;
  onClick: () => void;
}> = ({ project, isActive, onClick }) => (
  <div className="relative group mb-2">
    <div
      className={`
        w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200
        ${
          isActive
            ? "bg-kafuffle-primary text-white"
            : "bg-gray-700 text-gray-300 hover:bg-kafuffle-primary hover:text-white group-hover:rounded-2xl"
        }
      `}
      onClick={onClick}
    >
      {project.icon ? (
        <img
          src={project.icon}
          alt={project.name}
          className="w-8 h-8 rounded-full"
        />
      ) : (
        <span className="font-semibold text-lg">
          {project.name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>

    {/* Active indicator */}
    {isActive && (
      <div className="absolute left-0 top-0 w-1 h-full bg-white rounded-r-lg" />
    )}

    {/* Tooltip */}
    <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-black text-white text-sm py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
      {project.name}
    </div>
  </div>
);

const ChannelItem: React.FC<{
  channel: Channel;
  isActive: boolean;
  onClick: () => void;
}> = ({ channel, isActive, onClick }) => (
  <div
    className={`
      flex items-center px-2 py-1 mx-2 rounded cursor-pointer group relative
      ${
        isActive
          ? "bg-gray-600/50 text-white"
          : "text-gray-300 hover:bg-gray-600/30 hover:text-gray-200"
      }
    `}
    onClick={onClick}
  >
    {channel.type === "text" ? (
      <Hash className="w-4 h-4 mr-2 flex-shrink-0" />
    ) : (
      <Volume2 className="w-4 h-4 mr-2 flex-shrink-0" />
    )}
    <span className="truncate text-sm">{channel.name}</span>

    {channel.unread && (
      <div className="ml-auto bg-kafuffle-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
        {channel.unread > 99 ? "99+" : channel.unread}
      </div>
    )}

    <MoreHorizontal className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 hover:text-white" />
  </div>
);

const DMItem: React.FC<{
  conversation: DMConversation;
  isActive: boolean;
  onClick: () => void;
}> = ({ conversation, isActive, onClick }) => {
  const displayName =
    conversation.type === "dm"
      ? conversation.users[0]?.username || "Unknown"
      : conversation.name || `Group (${conversation.users.length})`;

  const avatar =
    conversation.type === "dm"
      ? conversation.users[0]?.avatar_url
      : conversation.avatar_url;

  const status =
    conversation.type === "dm" ? conversation.users[0]?.status : null;

  return (
    <div
      className={`
        flex items-center px-2 py-1 mx-2 rounded cursor-pointer group relative
        ${
          isActive
            ? "bg-gray-600/50 text-white"
            : "text-gray-300 hover:bg-gray-600/30 hover:text-gray-200"
        }
      `}
      onClick={onClick}
    >
      <div className="relative mr-3">
        {avatar ? (
          <img
            src={avatar}
            alt={displayName}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-kafuffle-primary flex items-center justify-center text-white text-sm font-semibold">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}

        {status && (
          <div
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-800 ${
              status === "online"
                ? "bg-green-500"
                : status === "away"
                  ? "bg-yellow-500"
                  : status === "busy"
                    ? "bg-red-500"
                    : "bg-gray-500"
            }`}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{displayName}</div>
        {conversation.lastMessage && (
          <div className="text-xs text-gray-400 truncate">
            {conversation.lastMessage.content}
          </div>
        )}
      </div>

      {conversation.unread && (
        <div className="ml-2 bg-kafuffle-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {conversation.unread > 99 ? "99+" : conversation.unread}
        </div>
      )}
    </div>
  );
};

export const DiscordLayout: React.FC<DiscordLayoutProps> = ({
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
  children,
}) => {
  const [view, setView] = useState<"projects" | "dms">("projects");
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(),
  );
  const [memberListOpen, setMemberListOpen] = useState(true);

  const toggleSection = (sectionId: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId);
    } else {
      newCollapsed.add(sectionId);
    }
    setCollapsedSections(newCollapsed);
  };

  return (
    <div className="h-screen bg-gray-800 text-white flex">
      {/* Projects/DMs Sidebar */}
      <div className="w-16 bg-gray-900 flex flex-col items-center py-3">
        {/* DM Button */}
        <div className="relative group mb-2">
          <div
            className={`
              w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200
              ${
                view === "dms"
                  ? "bg-kafuffle-primary text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-kafuffle-primary hover:text-white hover:rounded-2xl"
              }
            `}
            onClick={() => setView("dms")}
          >
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="w-8 h-0.5 bg-gray-700 mb-2" />

        {/* Projects */}
        {projects.map((project) => (
          <ProjectIcon
            key={project.id}
            project={project}
            isActive={view === "projects" && currentProject?.id === project.id}
            onClick={() => {
              setView("projects");
              onProjectSelect(project);
            }}
          />
        ))}

        {/* Add Project */}
        <div className="relative group">
          <div
            className="w-12 h-12 rounded-full bg-gray-700 hover:bg-green-600 hover:rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-200 text-green-400 hover:text-white"
            onClick={onCreateProject}
          >
            <Plus className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Channels/DMs List */}
      <div className="w-60 bg-gray-800 flex flex-col">
        {view === "projects" && currentProject ? (
          <>
            {/* Project Header */}
            <div className="h-12 border-b border-gray-700 flex items-center px-4 shadow-md">
              <h2 className="font-semibold truncate">{currentProject.name}</h2>
              <ChevronDown className="w-4 h-4 ml-auto" />
            </div>

            {/* Channels */}
            <div className="flex-1 overflow-y-auto">
              {currentProject.sections.map((section) => (
                <div key={section.id} className="mb-1">
                  <div
                    className="flex items-center px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide cursor-pointer hover:text-gray-300"
                    onClick={() => toggleSection(section.id)}
                  >
                    {collapsedSections.has(section.id) ? (
                      <ChevronRight className="w-3 h-3 mr-1" />
                    ) : (
                      <ChevronDown className="w-3 h-3 mr-1" />
                    )}
                    {section.name}
                    <Plus
                      className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateChannel(section.id);
                      }}
                    />
                  </div>

                  {!collapsedSections.has(section.id) && (
                    <div className="mb-2">
                      {section.channels.map((channel) => (
                        <ChannelItem
                          key={channel.id}
                          channel={channel}
                          isActive={currentChannel?.id === channel.id}
                          onClick={() => onChannelSelect(channel)}
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
            <div className="h-12 border-b border-gray-700 flex items-center px-4">
              <h2 className="font-semibold">Direct Messages</h2>
              <UserPlus className="w-4 h-4 ml-auto cursor-pointer hover:text-white" />
            </div>

            {/* Search */}
            <div className="p-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Find or start a conversation"
                  className="w-full bg-gray-900 text-sm rounded px-8 py-1.5 text-white placeholder-gray-400 focus:outline-none"
                />
              </div>
            </div>

            {/* DMs List */}
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conversation) => (
                <DMItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={currentConversation?.id === conversation.id}
                  onClick={() => onConversationSelect(conversation)}
                />
              ))}
            </div>
          </>
        )}

        {/* User Panel */}
        <div className="h-14 bg-gray-900 flex items-center px-2">
          <div className="relative mr-2">
            <div className="w-8 h-8 rounded-full bg-kafuffle-primary flex items-center justify-center text-white text-sm font-semibold">
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900 ${
                currentUser.status === "online"
                  ? "bg-green-500"
                  : currentUser.status === "away"
                    ? "bg-yellow-500"
                    : currentUser.status === "busy"
                      ? "bg-red-500"
                      : "bg-gray-500"
              }`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {currentUser.username}
            </div>
            <div className="text-xs text-gray-400 capitalize">
              {currentUser.status}
            </div>
          </div>

          <div className="flex space-x-1">
            <div className="w-8 h-8 rounded flex items-center justify-center hover:bg-gray-700 cursor-pointer">
              <Mic className="w-4 h-4" />
            </div>
            <div className="w-8 h-8 rounded flex items-center justify-center hover:bg-gray-700 cursor-pointer">
              <Headphones className="w-4 h-4" />
            </div>
            <div className="w-8 h-8 rounded flex items-center justify-center hover:bg-gray-700 cursor-pointer">
              <Settings className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-12 border-b border-gray-700 flex items-center px-4 bg-gray-800">
          <div className="flex items-center">
            {view === "projects" && currentChannel ? (
              <>
                <Hash className="w-5 h-5 text-gray-400 mr-2" />
                <h3 className="font-semibold">{currentChannel.name}</h3>
              </>
            ) : currentConversation ? (
              <>
                <AtSign className="w-5 h-5 text-gray-400 mr-2" />
                <h3 className="font-semibold">
                  {currentConversation.type === "dm"
                    ? currentConversation.users[0]?.username
                    : currentConversation.name || "Group Chat"}
                </h3>
              </>
            ) : (
              <h3 className="font-semibold text-gray-400">
                Welcome to Kafuffle
              </h3>
            )}
          </div>

          <div className="ml-auto flex items-center space-x-4">
            {currentConversation && (
              <>
                <Phone className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                <Video className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
              </>
            )}
            <Pin className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
            <Users
              className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer"
              onClick={() => setMemberListOpen(!memberListOpen)}
            />
            <Search className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
            <Bell className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex">
          <div className="flex-1">{children}</div>

          {/* Member List */}
          {memberListOpen && view === "projects" && (
            <div className="w-60 bg-gray-800 border-l border-gray-700">
              <div className="p-4">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Members — 12
                </h4>
                <div className="space-y-1">
                  {/* Mock members */}
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex items-center py-1 px-2 rounded hover:bg-gray-700 cursor-pointer"
                    >
                      <div className="relative mr-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                          U{i}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800" />
                      </div>
                      <span className="text-sm">User {i}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscordLayout;
