// /app/spaces/page.tsx
"use client";

import { spaces } from "@/lib/dummy-data/spaces";
import ServerAvatar from "@/components/user/server-avatar";
import Link from "next/link";

export default function SpacesListPage() {
  return (
    <div
      className={`p-3 sm:p-4 md:p-8 flex flex-col items-center justify-start gap-4 h-screen bg-background transition-all duration-300 ease-in-out`}
    >
      <Link href={"/"} className={`p-2 bg-kafuffle`}>
        <img src={`/kafuffle-symbol.svg`} className={`mx-auto h-8 w-auto`} />
      </Link>

      <div className={`text-center mb-4`}>
        <h1 className={`text-4xl font-bold mb-2`}>Choose a Space</h1>
        <p className={`text-foreground/60`}>Select a space to start chatting</p>
      </div>

      <div className={`pb-4 grid grid-cols-1 gap-2`}>
        {spaces.map((space) => (
          <Link
            key={space.id}
            href={`/spaces/${space.id}`}
            className={`p-4 flex items-center gap-4 rounded-2xl hover:bg-foreground/5 border border-foreground/10 transition-all duration-200`}
          >
            <ServerAvatar
              imageSrc="https://res.cloudinary.com/duhygs5ck/image/upload/f_auto,q_auto/v1740646396/avatar2.jpg"
              alt={space.name}
            />
            <div className={``}>
              <h3 className={`font-semibold`}>{space.name}</h3>
              <p className={`text-sm text-foreground/60`}>
                {space.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
