// /components/spaces/space-calendar.tsx
"use client";

import { useState, useEffect } from "react";
import {
  IconCalendar,
  IconPlus,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/client";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  is_all_day: boolean;
  location?: string;
  attendees: string[];
  created_by: string;
}

interface SpaceCalendarProps {
  spaceId: string;
  zoneId: string;
}

export default function SpaceCalendar({ spaceId, zoneId }: SpaceCalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  useEffect(() => {
    loadEvents();
  }, [spaceId, currentDate]);

  const loadEvents = async () => {
    try {
      const supabase = createClient();

      // Get start and end of current month
      const start = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      );
      const end = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
      );

      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("space_id", spaceId)
        .gte("start_time", start.toISOString())
        .lte("start_time", end.toISOString())
        .order("start_time");

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (title: string, startTime: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("calendar_events")
        .insert({
          title,
          start_time: startTime,
          space_id: spaceId,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          attendees: [],
          is_all_day: false,
        })
        .select()
        .single();

      if (error) throw error;
      setEvents((prev) => [...prev, data]);
    } catch (error) {
      console.error("Failed to create event:", error);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getEventsForDay = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start_time);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="flex items-center gap-2 text-neutral-500">
          <div className="w-4 h-4 border-2 border-neutral-300 border-t-kafuffle-primary rounded-full animate-spin"></div>
          Loading calendar...
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {currentDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg"
            >
              <IconChevronLeft size={16} />
            </button>
            <button
              onClick={() => navigateMonth("next")}
              className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg"
            >
              <IconChevronRight size={16} />
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            const title = prompt("Event title:");
            const time = prompt("Start time (YYYY-MM-DD HH:MM):");
            if (title && time) {
              createEvent(title, new Date(time).toISOString());
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-kafuffle-primary text-white rounded-lg hover:opacity-80 transition-opacity"
        >
          <IconPlus size={16} />
          Add Event
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-700">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="p-3 text-center font-semibold text-neutral-600 dark:text-neutral-400 border-r border-neutral-200 dark:border-neutral-700 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {getDaysInMonth().map((day, index) => {
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = day.toDateString() === new Date().toDateString();
            const dayEvents = getEventsForDay(day);

            return (
              <div
                key={index}
                className={`min-h-24 p-2 border-r border-b border-neutral-200 dark:border-neutral-700 last:border-r-0 ${
                  !isCurrentMonth ? "bg-neutral-50 dark:bg-neutral-900" : ""
                } ${isToday ? "bg-kafuffle-primary/5" : ""}`}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    !isCurrentMonth
                      ? "text-neutral-400"
                      : "text-neutral-900 dark:text-white"
                  } ${isToday ? "text-kafuffle-primary" : ""}`}
                >
                  {day.getDate()}
                </div>

                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className="text-xs bg-kafuffle-primary text-white px-2 py-1 rounded truncate"
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-neutral-500">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Events Section */}
      <div className="mt-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
        <h3 className="font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
          <IconCalendar size={16} />
          Today's Events
        </h3>

        {getEventsForDay(new Date()).length === 0 ? (
          <p className="text-sm text-neutral-500">No events today</p>
        ) : (
          <div className="space-y-2">
            {getEventsForDay(new Date()).map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 p-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg"
              >
                <div className="w-2 h-2 bg-kafuffle-primary rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-neutral-900 dark:text-white truncate">
                    {event.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <span>
                      {new Date(event.start_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {event.location && (
                      <>
                        <span>•</span>
                        <span>{event.location}</span>
                      </>
                    )}
                    {event.attendees.length > 0 && (
                      <>
                        <span>•</span>
                        <span>{event.attendees.length} attendees</span>
                      </>
                    )}
                  </div>
                  {event.description && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setCurrentDate(new Date())}
          className="px-3 py-1.5 text-sm bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
        >
          Today
        </button>
        <button
          onClick={() => setViewMode(viewMode === "month" ? "week" : "month")}
          className="px-3 py-1.5 text-sm bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
        >
          {viewMode === "month" ? "Week View" : "Month View"}
        </button>
      </div>
    </div>
  );
}
