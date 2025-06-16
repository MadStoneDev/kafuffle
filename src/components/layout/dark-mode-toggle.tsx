"use client";

import React from "react";
import { useTheme } from "next-themes";
import { IconMoon, IconSun } from "@tabler/icons-react";

export default function DarkModeToggle() {
  const { systemTheme, theme, setTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <button
      onClick={() => (theme == "dark" ? setTheme("light") : setTheme("dark"))}
      className={`cursor-pointer grid place-content-center w-10 h-10 hover:bg-kafuffle-primary rounded-full hover:text-neutral-50 transition-all duration-500 ease-in-out`}
    >
      {theme === "dark" ? <IconSun /> : <IconMoon />}
    </button>
  );
}
