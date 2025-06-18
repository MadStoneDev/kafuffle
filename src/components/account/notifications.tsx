"use client";

import { View } from "@/types";
import { IconChevronLeft } from "@tabler/icons-react";

interface NotificationsProps {
  onViewChange: (view: View) => void;
}

export default function Notifications({ onViewChange }: NotificationsProps) {
  const notifications = [
    { id: 1, title: "New message", text: "You have a new message" },
    { id: 2, title: "Update available", text: "A new update is available" },
    { id: 3, title: "Reminder", text: "Don't forget your appointment" },
  ];

  return (
    <div
      className={`flex-grow p-6 bg-neutral-50 dark:bg-neutral-800/90 rounded-4xl h-full`}
    >
      <div className={`mx-auto`}>
        <header
          className={`mb-4 flex items-center gap-2 text-neutral-900 dark:text-neutral-50`}
        >
          <button
            onClick={() => onViewChange("spaces")}
            className={`cursor-pointer p-2 hover:bg-kafuffle-primary text-neutral-900 dark:text-neutral-50 hover:text-neutral-50 rounded-full transition-all duration-200`}
          >
            <IconChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Notifications</h1>
        </header>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-white rounded-lg p-4 shadow-md"
          >
            <h3 className="font-semibold">{notification.title}</h3>
            <p className="text-gray-600">{notification.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
