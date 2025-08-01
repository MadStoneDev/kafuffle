import UserAvatar from "@/components/user/user-avatar";

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

  switch (messageType) {
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
        <article className={`py-2 flex items-center gap-2`}>
          <section>
            <UserAvatar imageSrc={userAvatar || ""} alt={"Avatar"} />
          </section>
          <section>
            <div className={`flex items-center gap-2`}>
              <p className={`text-kafuffle text-sm font-medium`}>{username}</p>
              <span className={`text-xs opacity-50`}>{timestamp}</span>
            </div>
            <span className={`pb-0.5 text-sm`}>{messageContent}</span>
          </section>
        </article>
      );
  }
}
