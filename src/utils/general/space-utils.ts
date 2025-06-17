import { Space } from "@/types";

const formatParticipants = (participants: string[], maxShow: number = 3) => {
  if (participants.length <= maxShow) {
    return participants.join(", ");
  }
  const shown = participants.slice(0, maxShow);
  const remaining = participants.length - maxShow;
  return `${shown.join(", ")} +${remaining} more`;
};

const getSpaceDisplayName = (space: Space) => {
  if (space.name) return space.name;
  return formatParticipants(space.participants, 2);
};

const getAvatarInitials = (name: string) => {
  return name
    .split(/[\s_]+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getRelativeTime = (timestamp: string): string => {
  // Since timestamps include timezone (+10:00), JavaScript parses them correctly
  const now = new Date();
  const time = new Date(timestamp);

  const diffInMs = now.getTime() - time.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // Just now (less than 1 minute)
  if (diffInMinutes < 1) {
    return "just now";
  }

  // Minutes ago (1-59 minutes)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  // Hours ago (1-23 hours)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  // Yesterday
  if (diffInDays === 1) {
    return "yesterday";
  }

  // Days ago (2-3 days)
  if (diffInDays <= 3) {
    return `${diffInDays}d ago`;
  }

  // More than 3 days - show actual date
  const isCurrentYear = time.getFullYear() === now.getFullYear();

  if (isCurrentYear) {
    return time.toLocaleDateString("en-AU", {
      month: "short",
      day: "numeric",
    });
  } else {
    return time.toLocaleDateString("en-AU", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
};

export {
  formatParticipants,
  getSpaceDisplayName,
  getAvatarInitials,
  getRelativeTime,
};
