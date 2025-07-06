// /components/account/notifications.tsx
"use client";

import { useState, useEffect } from "react";
import { View } from "@/types";
import { IconBell, IconCheck, IconTrash, IconX } from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/client";

interface NotificationProps {
  onViewChange: (view: View) => void;
}

interface Notification {
  id: string;
  type:
    | "message"
    | "mention"
    | "space_invite"
    | "zone_invite"
    | "flow_invite"
    | "system";
  title: string;
  message?: string | null;
  read_at?: string | null;
  created_at: string;
  data?: Record<string, any>;
}

export default function Notifications({ onViewChange }: NotificationProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const supabase = createClient();
      await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", notificationId);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, read_at: new Date().toISOString() }
            : n,
        ),
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const supabase = createClient();
      await supabase.from("notifications").delete().eq("id", notificationId);

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return "💬";
      case "mention":
        return "@";
      case "space_invite":
        return "🏠";
      case "zone_invite":
        return "📢";
      case "flow_invite":
        return "📋";
      default:
        return "🔔";
    }
  };

  if (loading) {
    return (
      <div className="flex-grow p-6 bg-neutral-50 dark:bg-neutral-800/80 rounded-4xl h-full">
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center gap-2 text-neutral-500">
            <div className="w-4 h-4 border-2 border-neutral-300 border-t-kafuffle-primary rounded-full animate-spin"></div>
            Loading notifications...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow p-6 bg-neutral-50 dark:bg-neutral-800/80 rounded-4xl h-full">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            Notifications
          </h1>
          <p className="text-sm text-neutral-400 dark:text-neutral-500">
            {notifications.filter((n) => !n.read_at).length} unread
            notifications
          </p>
        </header>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconBell size={30} className="text-neutral-400" />
              </div>
              <h3 className="text-lg font-medium text-neutral-600 dark:text-neutral-400">
                No notifications yet
              </h3>
              <p className="text-neutral-400 dark:text-neutral-500">
                You'll see notifications for messages, mentions, and invites
                here
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 bg-white dark:bg-neutral-900 rounded-xl border transition-all hover:shadow-md ${
                  notification.read_at
                    ? "border-neutral-200 dark:border-neutral-700"
                    : "border-kafuffle-primary/30 bg-kafuffle-primary/5"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-neutral-900 dark:text-white">
                        {notification.title}
                      </h3>
                      {notification.message && (
                        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                          {notification.message}
                        </p>
                      )}
                      <p className="text-xs text-neutral-400 mt-2">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!notification.read_at && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <IconCheck size={16} className="text-green-500" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <IconTrash size={16} className="text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => onViewChange("spaces")}
            className="text-kafuffle-primary hover:underline"
          >
            ← Back to Spaces
          </button>
        </div>
      </div>
    </div>
  );
}
