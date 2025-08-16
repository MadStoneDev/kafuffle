// /components/messages/message.tsx
import UserAvatar from "@/components/user/user-avatar";
import {
  parseMessage,
  renderMessageParts,
} from "@/lib/messages/message-parser";
import {
  IconMoodSmile,
  IconCornerDownLeft,
  IconDots,
} from "@tabler/icons-react";

interface MessageProps {
  userAvatar?: string | null;
  username?: string | null;
  messageType?: string;
  messageContent?: string;
  messageTimestamp?: string;
}

const formatTimestamp = (timestamp: string, isSystem: boolean) => {
  const date = new Date(timestamp);

  if (isSystem) {
    const day = date.getDate().toString().padStart(2, "0");
    const months = [
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
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  } else {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = hours.toString().padStart(2, "0");

    return `${day}/${month}/${year}, ${formattedHours}:${minutes} ${ampm}`;
  }
};

export default function Message({
  userAvatar,
  username,
  messageType,
  messageContent,
  messageTimestamp,
}: MessageProps) {
  const timestamp = messageTimestamp
    ? formatTimestamp(messageTimestamp, messageType === "system")
    : "";

  // Parse message content for formatting
  const parsedContent = messageContent ? parseMessage(messageContent) : [];

  switch (messageType) {
    case "system":
      return (
        <article className="px-2 flex items-center gap-2">
          <div className="flex-grow min-h-[1px] bg-foreground/20"></div>
          <span className="pb-0.5 text-xs opacity-60">{timestamp}</span>
          <div className="flex-grow min-h-[1px] bg-foreground/20"></div>
        </article>
      );

    case "media":
      return (
        <article className="py-2 flex items-start gap-3">
          <section className="flex-shrink-0 mt-1">
            <UserAvatar imageSrc={userAvatar || ""} alt={"Avatar"} />
          </section>
          <section className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-kafuffle text-sm font-medium">{username}</p>
              <span className="text-xs font-light opacity-50">{timestamp}</span>
            </div>

            {/* Media content would go here */}
            <div className="bg-foreground/5 rounded-lg p-3 mb-2">
              <p className="text-sm opacity-70">📎 Media attachment</p>
            </div>

            {/* Caption/message content */}
            {messageContent && (
              <div className="text-sm leading-relaxed">
                {renderMessageParts(parsedContent)}
              </div>
            )}
          </section>
        </article>
      );

    default:
      return (
        <article className="py-2 flex items-start gap-3 group hover:bg-foreground/5 -mx-3 px-3 rounded-lg transition-colors">
          <section className="flex-shrink-0 mt-1">
            <UserAvatar imageSrc={userAvatar || ""} alt={"Avatar"} />
          </section>
          <section className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-kafuffle text-sm font-medium">{username}</p>
              <span className="text-xs font-light opacity-50">{timestamp}</span>
            </div>
            <div className="text-sm leading-relaxed break-words">
              {renderMessageParts(parsedContent)}
            </div>
          </section>

          {/* Message actions (visible on hover) */}
          <section className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1">
            <button
              className="p-1 hover:bg-foreground/10 rounded text-xs opacity-70 hover:opacity-100"
              title="Add reaction"
            >
              <IconMoodSmile size={14} />
            </button>
            <button
              className="p-1 hover:bg-foreground/10 rounded text-xs opacity-70 hover:opacity-100"
              title="Reply"
            >
              <IconCornerDownLeft size={14} />
            </button>
            <button
              className="p-1 hover:bg-foreground/10 rounded text-xs opacity-70 hover:opacity-100"
              title="More options"
            >
              <IconDots size={14} />
            </button>
          </section>
        </article>
      );
  }
}
