// /components/messages/message.tsx
import { useState } from "react";
import UserAvatar from "@/components/user/user-avatar";
import {
  parseMessage,
  renderMessageParts,
} from "@/lib/messages/message-parser";
import {
  IconCornerDownLeft,
  IconDots,
  IconX,
  IconExternalLink,
  IconMoodWink,
} from "@tabler/icons-react";

import { Message as MessageType, MediaItem } from "@/lib/types/messages";
import Link from "next/link";

interface MessageProps {
  message: MessageType;
  userAvatar?: string | null;
  username?: string | null;
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

// Image Preview Modal Component
interface ImagePreviewModalProps {
  image: MediaItem;
  isOpen: boolean;
  onClose: () => void;
}

function ImagePreviewModal({ image, isOpen, onClose }: ImagePreviewModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4`}
      onClick={handleBackdropClick}
    >
      <div className={`relative max-w-4xl max-h-full`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute -top-10 right-0 text-white hover:text-gray-300 transition-all duration-300 ease-in-out`}
          title="Close"
        >
          <IconX size={24} />
        </button>

        {/* Image */}
        <img
          src={image.url}
          alt={image.filename || "Image"}
          className={`max-w-full max-h-[80vh] object-contain rounded-lg`}
        />

        {/* Image info and link */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-black/60 text-white p-3 rounded-b-lg`}
        >
          <div className={`flex items-center justify-between`}>
            <div>
              {image.filename && (
                <p className={`text-sm font-medium`}>{image.filename}</p>
              )}
              {image.metadata?.width && image.metadata?.height && (
                <p className={`text-xs opacity-80`}>
                  {image.metadata.width} × {image.metadata.height}
                </p>
              )}
            </div>
            <Link
              href={image.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1 text-sm hover:text-blue-300 transition-all duration-300 ease-in-out`}
              title="Open in new tab"
            >
              <IconExternalLink size={16} />
              Open original
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Media Grid Component
interface MediaGridProps {
  media: MediaItem[];
}

function MediaGrid({ media }: MediaGridProps) {
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);

  const images = media.filter((item) => item.type === "image");
  const otherMedia = media.filter((item) => item.type !== "image");

  if (images.length === 0 && otherMedia.length === 0) return null;

  return (
    <>
      <div className={`mt-2 space-y-2 max-w-lg`}>
        {/* Image grid */}
        {images.length > 0 && (
          <div
            className={`grid gap-2 ${
              images.length === 1
                ? "grid-cols-1"
                : images.length === 2
                  ? "grid-cols-2"
                  : images.length === 3
                    ? "grid-cols-3"
                    : "grid-cols-2"
            }`}
          >
            {images.map((image, index) => (
              <div
                key={index}
                className={`relative cursor-pointer group overflow-hidden rounded-lg bg-foreground/5 border`}
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image.url}
                  alt={image.filename || `Image ${index + 1}`}
                  className={`w-full h-[200px] object-cover transition-transform group-hover:scale-105`}
                />
                <div
                  className={`absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center`}
                >
                  <div
                    className={`opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white px-2 py-1 rounded text-xs`}
                  >
                    Click to view
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Other media types */}
        {otherMedia.map((item, index) => (
          <div key={index} className={`bg-foreground/5 rounded-lg p-3 border`}>
            <div className={`flex items-center gap-2`}>
              <div className={`text-sm`}>
                {item.type === "video" && "🎥"}
                {item.type === "audio" && "🎵"}
                {item.type === "file" && "📎"}
                {item.type === "gif" && "🎬"}
              </div>
              <div className={`flex-1`}>
                <p className={`text-sm font-medium`}>
                  {item.filename || `${item.type} attachment`}
                </p>
                {item.metadata?.size && (
                  <p className={`text-xs opacity-60`}>
                    {(item.metadata.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                )}
              </div>
              <Link
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-xs text-blue-500 hover:text-blue-600 transition-colors`}
              >
                Open
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <ImagePreviewModal
          image={selectedImage}
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
}

export default function Message({
  message,
  userAvatar,
  username,
}: MessageProps) {
  const timestamp = message.timestamp
    ? formatTimestamp(message.timestamp, message.type === "system")
    : "";

  // Parse message content for formatting
  const parsedContent = message.content ? parseMessage(message.content) : [];

  switch (message.type) {
    case "system":
      return (
        <article className={`px-2 flex items-center gap-2`}>
          <div className={`flex-grow min-h-[1px] bg-foreground/20`}></div>
          <span className={`pb-0.5 text-xs opacity-60`}>{timestamp}</span>
          <div className={`flex-grow min-h-[1px] bg-foreground/20`}></div>
        </article>
      );

    default:
      return (
        <article className="group -mx-3 pl-4 pr-3 py-2 flex flex-row items-start gap-3 hover:bg-foreground/5 rounded-lg transition-all duration-300 ease-in-out">
          <section className="mt-1">
            <UserAvatar imageSrc={userAvatar || ""} alt={"Avatar"} />
          </section>

          <section className="flex-1">
            {/* Header with username, timestamp, and actions */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <p className="text-kafuffle text-sm font-medium">{username}</p>
                <span className="text-xs font-light opacity-50">
                  {timestamp}
                </span>
              </div>

              {/* Message actions (visible on hover) */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <button
                  className="p-1 hover:bg-foreground/10 rounded text-xs opacity-70 hover:opacity-100"
                  title="Add reaction"
                >
                  <IconMoodWink size={18} />
                </button>
                <button
                  className="p-1 hover:bg-foreground/10 rounded text-xs opacity-70 hover:opacity-100"
                  title="Reply"
                >
                  <IconCornerDownLeft size={16} />
                </button>
                <button
                  className="p-1 hover:bg-foreground/10 rounded text-xs opacity-70 hover:opacity-100"
                  title="More options"
                >
                  <IconDots size={16} />
                </button>
              </div>
            </div>

            {/* Message content - now takes full width */}
            {message.content && (
              <div className="text-sm leading-relaxed break-words">
                {renderMessageParts(parsedContent)}
              </div>
            )}

            {/* Media attachments */}
            {message.media && message.media.length > 0 && (
              <MediaGrid media={message.media} />
            )}

            {/* Embeds */}
            {message.embed && message.embed.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.embed.map((embed, index) => (
                  <div
                    key={index}
                    className="border border-foreground/20 rounded-lg p-3 bg-foreground/5"
                  >
                    <div className="flex gap-3">
                      {embed.image && (
                        <img
                          src={embed.image}
                          alt={embed.title || "Embed"}
                          className="w-16 h-16 object-cover rounded flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        {embed.title && (
                          <h4 className="font-medium text-sm mb-1 truncate">
                            {embed.title}
                          </h4>
                        )}
                        {embed.description && (
                          <p className="text-xs opacity-70 line-clamp-2">
                            {embed.description}
                          </p>
                        )}

                        <Link
                          href={embed.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:text-blue-600 transition-colors inline-flex
                              items-center gap-1 mt-1"
                        >
                          <IconExternalLink size={12} />
                          {new URL(embed.url).hostname}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </article>
      );
  }
}
