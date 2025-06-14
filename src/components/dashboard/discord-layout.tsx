import React, { useState } from "react";
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
  PlusCircle,
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
  <div className={`px-3 relative group mb-2`}>
    <div
      className={`
        cursor-pointer w-10 h-8 rounded-xl flex items-center justify-center transition-all duration-200
        ${
          isActive
            ? "bg-kafuffle-primary text-white"
            : "bg-neutral-700/60 text-neutral-400 hover:bg-kafuffle-primary hover:text-white"
        }
      `}
      onClick={onClick}
    >
      {project.icon ? (
        <img
          src={project.icon}
          alt={project.name}
          className="w-8 h-8 object-cover"
        />
      ) : (
        <span className={``}>{project.name.charAt(0).toUpperCase()}</span>
      )}
    </div>

    {/* Active indicator */}
    <div
      className={`absolute top-1/2 -translate-y-1/2 left-0 w-[3px] ${
        isActive ? "h-[90%]" : "h-0 group-hover:h-1/2"
      } bg-neutral-100 rounded-r-full transition-all duration-300 ease-in-out`}
    />

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
      flex items-center px-2 py-2 mx-2 rounded-xl cursor-pointer group relative
      ${
        isActive
          ? "bg-neutral-600/50 text-white"
          : "text-neutral-400 hover:bg-neutral-600/30 hover:text-neutral-200"
      }
    transition-all duration-300 ease-in-out`}
    onClick={onClick}
  >
    {channel.type === "text" ? (
      <Hash className="w-4 h-4 mr-2 flex-shrink-0" />
    ) : (
      <Volume2 className="w-4 h-4 mr-2 flex-shrink-0" />
    )}
    <span className="truncate text-xs">{channel.name}</span>

    {channel.unread && (
      <div
        className={`ml-4 bg-kafuffle-primary text-neutral-100 text-xs rounded-full w-4 h-4 grid place-content-center`}
      >
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
            ? "bg-neutral-600/50 text-white"
            : "text-neutral-300 hover:bg-neutral-600/30 hover:text-neutral-200"
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
        {conversation.lastMessage && (
          <div className="text-xs text-neutral-400 truncate">
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
    <div className="h-screen bg-neutral-800 text-white flex">
      {/* Projects/DMs Sidebar */}
      <div className={`bg-neutral-900 flex flex-col items-center py-3`}>
        {/* DM Button */}
        <div className="px-3 relative group mb-2">
          <div
            className={`
              w-10 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200
              ${
                view === "dms"
                  ? "bg-kafuffle-primary text-white"
                  : "bg-neutral-700 text-neutral-300 hover:bg-kafuffle-primary hover:text-white"
              }
            `}
            onClick={() => setView("dms")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlSpace="preserve"
              width={17}
              height={20}
              style={{
                fillRule: "evenodd",
                clipRule: "evenodd",
                strokeLinejoin: "round",
                strokeMiterlimit: 2,
              }}
            >
              <path
                d="m1680.68 2.474 3.62-2.1 1.64 2.84-3.36 1.94h2.42v5.98h-3.26v-2.74h-1.06v2.74h-3.28v-7.2h-.6V.694h3.88v1.78Z"
                style={{
                  fill: "#fff",
                  fillRule: "nonzero",
                }}
                transform="translate(-3116.73 -.696) scale(1.85874)"
              />
            </svg>
          </div>

          {/* Active indicator */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 left-0 w-[3px] ${
              view === "dms" ? "h-[90%]" : "h-0 group-hover:h-1/2"
            } bg-neutral-100 rounded-r-full transition-all duration-300 ease-in-out`}
          />
        </div>

        <div className="w-8 h-0.5 bg-neutral-700 mb-2" />

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
            className={`w-10 h-8 rounded-xl hover:bg-kafuffle-primary flex items-center justify-center cursor-pointer transition-all duration-200 text-white`}
            onClick={onCreateProject}
          >
            <PlusCircle className={`w-5 h-5`} />
          </div>
        </div>
      </div>

      {/* Channels/DMs List */}
      <div className="w-60 bg-neutral-800 flex flex-col">
        {view === "projects" && currentProject ? (
          <>
            {/* Project Header */}
            <div className="h-12 border-b border-neutral-700 flex items-center px-4 shadow-md">
              <h2 className="font-semibold truncate">{currentProject.name}</h2>
              <ChevronDown className="w-4 h-4 ml-auto" />
            </div>

            {/* Channels */}
            <div className="py-2 flex-1 overflow-y-auto">
              {currentProject.sections.map((section) => (
                <div key={section.id} className="mb-1">
                  <div
                    className={`flex items-center gap-1 px-2 py-1 text-xs text-neutral-400 cursor-pointer hover:text-neutral-300`}
                    onClick={() => toggleSection(section.id)}
                  >
                    {section.name}
                    {collapsedSections.has(section.id) ? (
                      <ChevronRight className="w-3 h-3 mr-1" />
                    ) : (
                      <ChevronDown className="w-3 h-3 mr-1" />
                    )}
                    <Plus
                      className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateChannel(section.id);
                      }}
                    />
                  </div>

                  {!collapsedSections.has(section.id) && (
                    <div className="mb-2 space-y-1">
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
            <div className="h-12 border-b border-neutral-700 flex items-center px-4">
              <h2 className="font-semibold">Direct Messages</h2>
              <UserPlus className="w-4 h-4 ml-auto cursor-pointer hover:text-white" />
            </div>

            {/* Search */}
            <div className="p-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Find or start a conversation"
                  className="w-full bg-neutral-900 text-sm rounded px-8 py-1.5 text-white placeholder-neutral-400 focus:outline-none"
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
        <div className="h-14 bg-neutral-900 flex items-center px-2">
          <div className="relative mr-2">
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

          <div className="flex space-x-1">
            <div className="w-8 h-8 rounded flex items-center justify-center hover:bg-neutral-700 cursor-pointer">
              <Mic className="w-4 h-4" />
            </div>
            <div className="w-8 h-8 rounded flex items-center justify-center hover:bg-neutral-700 cursor-pointer">
              <Headphones className="w-4 h-4" />
            </div>
            <div className="w-8 h-8 rounded flex items-center justify-center hover:bg-neutral-700 cursor-pointer">
              <Settings className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-12 border-b border-neutral-700 flex items-center px-4 bg-neutral-800">
          <div className="flex items-center">
            {view === "projects" && currentChannel ? (
              <>
                <Hash className="w-5 h-5 text-neutral-400 mr-2" />
                <h3 className="font-semibold">{currentChannel.name}</h3>
              </>
            ) : currentConversation ? (
              <>
                <AtSign className="w-5 h-5 text-neutral-400 mr-2" />
                <h3 className="font-semibold">
                  {currentConversation.type === "dm"
                    ? currentConversation.users[0]?.username
                    : currentConversation.name || "Group Chat"}
                </h3>
              </>
            ) : (
              <h3 className="font-semibold text-neutral-400">
                Welcome to Kafuffle
              </h3>
            )}
          </div>

          <div className="ml-auto flex items-center space-x-4">
            {currentConversation && (
              <>
                <Phone className="w-5 h-5 text-neutral-400 hover:text-white cursor-pointer" />
                <Video className="w-5 h-5 text-neutral-400 hover:text-white cursor-pointer" />
              </>
            )}
            <Pin className="w-5 h-5 text-neutral-400 hover:text-white cursor-pointer" />
            <Users
              className="w-5 h-5 text-neutral-400 hover:text-white cursor-pointer"
              onClick={() => setMemberListOpen(!memberListOpen)}
            />
            <Search className="w-5 h-5 text-neutral-400 hover:text-white cursor-pointer" />
            <Bell className="w-5 h-5 text-neutral-400 hover:text-white cursor-pointer" />
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex">
          <div className="flex-1">{children}</div>

          {/* Member List */}
          {memberListOpen && view === "projects" && (
            <div className="w-60 bg-neutral-800 border-l border-neutral-700">
              <div className="p-4">
                <h4 className="text-sm font-semibold text-neutral-400 uppercase tracking-wide mb-2">
                  Members — 12
                </h4>
                <div className="space-y-1">
                  {/* Mock members */}
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex items-center py-1 px-2 rounded hover:bg-neutral-700 cursor-pointer"
                    >
                      <div className="relative mr-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                          U{i}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-neutral-800" />
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
