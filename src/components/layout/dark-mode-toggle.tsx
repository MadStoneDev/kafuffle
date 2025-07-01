"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { IconMoon, IconSun } from "@tabler/icons-react";

export default function DarkModeToggle() {
  const [mounted, setMounted] = useState(false);
  const { systemTheme, theme, setTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`cursor-pointer grid place-content-center w-10 h-10 hover:bg-kafuffle-primary rounded-full hover:text-neutral-50 transition-all duration-500 ease-in-out`}
      ></div>
    );
  }

  return (
    <button
      onClick={() =>
        currentTheme === "dark" ? setTheme("light") : setTheme("dark")
      }
      className={`cursor-pointer grid place-content-center w-10 h-10 hover:bg-kafuffle-primary rounded-full hover:text-neutral-50 transition-all duration-500 ease-in-out`}
    >
      {currentTheme === "dark" ? <IconSun /> : <IconMoon />}
    </button>
  );
}
