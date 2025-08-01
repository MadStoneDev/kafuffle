import { IconSettings, IconUserFilled } from "@tabler/icons-react";

import ServerAvatar from "@/components/user/server-avatar";
import ServerNavigation from "@/components/user/server-navigation";

export default function SpacesSidebar() {
  return (
    <aside className={`py-4 flex flex-col justify-between items-center gap-2`}>
      <ServerNavigation />

      <section className={`flex flex-col items-center gap-4`}>
        <button>
          <IconUserFilled className={`text-ravenci-primary`} size={22} />
        </button>

        <button>
          <IconSettings className={`text-ravenci-primary`} size={24} />
        </button>
      </section>
    </aside>
  );
}
