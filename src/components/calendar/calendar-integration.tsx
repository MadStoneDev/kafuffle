import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  Clock,
  MapPin,
  Users,
  Video,
  Repeat,
  Bell,
  X,
  Edit,
  Trash2,
  ExternalLink,
  Filter,
} from "lucide-react";
import { DatabaseService } from "@/lib/database";
import type { EnhancedUser } from "@/types";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  location?: string;
  meeting_url?: string;
  attendees: CalendarAttendee[];
  organizer: EnhancedUser;
  recurrence?: RecurrenceRule;
  reminders: ReminderRule[];
  color?: string;
  status: "confirmed" | "tentative" | "cancelled";
  project_id?: string;
  channel_id?: string;
  section_id?: string;
  visibility: "public" | "private" | "team_only";
  created_at: string;
  updated_at: string;
}

interface CalendarAttendee {
  user: EnhancedUser;
  status: "accepted" | "declined" | "tentative" | "pending";
  role: "organizer" | "attendee" | "optional";
}

interface RecurrenceRule {
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  until?: string;
  count?: number;
  by_weekday?: number[];
  by_month_day?: number[];
}

interface ReminderRule {
  method: "email" | "popup" | "push";
  minutes_before: number;
}

interface CalendarIntegrationProps {
  currentUser: EnhancedUser;
  context: {
    type: "project" | "section" | "channel";
    id: string;
    name: string;
  };
  onEventSelect?: (event: CalendarEvent) => void;
  compact?: boolean;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const CalendarIntegration: React.FC<CalendarIntegrationProps> = ({
  currentUser,
  context,
  onEventSelect,
  compact = false,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day" | "agenda">(
    "month",
  );
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [filters, setFilters] = useState({
    show_declined: false,
    show_private: true,
    event_types: ["meeting", "deadline", "reminder", "other"],
  });

  // Load events for current month/view
  useEffect(() => {
    loadEvents();
  }, [currentDate, view, context]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const startDate = getViewStartDate();
      const endDate = getViewEndDate();

      const eventsData = await DatabaseService.getCalendarEvents({
        context_type: context.type,
        context_id: context.id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        user_id: currentUser.id,
      });

      setEvents(eventsData);
    } catch (error) {
      console.error("Failed to load calendar events:", error);
    } finally {
      setLoading(false);
    }
  };

  const getViewStartDate = () => {
    const date = new Date(currentDate);
    switch (view) {
      case "month":
        date.setDate(1);
        date.setDate(date.getDate() - date.getDay()); // Start of week containing first day
        return date;
      case "week":
        date.setDate(date.getDate() - date.getDay());
        return date;
      case "day":
        return date;
      case "agenda":
        return date;
      default:
        return date;
    }
  };

  const getViewEndDate = () => {
    const date = new Date(currentDate);
    switch (view) {
      case "month":
        date.setMonth(date.getMonth() + 1);
        date.setDate(0); // Last day of month
        date.setDate(date.getDate() + (6 - date.getDay())); // End of week containing last day
        return date;
      case "week":
        date.setDate(date.getDate() - date.getDay() + 6);
        return date;
      case "day":
        return date;
      case "agenda":
        date.setDate(date.getDate() + 30); // Next 30 days
        return date;
      default:
        return date;
    }
  };

  const navigateCalendar = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);

    switch (view) {
      case "month":
        newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
        break;
      case "week":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
        break;
      case "day":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
        break;
      case "agenda":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 30 : -30));
        break;
    }

    setCurrentDate(newDate);
  };

  const getEventsForDate = useCallback(
    (date: Date) => {
      const dateStr = date.toDateString();
      return events.filter((event) => {
        const eventStart = new Date(event.start_time);
        const eventEnd = new Date(event.end_time);

        if (event.all_day) {
          return eventStart.toDateString() === dateStr;
        }

        return (
          eventStart.toDateString() === dateStr ||
          (eventStart <= date && eventEnd >= date)
        );
      });
    },
    [events],
  );

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
    onEventSelect?.(event);
  };

  const handleCreateEvent = () => {
    setEditingEvent({
      id: "",
      title: "",
      description: "",
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
      all_day: false,
      attendees: [],
      organizer: currentUser,
      reminders: [{ method: "popup", minutes_before: 15 }],
      status: "confirmed",
      visibility: "team_only",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as CalendarEvent);
    setShowEventModal(true);
  };

  const MonthView: React.FC = () => {
    const monthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const monthEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );
    const calendarStart = new Date(monthStart);
    calendarStart.setDate(calendarStart.getDate() - monthStart.getDay());

    const weeks = [];
    const currentWeekStart = new Date(calendarStart);

    for (let week = 0; week < 6; week++) {
      const days = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(currentWeekStart);
        date.setDate(currentWeekStart.getDate() + day);

        const isCurrentMonth = date.getMonth() === currentDate.getMonth();
        const isToday = date.toDateString() === new Date().toDateString();
        const dayEvents = getEventsForDate(date);

        days.push(
          <div
            key={date.toISOString()}
            className={`min-h-24 p-1 border border-neutral-700 ${
              isCurrentMonth ? "bg-neutral-800" : "bg-neutral-900"
            } ${isToday ? "ring-2 ring-kafuffle-primary" : ""}`}
          >
            <div
              className={`text-sm mb-1 ${
                isCurrentMonth ? "text-white" : "text-neutral-500"
              } ${isToday ? "font-bold" : ""}`}
            >
              {date.getDate()}
            </div>

            <div className="space-y-1">
              {dayEvents.slice(0, compact ? 2 : 3).map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className="text-xs p-1 rounded cursor-pointer truncate"
                  style={{
                    backgroundColor: event.color || "#3b82f6",
                    color: "white",
                  }}
                  title={event.title}
                >
                  {event.title}
                </div>
              ))}

              {dayEvents.length > (compact ? 2 : 3) && (
                <div className="text-xs text-neutral-400">
                  +{dayEvents.length - (compact ? 2 : 3)} more
                </div>
              )}
            </div>
          </div>,
        );
      }

      weeks.push(
        <div key={week} className="grid grid-cols-7">
          {days}
        </div>,
      );

      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    return (
      <div>
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-neutral-700">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-neutral-400"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="space-y-0">{weeks}</div>
      </div>
    );
  };

  const AgendaView: React.FC = () => {
    const sortedEvents = [...events].sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    );

    const groupedEvents = sortedEvents.reduce(
      (groups, event) => {
        const date = new Date(event.start_time).toDateString();
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(event);
        return groups;
      },
      {} as Record<string, CalendarEvent[]>,
    );

    return (
      <div className="space-y-4">
        {Object.entries(groupedEvents).map(([date, dayEvents]) => (
          <div key={date}>
            <h3 className="font-medium text-white mb-2">
              {new Date(date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </h3>

            <div className="space-y-2">
              {dayEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onSelect={handleEventClick}
                />
              ))}
            </div>
          </div>
        ))}

        {sortedEvents.length === 0 && (
          <div className="text-center py-12">
            <CalendarIcon className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-400">No upcoming events</p>
          </div>
        )}
      </div>
    );
  };

  const EventCard: React.FC<{
    event: CalendarEvent;
    onSelect: (event: CalendarEvent) => void;
  }> = ({ event, onSelect }) => (
    <div
      onClick={() => onSelect(event)}
      className="p-3 bg-neutral-700 hover:bg-neutral-600 rounded-lg cursor-pointer transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-white mb-1">{event.title}</h4>

          <div className="flex items-center space-x-4 text-sm text-neutral-400">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {event.all_day ? (
                "All day"
              ) : (
                <>
                  {new Date(event.start_time).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                  {" - "}
                  {new Date(event.end_time).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </>
              )}
            </div>

            {event.location && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {event.location}
              </div>
            )}

            {event.attendees.length > 0 && (
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {event.attendees.length} attendees
              </div>
            )}
          </div>

          {event.description && (
            <p className="text-sm text-neutral-400 mt-2 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>

        <div
          className="w-3 h-3 rounded-full ml-3"
          style={{ backgroundColor: event.color || "#3b82f6" }}
        />
      </div>
    </div>
  );

  const EventModal: React.FC = () => {
    const event = selectedEvent || editingEvent;
    const isEditing = !!editingEvent;

    if (!event) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-neutral-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                {isEditing
                  ? event.id
                    ? "Edit Event"
                    : "Create Event"
                  : "Event Details"}
              </h2>
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setSelectedEvent(null);
                  setEditingEvent(null);
                }}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {isEditing ? (
              <EventForm
                event={event}
                onSave={(savedEvent) => {
                  // Handle save
                  setShowEventModal(false);
                  setEditingEvent(null);
                  loadEvents();
                }}
                onCancel={() => {
                  setShowEventModal(false);
                  setEditingEvent(null);
                }}
              />
            ) : (
              <EventDetails
                event={event}
                currentUser={currentUser}
                onEdit={() => setEditingEvent(event)}
                onDelete={async () => {
                  // Handle delete
                  setShowEventModal(false);
                  setSelectedEvent(null);
                  loadEvents();
                }}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  const EventForm: React.FC<{
    event: CalendarEvent;
    onSave: (event: CalendarEvent) => void;
    onCancel: () => void;
  }> = ({ event, onSave, onCancel }) => {
    const [formData, setFormData] = useState(event);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        if (formData.id) {
          await DatabaseService.updateCalendarEvent(formData.id, formData);
        } else {
          await DatabaseService.createCalendarEvent({
            ...formData,
            project_id: context.type === "project" ? context.id : undefined,
            section_id: context.type === "section" ? context.id : undefined,
            channel_id: context.type === "channel" ? context.id : undefined,
          });
        }

        onSave(formData);
      } catch (error) {
        console.error("Failed to save event:", error);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Event Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-kafuffle-primary"
            placeholder="Enter event title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description || ""}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-kafuffle-primary resize-none"
            placeholder="Event description"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              required
              value={new Date(formData.start_time).toISOString().slice(0, 16)}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  start_time: new Date(e.target.value).toISOString(),
                })
              }
              className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-kafuffle-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              End Date & Time
            </label>
            <input
              type="datetime-local"
              required
              value={new Date(formData.end_time).toISOString().slice(0, 16)}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  end_time: new Date(e.target.value).toISOString(),
                })
              }
              className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-kafuffle-primary"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            id="all-day"
            type="checkbox"
            checked={formData.all_day}
            onChange={(e) =>
              setFormData({ ...formData, all_day: e.target.checked })
            }
            className="rounded border-neutral-600 text-kafuffle-primary focus:ring-kafuffle-primary"
          />
          <label htmlFor="all-day" className="text-sm text-neutral-300">
            All day event
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Location
          </label>
          <input
            type="text"
            value={formData.location || ""}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-kafuffle-primary"
            placeholder="Event location"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Meeting URL
          </label>
          <input
            type="url"
            value={formData.meeting_url || ""}
            onChange={(e) =>
              setFormData({ ...formData, meeting_url: e.target.value })
            }
            className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-kafuffle-primary"
            placeholder="https://zoom.us/..."
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t border-neutral-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-kafuffle-primary hover:bg-kafuffle-primary/80 rounded-lg text-white transition-colors"
          >
            {formData.id ? "Update Event" : "Create Event"}
          </button>
        </div>
      </form>
    );
  };

  const EventDetails: React.FC<{
    event: CalendarEvent;
    currentUser: EnhancedUser;
    onEdit: () => void;
    onDelete: () => Promise<void>;
  }> = ({ event, currentUser, onEdit, onDelete }) => {
    const canEdit = event.organizer.id === currentUser.id;

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {event.title}
          </h3>
          {event.description && (
            <p className="text-neutral-300">{event.description}</p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-neutral-400 mr-3" />
            <div>
              <div className="text-white">
                {event.all_day ? (
                  "All day"
                ) : (
                  <>
                    {new Date(event.start_time).toLocaleDateString()} at{" "}
                    {new Date(event.start_time).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    {" - "}
                    {new Date(event.end_time).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </>
                )}
              </div>
            </div>
          </div>

          {event.location && (
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-neutral-400 mr-3" />
              <span className="text-white">{event.location}</span>
            </div>
          )}

          {event.meeting_url && (
            <div className="flex items-center">
              <Video className="w-5 h-5 text-neutral-400 mr-3" />
              <a
                href={event.meeting_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-kafuffle-primary hover:underline flex items-center"
              >
                Join Meeting
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          )}
        </div>

        {event.attendees.length > 0 && (
          <div>
            <h4 className="font-medium text-white mb-3">
              Attendees ({event.attendees.length})
            </h4>
            <div className="space-y-2">
              {event.attendees.map((attendee) => (
                <div
                  key={attendee.user.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-kafuffle-primary flex items-center justify-center text-white text-sm">
                      {attendee.user.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white">
                        {attendee.user.full_name || attendee.user.username}
                      </div>
                      <div className="text-sm text-neutral-400">
                        {attendee.role}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-sm px-2 py-1 rounded ${
                      attendee.status === "accepted"
                        ? "bg-green-600 text-white"
                        : attendee.status === "declined"
                          ? "bg-red-600 text-white"
                          : attendee.status === "tentative"
                            ? "bg-yellow-600 text-white"
                            : "bg-neutral-600 text-white"
                    }`}
                  >
                    {attendee.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {canEdit && (
          <div className="flex justify-end space-x-4 pt-4 border-t border-neutral-700">
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2 inline" />
              Delete
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-kafuffle-primary hover:bg-kafuffle-primary/80 rounded-lg text-white transition-colors"
            >
              <Edit className="w-4 h-4 mr-2 inline" />
              Edit Event
            </button>
          </div>
        )}
      </div>
    );
  };

  if (compact) {
    return (
      <div className="bg-neutral-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-white">Calendar</h3>
          <button
            onClick={handleCreateEvent}
            className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <AgendaView />

        {showEventModal && <EventModal />}
      </div>
    );
  }

  return (
    <div className="bg-neutral-800 rounded-lg">
      {/* Calendar Header */}
      <div className="p-4 border-b border-neutral-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-white">
              {context.name} Calendar
            </h2>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateCalendar("prev")}
                className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-medium text-white min-w-48 text-center">
                {view === "month" &&
                  `${
                    MONTHS[currentDate.getMonth()]
                  } ${currentDate.getFullYear()}`}
                {view === "week" &&
                  `Week of ${currentDate.toLocaleDateString()}`}
                {view === "day" && currentDate.toLocaleDateString()}
                {view === "agenda" && "Upcoming Events"}
              </h3>

              <button
                onClick={() => navigateCalendar("next")}
                className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex bg-neutral-700 rounded-lg p-1">
              {["month", "week", "day", "agenda"].map((viewType) => (
                <button
                  key={viewType}
                  onClick={() => setView(viewType as any)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    view === viewType
                      ? "bg-kafuffle-primary text-white"
                      : "text-neutral-300 hover:text-white"
                  }`}
                >
                  {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
                </button>
              ))}
            </div>

            <button
              onClick={handleCreateEvent}
              className="flex items-center px-4 py-2 bg-kafuffle-primary hover:bg-kafuffle-primary/80 rounded-lg text-white transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Event
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-kafuffle-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {view === "month" && <MonthView />}
            {view === "agenda" && <AgendaView />}
            {/* Add WeekView and DayView components as needed */}
          </>
        )}
      </div>

      {showEventModal && <EventModal />}
    </div>
  );
};
