// components/notifications/NotificationSystem.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Bell,
  BellOff,
  Check,
  X,
  MessageSquare,
  UserPlus,
  Calendar,
  FileText,
  AlertCircle,
  Info,
  CheckCircle,
  Settings,
  MoreHorizontal,
  Archive,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { DatabaseService } from "@/lib/database";
import type { EnhancedUser, EnhancedProject, EnhancedChannel } from "@/types";

export interface Notification {
  id: string;
  type: "message" | "mention" | "invite" | "calendar" | "system" | "file_share";
  title: string;
  content: string;
  timestamp: string;
  read: boolean;
  archived: boolean;
  priority: "low" | "normal" | "high" | "urgent";
  metadata: {
    user?: EnhancedUser;
    project?: EnhancedProject;
    channel?: EnhancedChannel;
    message_id?: string;
    event_id?: string;
    file_id?: string;
    action_url?: string;
  };
  actions?: NotificationAction[];
}

interface NotificationAction {
  id: string;
  label: string;
  type: "primary" | "secondary" | "danger";
  action: () => void;
}

interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  desktop_notifications: boolean;
  sound_enabled: boolean;
  quiet_hours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  frequency: "immediate" | "batched" | "digest";
  filters: {
    mentions: boolean;
    direct_messages: boolean;
    channel_messages: boolean;
    project_updates: boolean;
    calendar_events: boolean;
    file_shares: boolean;
  };
}

export const NotificationSystem: React.FC<{
  currentUser: EnhancedUser;
}> = ({ currentUser }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "unread" | "mentions" | "archived"
  >("all");
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    push_notifications: true,
    desktop_notifications: true,
    sound_enabled: true,
    quiet_hours: { enabled: false, start: "22:00", end: "08:00" },
    frequency: "immediate",
    filters: {
      mentions: true,
      direct_messages: true,
      channel_messages: true,
      project_updates: true,
      calendar_events: true,
      file_shares: true,
    },
  });
  const [showPreferences, setShowPreferences] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load notifications and preferences
  useEffect(() => {
    loadNotifications();
    loadPreferences();

    // Set up real-time subscription for new notifications
    const unsubscribe = DatabaseService.subscribeToNotifications(
      currentUser.id,
      (notification) => {
        handleNewNotification(notification);
      },
    );

    return unsubscribe;
  }, [currentUser.id]);

  // Update unread count
  useEffect(() => {
    const unread = notifications.filter((n) => !n.read && !n.archived).length;
    setUnreadCount(unread);
  }, [notifications]);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Click outside to close panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setShowPanel(false);
      }
    };

    if (showPanel) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showPanel]);

  const loadNotifications = async () => {
    try {
      const notifications = await DatabaseService.getUserNotifications(
        currentUser.id,
      );
      setNotifications(notifications);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const loadPreferences = async () => {
    try {
      const prefs = await DatabaseService.getNotificationPreferences(
        currentUser.id,
      );
      if (prefs) {
        setPreferences(prefs);
      }
    } catch (error) {
      console.error("Failed to load notification preferences:", error);
    }
  };

  const handleNewNotification = useCallback(
    (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);

      // Check if we should show this notification based on preferences
      if (!shouldShowNotification(notification)) {
        return;
      }

      // Play sound if enabled
      if (preferences.sound_enabled && audioRef.current) {
        audioRef.current.play().catch(() => {
          // Ignore autoplay errors
        });
      }

      // Show desktop notification
      if (
        preferences.desktop_notifications &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        const desktopNotification = new Notification(notification.title, {
          body: notification.content,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          tag: notification.id,
        });

        desktopNotification.onclick = () => {
          window.focus();
          setShowPanel(true);
          markAsRead(notification.id);

          // Navigate to notification source if action URL exists
          if (notification.metadata.action_url) {
            window.location.href = notification.metadata.action_url;
          }
        };

        // Auto-close after 5 seconds
        setTimeout(() => {
          desktopNotification.close();
        }, 5000);
      }
    },
    [preferences],
  );

  const shouldShowNotification = (notification: Notification): boolean => {
    // Check quiet hours
    if (preferences.quiet_hours.enabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      if (
        currentTime >= preferences.quiet_hours.start ||
        currentTime <= preferences.quiet_hours.end
      ) {
        return notification.priority === "urgent";
      }
    }

    // Check type filters
    switch (notification.type) {
      case "mention":
        return preferences.filters.mentions;
      case "message":
        return notification.metadata.channel
          ? preferences.filters.channel_messages
          : preferences.filters.direct_messages;
      case "calendar":
        return preferences.filters.calendar_events;
      case "file_share":
        return preferences.filters.file_shares;
      default:
        return true;
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await DatabaseService.markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
      await DatabaseService.markNotificationsAsRead(unreadIds);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const archiveNotification = async (notificationId: string) => {
    try {
      await DatabaseService.archiveNotification(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, archived: true } : n,
        ),
      );
    } catch (error) {
      console.error("Failed to archive notification:", error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await DatabaseService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
      case "mention":
        return <MessageSquare className="w-4 h-4" />;
      case "invite":
        return <UserPlus className="w-4 h-4" />;
      case "calendar":
        return <Calendar className="w-4 h-4" />;
      case "file_share":
        return <FileText className="w-4 h-4" />;
      case "system":
        return <Info className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-400";
      case "high":
        return "text-orange-400";
      case "normal":
        return "text-blue-400";
      case "low":
        return "text-neutral-400";
      default:
        return "text-neutral-400";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter((notification) => {
    switch (filter) {
      case "unread":
        return !notification.read && !notification.archived;
      case "mentions":
        return notification.type === "mention" && !notification.archived;
      case "archived":
        return notification.archived;
      default:
        return !notification.archived;
    }
  });

  const NotificationItem: React.FC<{ notification: Notification }> = ({
    notification,
  }) => (
    <div
      className={`p-4 border-b border-neutral-700 hover:bg-neutral-700/50 transition-colors ${
        !notification.read
          ? "bg-kafuffle-primary/5 border-l-2 border-l-kafuffle-primary"
          : ""
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className={`mt-1 ${getPriorityColor(notification.priority)}`}>
          {getNotificationIcon(notification.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h4
              className={`text-sm font-medium ${
                notification.read ? "text-neutral-300" : "text-white"
              }`}
            >
              {notification.title}
            </h4>
            <div className="flex items-center space-x-1 ml-2">
              {!notification.read && (
                <div className="w-2 h-2 bg-kafuffle-primary rounded-full" />
              )}
              <span className="text-xs text-neutral-500">
                {formatTimestamp(notification.timestamp)}
              </span>
            </div>
          </div>

          <p
            className={`text-sm ${
              notification.read ? "text-neutral-400" : "text-neutral-300"
            } mb-2`}
          >
            {notification.content}
          </p>

          {notification.metadata.user && (
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-kafuffle-primary flex items-center justify-center text-white text-xs">
                {notification.metadata.user.username?.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-neutral-500">
                {notification.metadata.user.username}
              </span>
              {notification.metadata.channel && (
                <>
                  <span className="text-neutral-600">•</span>
                  <span className="text-xs text-neutral-500">
                    #{notification.metadata.channel.name}
                  </span>
                </>
              )}
            </div>
          )}

          {notification.actions && notification.actions.length > 0 && (
            <div className="flex space-x-2 mt-2">
              {notification.actions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    action.type === "primary"
                      ? "bg-kafuffle-primary hover:bg-kafuffle-primary/80 text-white"
                      : action.type === "danger"
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-neutral-600 hover:bg-neutral-500 text-white"
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-1">
          {!notification.read && (
            <button
              onClick={() => markAsRead(notification.id)}
              className="p-1 hover:bg-neutral-600 rounded text-neutral-400 hover:text-white"
              title="Mark as read"
            >
              <Check className="w-3 h-3" />
            </button>
          )}

          <button
            onClick={() => archiveNotification(notification.id)}
            className="p-1 hover:bg-neutral-600 rounded text-neutral-400 hover:text-white"
            title="Archive"
          >
            <Archive className="w-3 h-3" />
          </button>

          <button
            onClick={() => deleteNotification(notification.id)}
            className="p-1 hover:bg-neutral-600 rounded text-neutral-400 hover:text-red-400"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );

  const PreferencesPanel: React.FC = () => (
    <div className="p-4 border-t border-neutral-700 space-y-4">
      <h3 className="font-medium text-white">Notification Preferences</h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-300">
            Desktop notifications
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.desktop_notifications}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  desktop_notifications: e.target.checked,
                }))
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kafuffle-primary"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-300">Sound notifications</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.sound_enabled}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  sound_enabled: e.target.checked,
                }))
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kafuffle-primary"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-300">Email notifications</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.email_notifications}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  email_notifications: e.target.checked,
                }))
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kafuffle-primary"></div>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm text-neutral-300 mb-2">Frequency</label>
        <select
          value={preferences.frequency}
          onChange={(e) =>
            setPreferences((prev) => ({
              ...prev,
              frequency: e.target.value as any,
            }))
          }
          className="w-full px-3 py-2 bg-neutral-600 border border-neutral-500 rounded text-white text-sm focus:outline-none focus:border-kafuffle-primary"
        >
          <option value="immediate">Immediate</option>
          <option value="batched">Batched (every 15 minutes)</option>
          <option value="digest">Daily digest</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div
          ref={panelRef}
          className="absolute top-full right-0 mt-2 w-96 bg-neutral-800 border border-neutral-600 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-neutral-700">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-white">Notifications</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowPreferences(!showPreferences)}
                  className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={markAllAsRead}
                  className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white"
                  title="Mark all as read"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-1">
              {[
                { key: "all", label: "All" },
                { key: "unread", label: "Unread" },
                { key: "mentions", label: "Mentions" },
                { key: "archived", label: "Archived" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    filter === tab.key
                      ? "bg-kafuffle-primary text-white"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preferences Panel */}
          {showPreferences && <PreferencesPanel />}

          {/* Notifications List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                <p className="text-neutral-400 text-sm">
                  {filter === "unread"
                    ? "No unread notifications"
                    : filter === "archived"
                      ? "No archived notifications"
                      : "No notifications yet"}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Notification Sound */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/notification.mp3" type="audio/mpeg" />
        <source src="/sounds/notification.ogg" type="audio/ogg" />
      </audio>
    </div>
  );
};

// Toast notification component for immediate feedback
export const ToastNotification: React.FC<{
  notification: {
    id: string;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    duration?: number;
  };
  onClose: () => void;
}> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, notification.duration || 5000);

    return () => clearTimeout(timer);
  }, [notification.duration, onClose]);

  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "error":
        return <AlertCircle className="w-5 h-5" />;
      case "warning":
        return <AlertCircle className="w-5 h-5" />;
      case "info":
        return <Info className="w-5 h-5" />;
    }
  };

  const getColors = () => {
    switch (notification.type) {
      case "success":
        return "bg-green-600 text-white";
      case "error":
        return "bg-red-600 text-white";
      case "warning":
        return "bg-yellow-600 text-white";
      case "info":
        return "bg-blue-600 text-white";
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 max-w-sm p-4 rounded-lg shadow-lg z-50 ${getColors()}`}
    >
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1">
          <h4 className="font-medium">{notification.title}</h4>
          <p className="text-sm opacity-90">{notification.message}</p>
        </div>
        <button onClick={onClose} className="opacity-70 hover:opacity-100">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
