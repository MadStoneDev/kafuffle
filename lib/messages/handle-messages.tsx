const processMessages = (messages: any[]) => {
  const processed: {
    id: string;
    type: string;
    timestamp: any;
  }[] = [];
  let lastDate: string | null = null;

  messages.forEach((message) => {
    const messageDate = new Date(message.timestamp).toDateString();

    // If the date changed, insert a system message
    if (lastDate !== messageDate) {
      processed.push({
        type: "system",
        timestamp: message.timestamp,
        id: `divider-${messageDate}`,
      });

      lastDate = messageDate;
    }

    processed.push(message);
  });

  return processed;
};

export default processMessages;
