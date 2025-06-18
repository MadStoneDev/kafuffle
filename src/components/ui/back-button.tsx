"use client";

import { IconChevronLeft } from "@tabler/icons-react";

interface BackButtonProps {
  action: () => void;
}

export default function BackButton({ action }: BackButtonProps) {
  return (
    <button
      onClick={action}
      className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-2 
                 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg 
                 hover:bg-white/20 transition-colors duration-200"
      aria-label="Go back"
    >
      <IconChevronLeft size={20} />
    </button>
  );
}
