import { IconChevronLeft } from "@tabler/icons-react";
import { View } from "@/types";

interface NotificationsProps {
  onViewChange: (view: View) => void;
}

export default function Notifications({ onViewChange }: NotificationsProps) {
  return (
    <div
      className={`flex-grow p-6 bg-neutral-50 dark:bg-neutral-800/80 rounded-4xl`}
    >
      <div className={`mx-auto`}>
        <header
          className={`mb-4 flex items-center gap-2 text-neutral-900 dark:text-neutral-50`}
        >
          <button
            onClick={() => onViewChange("spaces")}
            className={`cursor-pointer p-1.5 aspect-square hover:bg-neutral-50 rounded-full hover:text-kafuffle-primary transition-all duration-500 ease-in-out`}
          >
            <IconChevronLeft />
          </button>

          <h1 className={`mb-1 text-xl font-bold `}>Notifications</h1>
        </header>
      </div>
    </div>
  );
}
