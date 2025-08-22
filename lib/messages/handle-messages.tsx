import { Message } from "@/lib/types/messages";

const defaultMessage: Message = {
  id: "",
  authorId: "",
  type: "",
  content: "",
  timestamp: "",
  replyToId: null,
  spaceId: "",
  zoneId: "",
};

const processMessages = (messages: Message[]) => {
  const processed: Message[] = [];
  let lastDate: string | null = null;

  messages.forEach((message) => {
    const messageDate = new Date(message.timestamp).toDateString();

    // If the date changed, insert a system message
    if (lastDate !== messageDate) {
      const dividerMessage: Message = {
        ...defaultMessage,
        id: `divider-${messageDate}`,
        type: "system",
        timestamp: message.timestamp,
      };
      processed.push(dividerMessage);

      lastDate = messageDate;
    }

    processed.push(message);
  });

  return processed;
};

export default processMessages;
