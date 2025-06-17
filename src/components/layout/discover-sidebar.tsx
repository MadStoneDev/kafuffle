import {
  IconCubeOff,
  IconCubePlus,
  IconCubeSend,
  IconMessage,
  IconMessagePlus,
  IconSearch,
  IconTable,
  IconTablePlus,
  IconUsers,
} from "@tabler/icons-react";
import { View } from "@/types";

interface DiscoverSidebarProps {
  onViewChange: (view: View) => void;
}

export default function DiscoverSidebar({
  onViewChange,
}: DiscoverSidebarProps) {
  return (
    <div className={`py-4 space-y-4`}>
      <section className={`relative`}>
        <input
          type={`text`}
          placeholder={`Search...`}
          className={`pl-4 h-10 pr-12 w-52 bg-black/25 rounded-full focus:ring-none focus:outline-none text-sm text-neutral-50/50 placeholder-neutral-50/50 focus:text-neutral-50 transition duration-200`}
        />
        <button
          onClick={() => {
            onViewChange("members");
          }}
          className={`cursor-pointer absolute top-1/2 -translate-y-1/2 right-1 grid place-content-center w-10 h-10 rounded-full text-neutral-50 opacity-50 hover:opacity-100 transition-all duration-500 ease-in-out`}
        >
          <IconSearch />
        </button>
      </section>

      <div className={`w-full h-px bg-neutral-50/30`} />

      <section className={`flex flex-col items-start gap-6 w-full`}>
        <div className={`flex items-center gap-2`}>
          <IconCubePlus size={20} />
          <span>Create a New Space</span>
        </div>

        <div className={`flex items-center gap-2`}>
          <IconCubeSend size={20} />
          <span>Space Templates</span>
        </div>

        <div className={`flex items-center gap-2`}>
          <IconCubeOff size={20} />
          <span>Inactive Spaces</span>
        </div>
      </section>
    </div>
  );
}
