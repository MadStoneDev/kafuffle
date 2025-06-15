import { JSX } from "react";
import {
  IconArrowsRightLeft,
  IconBell,
  IconBellFilled,
  IconHelp,
  IconHelpCircleFilled,
  IconInfoCircleFilled,
  IconNotification,
  IconPower,
  IconSettings,
  IconUserFilled,
} from "@tabler/icons-react";
import { View } from "@/types";

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
      } top-0 bottom-0 flex flex-col items-center justify-between bg-neutral-50 dark:bg-black transition-all duration-500 ease-in-out`}
    >
      <section className={`flex-grow flex flex-col gap-2`}>
        <div
          className={`grid place-content-center w-10 h-10 transition-all duration-500 ease-in-out`}
        >
          <img src={`kafuffle-symbol.svg`} />
        </div>

        <div className={`w-full h-px bg-neutral-50/20`} />

        <div
          className={`cursor-pointer grid place-content-center w-10 h-10 hover:bg-kafuffle-primary rounded-full hover:text-neutral-50 transition-all duration-500 ease-in-out`}
          onClick={() => onViewChange("profile")}
        >
          <IconUserFilled />
        </div>

        <div
          className={`cursor-pointer grid place-content-center w-10 h-10 hover:bg-kafuffle-primary rounded-full hover:text-neutral-50 transition-all duration-500 ease-in-out`}
        >
          <IconBellFilled />
        </div>

        <div
          className={`cursor-pointer grid place-content-center w-10 h-10 hover:bg-kafuffle-primary rounded-full hover:text-neutral-50 transition-all duration-500 ease-in-out`}
        >
          <IconHelpCircleFilled />
        </div>

        <div
          className={`cursor-pointer grid place-content-center w-10 h-10 hover:bg-kafuffle-primary rounded-full hover:text-neutral-50 transition-all duration-500 ease-in-out`}
        >
          <IconInfoCircleFilled />
        </div>
      </section>

      <section className={`flex flex-col gap-2`}>
        <div className={`w-full h-px bg-neutral-50/20`} />
        <div
          className={`cursor-pointer grid place-content-center w-10 h-10 hover:bg-kafuffle-primary rounded-full hover:text-neutral-50 transition-all duration-500 ease-in-out`}
        >
          <IconSettings />
        </div>
        <div
          className={`cursor-pointer grid place-content-center w-10 h-10 hover:bg-kafuffle-primary rounded-full hover:text-neutral-50 transition-all duration-500 ease-in-out`}
        >
          <IconArrowsRightLeft />
        </div>
        <div className={`w-full h-px bg-neutral-50/20`} />
        <div
          className={`cursor-pointer grid place-content-center w-10 h-10 hover:bg-kafuffle-primary rounded-full hover:text-neutral-50 transition-all duration-500 ease-in-out`}
        >
          <IconPower />
        </div>
      </section>
    </nav>
  );
}
