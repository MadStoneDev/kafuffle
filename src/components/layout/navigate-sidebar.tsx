// /components/layout/navigate-sidebar.tsx
import { JSX } from "react";
import {
  IconArrowsRightLeft,
  IconBellFilled,
  IconHelpCircleFilled,
  IconInfoCircleFilled,
  IconPower,
  IconSettings,
  IconUser,
  IconUserFilled,
  IconUserPlus,
} from "@tabler/icons-react";
import { View } from "@/types";
import { createClient } from "@/utils/supabase/client";
import DarkModeToggle from "@/components/layout/dark-mode-toggle";
import Link from "next/link";

interface NavigateSidebarProps {
  isOpen: boolean;
  onOpen: (open: boolean) => void;
  currentView: View;
  onViewChange: (view: View) => void;
  isAuthenticated: boolean;
}

export default function NavigateSidebar({
  isOpen = false,
  onOpen,
  currentView,
  onViewChange,
  isAuthenticated,
}: NavigateSidebarProps): JSX.Element {
  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out?")) {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/";
    }
  };

  return (
    <nav
      className={`p-4 md:p-0 absolute md:relative ${
        isOpen ? "left-0" : "-left-full md:left-0"
      } top-0 bottom-0 h-full flex flex-col items-center justify-between bg-black ${currentView === "profile" ? "text-kafuffle-primary hover:text-neutral-50" : "text-neutral-50"} transition-all duration-500 ease-in-out z-50`}
    >
      <section className={`flex-grow flex flex-col gap-2 z-20`}>
        <Link
          href={`/`}
          onClick={() => {
            onOpen(false);
            onViewChange("spaces");
          }}
          className={`grid place-content-center w-10 h-10 transition-all duration-500 ease-in-out`}
        >
          <img src={`kafuffle-symbol.svg`} />
        </Link>

        <div className={`w-full h-px bg-neutral-50/20`} />

        {/* Profile - only show when authenticated */}
        {isAuthenticated && (
          <div
            onClick={() => {
              onOpen(false);
              onViewChange("profile");
            }}
            className={`cursor-pointer grid place-content-center w-10 h-10 hover:bg-kafuffle-primary rounded-full ${currentView === "profile" ? "text-kafuffle-primary hover:text-neutral-50" : "text-neutral-50"} transition-all duration-500 ease-in-out`}
          >
            <IconUserFilled />
          </div>
        )}

        {/* Notifications - only show when authenticated */}
        {isAuthenticated && (
          <div
            onClick={() => {
              onOpen(false);
              onViewChange("notifications");
            }}
            className={`cursor-pointer grid place-content-center w-10 h-10 hover:bg-kafuffle-primary rounded-full ${currentView === "notifications" ? "text-kafuffle-primary hover:text-neutral-50" : "text-neutral-50"} transition-all duration-500 ease-in-out`}
          >
            <IconBellFilled />
          </div>
        )}

        {/* About - always available */}
        <button
          onClick={() => {
            onOpen(false);
            onViewChange("about");
          }}
          className={`cursor-pointer grid place-content-center w-10 h-10 hover:bg-kafuffle-primary rounded-full ${currentView === "about" ? "text-kafuffle-primary hover:text-neutral-50" : "text-neutral-50"} transition-all duration-500 ease-in-out`}
        >
          <IconInfoCircleFilled />
        </button>

        {/* Help - always available */}
        <button
          onClick={() => {
            onOpen(false);
            onViewChange("help");
          }}
          className={`cursor-pointer grid place-content-center w-10 h-10 hover:bg-kafuffle-primary rounded-full ${currentView === "help" ? "text-kafuffle-primary hover:text-neutral-50" : "text-neutral-50"} transition-all duration-500 ease-in-out`}
        >
          <IconHelpCircleFilled />
        </button>
      </section>

      <section className={`flex flex-col gap-2`}>
        <DarkModeToggle />

        <div className={`w-full h-px bg-neutral-50/20`} />

        {/* Settings - only show when authenticated */}
        {isAuthenticated && (
          <div
            onClick={() => {
              onOpen(false);
              onViewChange("settings");
            }}
            className={`cursor-pointer grid place-content-center w-10 h-10 hover:bg-kafuffle-primary rounded-full ${currentView === "settings" ? "text-kafuffle-primary hover:text-neutral-50" : "text-neutral-50"} transition-all duration-500 ease-in-out`}
          >
            <IconSettings />
          </div>
        )}

        {/* Account Switcher - only show when authenticated */}
        {isAuthenticated && (
          <div
            className={`cursor-pointer grid place-content-center w-10 h-10 hover:bg-kafuffle-primary rounded-full text-neutral-50 transition-all duration-500 ease-in-out`}
          >
            <IconArrowsRightLeft />
          </div>
        )}

        {/* Logout - only show when authenticated */}
        {isAuthenticated && (
          <>
            <div className={`w-full h-px bg-neutral-50/20`} />
            <div
              onClick={() => {
                onOpen(false);
                handleLogout().then();
              }}
              className={`cursor-pointer grid place-content-center w-10 h-10 hover:bg-red-500 rounded-full text-neutral-50 transition-all duration-500 ease-in-out`}
            >
              <IconPower />
            </div>
          </>
        )}

        {/* Login prompt when not authenticated */}
        {!isAuthenticated && (
          <Link
            href={`/auth`}
            onClick={() => {
              onOpen(false);
            }}
            className={`cursor-pointer grid place-content-center w-10 h-10 hover:bg-kafuffle-primary rounded-full text-neutral-50 transition-all duration-500 ease-in-out`}
            title="Sign In"
          >
            <IconUserPlus />
          </Link>
        )}
      </section>
    </nav>
  );
}
