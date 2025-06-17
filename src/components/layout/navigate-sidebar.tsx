import { JSX } from "react";
import {
  IconArrowsRightLeft,
  IconBellFilled,
  IconHelpCircleFilled,
  IconInfoCircleFilled,
  IconPower,
  IconSettings,
  IconUserFilled,
} from "@tabler/icons-react";
import { View } from "@/types";
import DarkModeToggle from "@/components/layout/dark-mode-toggle";

interface NavigateSidebarProps {
  isOpen: boolean;
  onOpen: (open: boolean) => void;
  currentView: View;
  onViewChange: (view: View) => void;
}

export default function NavigateSidebar({
  isOpen = false,
  onOpen,
  currentView,
  onViewChange,
}: NavigateSidebarProps): JSX.Element {
  return (
    <nav
      className={`absolute md:relative ${
        isOpen ? "left-0" : "-left-full md:left-0"
      } top-0 bottom-0 flex flex-col items-center justify-between bg-black ${currentView === "profile" ? "text-kafuffle-primary hover:text-neutral-50" : "text-neutral-50"} transition-all duration-500 ease-in-out z-50`}
    >
      <div
        onClick={() => onOpen(false)}
        className={`fixed top-0 right-0 bottom-0 left-0 bg-black ${isOpen ? "pointer-events-auto sm:pointer-events-none opacity-30 sm:opacity-0" : "pointer-events-none opacity-0"} transition-all duration-500 ease-in-out z-10`}
      />
      <section className={`flex-grow flex flex-col gap-2 z-20`}>
        <div
          className={`grid place-content-center w-10 h-10 transition-all duration-500 ease-in-out`}
        >
          <img src={`kafuffle-symbol.svg`} />
        </div>

        <div className={`w-full h-px bg-neutral-50/20`} />

        <div
          onClick={() => onViewChange("profile")}
          className={`cursor-pointer grid place-content-center w-10 h-10 hover:bg-kafuffle-primary rounded-full ${currentView === "profile" ? "text-kafuffle-primary hover:text-neutral-50" : "text-neutral-50"} transition-all duration-500 ease-in-out`}
        >
          <IconUserFilled />
        </div>

        <div
          onClick={() => onViewChange("notifications")}
          className={`cursor-pointer grid place-content-center w-10 h-10 hover:bg-kafuffle-primary rounded-full ${currentView === "notifications" ? "text-kafuffle-primary hover:text-neutral-50" : "text-neutral-50"} transition-all duration-500 ease-in-out`}
        >
          <IconBellFilled />
        </div>

        <div
          onClick={() => onViewChange("help")}
          className={`cursor-pointer grid place-content-center w-10 h-10 hover:bg-kafuffle-primary rounded-full ${currentView === "help" ? "text-kafuffle-primary hover:text-neutral-50" : "text-neutral-50"} transition-all duration-500 ease-in-out`}
        >
          <IconHelpCircleFilled />
        </div>

        <div
          onClick={() => onViewChange("about")}
          className={`cursor-pointer grid place-content-center w-10 h-10 hover:bg-kafuffle-primary rounded-full ${currentView === "about" ? "text-kafuffle-primary hover:text-neutral-50" : "text-neutral-50"} transition-all duration-500 ease-in-out`}
        >
          <IconInfoCircleFilled />
        </div>
      </section>

      <section className={`flex flex-col gap-2`}>
        <DarkModeToggle />

        <div className={`w-full h-px bg-neutral-50/20`} />

        <div
          onClick={() => onViewChange("settings")}
          className={`cursor-pointer grid place-content-center w-10 h-10 hover:bg-kafuffle-primary rounded-full ${currentView === "settings" ? "text-kafuffle-primary hover:text-neutral-50" : "text-neutral-50"} transition-all duration-500 ease-in-out`}
        >
          <IconSettings />
        </div>

        <div
          className={`cursor-pointer grid place-content-center w-10 h-10 hover:bg-kafuffle-primary rounded-full text-neutral-50 transition-all duration-500 ease-in-out`}
        >
          <IconArrowsRightLeft />
        </div>

        <div className={`w-full h-px bg-neutral-50/20`} />

        <div
          className={`cursor-pointer grid place-content-center w-10 h-10 hover:bg-kafuffle-primary rounded-full text-neutral-50 transition-all duration-500 ease-in-out`}
        >
          <IconPower />
        </div>
      </section>
    </nav>
  );
}
