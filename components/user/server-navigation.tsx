"use client";

import { useState } from "react";
import ServerAvatar from "@/components/user/server-avatar";

export default function ServerNavigation() {
  // States
  const [selectedSpaceId, setSelectedSpaceId] = useState<number>(3);

  return (
    <section className={`px-2 flex flex-col items-center gap-2 h-full`}>
      <button
        onClick={() => setSelectedSpaceId(0)}
        className={`${
          selectedSpaceId === 0 ? "opacity-100" : "opacity-55 dark:opacity-60"
        } hover:opacity-100 dark:hover:opacity-100 transition-all duration-300 ease-in-out`}
      >
        <ServerAvatar
          alt={"Kafuffle Logo"}
          active={selectedSpaceId === 0}
          innerElement={
            <img
              src={"/kafuffle-symbol.svg"}
              alt={"Kafuffle Logo"}
              className={`ml-0.5 w-5 group-hover:w-6 transition-all duration-300 ease-in-out`}
            />
          }
        />
      </button>

      <div className={`mb-1 relative w-[90%] min-h-[1px] bg-neutral-500`}></div>

      <div className={`flex-1 overflow-y-auto`}>
        {Array.from({ length: 10 }, (_, index) => index + 1).map((index) => (
          <button
            key={index}
            onClick={() => setSelectedSpaceId(index)}
            className={`${
              selectedSpaceId === index
                ? "opacity-100"
                : "opacity-55 dark:opacity-60"
            } hover:opacity-100 dark:hover:opacity-100 transition-all duration-300 ease-in-out`}
          >
            <ServerAvatar
              imageSrc={
                "https://res.cloudinary.com/duhygs5ck/image/upload/f_auto,q_auto/v1740646396/avatar2.jpg"
              }
              alt={"Avatar"}
              active={selectedSpaceId === index}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
