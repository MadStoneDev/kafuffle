import React, { useState, useCallback } from "react";
import {
  Hash,
  Volume2,
  ChevronDown,
  ChevronRight,
  Plus,
  Settings,
  MoreHorizontal,
  Calendar,
  Kanban,
  Users,
  Trash2,
  Edit3,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type {
  EnhancedProject,
  EnhancedSection,
  EnhancedChannel,
  DragDropResult,
} from "@/types";
import { ChannelItem } from "./ChannelItem";
import { SectionHeader } from "./SectionHeader";

interface ProjectSidebarProps {
  project: EnhancedProject;
  currentChannel?: EnhancedChannel;
  onChannelSelect: (channel: EnhancedChannel) => void;
  onSectionToggle: (sectionId: string) => void;
  onCreateChannel: (sectionId: string, type: "text" | "voice") => void;
  onCreateSection: () => void;
  onDragEnd: (result: DragDropResult) => void;
  onSectionEdit: (section: EnhancedSection) => void;
  onSectionDelete: (sectionId: string) => void;
  onChannelEdit: (channel: EnhancedChannel) => void;
  onChannelDelete: (channelId: string) => void;
  onAddKanban: (type: "section" | "channel", id: string) => void;
  onAddCalendar: (type: "section" | "channel", id: string) => void;
}

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  project,
  currentChannel,
  onChannelSelect,
  onSectionToggle,
  onCreateChannel,
  onCreateSection,
  onDragEnd,
  onSectionEdit,
  onSectionDelete,
  onChannelEdit,
  onChannelDelete,
  onAddKanban,
  onAddCalendar,
}) => {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [hoveredChannel, setHoveredChannel] = useState<string | null>(null);

  const handleDragEnd = useCallback(
    (result: DragDropResult) => {
      if (!result.destination) return;
      onDragEnd(result);
    },
    [onDragEnd],
  );

  return (
    <div className="w-60 bg-neutral-800 flex flex-col h-full">
      {/* Project header */}
      <div className="p-4 border-b border-neutral-700">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white truncate">{project.name}</h2>
          <button className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white">
            <Settings className="w-4 h-4" />
          </button>
        </div>
        {project.unread_count && project.unread_count > 0 && (
          <div className="text-xs text-neutral-400 mt-1">
            {project.unread_count} unread messages
          </div>
        )}
      </div>

      {/* Project-level tools */}
      <div className="px-4 py-2 border-b border-neutral-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onAddKanban("section", project.id)}
            className="flex items-center px-2 py-1 text-xs bg-neutral-700 hover:bg-neutral-600 rounded text-neutral-300"
          >
            <Kanban className="w-3 h-3 mr-1" />
            Kanban
          </button>
          <button
            onClick={() => onAddCalendar("section", project.id)}
            className="flex items-center px-2 py-1 text-xs bg-neutral-700 hover:bg-neutral-600 rounded text-neutral-300"
          >
            <Calendar className="w-3 h-3 mr-1" />
            Calendar
          </button>
          <button className="flex items-center px-2 py-1 text-xs bg-neutral-700 hover:bg-neutral-600 rounded text-neutral-300">
            <Users className="w-3 h-3 mr-1" />
            Members
          </button>
        </div>
      </div>

      {/* Sections and channels */}
      <div className="flex-1 overflow-y-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sections" type="SECTION">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-2 p-2"
              >
                {project.sections.map((section, index) => (
                  <Draggable
                    key={section.id}
                    draggableId={section.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${snapshot.isDragging ? "opacity-50" : ""}`}
                        onMouseEnter={() => setHoveredSection(section.id)}
                        onMouseLeave={() => setHoveredSection(null)}
                      >
                        <SectionHeader
                          section={section}
                          isHovered={hoveredSection === section.id}
                          dragHandleProps={provided.dragHandleProps}
                          onToggle={() => onSectionToggle(section.id)}
                          onEdit={() => onSectionEdit(section)}
                          onDelete={() => onSectionDelete(section.id)}
                          onCreateChannel={(type) =>
                            onCreateChannel(section.id, type)
                          }
                          onAddKanban={() => onAddKanban("section", section.id)}
                          onAddCalendar={() =>
                            onAddCalendar("section", section.id)
                          }
                        />

                        {/* Channels within section */}
                        {!section.collapsed && (
                          <Droppable
                            droppableId={`section-${section.id}`}
                            type="CHANNEL"
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="ml-4 space-y-1"
                              >
                                {section.channels.map(
                                  (channel, channelIndex) => (
                                    <Draggable
                                      key={channel.id}
                                      draggableId={channel.id}
                                      index={channelIndex}
                                    >
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          className={`${
                                            snapshot.isDragging
                                              ? "opacity-50"
                                              : ""
                                          }`}
                                          onMouseEnter={() =>
                                            setHoveredChannel(channel.id)
                                          }
                                          onMouseLeave={() =>
                                            setHoveredChannel(null)
                                          }
                                        >
                                          <ChannelItem
                                            channel={channel}
                                            isActive={
                                              currentChannel?.id === channel.id
                                            }
                                            isHovered={
                                              hoveredChannel === channel.id
                                            }
                                            dragHandleProps={
                                              provided.dragHandleProps
                                            }
                                            onClick={() =>
                                              onChannelSelect(channel)
                                            }
                                            onEdit={() =>
                                              onChannelEdit(channel)
                                            }
                                            onDelete={() =>
                                              onChannelDelete(channel.id)
                                            }
                                            onAddKanban={() =>
                                              onAddKanban("channel", channel.id)
                                            }
                                            onAddCalendar={() =>
                                              onAddCalendar(
                                                "channel",
                                                channel.id,
                                              )
                                            }
                                          />
                                        </div>
                                      )}
                                    </Draggable>
                                  ),
                                )}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Add section button */}
        <div className="px-4 py-2">
          <button
            onClick={onCreateSection}
            className="flex items-center w-full px-2 py-1 text-sm text-neutral-400 hover:text-white hover:bg-neutral-700 rounded transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </button>
        </div>
      </div>
    </div>
  );
};
