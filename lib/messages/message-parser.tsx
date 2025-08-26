// /lib/messages/message-parser.tsx
import { users } from "@/lib/dummy-data/users";

export interface ParsedMessagePart {
  type: "text" | "bold" | "italic" | "mention" | "newline";
  content: string;
  userId?: string; // for mentions
}

export function parseMessage(content: string): ParsedMessagePart[] {
  const parts: ParsedMessagePart[] = [];

  // Split by newlines first to preserve them
  const lines = content.split("\n");

  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) {
      // Add newline between lines
      parts.push({ type: "newline", content: "\n" });
    }

    parseLine(line, parts);
  });

  return parts;
}

function parseLine(line: string, parts: ParsedMessagePart[]) {
  let currentIndex = 0;

  while (currentIndex < line.length) {
    // Check for mentions (@username)
    const mentionMatch = line.slice(currentIndex).match(/^@(\w+)/);
    if (mentionMatch) {
      const username = mentionMatch[1];
      const user = users.find((u) => u.username === username);

      if (user) {
        parts.push({
          type: "mention",
          content: `@${username}`,
          userId: user.id,
        });
        currentIndex += mentionMatch[0].length;
        continue;
      }
    }

    // Check for bold (**text**)
    const boldMatch = line.slice(currentIndex).match(/^\*\*(.+?)\*\*/);
    if (boldMatch) {
      parts.push({
        type: "bold",
        content: boldMatch[1],
      });
      currentIndex += boldMatch[0].length;
      continue;
    }

    // Check for italic (*text*)
    const italicMatch = line.slice(currentIndex).match(/^\*(.+?)\*/);
    if (italicMatch) {
      parts.push({
        type: "italic",
        content: italicMatch[1],
      });
      currentIndex += italicMatch[0].length;
      continue;
    }

    // Regular text - find the next special character or end of line
    let nextSpecialIndex = line.length;
    const specialChars = ["@", "*"];

    for (const char of specialChars) {
      const index = line.indexOf(char, currentIndex + 1);
      if (index !== -1 && index < nextSpecialIndex) {
        nextSpecialIndex = index;
      }
    }

    const textContent = line.slice(currentIndex, nextSpecialIndex);
    if (textContent) {
      parts.push({
        type: "text",
        content: textContent,
      });
    }

    currentIndex = nextSpecialIndex;
  }
}

export function renderMessageParts(parts: ParsedMessagePart[]) {
  return parts.map((part, index) => {
    switch (part.type) {
      case "bold":
        return (
          <strong key={index} className="font-bold">
            {part.content}
          </strong>
        );

      case "italic":
        return (
          <em key={index} className="italic">
            {part.content}
          </em>
        );

      case "mention":
        return (
          <span
            key={index}
            className="bg-kafuffle/20 text-kafuffle px-1 py-0.5 rounded font-medium hover:bg-kafuffle/50 cursor-pointer"
            onClick={() => {
              // TODO: Handle mention click (show user profile, etc.)
              console.log("Mentioned user:", part.userId);
            }}
          >
            {part.content}
          </span>
        );

      case "newline":
        return <br key={index} />;

      case "text":
      default:
        return (
          <span key={index} className={`font-light`}>
            {part.content}
          </span>
        );
    }
  });
}
