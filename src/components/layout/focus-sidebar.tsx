import {
  IconMessage,
  IconMessagePlus,
  IconSearch,
  IconTable,
  IconTablePlus,
  IconUsers,
} from "@tabler/icons-react";
import { View } from "@/types";

interface FocusSidebarProps {
  selectedSpaceId: string | null;
  selectedZoneId: string | null;
  onSelectZone: (selectedZoneId: string | null) => void;
  onViewChange: (view: View) => void;
}

export default function FocusSidebar({
  selectedSpaceId,
  selectedZoneId,
  onSelectZone,
  onViewChange,
}: FocusSidebarProps) {
  return (
    <>
      <section className={`py-4 flex gap-4`}>
        <button
          onClick={() => {
            onViewChange("members");
          }}
          className={`cursor-pointer grid place-content-center w-10 h-10 hover:bg-kafuffle-primary rounded-full hover:text-neutral-50 transition-all duration-500 ease-in-out`}
        >
          <IconUsers />
        </button>

        <button
          onClick={() => {
            onViewChange("members");
          }}
          className={`cursor-pointer grid place-content-center w-10 h-10 hover:bg-kafuffle-primary rounded-full hover:text-neutral-50 transition-all duration-500 ease-in-out`}
        >
          <IconMessagePlus />
        </button>

        <button
          onClick={() => {
            onViewChange("members");
          }}
          className={`cursor-pointer grid place-content-center w-10 h-10 hover:bg-kafuffle-primary rounded-full hover:text-neutral-50 transition-all duration-500 ease-in-out`}
        >
          <IconTablePlus />
        </button>

        <button
          onClick={() => {
            onViewChange("members");
          }}
          className={`cursor-pointer grid place-content-center w-10 h-10 hover:bg-kafuffle-primary rounded-full hover:text-neutral-50 transition-all duration-500 ease-in-out`}
        >
          <IconSearch />
        </button>
      </section>

      <div className={`w-full h-px bg-neutral-50/30`} />

      <section className={`py-4 flex flex-col items-start gap-6 w-full`}>
        <div className={`flex items-center gap-2`}>
          <IconMessage size={20} />
          <span>zone-one</span>
        </div>

        <div className={`flex items-center gap-2`}>
          <IconMessage size={20} />
          <span>zone-two</span>
        </div>

        <div className={`flex items-center gap-2`}>
          <IconMessage size={20} />
          <span>zone-three</span>
        </div>

        <div className={`flex items-center gap-2`}>
          <IconTable size={20} />
          zone-one
        </div>
      </section>
    </>
  );
}
